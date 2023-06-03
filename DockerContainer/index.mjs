import { spawn } from "child_process";
import unzipper from "unzipper";
import FormData from "form-data";
import fetch from "node-fetch";
import express from "express";
import tmp from "tmp-promise";
import multer from "multer";
import fs from "fs";

const app = express();
const port = process.env.PORT || 3000;

const upload = multer();

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Archive-Name");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

app.post("/", upload.single("file"), async (req, res) => {
  try {
    const result = await handleAPIRequest(req);
    res.status(result.status).send(result.body);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

function startServer() {
  app.listen(port, () => {
  });
}

async function handleAPIRequest(request) {
  if (request.method !== "POST") {
    return { status: 405, body: "Method not allowed" };
  }

   // Extract the archiveName from the request headers
   const archiveName = request.headers['x-archive-name'];

  // Get the uploaded program file from the POST request
  const form = new FormData();
  form.append("file", request.file.buffer, "testedProgram");

  // Extract files from the database
  const extractedFiles = await extractFilesFromDatabase(archiveName);

  // Get input and answer files from the extracted files
  const inputFiles = [];
  const answerFiles = [];
  for (let i = 1; i <= 9; i++) {
    const inputFileName = `tests/${i.toString().padStart(2, "0")}.file`;
    const answerFileName = `tests/${i.toString().padStart(2, "0")}.a`;
    if (extractedFiles[inputFileName] && extractedFiles[answerFileName]) {
      inputFiles.push(extractedFiles[inputFileName]);
      answerFiles.push(extractedFiles[answerFileName]);
    }
  }

  // Create a temporary file for the program
  const programFile = await tmp.file({ postfix: ".cpp" });
  await fs.promises.writeFile(programFile.path, request.file.buffer);

  // Compile the program
  const p = spawn("g++", ["-o", `${programFile.path}.out`, programFile.path]);
  await new Promise((resolve, reject) => {
    p.on("exit", resolve);
    p.on("error", reject);
  });

  // Run the program with each input file and capture the output
  const programOutputs = [];
  for (let i = 0; i < inputFiles.length; i++) {
    const input = inputFiles[i];
    const program = spawn(`${programFile.path}.out`, [], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    program.stdin.write(input);
    program.stdin.end();

    const output = await new Promise((resolve, reject) => {
      let data = Buffer.alloc(0);
      program.stdout.on("data", (chunk) => {
        data = Buffer.concat([data, chunk]);
      });
      program.stdout.on("end", () => resolve(data));
      program.stdout.on("error", reject);
    });
    programOutputs.push(output);
  }
  //console.log("output:", output); output needs actual test .cpp to work
  //console.log("output get");

  // Create a temporary file for the test case executable
  const testCaseFile = await tmp.file({ postfix: ".exe" });
  await fs.promises.writeFile(testCaseFile.path, extractedFiles["check.exe"]);

  // Feed each input/output/answer set to the test case and capture the results
  const testResults = [];
  for (let i = 0; i < inputFiles.length; i++) {
    const input = inputFiles[i];
    const programOutput = programOutputs[i];
    const answers = answerFiles[i];
    const testResult = await runTestCase(
      testCaseFile.path,
      input,
      programOutput,
      answers
    );
    testResults.push(testResult);
  }

  //console.log("testResult:", testResult);
  //console.log("test case successful"); 
  return { status: 200, body: testResults.join("\n") };
}

// Extract files from the database
async function extractFilesFromDatabase(archiveName) {
  const url = `https://storage.yandexcloud.net/contest-bucket/testCases/${archiveName}`;

  const response = await fetch(url);

  if (response.ok) {
    const data = await response.buffer();

    const extractedFiles = {};

    await unzipper.Open.buffer(data)
      .then((archive) => {
        const filePromises = [];
        archive.files.forEach((file) => {
          const fileName = file.path;
          if (
            fileName === "check.exe" ||
            fileName.match(/^tests\/\d{1,2}\.file$/) ||
            fileName.match(/^tests\/\d{1,2}\.a$/) // it will find both single-digit numbers and two-digit numbers (02.a, 12.a)
          ) {
            const filePromise = file.buffer().then((buffer) => {
              extractedFiles[fileName] = buffer;
            });
            filePromises.push(filePromise);
          }
        });
        return Promise.all(filePromises);
      })
      .catch((error) => {
        throw new Error(
          `Failed to extract files from ${archiveName}: ${error}`
        );
      });

    return extractedFiles;
  } else {
    throw new Error(
      `Failed to fetch ${archiveName} from Yandex Object Storage`
    );
  }
}

async function runTestCase(testCasePath, input, programOutput, answers) {
  //console.log("Running test case:", testCasePath);
  // Use the test case executable to test the program output
  const result = spawn(testCasePath, [input, programOutput, answers], {
    stdio: ["ignore", "pipe", "ignore"],
  });

  return new Promise((resolve, reject) => {
    let data = Buffer.alloc(0);
    result.stdout.on("data", (chunk) => {
      data = Buffer.concat([data, chunk]);
    });
    result.stdout.on("end", () => resolve(data.toString()));
    result.stdout.on("error", reject);
  });
}

startServer();
