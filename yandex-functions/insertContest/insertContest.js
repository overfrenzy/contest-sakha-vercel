const { Driver, getCredentialsFromEnv, getLogger } = require("ydb-sdk");
const { v4: uuidv4 } = require('uuid');
const logger = getLogger({ level: "debug" });
const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714";
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function upsertContest(contestId, name, year, tasks) {
  const tasksJson = JSON.stringify(tasks); 
  const query = `
    UPSERT INTO contest (contest_id, name, year, tasks)
    VALUES ("${contestId}", "${name}", ${year}, '${tasksJson}')`;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
  return contestId;
}

async function deleteContest(contestId) {
  const query = `
    DELETE FROM contest WHERE contest_id = "${contestId}"
  `;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
}

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  await driver.ready;

  if (!event.body || event.body.trim() === "") {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Empty request body" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Invalid JSON format" }),
    };
  }

  const { contestId, name, year, tasks } = body;

  if (event.httpMethod === "POST" || event.httpMethod === "PUT") {
    const id = contestId || uuidv4();
    await upsertContest(id, name, parseInt(year, 10), JSON.parse(tasks));
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Contest upserted successfully" }),
    };
  } else if (event.httpMethod === "DELETE") {
    if (!contestId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Contest ID is required for deletion" }),
      };
    }
    await deleteContest(contestId);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Contest deleted successfully" }),
    };
  } else {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Invalid HTTP method" }),
    };
  }
};
