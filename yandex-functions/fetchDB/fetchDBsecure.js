const { OAuth2Client } = require("google-auth-library");
const { Driver, getCredentialsFromEnv, getLogger } = require("ydb-sdk");

const logger = getLogger({ level: "debug" });
const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714";
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function checkPermissions(email) {
  let idToken = null;

  await driver.tableClient.withSession(async (session) => {
    // Check if email exists in the database
    const userResult = await session.executeQuery(`
      SELECT idToken FROM user WHERE email = '${email}';
    `);

    if (userResult.resultSets[0].rows.length === 0 || !idToken) {
      throw new Error("User not found1");
    }

    idToken =
      userResult.resultSets[0].rows[0].items[0]?.bytesValue?.toString("utf8") ||
      "";
  });

  if (!idToken) {
    throw new Error("User not found2");
  }

  return idToken;
}

async function fetchData() {
  let countries,
    schools,
    participations,
    awards,
    contests,
    schoolnames,
    participants;

  await driver.tableClient.withSession(async (session) => {
    // Fetch countries data
    const countriesResult = await session.executeQuery(`
      SELECT * FROM country;
    `);
    countries = countriesResult.resultSets[0].rows.map((row) => {
      const country_id = row.items[0]?.bytesValue?.toString("utf8") || "";
      const name = row.items[1].textValue;
      return { country_id, name };
    });

    // Fetch schools data
    const schoolsResult = await session.executeQuery(`
      SELECT * FROM school;
    `);
    schools = schoolsResult.resultSets[0].rows.map((row) => {
      const school_id = row.items[0]?.bytesValue?.toString("utf8") || "";
      const schoolname_id = row.items[1]?.bytesValue?.toString("utf8") || "";
      return { school_id, schoolname_id };
    });

    // Fetch participations data
    const participationsResult = await session.executeQuery(`
      SELECT * FROM participation;
    `);
    participations = participationsResult.resultSets[0].rows.map((row) => {
      const award_id = row.items[0]?.bytesValue?.toString("utf8") || "";
      const contest_id = row.items[1]?.bytesValue?.toString("utf8") || "";
      const participant_id = row.items[2]?.bytesValue?.toString("utf8") || "";
      const participation_id = row.items[3]?.bytesValue?.toString("utf8") || "";
      const tasksdone = row.items[4].textValue;
      const time = row.items[5].textValue;
      const trycount = row.items[6].textValue;
      return {
        award_id,
        contest_id,
        participant_id,
        participation_id,
        tasksdone,
        time,
        trycount,
      };
    });

    // Fetch awards data
    const awardsResult = await session.executeQuery(`
      SELECT * FROM award;
    `);
    awards = awardsResult.resultSets[0].rows.map((row) => {
      const award_id = row.items[0]?.bytesValue?.toString("utf8") || "";
      const name = row.items[1].textValue;
      return { award_id, name };
    });

    // Fetch contests data
    const contestsResult = await session.executeQuery(`
      SELECT * FROM contest;
    `);
    contests = contestsResult.resultSets[0].rows.map((row) => {
      const contest_id = row.items[0]?.bytesValue?.toString("utf8") || "";
      const name = row.items[1].textValue;
      const tasks = row.items[2].textValue;
      const yearLong = row.items[3].int64Value;
      const year = yearLong.toInt();
      return { contest_id, name, tasks, year };
    });

    // Fetch school names data
    const schoolNamesResult = await session.executeQuery(`
      SELECT * FROM schoolname;
    `);
    schoolnames = schoolNamesResult.resultSets[0].rows.map((row) => {
      const name = row.items[0].textValue;
      const schoolname_id = row.items[1]?.bytesValue?.toString("utf8") || "";
      return { name, schoolname_id };
    });

    // Fetch participant names data
    const participantResult = await session.executeQuery(`
      SELECT * FROM participant;
    `);
    participants = participantResult.resultSets[0].rows.map((row) => {
      const country_id = row.items[0]?.bytesValue?.toString("utf8") || "";
      const name = row.items[1].textValue;
      const participant_id = row.items[2]?.bytesValue?.toString("utf8") || "";
      const participation_id = row.items[3]?.bytesValue?.toString("utf8") || "";
      const school_id = row.items[4]?.bytesValue?.toString("utf8") || "";
      return { country_id, name, participant_id, participation_id, school_id };
    });
  });

  return {
    countries,
    schools,
    participations,
    awards,
    contests,
    schoolnames,
    participants,
  };
}

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Email, Audience",
          "Access-Control-Max-Age": "86400",
        },
        body: "",
      };
    }

    const clientIdHeader = event.headers["Audience"];
    if (!clientIdHeader) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing clientid header" }),
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      };
    }

    const emailHeader = event.headers["Email"];
    if (!emailHeader) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing email header" }),
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      };
    }

    const clientId = clientIdHeader;
    const email = emailHeader;

    // Verify the ID token
    const client = new OAuth2Client(clientId);
    const idToken = await checkPermissions(email);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });
    const data = await fetchData();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Email, Audience",
        "Access-Control-Max-Age": "86400",
      },
    };
  } catch (error) {
    let statusCode = 403;
    let errorMessage = "Unauthorized";
    if (error.message === "User not found") {
      statusCode = 404;
      errorMessage = "User not found";
    } else if (error.message === "Insufficient permissions") {
      statusCode = 403;
      errorMessage = "Insufficient permissions";
    }

    return {
      statusCode,
      body: JSON.stringify({ error: errorMessage }),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  }
};
