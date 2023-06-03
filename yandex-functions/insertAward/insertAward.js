const { Driver, getCredentialsFromEnv, getLogger } = require("ydb-sdk");
const { OAuth2Client } = require("google-auth-library");

const logger = getLogger({ level: "debug" });
const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714";
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function upsertAward(awardId, name) {
  const query = `
    UPSERT INTO award (award_id, name)
    VALUES ("${awardId}", "${name}")
  `;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
}

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Audience",
      },
      body: "",
    };
  }

  await driver.ready;

  if (!event.body || event.body.trim() === "") {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Empty request body" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON format" }),
    };
  }

  const { operation, awardName } = body;

  if (!operation) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid request body" }),
    };
  }

  if (operation === "insert") {
    if (!awardName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request body" }),
      };
    }

    // Authorization and audience verification
    const { headers } = event;
    const authorization = headers.Authorization;
    const audience = headers.Audience;

    if (!authorization || !audience) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Missing authorization headers" }),
      };
    }

    const idToken = authorization.replace("Bearer ", "");
    const clientId = audience;

    const client = new OAuth2Client(clientId);
    let email = "";

    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      email = payload.email;
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid authorization token" }),
      };
    }

    // Generate a new UUID for insert operation
    const upsertAwardId = uuidv4();

    await upsertAward(upsertAwardId, awardName);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Award added successfully",
        awardId: upsertAwardId,
      }),
    };
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ message: "Invalid operation" }),
  };
};
