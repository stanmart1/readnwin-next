require('dotenv').config();
const { query } = require('../utils/database');
const { imageStorageService } = require('../utils/image-storage-service');
const fs = require('fs');
const path = require('path');

async function migrateImagesToDatabase() {
  console.log('🔄 Starting image migration to database...\n');

  try {
    // Apply database schema first
    console.log('📋 Applying database schema...');
    const schemaPath = path.join(__dirname, '../database/migrations/012_create_image_storage_system.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await query(schema);
    console.log('✅ Database schema applied\n');

    const storageBasePath = path.join(__dirname, '../storage/assets');
    const categories = ['profiles', 'covers', 'works', 'payment-proofs'];
    
    let totalMigrated = 0;
    let totalErrors = 0;

    for (const category of categories) {
      const categoryPath = path.join(storageBasePath, category);
      
      if (!fs.existsSync(categoryPath)) {
        console.log(`⚠️ Directory not found: ${categoryPath}`);
        continue;
      }

      console.log(`📁 Processing ${category} images...`);
      const files = fs.readdirSync(categoryPath);
      
      for (const filename of files) {
        const filePath = path.join(categoryPath, filename);
        
        if (!fs.statSync(filePath).isFile()) continue;
        
        try {
          const buffer = fs.readFileSync(filePath);
          const mimeType = getMimeType(filename);
          
          if (!mimeType) {
            console.log(`⚠️ Skipping unsupported file: ${filename}`);
            continue;
          }

          // Extract entity info from filename if possible
          const entityInfo = extractEntityInfo(filename, category);

          const imageId = await imageStorageService.uploadImage({
            filename,
            originalFilename: filename,
            mimeType,
            buffer,
            category: category.replace('-', '_'), // Convert to snake_case
            entityType: entityInfo.entityType,
            entityId: entityInfo.entityId,
            altText: `Migrated ${category} image`,
            uploadedBy: 1 // System user
          });

          console.log(`✅ Migrated: ${filename} -> ID: ${imageId}`);
          totalMigrated++;

        } catch (error) {
          console.error(`❌ Failed to migrate ${filename}:`, error.message);
          totalErrors++;
        }
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`  - Total migrated: ${totalMigrated}`);
    console.log(`  - Total errors: ${totalErrors}`);
    console.log(`  - Success rate: ${Math.round((totalMigrated / (totalMigrated + totalErrors)) * 100)}%`);

    // Update existing records to link with new image system
    await updateExistingRecords();

    console.log('\n✅ Image migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  };
  return mimeTypes[ext];
}

function extractEntityInfo(filename, category) {
  // Try to extract entity ID from filename patterns
  const patterns = {
    profiles: /profile_(\d+)_/,
    covers: /(\d+)_/,
    works: /(\d+)_/,
    'payment-proofs': /proof_(\d+)_/
  };

  const pattern = patterns[category];
  if (pattern) {
    const match = filename.match(pattern);
    if (match) {
      return {
        entityType: category === 'profiles' ? 'user' : 
                   category === 'covers' ? 'book' :
                   category === 'works' ? 'work' : 'order',
        entityId: parseInt(match[1])
      };
    }
  }

  return { entityType: null, entityId: null };
}

async function updateExistingRecords() {
  console.log('\n🔗 Updating existing records...');

  try {
    // Update user profile images
    const profileImages = await query(`
      SELECT id, filename, entity_id 
      FROM images 
      WHERE category = 'profiles' AND entity_type = 'user' AND entity_id IS NOT NULL
    `);

    for (const img of profileImages.rows) {
      await query(`
        UPDATE users SET profile_image_id = $1 WHERE id = $2
      `, [img.id, img.entity_id]);
    }

    console.log(`✅ Updated ${profileImages.rows.length} user profile images`);

    // Update book cover images
    const coverImages = await query(`
      SELECT id, filename, entity_id 
      FROM images 
      WHERE category = 'covers' AND entity_type = 'book' AND entity_id IS NOT NULL
    `);

    for (const img of coverImages.rows) {
      await query(`
        UPDATE books SET cover_image_id = $1 WHERE id = $2
      `, [img.id, img.entity_id]);
    }

    console.log(`✅ Updated ${coverImages.rows.length} book cover images`);

    // Update work images
    const workImages = await query(`
      SELECT id, filename, entity_id 
      FROM images 
      WHERE category = 'works' AND entity_type = 'work' AND entity_id IS NOT NULL
    `);

    for (const img of workImages.rows) {
      await query(`
        UPDATE works SET image_id = $1 WHERE id = $2
      `, [img.id, img.entity_id]);
    }

    console.log(`✅ Updated ${workImages.rows.length} work images`);

  } catch (error) {
    console.error('❌ Failed to update existing records:', error);
  }
}

// Run migration
if (require.main === module) {
  migrateImagesToDatabase();
}

module.exports = { migrateImagesToDatabase };