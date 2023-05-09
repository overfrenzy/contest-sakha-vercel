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
    
    // Read the input  and answers from the database
    const input = await readFromDatabase('input.txt');
    const answers = await readFromDatabase('inputA.txt');
    
    // Write the file to disk
    await Deno.writeTextFile('/tmp/program.cpp', file);
    
    // Compile the file
    const p = Deno.run({
      cmd: ['g++', '-o', '/tmp/program', '/tmp/program.cpp']
    });
    await p.status();
    
    // Run the program with the input data and capture the output
    const program = Deno.run({
      cmd: ['/tmp/program'],
      stdin: 'piped',
      stdout: 'piped',
    });
    await program.stdin.write(new TextEncoder().encode(input));
    program.stdin.close();
    await program.outputToFile('/tmp/program_output.txt');
    
    // Read the program output from the output file
    const programOutput = await Deno.readTextFile('/tmp/program_output.txt');
    
    // Read the test case executable from the database and write it to disk
    const testCase = await readFromDatabase('check.exe');
    await Deno.writeFile('/tmp/check.exe', testCase);
    
    // Feed the input, program output, and inputA to the test case
    const testResult = await runTestCase('/tmp/check.exe', input, programOutput, answers);
    
    // Return the test case result as the response
    return new Response(testResult, { status: 200 });
  }
  
  async function readFromDatabase() {
 
  }
  
  async function runTestCase(testCasePath, input, programOutput, answers) {
    // Use the test case executable to test the program output
    const result = await Deno.run({
      cmd: [testCasePath, input, programOutput, answers],
      stdout: 'piped',
    });
    return new TextDecoder().decode(await result.output());
  }
  


//нужно изменить функцию readFromDatabase и положить testcase.exe, input.txt и inputA.txt в бд.