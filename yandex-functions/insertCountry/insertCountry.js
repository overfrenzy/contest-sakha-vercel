const { Driver, getCredentialsFromEnv, getLogger } = require("ydb-sdk");
const { v4: uuidv4 } = require("uuid");
const logger = getLogger({ level: "debug" });
const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714";
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function insertCountry(name) {
  const countryId = uuidv4();
  const query = `
    INSERT INTO country (country_id, name)
    VALUES ("${countryId}", "${name}")
  `;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
  return countryId;
}

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
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

  const { countryName } = body;

  await insertCountry(countryName);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Country added successfully" }),
  };
};