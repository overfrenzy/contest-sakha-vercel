const { Driver, getCredentialsFromEnv, getLogger } = require("ydb-sdk");
const { v4: uuidv4 } = require('uuid');
const logger = getLogger({ level: "debug" });
const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714";
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function upsertSchools(schools) {
  const values = schools
    .map(school => {
      const schoolId = uuidv4();
      const schoolnameJson = JSON.stringify(school.schoolName);
      return `("${schoolId}", '${schoolnameJson}')`;
    })
    .join(',');

  const query = `UPSERT INTO school (school_id, schoolname) VALUES ${values}`;
  
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
  return schools.length;
}

async function deleteSchool(schoolId) {
  const query = `DELETE FROM school WHERE school_id = '${schoolId}'`;

  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
}

async function updateSchool(schoolId, schoolName) {
  const schoolNameJson = JSON.stringify(schoolName);
  const query = `UPDATE school SET schoolname = '${schoolNameJson}' WHERE school_id = '${schoolId}'`;

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

  try {
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

    const { schools } = body;

    if (!Array.isArray(schools)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Invalid schools data" }),
      };
    }

    await upsertSchools(schools);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Schools upserted successfully" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
