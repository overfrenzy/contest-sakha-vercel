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

async function loginUser(username) {
  console.log("Calling loginUser function"); // Log function call

  const query = `
    SELECT password FROM user
    WHERE username = '${username}'
  `;

  let storedPassword;

  await driver.tableClient.withSession(async (session) => {
    try {
      const result = await session.executeQuery(query);
      console.log("Query execution successful"); // Log query execution success

      const resultSets = result.resultSets;
      const resultSet = resultSets[0];
      const rows = resultSet.rows;

      if (rows.length > 0) {
        const passwordColumn = rows[0].items[0];
        storedPassword = passwordColumn.textValue;
        console.log("Stored password:", storedPassword); // Log the storedPassword value
      } else {
        console.log("No password found for the given username.");
      }
    } catch (error) {
      console.error("Error executing query:", error); // Log any error that occurred during query execution
    }
  });

  return storedPassword;
}

exports.handler = async (event, context) => {
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
    return response;
  }

  await driver.ready;

  if (!body || body.trim() === "") {
    response.statusCode = 400;
    response.body = "Empty request body";
    return response;
  }

  const { action, username, password } = JSON.parse(body);

  if (!username || !password) {
    response.statusCode = 400;
    response.body = "Username and password required";
    return response;
  }

  try {
    if (action === "register") {
      const userId = await registerUser(username, password);
      response.body = JSON.stringify({ userId });
      return response;
    } else if (action === "login") {
      const storedPassword = await loginUser(username);
      if (storedPassword === password) {
        response.body = JSON.stringify({ success: true, password: storedPassword });
        return response;
      } else {
        response.statusCode = 401;
        response.body = JSON.stringify({
          success: false,
          message: "Invalid username or password",
        });
        return response;
      }
    } else {
      response.statusCode = 400;
      response.body = "Invalid action";
      return response;
    }
  } catch (error) {
    response.statusCode = 500;
    response.body = "Internal server error";
    return response;
  }
};
