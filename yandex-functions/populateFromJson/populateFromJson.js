// old unfinished function

const { Driver, getCredentialsFromEnv, Type } = require('ydb-sdk');
const { v4: uuidv4 } = require('uuid');

const endpoint = 'grpcs://ydb.serverless.yandexcloud.net:2135';
const database = '/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714';
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function insertData(jsonData) {
  const contestName = jsonData.students[0].contest;

  const parsedData = jsonData.students.map((student) => {
    const participantName = student.participant_en;
    const countryName = student.country_en;
    const tasksDone = JSON.stringify(student.problems1.concat(student.problems2));
    const awardName = student.place;

    return {
      participant: { name: participantName },
      country: { name: countryName },
      award: { name: awardName },
      participation: { tasksDone: tasksDone, contestName: contestName },
    };
  });

  const insertPromises = parsedData.map(async (data) => {
    const participantId = uuidv4();
    const participationId = uuidv4();
    const countryId = uuidv4();
    const awardId = uuidv4();
    let schoolId;

    await driver.tableClient.withSession(async (session) => {
      // Check if contest exists
      const contestQuery = `
        SELECT contest_id
        FROM contest
        WHERE name = '${data.participation.contestName}'
        LIMIT 1;
      `;
      const contestParams = {
        $params: {
          contestName: Type.createString(data.participation.contestName),
        },
      };

      try {
        const contestResult = await session.executeQuery(contestQuery, contestParams);

        if (!contestResult) {
          throw new Error('Contest result object is undefined');
        }

        console.log('Contest result object:', contestResult);

        const resultSet = contestResult.resultSet;

        const contestExists = resultSet && resultSet.rows && resultSet.rows.length > 0;

      // If contest doesn't exist, insert it
      let contestId;
      if (!contestExists) {
        contestId = uuidv4();
        await session.executeQuery(`
          INSERT INTO contest (contest_id, name)
          VALUES ('${contestId}', '${data.participation.contestName}');
        `);
      } else {
        contestId = contestResult.resultSet.rows[0].values[0].stringValue;
      }

      // Insert country
      await session.executeQuery(`
        INSERT INTO country (country_id, name)
        VALUES ('${countryId}', '${data.country.name}');
      `);

      // Insert school
      const schoolQuery = `
        SELECT school_id
        FROM schoolname
        WHERE name = '${contestName}'
        LIMIT 1;
      `;
      const schoolResult = await session.executeQuery(schoolQuery);
      const schoolExists = schoolResult.resultSet.rows.length > 0;

      if (!schoolExists) {
        schoolId = uuidv4();
        await session.executeQuery(`
          INSERT INTO schoolname (schoolname_id, name)
          VALUES ('${schoolId}', '${contestName}');
        `);
      } else {
        schoolId = schoolResult.resultSet.rows[0].values[0].stringValue;
      }

      // Insert participant
      await session.executeQuery(`
        INSERT INTO participant (participant_id, country_id, school_id, participation_id, name)
        VALUES ('${participantId}', '${countryId}', '${schoolId}', '${participationId}', '${data.participant.name}');
      `);

      // Insert participation
      await session.executeQuery(`
        INSERT INTO participation (participation_id, participant_id, award_id, contest_id, tasksdone)
        VALUES ('${participationId}', '${participantId}', '${awardId}', '${contestId}', '${data.participation.tasksDone}');
      `);

      // Insert award
      await session.executeQuery(`
        INSERT INTO award (award_id, name)
        VALUES ('${awardId}', '${data.award.name}');
      `);
    } catch (error) {
      console.error('Error fetching contest data:', error.message);
      throw error;
    }
  });
});

  await Promise.all(insertPromises);
}

async function fetchAllData(jsonData) {
  const contestName = jsonData.students[0].contest;

  const query = `
    SELECT *
    FROM schoolname
      JOIN school ON schoolname.schoolname_id = school.schoolname_id
      JOIN participant ON school.school_id = participant.school_id
      JOIN country ON participant.country_id = country.country_id
      JOIN participation ON participant.participant_id = participation.participant_id
      JOIN award ON participation.award_id = award.award_id
      JOIN contest ON participation.contest_id = contest.contest_id
    WHERE contest.name = '${contestName}'
  `;

  const result = await driver.tableClient.withSession(async (session) => {
    return await session.executeQuery(query);
  });

  if (result && result.resultSet && result.resultSet.rows) {
    return result.resultSet.rows;
  } else {
    throw new Error('Failed to fetch data from YDB');
  }
}


exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod === 'POST') {
    const jsonData = JSON.parse(event.body);
    await insertData(jsonData);

    const result = await fetchAllData(jsonData);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(result),
    };
  }

  return {
    statusCode: 405,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ message: 'Method not allowed' }),
  };
};