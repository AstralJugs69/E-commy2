// Simple script to start both servers
const { spawn } = require('child_process');
const path = require('path');

// Function to spawn a process and pipe its output
function startProcess(command, args, cwd) {
  console.log(`Starting: ${command} ${args.join(' ')} in ${cwd}`);
  
  const process = spawn(command, args, { 
    cwd,
    shell: true,
    stdio: 'pipe'
  });
  
  process.stdout.on('data', (data) => {
    console.log(`[${cwd}] ${data.toString().trim()}`);
  });
  
  process.stderr.on('data', (data) => {
    console.error(`[${cwd}] ERROR: ${data.toString().trim()}`);
  });
  
  process.on('close', (code) => {
    console.log(`${cwd} process exited with code ${code}`);
  });
  
  return process;
}

// Paths to our package directories
const rootDir = __dirname;
const backendDir = path.join(rootDir, 'packages', 'backend');
const adminDir = path.join(rootDir, 'packages', 'admin-frontend');

// Start the backend server
const backendProcess = startProcess('npm', ['run', 'dev'], backendDir);

// Wait a bit before starting the frontend to ensure backend is ready
setTimeout(() => {
  const adminProcess = startProcess('npm', ['run', 'dev'], adminDir);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down servers...');
    backendProcess.kill();
    adminProcess.kill();
    process.exit(0);
  });
}, 3000);

console.log('Servers starting...');
console.log('Press Ctrl+C to stop both servers.'); 