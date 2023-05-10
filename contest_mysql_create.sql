CREATE TABLE "Participant" (
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"country" INT NOT NULL,
	"school" INT NOT NULL,
	"participation" INT NOT NULL,
	"award" INT NOT NULL,
	UNIQUE ("name", "country", "school", "participation")
);

CREATE TABLE "Task" (
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"value" VARCHAR(5) NOT NULL,
	"solved" BOOLEAN NOT NULL
);

CREATE TABLE "Placement" (
	"id" SERIAL PRIMARY KEY,
	"participant" INT NOT NULL,
	"contest" INT NOT NULL,
	"award" INT NOT NULL,
	"time" INT NOT NULL,
	"total" INT NOT NULL
);

CREATE TABLE "Country" (
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL
);

CREATE TABLE "SchoolName" (
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL
);

CREATE TABLE "Contest" (
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"year" INT NOT NULL
);

CREATE TABLE "ContestTasks" (
	"id" SERIAL PRIMARY KEY,
	"contestId" INT NOT NULL,
	"taskId" INT NOT NULL,
	"number" VARCHAR(3) NOT NULL
);

CREATE TABLE "School" (
	"id" SERIAL PRIMARY KEY,
	"schoolName_id" INT NOT NULL
);

CREATE TABLE "Participation" (
	"id" SERIAL PRIMARY KEY,
	"contest" INT NOT NULL
);

CREATE TABLE "Result" (
	"id" SERIAL PRIMARY KEY,
	"participant" INT NOT NULL,
	"task" INT NOT NULL,
	"grade" INT NOT NULL,
	"try" INT NOT NULL,
	"time" INT NOT NULL
);

CREATE TABLE "Award" (
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL
);

ALTER TABLE "Participant" ADD FOREIGN KEY ("country") REFERENCES "Country"("id");

ALTER TABLE "Participant" ADD FOREIGN KEY ("school") REFERENCES "School"("id");

ALTER TABLE "Participant" ADD FOREIGN KEY ("participation") REFERENCES "Participation"("id");

ALTER TABLE "Participant" ADD FOREIGN KEY ("award") REFERENCES "Award"("id");

ALTER TABLE "Placement" ADD FOREIGN KEY ("participant") REFERENCES "Participant"("id");

ALTER TABLE "Placement" ADD FOREIGN KEY ("contest") REFERENCES "Contest"("id");

ALTER TABLE "Placement" ADD FOREIGN KEY ("award") REFERENCES "Award"("id");

ALTER TABLE "ContestTasks" ADD FOREIGN KEY ("contestId") REFERENCES "Contest"("id");

ALTER TABLE "ContestTasks" ADD FOREIGN KEY ("taskId") REFERENCES "Task"("id");

ALTER TABLE "School" ADD FOREIGN KEY ("schoolName_id") REFERENCES "SchoolName"("id");

ALTER TABLE "Participation" ADD FOREIGN KEY ("contest") REFERENCES "Contest"("id");

ALTER TABLE "Result" ADD FOREIGN KEY ("participant") REFERENCES "Participant"("id");

ALTER TABLE "Result" ADD FOREIGN KEY ("task") REFERENCES "ContestTasks"("id");