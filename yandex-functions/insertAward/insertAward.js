const { Driver, getCredentialsFromEnv, getLogger } = require("ydb-sdk");
const { v4: uuidv4 } = require("uuid");
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

async function deleteAward(awardId) {
  const query = `
    DELETE FROM award
    WHERE award_id = "${awardId}"
  `;
  console.log("Deleting award with ID:", awardId);
  console.log("Delete query:", query);
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
        "Access-Control-Allow-Headers": "Content-Type",
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

  const { operation, awardId, awardName } = body;

  if (!operation) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid request body" }),
    };
  }

  if (operation === "insert" || operation === "update") {
    if (!awardName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request body" }),
      };
    }

    // Generate a new UUID for insert operation
    const upsertAwardId = operation === "insert" ? uuidv4() : awardId;

    await upsertAward(upsertAwardId, awardName);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message:
          operation === "insert"
            ? "Award added successfully"
            : "Award updated successfully",
      }),
    };
  }

  if (operation === "delete") {
    if (!awardId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request body" }),
      };
    }

    await deleteAward(awardId);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Award deleted successfully" }),
    };
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ message: "Invalid operation" }),
  };
};
