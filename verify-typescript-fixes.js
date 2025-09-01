#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Verifying TypeScript fixes...\n');

// Check if TypeScript is available
const tscPath = path.join(__dirname, 'node_modules', '.bin', 'tsc');

const tsc = spawn('node', [tscPath, '--noEmit', '--skipLibCheck'], {
  stdio: 'pipe',
  cwd: __dirname
});

let stdout = '';
let stderr = '';

tsc.stdout.on('data', (data) => {
  stdout += data.toString();
});

tsc.stderr.on('data', (data) => {
  stderr += data.toString();
});

tsc.on('close', (code) => {
  console.log('TypeScript Check Results:');
  console.log('========================');
  
  if (code === 0) {
    console.log('✅ SUCCESS: All TypeScript errors have been fixed!');
    console.log('✅ The project should now build without TypeScript errors.');
  } else {
    console.log('❌ FAILED: There are still TypeScript errors:');
    console.log('\nSTDOUT:', stdout);
    console.log('\nSTDERR:', stderr);
  }
  
  console.log(`\nExit code: ${code}`);
  process.exit(code);
});

tsc.on('error', (error) => {
  console.error('❌ Error running TypeScript check:', error.message);
  console.log('\n🔧 Trying alternative method...');
  
  // Try using Next.js build as fallback
  const nextBuild = spawn('node', [path.join(__dirname, 'node_modules', '.bin', 'next'), 'build'], {
    stdio: 'pipe',
    cwd: __dirname,
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  let buildOutput = '';
  
  nextBuild.stdout.on('data', (data) => {
    buildOutput += data.toString();
  });
  
  nextBuild.stderr.on('data', (data) => {
    buildOutput += data.toString();
  });
  
  nextBuild.on('close', (buildCode) => {
    if (buildCode === 0) {
      console.log('✅ SUCCESS: Next.js build completed successfully!');
      console.log('✅ All TypeScript errors have been resolved.');
    } else {
      console.log('❌ Next.js build failed. Output:');
      console.log(buildOutput);
    }
    process.exit(buildCode);
  });
});