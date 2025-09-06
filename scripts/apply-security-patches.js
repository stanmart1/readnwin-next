#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ADMIN_API_DIR = path.join(__dirname, '../app/api/admin');

// Security patches to apply
const patches = {
  // Add imports at the top
  addImports: `import { sanitizeInput, sanitizeQuery, validateObjectId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';`,

  // Replace unsafe MongoDB queries
  fixMongoQueries: [
    {
      pattern: /db\.collection\([^)]+\)\.find\(([^)]+)\)/g,
      replacement: 'db.collection($1).find(sanitizeQuery($2))'
    },
    {
      pattern: /db\.collection\([^)]+\)\.findOne\(([^)]+)\)/g,
      replacement: 'db.collection($1).findOne(sanitizeQuery($2))'
    },
    {
      pattern: /db\.collection\([^)]+\)\.updateOne\(([^,]+),\s*([^)]+)\)/g,
      replacement: 'db.collection($1).updateOne(sanitizeQuery($2), sanitizeQuery($3))'
    }
  ],

  // Add authentication checks
  addAuthCheck: `
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }`,

  // Sanitize request body
  sanitizeBody: `
  const body = await request.json();
  const sanitizedBody = {};
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      sanitizedBody[key] = sanitizeInput(value);
    } else {
      sanitizedBody[key] = value;
    }
  }`,

  // Replace console.log with secure logger
  replaceLogging: [
    {
      pattern: /console\.log\(([^)]+)\)/g,
      replacement: 'logger.info($1)'
    },
    {
      pattern: /console\.error\(([^)]+)\)/g,
      replacement: 'logger.error($1)'
    }
  ],

  // Validate ObjectIds
  validateIds: `
  if (params.id && !validateObjectId(params.id)) {
    return Response.json({ error: 'Invalid ID format' }, { status: 400 });
  }`
};

function patchFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.js')) return;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Skip if already patched
    if (content.includes('sanitizeInput') || content.includes('requireAdmin')) {
      console.log(`Skipped (already patched): ${filePath}`);
      return;
    }

    // Add imports at the top
    if (!content.includes('import { sanitizeInput')) {
      const importIndex = content.indexOf('import');
      if (importIndex !== -1) {
        content = content.slice(0, importIndex) + patches.addImports + '\n' + content.slice(importIndex);
        modified = true;
      }
    }

    // Add auth check after function declaration
    const functionMatch = content.match(/export async function (GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*{/);
    if (functionMatch) {
      const insertIndex = functionMatch.index + functionMatch[0].length;
      content = content.slice(0, insertIndex) + patches.addAuthCheck + content.slice(insertIndex);
      modified = true;
    }

    // Add ID validation for routes with params
    if (content.includes('params.id') || content.includes('params.bookId')) {
      const authIndex = content.indexOf(patches.addAuthCheck);
      if (authIndex !== -1) {
        const insertIndex = authIndex + patches.addAuthCheck.length;
        content = content.slice(0, insertIndex) + patches.validateIds + content.slice(insertIndex);
        modified = true;
      }
    }

    // Add body sanitization for POST/PUT/PATCH requests
    if (content.includes('await request.json()') && !content.includes('sanitizedBody')) {
      content = content.replace(
        /const body = await request\.json\(\);/g,
        patches.sanitizeBody
      );
      content = content.replace(/\bbody\b/g, 'sanitizedBody');
      modified = true;
    }

    // Fix MongoDB queries
    patches.fixMongoQueries.forEach(fix => {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    // Replace logging
    patches.replaceLogging.forEach(fix => {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    // Generic error handling
    if (!content.includes('} catch (error) {')) {
      content = content.replace(
        /return Response\.json\(/g,
        `} catch (error) {
    logger.error('API Error', { error: error.message, endpoint: request.url });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
  
  return Response.json(`
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Patched: ${filePath}`);
    }

  } catch (error) {
    console.error(`Error patching ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (file === 'route.ts' || file === 'route.js') {
      patchFile(filePath);
    }
  });
}

console.log('Applying security patches to admin API endpoints...');
walkDirectory(ADMIN_API_DIR);
console.log('Security patches applied!');