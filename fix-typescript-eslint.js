#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 TypeScript and ESLint Fix Script');
console.log('====================================\n');

// Function to run command and capture output
function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    const output = execSync(command, { 
      cwd: __dirname, 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(`✅ ${description} completed successfully`);
    return { success: true, output };
  } catch (error) {
    console.log(`❌ ${description} failed`);
    console.log('Error output:', error.stdout || error.message);
    return { success: false, output: error.stdout || error.message };
  }
}

// Check if node_modules exists
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('📦 Installing dependencies...');
  runCommand('npm install', 'Dependency installation');
}

// Run TypeScript check
console.log('\n🔍 Running TypeScript check...');
const tscResult = runCommand('npx tsc --noEmit --skipLibCheck', 'TypeScript compilation check');

// Run ESLint check
console.log('\n🔍 Running ESLint check...');
const eslintResult = runCommand('npx eslint . --ext .ts,.tsx --max-warnings 0', 'ESLint check');

// Run Next.js build
console.log('\n🏗️ Running Next.js build...');
const buildResult = runCommand('npx next build', 'Next.js build');

// Summary
console.log('\n📊 SUMMARY');
console.log('==========');
console.log(`TypeScript: ${tscResult.success ? '✅ PASS' : '❌ FAIL'}`);
console.log(`ESLint: ${eslintResult.success ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Build: ${buildResult.success ? '✅ PASS' : '❌ FAIL'}`);

if (tscResult.success && eslintResult.success && buildResult.success) {
  console.log('\n🎉 All checks passed! Your project is ready for production.');
  process.exit(0);
} else {
  console.log('\n⚠️ Some checks failed. Please review the errors above.');
  process.exit(1);
}