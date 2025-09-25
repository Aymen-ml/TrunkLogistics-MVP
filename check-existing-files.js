import { query } from './server/src/config/database.js';
import logger from './server/src/utils/logger.js';

const checkExistingFiles = async () => {
  try {
    console.log('🔍 Checking for existing files in database...\n');
    
    // Check truck images
    const imagesResult = await query(`
      SELECT id, license_plate, 
             CASE 
               WHEN images IS NULL OR images::text = '' THEN '[]'::json
               WHEN images::text = '[]' THEN '[]'::json
               ELSE images::json
             END as images
      FROM trucks 
      WHERE images IS NOT NULL AND images::text != '[]' AND images::text != ''
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log(`📸 Found ${imagesResult.rows.length} trucks with images:`);
    imagesResult.rows.forEach(truck => {
      try {
        const images = Array.isArray(truck.images) ? truck.images : [];
        console.log(`  - Truck ${truck.license_plate}: ${images.length} images`);
        images.forEach(img => {
          if (typeof img === 'string') {
            console.log(`    * ${img}`);
          } else if (img && img.filename && img.path) {
            console.log(`    * ${img.filename} -> ${img.path}`);
          } else {
            console.log(`    * ${JSON.stringify(img)}`);
          }
        });
      } catch (error) {
        console.log(`  - Truck ${truck.license_plate}: Error parsing images - ${error.message}`);
      }
    });
    
    console.log('\n');
    
    // Check documents
    const docsResult = await query(`
      SELECT id, file_name, file_path, document_type, entity_type
      FROM documents 
      WHERE entity_type = 'truck'
      ORDER BY uploaded_at DESC
      LIMIT 10
    `);
    
    console.log(`📄 Found ${docsResult.rows.length} documents:`);
    docsResult.rows.forEach(doc => {
      console.log(`  - ${doc.file_name} (${doc.document_type}): ${doc.file_path}`);
    });
    
    console.log('\n✅ File check completed');
    
  } catch (error) {
    console.error('❌ Error checking files:', error);
  }
  
  process.exit(0);
};

checkExistingFiles();
