const { Driver, getCredentialsFromEnv } = require("ydb-sdk");

const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/your-database-path";
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function upsertSchool(schoolId, schoolName) {
  const schoolNameJson = JSON.stringify(schoolName);
  const query = `
    UPSERT INTO school (school_id, schoolname)
    VALUES ("${schoolId}", '${schoolNameJson}')
  `;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
}

async function deleteSchool(schoolId) {
  const query = `
    DELETE FROM school WHERE school_id = "${schoolId}"
  `;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
}

exports.handler = async (event, context) => {
  const { httpMethod, queryStringParameters, body } = event;

  const headers = {
    "Access-Control-Allow-Origin": "*", 
    "Access-Control-Allow-Methods": "POST, DELETE", 
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (httpMethod === "OPTIONS") {
    // Handle pre-flight request
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (httpMethod === "POST") {
    const { schoolId, schoolName } = JSON.parse(body);

    try {
      await upsertSchool(schoolId, schoolName);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "School added successfully" }),
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: "Failed to add school" }),
      };
    }
  } else if (httpMethod === "DELETE") {
    const { schoolId } = queryStringParameters;

    try {
      await deleteSchool(schoolId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "School deleted successfully" }),
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: "Failed to delete school" }),
      };
    }
  } else {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Invalid HTTP method" }),
    };
  }
};
