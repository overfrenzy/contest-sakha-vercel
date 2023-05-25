import { Driver, getCredentialsFromEnv } from "ydb-sdk";
const { v4: uuidv4 } = require('uuid');
const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714";
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function storePassword(username, password) {
  const userId = uuidv4();
  const query = `
    INSERT INTO users (user_id, username, password)
    VALUES ('${userId}', '${username}', '${password}')
  `;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
  return userId;
}

async function getPassword(username) {
  const query = `
    SELECT password FROM users
    WHERE username = '${username}'
  `;
  let password;
  await driver.tableClient.withSession(async (session) => {
    const result = await session.executeQuery(query);
    const resultSet = result.getResultSet();
    if (resultSet.next()) {
      password = resultSet.getString(0);
    }
  });
  return password;
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
    if (req.method === "OPTIONS") {
      res.status(200).send("");
      return;
    }
  
    await driver.ready;
  
    if (!req.body || req.body.trim() === "") {
      res.status(400).send("Empty request body");
      return;
    }
  
    const { username, password } = JSON.parse(req.body);
  
    try {
      const userId = await storePassword(username, password);
      const passwordResponse = await getPassword(username);
      res.status(200).json({ userId, password: passwordResponse });
    } catch (error) {
      res.status(400).send("Invalid JSON format");
    }
  }