/*
import { spawn } from 'child_process';
import { Buffer } from 'buffer';
import unzipper from 'unzipper';
import FormData from 'form-data';
import fetch from 'node-fetch';
import nc from 'next-connect';
import tmp from 'tmp-promise';

async function handleRequest(req, res) {
  try {
    const result = await handleAPIRequest(req);
    res.status(result.status);
    res.setHeader('Content-Type', 'text/plain');
    res.end(result.body);
  } catch (e) {
    console.error(e);
    res.status(500);
    res.end();
  }
}

async function handleAPIRequest(request) {
  // Check that the request method is POST
  if (request.method !== 'POST') {
    return { status: 405, body: 'Method not allowed' };
  }
  
  // Get the uploaded program file from the POST request
  const form = new FormData();
  form.append('file', request);
  
  // Extract files from the database
  const archiveName = 'granopodus-26%24windows.zip'; //how to dynamically call for archives? hardcode it into a page tasks when sending a post request?
  const extractedFiles = await extractFilesFromDatabase(archiveName);
  
  // Get input and answer files from the extracted files
  const inputFiles = [];
  const answerFiles = [];
  for (let i = 1; i <= 9; i++) {
    const inputFileName = `tests/${i.toString().padStart(2, '0')}.file`;
    const answerFileName = `tests/${i.toString().padStart(2, '0')}.a`;
    if (extractedFiles[inputFileName] && extractedFiles[answerFileName]) {
      inputFiles.push(extractedFiles[inputFileName]);
      answerFiles.push(extractedFiles[answerFileName]);
    }
  }
  
  // Create a temporary file for the program
  const programFile = await tmp.file({ postfix: '.cpp' });
  await programFile.write(form.get('file'));
  await programFile.close();
    
  // Compile the program
  const p = spawn('g++', ['-o', `${programFile.path}.out`, programFile.path]);
  await new Promise((resolve, reject) => {
    p.on('exit', resolve);
    p.on('error', reject);
  });
    
  // Run the program with each input file and capture the output
  const programOutputs = [];
  for (let i = 0; i < inputFiles.length; i++) {
    const input = inputFiles[i];
    const program = spawn(`${programFile.path}.out`, [], { stdio: ['pipe', 'pipe', 'pipe'] });
    program.stdin.write(input);
    program.stdin.end();
    
    const output = await new Promise((resolve, reject) => {
      let data = Buffer.alloc(0);
      program.stdout.on('data', chunk => {
        data = Buffer.concat([data, chunk]);
      });
      program.stdout.on('end', () => resolve(data));
      program.stdout.on('error', reject);
    });
    programOutputs.push(output);
  }
    
  // Create a temporary file for the test case executable
  const testCaseFile = await tmp.file({ postfix: '.exe' });
  await testCaseFile.write(extractedFiles['check.exe']);
  await testCaseFile.close();
    
  // Feed each input/output/answer set to the test case and capture the results
  const testResults = [];
  for (let i = 0; i < inputFiles.length; i++) {
    const input = inputFiles[i];
    const programOutput = programOutputs[i];
    const answers = answerFiles[i];
    const testResult = await runTestCase(testCaseFile.path, input, programOutput, answers);
    testResults.push(testResult);
  }
    
  // Return the test case results as the response
  return { status: 200, body: testResults.join('\n') };
}

// Extract files from the database
async function extractFilesFromDatabase(archiveName) {
  const url = `https://storage.yandexcloud.net/contest-bucket/${archiveName}`;

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
            fileName === 'check.exe' ||
            fileName.match(/^tests\/\d{2}\.file$/) ||
            fileName.match(/^tests\/\d{2}\.a$/)
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
        throw new Error(`Failed to extract files from ${archiveName}: ${error}`);
      });

    return extractedFiles;
  } else {
    throw new Error(`Failed to fetch ${archiveName} from Yandex Object Storage`);
  }
}

async function runTestCase(testCasePath, input, programOutput, answers) {
  // Use the test case executable to test the program output
  const result = spawn(testCasePath, [input, programOutput, answers], { stdio: ['ignore', 'pipe', 'ignore'] });
  
  return new Promise((resolve, reject) => {
    let data = Buffer.alloc(0);
    result.stdout.on('data', chunk => {
      data = Buffer.concat([data, chunk]);
    });
    result.stdout.on('end', () => resolve(data.toString()));
    result.stdout.on('error', reject);
  });
}

const handler = nc().post(handleRequest);
console.log(handler);


export default handler;
*/

//Vercel doesn't support the child_process.spawn() method for running executables like g++, how to compile a programm is a question
//use third party service? Compiler Explorer, Judge0
//break down the code into smaller functions and use Vercel's serverless functions to handle specific tasks as Vercel uses serverless functions, which are individual, stateless, and short-lived