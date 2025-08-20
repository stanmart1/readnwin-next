#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REQUIRED_VERSION = '20.18.1';
const currentVersion = process.version.slice(1); // Remove 'v' prefix

console.log('🔍 Node.js Version Verification');
console.log('================================');
console.log(`Required version: ${REQUIRED_VERSION}`);
console.log(`Current version:  ${currentVersion}`);

// Parse version numbers for comparison
const parseVersion = (version) => version.split('.').map(Number);
const [reqMajor, reqMinor, reqPatch] = parseVersion(REQUIRED_VERSION);
const [curMajor, curMinor, curPatch] = parseVersion(currentVersion);

// Check compatibility
let isCompatible = true;
let warnings = [];

if (curMajor !== reqMajor) {
  isCompatible = false;
  console.log('❌ Major version mismatch - this may cause compatibility issues');
} else if (curMinor < reqMinor) {
  isCompatible = false;
  console.log('❌ Minor version too low - please upgrade');
} else if (curMinor === reqMinor && curPatch < reqPatch) {
  isCompatible = false;
  console.log('❌ Patch version too low - please upgrade');
} else if (curMinor > reqMinor || (curMinor === reqMinor && curPatch > reqPatch)) {
  warnings.push('⚠️  Using newer version than specified - should be compatible but test thoroughly');
}

if (isCompatible) {
  console.log('✅ Node.js version is compatible');
} else {
  console.log('❌ Node.js version compatibility issue detected');
  console.log('\n📋 Recommended actions:');
  console.log('1. Use nvm to switch to the correct version:');
  console.log(`   nvm use ${REQUIRED_VERSION}`);
  console.log('2. Or install the required version:');
  console.log(`   nvm install ${REQUIRED_VERSION}`);
}

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(warning => console.log(`   ${warning}`));
}

console.log('\n📁 Configuration files checked:');
console.log(`   .nvmrc: ${fs.existsSync('.nvmrc') ? '✅' : '❌'}`);
console.log(`   package.json engines: ${fs.existsSync('package.json') ? '✅' : '❌'}`);
console.log(`   Dockerfile: ${fs.existsSync('Dockerfile') ? '✅' : '❌'}`);

process.exit(isCompatible ? 0 : 1);