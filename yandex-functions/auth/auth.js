const { Driver, getCredentialsFromEnv } = require("ydb-sdk");
const { v4: uuidv4 } = require("uuid");

const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714";
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function registerUser(username, password) {
  const userId = uuidv4();
  const query = `
    INSERT INTO user (user_id, username, password)
    VALUES (?, ?, ?)
  `;
  await driver.tableClient.withSession(async (session) => {
    await session.prepareQuery(query, (preparedQuery) => {
      preparedQuery.execute([userId, username, password]);
    });
  });
  return userId;
}

async function loginUser(username, password) {
  const query = `
    SELECT password FROM user
    WHERE username = ? LIMIT 1
  `;

  let storedPassword;

  await driver.tableClient.withSession(async (session) => {
    try {
      const result = await session.executeQuery(query, [username]);
      const resultSets = result.resultSets;
      const resultSet = resultSets[0];
      const rows = resultSet.rows;

      if (rows.length > 0) {
        const passwordColumn = rows[0].items[0];
        storedPassword = passwordColumn.textValue;
      }
    } catch (error) {
      console.error("Error executing query:", error);
      throw new Error("Error executing query");
    }
  });

  return storedPassword;
}

exports.handler = async (event, context) => {
  console.log("Received request:", event);

  const { httpMethod, headers, body } = event;

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  };

  if (httpMethod === "OPTIONS") {
    console.log("Preflight request");
    return response;
  }

  await driver.ready;

  if (!body || body.trim() === "") {
    console.log("Empty request body");
    response.statusCode = 400;
    response.body = "Empty request body";
    return response;
  }

  const { action, username, password } = JSON.parse(body);

  if (!username || !password) {
    console.log("Username and password required");
    response.statusCode = 400;
    response.body = "Username and password required";
    return response;
  }

  try {
    if (action === "register") {
      const userId = await registerUser(username, password);
      response.body = JSON.stringify({ userId });
      return response;
    } else if (action === "signIn") {
      const storedPassword = await loginUser(username, password);
      if (storedPassword === password) {
        response.body = JSON.stringify({ success: true });
        return response;
      } else {
        console.log("Invalid username or password");
        response.statusCode = 401;
        response.body = JSON.stringify({
          success: false,
          message: "Invalid username or password",
        });
        return response;
      }
    } else {
      console.log("Invalid action");
      response.statusCode = 400;
      response.body = "Invalid action";
      return response;
    }
  } catch (error) {
    console.error("Internal server error:", error);
    response.statusCode = 500;
    response.body = "Internal server error";
    return response;
  }
};
