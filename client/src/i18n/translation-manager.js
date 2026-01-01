#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const enPath = path.join(__dirname, 'locales/en.json');
const frPath = path.join(__dirname, 'locales/fr.json');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, answer => {
      resolve(answer);
    });
  });
}

// Function to set nested value
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
}

// Function to get nested value
function getNestedValue(obj, path) {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (!current || !current[key]) {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
}

async function addTranslation() {
  console.log('\n🌐 Translation Helper\n');
  console.log('This tool helps you add new translations to both English and French files.\n');
  
  // Read current files
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
  
  // Get translation key
  const key = await question('Enter translation key (e.g., bookings.form.title): ');
  
  if (!key) {
    console.log('❌ Key is required');
    rl.close();
    return;
  }
  
  // Check if key already exists
  const existingEn = getNestedValue(en, key);
  const existingFr = getNestedValue(fr, key);
  
  if (existingEn || existingFr) {
    console.log('\n⚠️  This key already exists:');
    if (existingEn) console.log(`   English: "${existingEn}"`);
    if (existingFr) console.log(`   French: "${existingFr}"`);
    
    const overwrite = await question('\nDo you want to overwrite? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Cancelled.');
      rl.close();
      return;
    }
  }
  
  // Get English translation
  const enValue = await question('\nEnter English translation: ');
  if (!enValue) {
    console.log('❌ English translation is required');
    rl.close();
    return;
  }
  
  // Get French translation
  const frValue = await question('Enter French translation: ');
  if (!frValue) {
    console.log('❌ French translation is required');
    rl.close();
    return;
  }
  
  // Add to objects
  setNestedValue(en, key, enValue);
  setNestedValue(fr, key, frValue);
  
  // Write back to files
  fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
  fs.writeFileSync(frPath, JSON.stringify(fr, null, 2), 'utf8');
  
  console.log('\n✅ Translation added successfully!');
  console.log(`   Key: ${key}`);
  console.log(`   EN: ${enValue}`);
  console.log(`   FR: ${frValue}`);
  
  // Ask if want to add more
  const addMore = await question('\nAdd another translation? (y/n): ');
  if (addMore.toLowerCase() === 'y') {
    await addTranslation();
  } else {
    console.log('\n👋 Done!\n');
    rl.close();
  }
}

async function bulkAdd() {
  console.log('\n📝 Bulk Translation Add\n');
  console.log('Enter translations in format: key|English|French');
  console.log('Example: common.save|Save|Enregistrer');
  console.log('Type "done" when finished.\n');
  
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
  
  let count = 0;
  
  while (true) {
    const input = await question(`[${count + 1}] Enter translation (or "done"): `);
    
    if (input.toLowerCase() === 'done') {
      break;
    }
    
    const parts = input.split('|');
    if (parts.length !== 3) {
      console.log('❌ Invalid format. Use: key|English|French');
      continue;
    }
    
    const [key, enValue, frValue] = parts.map(p => p.trim());
    
    if (!key || !enValue || !frValue) {
      console.log('❌ All parts are required');
      continue;
    }
    
    setNestedValue(en, key, enValue);
    setNestedValue(fr, key, frValue);
    
    console.log(`✅ Added: ${key}`);
    count++;
  }
  
  if (count > 0) {
    fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
    fs.writeFileSync(frPath, JSON.stringify(fr, null, 2), 'utf8');
    console.log(`\n✅ ${count} translations added successfully!\n`);
  } else {
    console.log('\nNo translations added.\n');
  }
  
  rl.close();
}

async function searchTranslation() {
  console.log('\n🔍 Search Translations\n');
  
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
  
  const searchTerm = await question('Enter search term: ');
  
  if (!searchTerm) {
    console.log('❌ Search term is required');
    rl.close();
    return;
  }
  
  const term = searchTerm.toLowerCase();
  const results = [];
  
  function search(obj, lang, prefix = '') {
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        search(obj[key], lang, fullKey);
      } else if (typeof obj[key] === 'string') {
        if (fullKey.toLowerCase().includes(term) || obj[key].toLowerCase().includes(term)) {
          const existing = results.find(r => r.key === fullKey);
          if (existing) {
            existing[lang] = obj[key];
          } else {
            results.push({
              key: fullKey,
              [lang]: obj[key]
            });
          }
        }
      }
    }
  }
  
  search(en, 'en');
  search(fr, 'fr');
  
  if (results.length === 0) {
    console.log('\nNo results found.\n');
  } else {
    console.log(`\nFound ${results.length} results:\n`);
    results.slice(0, 20).forEach(r => {
      console.log(`Key: ${r.key}`);
      if (r.en) console.log(`  EN: ${r.en}`);
      if (r.fr) console.log(`  FR: ${r.fr}`);
      console.log('');
    });
    
    if (results.length > 20) {
      console.log(`... and ${results.length - 20} more results\n`);
    }
  }
  
  rl.close();
}

async function main() {
  console.log('\n🌍 movelinker Translation Manager\n');
  console.log('Choose an option:');
  console.log('  1. Add single translation');
  console.log('  2. Bulk add translations');
  console.log('  3. Search translations');
  console.log('  4. Exit\n');
  
  const choice = await question('Enter choice (1-4): ');
  
  switch (choice) {
    case '1':
      await addTranslation();
      break;
    case '2':
      await bulkAdd();
      break;
    case '3':
      await searchTranslation();
      break;
    case '4':
      console.log('\n👋 Goodbye!\n');
      rl.close();
      break;
    default:
      console.log('❌ Invalid choice');
      rl.close();
  }
}

main().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
