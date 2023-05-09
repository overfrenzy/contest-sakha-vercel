const pool = require('../database/database');

const data = `
  INSERT INTO Participant (Id, Name, Country, School, Participation, Award) VALUES (1, 'Igor Vasilev', 1, 1, 1, 1);
  INSERT INTO Country (Id, Name) VALUES (1, 'Russia');
  INSERT INTO SchoolName (Id, Name) VALUES (1, 'SVFU');
  INSERT INTO School (Id, SchoolName) VALUES (1, 1);
  INSERT INTO Participation (Contest) VALUES (1);
  INSERT INTO Award (Name) VALUES ('First Place');
  INSERT INTO Contest (Id, Name, Year) VALUES (1, 'tuy', 2023);
  INSERT INTO Task (Id, Name, Value, Solved) VALUES (1, 'Task 1', '5', TRUE);
  INSERT INTO ContestTasks (ContestId, TaskId, Number) VALUES (1, 1, 'a');
  INSERT INTO Placement (Id, Participant, Contest, Award, Time, Total) VALUES (1, 1, 1, 1, 300, 5);
  INSERT INTO Result (Participant, Task, Grade, Try, Time) VALUES (1, 1, 5, 1, 60);
`;

pool.query(data)
  .then(() => {
    console.log('Data inserted successfully!');
    pool.end(); // close the connection pool
  })
  .catch((err) => {
    console.error('Error inserting data:', err);
    pool.end(); // close the connection pool
  });

/*
node populateDB.js
Error inserting data: Error: connect ECONNREFUSED 127.0.0.1:5432
at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1487:16) {
errno: -4078,
code: 'ECONNREFUSED',
syscall: 'connect',
address: '127.0.0.1',
port: 5432
}
C:\Users\xplo1\Documents\GitHub\overfrenzy_contest-sakha.github.io\contest-sakha\database\populateDB.js:24
pool.end(); // close the connection pool
     ^

TypeError: pool.end is not a function

a problem with a certificate as far as I can understand, I cannot run cockroach sql because of it either, thus I cannot populate the db even if I am connected to it
*/