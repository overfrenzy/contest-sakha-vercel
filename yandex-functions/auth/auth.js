const { Driver, getCredentialsFromEnv, getLogger } = require("ydb-sdk");
const logger = getLogger({ level: "debug" });
const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714";
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function fetchUsers() {
  let users;

  await driver.tableClient.withSession(async (session) => {
    // Fetch users data
    const usersResult = await session.executeQuery(`
      SELECT * FROM user;
    `);
    users = usersResult.resultSets[0].rows.map((row) => {
      const email = row.items[0]?.bytesValue?.toString("utf8") || "";
      const id_token = row.items[1]?.bytesValue?.toString("utf8") || "";
      const name = row.items[2].textValue;
      const permissions = row.items[3]?.bytesValue?.toString("utf8") || "";
      return { email, id_token, name, permissions };
    });
  });

  return {
    users
  };
}

// Insert users data
async function insertUser(id_token, name, email) {
  const query = `
  UPSERT INTO user (idToken, name, email)
  VALUES ("${id_token}", "${name}", "${email}")
`;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
  return email;
}

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  await driver.ready;

  if (event.httpMethod === "GET") {
    const users = await fetchUsers();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(users),
    };
  }

  if (event.httpMethod === "POST") {
    if (!event.body || typeof event.body !== "string" || event.body.trim() === "") {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Empty request body" }),
      };
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Invalid JSON format" }),
      };
    }

    const { id_token, name, email } = parsedBody;

    await insertUser(id_token, name, email);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "User added successfully" }),
    };
  }

  return {
    statusCode: 405,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "Method not allowed" }),
  };
};