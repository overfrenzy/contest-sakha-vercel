import { RarArchive } from "https://deno.land/x/rar/mod.ts";

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Check that the request method is POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  // Get the uploaded program file from the POST request
  const formData = await request.formData();
  const file = formData.get('file');
  
  // Extract files from the database
  const archiveName = 'archive_name.rar';
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
  
  // Write the program file to disk
  await Deno.writeTextFile('/tmp/program.cpp', file);
    
  // Compile the program
  const p = Deno.run({
    cmd: ['g++', '-o', '/tmp/program', '/tmp/program.cpp']
  });
  await p.status();
    
  // Run the program with each input file and capture the output
  const programOutputs = [];
  for (let i = 0; i < inputFiles.length; i++) {
    const input = inputFiles[i];
    const program = Deno.run({
      cmd: ['/tmp/program'],
      stdin: 'piped',
      stdout: 'piped',
    });
    await program.stdin.write(new TextEncoder().encode(input));
    program.stdin.close();
    const outputFileName = `/tmp/program_output_${i}.txt`;
    await program.outputToFile(outputFileName);
    programOutputs.push(await Deno.readTextFile(outputFileName));
  }
    
  // Read the test case executable from the database and write it to disk
  const testCase = extractedFiles['check.exe'];
  await Deno.writeFile('/tmp/check.exe', testCase);
    
  // Feed each input/output/answer set to the test case and capture the results
  const testResults = [];
  for (let i = 0; i < inputFiles.length; i++) {
    const input = inputFiles[i];
    const programOutput = programOutputs[i];
    const answers = answerFiles[i];
    const testResult = await runTestCase('/tmp/check.exe', input, programOutput, answers);
    testResults.push(testResult);
  }
    
  // Return the test case results as the response
  return new Response(testResults.join('\n'), { status: 200 });
}

async function extractFilesFromDatabase(archiveName) {
  const url = `https://storage.yandexcloud.net/contest-bucket/${archiveName}`;

  const response = await fetch(url);

  if (response.ok) {
    const data = new Uint8Array(await response.arrayBuffer());
    const rar = new RarArchive(data);

    let extractedFiles = {};

    for (const entry of rar.getEntries()) {
      const fileName = entry.name;
      if (fileName === 'check.exe' || fileName.match(/^tests\/\d{2}\.file$/) || fileName.match(/^tests\/\d{2}\.a$/)) {
        extractedFiles[fileName] = entry.getData();
      }
    }

    return extractedFiles;
  } else {
    throw new Error(`Failed to fetch ${archiveName} from Yandex Object Storage`);
  }
}

async function runTestCase(testCasePath, input, programOutput, answers) {
  // Use the test case executable to test the program output
  const result = await Deno.run({
    cmd: [testCasePath, input, programOutput, answers],
    stdout: 'piped',
  });
  
  return new TextDecoder().decode(await result.output());
}