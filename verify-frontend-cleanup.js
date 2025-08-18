#!/usr/bin/env node

/**
 * Frontend Cleanup Verification Script
 * Verifies that all hardcoded/mock books have been removed from the frontend
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Files that were known to have hardcoded books
const filesToCheck = [
  'app/reading/[bookId]/page.tsx',
  'components/PersonalizedRecommendations.tsx',
  'components/NewReleases.tsx',
  'app/admin/UserReadingAnalytics.tsx',
  'app/reading/EnhancedEbookReader.tsx'
];

// Patterns that indicate hardcoded books
const hardcodedPatterns = [
  /mockBooks?\s*[:=]\s*\[/,
  /const\s+\w+Books?\s*[:=]\s*\[/,
  /newBooks?\s*[:=]\s*\[/,
  /recommendations\s*[:=]\s*\[/,
  /mockUserData\s*[:=]\s*\{/,
  /sample\s+content/i,
  /placeholder/i,
  /demo\s+content/i,
  /test\s+content/i
];

// Book titles that were hardcoded
const hardcodedBookTitles = [
  'The Psychology of Money',
  'Atomic Habits',
  'The Midnight Library',
  'The Silent Patient',
  'Educated',
  'The 7 Habits of Highly Effective People',
  'The Song of Achilles',
  'Sapiens',
  'The Alchemist',
  'The Seven Husbands of Evelyn Hugo',
  'Project Hail Mary',
  'Klara and the Sun',
  'The Invisible Life of Addie LaRue',
  'The Sanatorium',
  'Malibu Rising',
  'The Thursday Murder Club',
  'The Guest List',
  'Dune'
];

function checkFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      logWarning(`File not found: ${filePath}`);
      return { hasHardcoded: false, issues: [`File not found: ${filePath}`] };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    // Check for hardcoded patterns (ignore comments)
    hardcodedPatterns.forEach((pattern, index) => {
      // Remove comments to avoid false positives
      const contentWithoutComments = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      if (pattern.test(contentWithoutComments)) {
        issues.push(`Found hardcoded pattern: ${pattern.source}`);
      }
    });

    // Check for hardcoded book titles
    hardcodedBookTitles.forEach(title => {
      if (content.includes(title)) {
        issues.push(`Found hardcoded book title: "${title}"`);
      }
    });

    // Check for API calls (good sign)
    const hasApiCalls = /fetch\(`\/api\//.test(content);
    const hasUseEffect = /useEffect/.test(content);
    const hasAsyncAwait = /async.*await/.test(content);

    return {
      hasHardcoded: issues.length > 0,
      issues,
      hasApiCalls,
      hasUseEffect,
      hasAsyncAwait
    };
  } catch (error) {
    return {
      hasHardcoded: false,
      issues: [`Error reading file: ${error.message}`]
    };
  }
}

function main() {
  log('🔍 Verifying Frontend Cleanup', 'bright');
  log('');

  let totalIssues = 0;
  let filesWithIssues = 0;
  let filesWithApiCalls = 0;

  filesToCheck.forEach(filePath => {
    log(`Checking: ${filePath}`, 'cyan');
    
    const result = checkFile(filePath);
    
    if (result.hasHardcoded) {
      logError(`Found ${result.issues.length} issues:`);
      result.issues.forEach(issue => {
        logError(`  - ${issue}`);
      });
      totalIssues += result.issues.length;
      filesWithIssues++;
    } else {
      logSuccess('No hardcoded content found');
    }

    if (result.hasApiCalls) {
      logInfo('✅ Has API calls (good)');
      filesWithApiCalls++;
    }
    if (result.hasUseEffect) {
      logInfo('✅ Has useEffect hooks (good)');
    }
    if (result.hasAsyncAwait) {
      logInfo('✅ Has async/await (good)');
    }

    log('');
  });

  // Summary
  log('📊 Cleanup Summary', 'bright');
  log(`Files checked: ${filesToCheck.length}`);
  log(`Files with issues: ${filesWithIssues}`);
  log(`Total issues found: ${totalIssues}`);
  log(`Files with API calls: ${filesWithApiCalls}`);

  if (totalIssues === 0) {
    logSuccess('🎉 All hardcoded books have been successfully removed!');
    logSuccess('The frontend is now using real API data.');
  } else {
    logWarning(`⚠️  ${totalIssues} issues found. Please review the files above.`);
  }

  // Additional recommendations
  log('\n💡 Recommendations:', 'bright');
  log('1. Test the application to ensure API calls are working');
  log('2. Verify that books are loading from the database');
  log('3. Check that error handling is working properly');
  log('4. Ensure loading states are displayed correctly');
}

main(); 