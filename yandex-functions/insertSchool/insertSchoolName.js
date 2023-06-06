const { Driver, getCredentialsFromEnv, getLogger } = require("ydb-sdk");
const { v4: uuidv4 } = require("uuid");
const logger = getLogger({ level: "debug" });
const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714";
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function upsertSchool(schoolId, schoolNameId) {
  const query = `
    UPSERT INTO school (school_id, schoolname_id)
    VALUES ("${schoolId}", "${schoolNameId}")
  `;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
  return schoolId;
}

async function upsertSchoolname(schoolNameId, name) {
  const query = `
    UPSERT INTO schoolname (schoolname_id, name)
    VALUES ("${schoolNameId}", "${name}")
  `;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
  return schoolNameId;
}

async function deleteSchool(schoolId) {
  const query = `
    DELETE FROM school WHERE school_id = "${schoolId}"
  `;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
}

async function deleteSchoolname(schoolNameId, schoolId) {
  const query = `
    DELETE FROM schoolname WHERE schoolname_id = "${schoolNameId}"
  `;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });

  if (schoolId) {
    const deleteQuery = `
      DELETE FROM school WHERE school_id = "${schoolId}"
    `;
    await driver.tableClient.withSession(async (session) => {
      await session.executeQuery(deleteQuery);
    });
  }
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

  const { schoolnameId, schoolName, schoolId } = body;

  if (event.httpMethod === "POST" || event.httpMethod === "PUT") {
    const newSchoolNameId = schoolnameId || uuidv4();
    await upsertSchoolname(newSchoolNameId, schoolName);
    await upsertSchool(schoolId, newSchoolNameId);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "School name added/updated successfully" }),
    };
  } else if (event.httpMethod === "DELETE") {
    if (!schoolId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "School ID is required for deletion" }),
      };
    }

    await deleteSchool(schoolId);
    await deleteSchoolname(schoolnameId, schoolId);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "School name deleted successfully" }),
    };
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid HTTP method" }),
    };
  }
};
