import { query } from './server/src/config/database.js';
import logger from './server/src/utils/logger.js';

const fixArrayData = async () => {
  try {
    console.log('🔧 Fixing malformed array data in trucks table...\n');
    
    // First, check for problematic records
    const checkResult = await query(`
      SELECT id, license_plate, images 
      FROM trucks 
      WHERE images IS NOT NULL 
        AND images::text != '[]' 
        AND images::text != ''
    `);
    
    console.log(`Found ${checkResult.rows.length} trucks with image data to check`);
    
    let fixedCount = 0;
    
    for (const truck of checkResult.rows) {
      try {
        // Try to parse the images field
        let images;
        if (typeof truck.images === 'string') {
          if (truck.images === '[]' || truck.images === '') {
            images = [];
          } else {
            images = JSON.parse(truck.images);
          }
        } else if (Array.isArray(truck.images)) {
          images = truck.images;
        } else {
          images = [];
        }
        
        // Update with properly formatted JSON
        await query(
          'UPDATE trucks SET images = $1 WHERE id = $2',
          [JSON.stringify(images), truck.id]
        );
        
        console.log(`✅ Fixed truck ${truck.license_plate} (ID: ${truck.id})`);
        fixedCount++;
        
      } catch (error) {
        console.log(`❌ Error fixing truck ${truck.license_plate} (ID: ${truck.id}): ${error.message}`);
        
        // Set to empty array if parsing fails
        await query(
          'UPDATE trucks SET images = $1 WHERE id = $2',
          ['[]', truck.id]
        );
        
        console.log(`🔄 Set empty array for truck ${truck.license_plate}`);
        fixedCount++;
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} truck records`);
    
    // Verify the fix
    const verifyResult = await query(`
      SELECT COUNT(*) as count
      FROM trucks 
      WHERE images IS NOT NULL 
        AND images::text != '[]' 
        AND images::text != ''
    `);
    
    console.log(`📊 Remaining trucks with image data: ${verifyResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error fixing array data:', error);
  }
  
  process.exit(0);
};

fixArrayData();