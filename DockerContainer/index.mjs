import { spawn } from "child_process";
import unzipper from "unzipper";
import FormData from "form-data";
import fetch from "node-fetch";
import express from "express";
import tmp from "tmp-promise";
import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";

const app = express();
const port = process.env.PORT || 3000;
const testlibPath = path.join(os.tmpdir(), "testlib");

const upload = multer();

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, X-Archive-Name"
  );
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

async function downloadTestlib() {
  const url = "https://storage.yandexcloud.net/contest-bucket/dependencies/testlib.zip";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch testlib.h: ${response.status}`);
  }

  const data = await response.arrayBuffer();
  const directory = await unzipper.Open.buffer(Buffer.from(data));
  await directory.extract({ path: testlibPath });
  console.log("Downloaded and extracted testlib.h successfully");
}

async function startServer() {
  // Before starting the server, download and extract the testlib
  await downloadTestlib();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

async function handleAPIRequest(request) {
  if (request.method !== "POST") {
    return { status: 405, body: "Method not allowed" };
  }

  // Extract the archiveName from the request headers
  const archiveName = request.headers["x-archive-name"];

  // Get the uploaded program file from the POST request
  const form = new FormData();
  form.append("file", request.file.buffer, "testedProgram");

  // Extract files from the database
  const extractedFiles = await extractFilesFromDatabase(archiveName);

  // Check if check.cpp file exists
  if (!extractedFiles["check.cpp"]) {
    throw new Error("check.cpp file is missing in the extracted files.");
  }

  // Get input and answer files from the extracted files
  const inputFiles = [];
  const answerFiles = [];
  for (const fileName in extractedFiles) {
    // If the file is in the "tests/" directory...
    if (fileName.startsWith("tests/")) {
      // If the file has ".a" extension, it's an answer file
      if (fileName.endsWith(".a")) {
        answerFiles.push(extractedFiles[fileName]);
      // If the file doesn't have ".a" extension, it's an input file
      } else {
        inputFiles.push(extractedFiles[fileName]);
      }
    }
  }

  console.log("Extracted files:", extractedFiles);
  console.log("Input files:", inputFiles);
  console.log("Answer files:", answerFiles);

  // Create a temporary file for the program
  const programFile = await tmp.file({ postfix: ".cpp" });
  await fs.promises.writeFile(programFile.path, request.file.buffer);
  console.log("Created a temp file for the program");

  // Compile the program
  const p = spawn("g++", ["-o", `${programFile.path}.out`, programFile.path]);
  await new Promise((resolve, reject) => {
    p.on("exit", resolve);
    p.on("error", reject);
  });
  console.log("Compiled the program");

  // Create a temporary file for the check program
  const checkFile = await tmp.file({ postfix: ".cpp" });
  await fs.promises.writeFile(checkFile.path, extractedFiles["check.cpp"]);
  console.log("Created a temp file for the check program");

  // Compile the check program
  const p2 = spawn("g++", ["-I", testlibPath, "-o", `${checkFile.path}.out`, checkFile.path]);
  await new Promise((resolve, reject) => {
    p2.on("exit", resolve);
    p2.on("error", reject);
  });
  console.log("Compiled the check program");

  // Run the program with each input file and capture the output
  const programOutputs = [];
  for (let i = 0; i < inputFiles.length; i++) {
    const input = inputFiles[i];
    const program = spawn(`${programFile.path}.out`, [], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    program.stdin.write(input);
    program.stdin.end();

    const outputPromise = new Promise((resolve, reject) => {
      let data = Buffer.alloc(0);
      program.stdout.on("data", (chunk) => {
        data = Buffer.concat([data, chunk]);
      });
      program.stdout.on("end", () => resolve(data));
      program.stdout.on("error", reject);
    });

    const output = await outputPromise;
    programOutputs.push(output.toString());
  }
  console.log("Program outputs:", programOutputs);

  // Run the check program with each input/output/answer set and capture the results
  const testResults = [];
  for (let i = 0; i < inputFiles.length; i++) {
    const input = inputFiles[i];
    const programOutput = programOutputs[i];
    const answers = answerFiles[i];
    const testResult = await runCheckProgram(
      `${checkFile.path}.out`,
      input,
      programOutput,
      answers
    );
    testResults.push(testResult);
  }

  console.log("Test results:", testResults);

  return { status: 200, body: testResults.join("\n") };
}

// Extract files from the database
async function extractFilesFromDatabase(archiveName) {
  const url = `https://storage.yandexcloud.net/contest-bucket/testCases/${archiveName}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${archiveName}: ${response.status}`);
  }

  console.log("Fetched archive data successfully.");

  try {
    const data = await response.arrayBuffer();
    const extractedFiles = {};

    await unzipper.Open.buffer(Buffer.from(data)).then((archive) => {
      const filePromises = [];
      archive.files.forEach((file) => {
        const fileName = file.path;

        if (
          fileName === "check.cpp" ||
          fileName.match(/^tests\/\d{1,2}$/) ||
          fileName.match(/^tests\/\d{1,2}\.a$/)
        ) {
          const filePromise = file.buffer().then((buffer) => {
            extractedFiles[fileName] = buffer;
            console.log(
              "Extracted file:",
              fileName,
              ", size:",
              buffer.length,
              "bytes"
            );
          });
          filePromises.push(filePromise);
        }
      });
      return Promise.all(filePromises);
    });

    console.log("Total files extracted:", Object.keys(extractedFiles).length);
    return extractedFiles;
  } catch (error) {
    throw new Error(`Failed to extract files from ${archiveName}: ${error}`);
  }
}

async function runCheckProgram(checkProgramPath, input, programOutput, answers) {
  console.log("Running check program:", checkProgramPath);
  console.log("Input:", input);
  console.log("Program Output:", programOutput);
  console.log("Answers:", answers);

  // Use the check program executable to test the program output
  console.log("Working directory:", process.cwd());

  const result = spawn(checkProgramPath, [input, programOutput, answers], {
    stdio: ["ignore", "pipe", "ignore"],
  });

  return new Promise((resolve, reject) => {
    let data = Buffer.alloc(0);
    result.stdout.on("data", (chunk) => {
      data = Buffer.concat([data, chunk]);
    });
    result.stdout.on("end", () => {
      const output = data.toString();
      console.log("Check program output:", output);
      resolve(output);
    });
    result.stdout.on("error", (error) => {
      console.error("Error occurred while reading check program output:", error);
      reject(error);
    });

    result.on("error", (error) => {
      console.error("Error occurred while running check program:", error);
      reject(error);
    });
  });
}

startServer();
