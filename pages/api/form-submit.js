import { Client } from "pg";
import parse from "pg-connection-string";

const config = parse(process.env.DATABASE_URL);

const client = new Client({
  user: config.user,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(req, res) {
  try {
    await client.connect();

    // Create the tables if they do not exist
    await client.query(
      `CREATE SEQUENCE IF NOT EXISTS contest.public.participant_seq; CREATE TABLE IF NOT EXISTS public.participant (id INT8 NOT NULL DEFAULT nextval('contest.public.participant_seq'::REGCLASS), name VARCHAR(50) NOT NULL, country INT4 NOT NULL, school INT4 NOT NULL, participation INT4 NOT NULL, award INT4 NOT NULL, CONSTRAINT participant_pkey PRIMARY KEY (id ASC), CONSTRAINT participant_fk0 FOREIGN KEY (country) REFERENCES public.country(id), CONSTRAINT participant_fk1 FOREIGN KEY (school) REFERENCES public.school(id), CONSTRAINT participant_fk2 FOREIGN KEY (participation) REFERENCES public.participation(id), CONSTRAINT participant_fk3 FOREIGN KEY (award) REFERENCES public.award(id));
       CREATE SEQUENCE IF NOT EXISTS contest.public.task_seq; CREATE TABLE IF NOT EXISTS public.task (id INT8 NOT NULL DEFAULT nextval('contest.public.task_seq'::REGCLASS), name VARCHAR(50) NOT NULL, value VARCHAR(5) NOT NULL, solved BOOL NOT NULL, CONSTRAINT task_pkey PRIMARY KEY (id ASC));      
       CREATE SEQUENCE IF NOT EXISTS contest.public.placement_seq; CREATE TABLE IF NOT EXISTS public.placement (id INT8 NOT NULL DEFAULT nextval('contest.public.placement_seq'::REGCLASS), participant INT4 NOT NULL, contest INT4 NOT NULL, award INT4 NOT NULL, "time" INT4 NOT NULL, total INT4 NOT NULL, CONSTRAINT placement_pkey PRIMARY KEY (id ASC), CONSTRAINT placement_fk0 FOREIGN KEY (participant) REFERENCES public.participant(id), CONSTRAINT placement_fk1 FOREIGN KEY (contest) REFERENCES public.contest(id), CONSTRAINT placement_fk2 FOREIGN KEY (award) REFERENCES public.award(id));
       CREATE SEQUENCE IF NOT EXISTS contest.public.country_seq; CREATE TABLE IF NOT EXISTS public.country (id INT8 NOT NULL DEFAULT nextval('contest.public.country_seq'::REGCLASS), name VARCHAR(50) NOT NULL, CONSTRAINT country_pkey PRIMARY KEY (id ASC));
       CREATE SEQUENCE IF NOT EXISTS contest.public.schoolname_seq; CREATE TABLE IF NOT EXISTS public.schoolname (id INT8 NOT NULL DEFAULT nextval('contest.public.schoolname_seq'::REGCLASS), name VARCHAR(50) NOT NULL, CONSTRAINT schoolname_pkey PRIMARY KEY (id ASC));
       CREATE SEQUENCE IF NOT EXISTS contest.public.contest_seq; CREATE TABLE IF NOT EXISTS public.contest (id INT8 NOT NULL DEFAULT nextval('contest.public.contest_seq'::REGCLASS), name VARCHAR(50) NOT NULL, year INT4 NOT NULL, CONSTRAINT contest_pkey PRIMARY KEY (id ASC));
       CREATE SEQUENCE IF NOT EXISTS contest.public.contesttasks_seq; CREATE TABLE IF NOT EXISTS public.contesttasks (id INT8 NOT NULL DEFAULT nextval('contest.public.contesttasks_seq'::REGCLASS), contestid INT4 NOT NULL, taskid INT4 NOT NULL, number VARCHAR(3) NOT NULL, CONSTRAINT contesttasks_pkey PRIMARY KEY (id ASC), CONSTRAINT contesttasks_fk0 FOREIGN KEY (contestid) REFERENCES public.contest(id), CONSTRAINT contesttasks_fk1 FOREIGN KEY (taskid) REFERENCES public.task(id));
       CREATE SEQUENCE IF NOT EXISTS contest.public.result_seq; CREATE TABLE IF NOT EXISTS public.result (id INT8 NOT NULL DEFAULT nextval('contest.public.result_seq'::REGCLASS), participant INT4 NOT NULL, task INT4 NOT NULL, grade INT4 NOT NULL, try INT4 NOT NULL, "time" INT4 NOT NULL, CONSTRAINT result_pkey PRIMARY KEY (id ASC), CONSTRAINT result_fk0 FOREIGN KEY (participant) REFERENCES public.participant(id), CONSTRAINT result_fk1 FOREIGN KEY (task) REFERENCES public.contesttasks(id));
       CREATE SEQUENCE IF NOT EXISTS contest.public.award_seq; CREATE TABLE IF NOT EXISTS public.award (id INT8 NOT NULL DEFAULT nextval('contest.public.award_seq'::REGCLASS), name VARCHAR(50) NOT NULL, CONSTRAINT award_pkey PRIMARY KEY (id ASC));
       CREATE SEQUENCE IF NOT EXISTS contest.public.participation_seq; CREATE TABLE IF NOT EXISTS public.participation (id INT8 NOT NULL DEFAULT nextval('contest.public.participation_seq'::REGCLASS), contest INT4 NOT NULL, CONSTRAINT participation_pkey PRIMARY KEY (id ASC), CONSTRAINT participation_fk0 FOREIGN KEY (contest) REFERENCES public.contest(id));
       CREATE SEQUENCE IF NOT EXISTS contest.public.school_seq; CREATE TABLE IF NOT EXISTS public.school (id INT8 NOT NULL DEFAULT nextval('contest.public.school_seq'::REGCLASS), schoolname INT4 NOT NULL, CONSTRAINT school_pkey PRIMARY KEY (id ASC), CONSTRAINT school_fk0 FOREIGN KEY (schoolname) REFERENCES public.schoolname(id));`
    );

    // Insert the data into the tables
    const {
      name,
      taskName,
      taskValue,
      taskSolved,
      placementTime,
      placementTotal,
      countryName,
      schoolName,
      contestName,
      contestYear,
      contestTasksNumber,
      resultGrade,
      resultTry,
      resultTime,
      awardName,
    } = req.body;
    await client.query("INSERT INTO Participant (Name) VALUES ($1)", [name]);
    await client.query(
      "INSERT INTO Task (Name, Value, Solved) VALUES ($1, $2, $3)",
      [taskName, taskValue, taskSolved]
    );
    await client.query("INSERT INTO Placement (Time, Total) VALUES ($1, $2)", [
      placementTime,
      placementTotal,
    ]);
    await client.query("INSERT INTO Country (Name) VALUES ($1)", [countryName]);
    await client.query("INSERT INTO SchoolName (Name) VALUES ($1)", [
      schoolName,
    ]);
    await client.query("INSERT INTO Contest (Name, Year) VALUES ($1, $2)", [
      contestName,
      contestYear,
    ]);
    await client.query("INSERT INTO ContestTasks (Number) VALUES ($1)", [
      contestTasksNumber,
    ]);
    await client.query(
      "INSERT INTO Result (Grade, Try, Time) VALUES ($1, $2, $3)",
      [resultGrade, resultTry, resultTime]
    );
    await client.query("INSERT INTO Award (Name) VALUES ($1)", [awardName]);

    res.status(200).json({ message: "Data inserted successfully" });

    await client.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while inserting data" });
  }
}
