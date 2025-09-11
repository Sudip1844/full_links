#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting server...');

// Start the server using tsx from node_modules
const serverProcess = spawn('npx', ['tsx', 'index.ts'], {
  cwd: join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true,
  env: { 
    ...process.env, 
    NODE_ENV: 'development',
    PORT: '3000'
  }
});

serverProcess.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code || 0);
});

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down server...');
  serverProcess.kill('SIGTERM');
});