import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const enPath = path.join(__dirname, 'locales/en.json');
const frPath = path.join(__dirname, 'locales/fr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

// Get all keys from an object
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Validation checks
let hasErrors = false;
const errors = [];
const warnings = [];

console.log('🔍 Validating translation files...\n');

// 1. Check if both files exist
if (!fs.existsSync(enPath)) {
  errors.push('❌ English translation file (en.json) not found');
  hasErrors = true;
}
if (!fs.existsSync(frPath)) {
  errors.push('❌ French translation file (fr.json) not found');
  hasErrors = true;
}

if (hasErrors) {
  console.error(errors.join('\n'));
  process.exit(1);
}

// 2. Get all keys
const enKeys = getAllKeys(en);
const frKeys = getAllKeys(fr);

console.log(`📊 Statistics:`);
console.log(`   English keys: ${enKeys.length}`);
console.log(`   French keys:  ${frKeys.length}\n`);

// 3. Find missing keys
const missingInEn = frKeys.filter(k => !enKeys.includes(k));
const missingInFr = enKeys.filter(k => !frKeys.includes(k));

if (missingInEn.length > 0) {
  errors.push(`❌ ${missingInEn.length} keys missing in English:`);
  missingInEn.slice(0, 10).forEach(k => errors.push(`   - ${k}`));
  if (missingInEn.length > 10) {
    errors.push(`   ... and ${missingInEn.length - 10} more`);
  }
  hasErrors = true;
}

if (missingInFr.length > 0) {
  errors.push(`❌ ${missingInFr.length} keys missing in French:`);
  missingInFr.slice(0, 10).forEach(k => errors.push(`   - ${k}`));
  if (missingInFr.length > 10) {
    errors.push(`   ... and ${missingInFr.length - 10} more`);
  }
  hasErrors = true;
}

// 4. Check for placeholder values in English
function findPlaceholders(obj, prefix = '') {
  const placeholders = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      placeholders.push(...findPlaceholders(obj[key], fullKey));
    } else if (typeof obj[key] === 'string' && obj[key].startsWith('[EN] ')) {
      placeholders.push(fullKey);
    }
  }
  return placeholders;
}

const enPlaceholders = findPlaceholders(en);
if (enPlaceholders.length > 0) {
  warnings.push(`⚠️  ${enPlaceholders.length} untranslated placeholders in English:`);
  enPlaceholders.slice(0, 5).forEach(k => warnings.push(`   - ${k}`));
  if (enPlaceholders.length > 5) {
    warnings.push(`   ... and ${enPlaceholders.length - 5} more`);
  }
}

// 5. Check for empty values
function findEmptyValues(obj, prefix = '') {
  const empty = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      empty.push(...findEmptyValues(obj[key], fullKey));
    } else if (typeof obj[key] === 'string' && obj[key].trim() === '') {
      empty.push(fullKey);
    }
  }
  return empty;
}

const enEmpty = findEmptyValues(en);
const frEmpty = findEmptyValues(fr);

if (enEmpty.length > 0) {
  warnings.push(`⚠️  ${enEmpty.length} empty values in English`);
}
if (frEmpty.length > 0) {
  warnings.push(`⚠️  ${frEmpty.length} empty values in French`);
}

// 6. Check for duplicate values (potential copy-paste errors)
function getDuplicateValues(obj, lang) {
  const values = {};
  const duplicates = [];
  
  function traverse(o, prefix = '') {
    for (const key in o) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof o[key] === 'object' && o[key] !== null && !Array.isArray(o[key])) {
        traverse(o[key], fullKey);
      } else if (typeof o[key] === 'string' && o[key].length > 10) {
        const val = o[key].toLowerCase().trim();
        if (!values[val]) {
          values[val] = [fullKey];
        } else {
          values[val].push(fullKey);
        }
      }
    }
  }
  
  traverse(obj);
  
  for (const val in values) {
    if (values[val].length > 3) { // Only report if more than 3 duplicates
      duplicates.push({
        value: val,
        keys: values[val]
      });
    }
  }
  
  return duplicates;
}

const enDuplicates = getDuplicateValues(en, 'English');
if (enDuplicates.length > 0) {
  warnings.push(`⚠️  Potential duplicate translations in English: ${enDuplicates.length} groups`);
}

// Print results
console.log('═'.repeat(60));

if (errors.length > 0) {
  console.log('\n❌ ERRORS:\n');
  errors.forEach(e => console.log(e));
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:\n');
  warnings.forEach(w => console.log(w));
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ All validation checks passed!');
  console.log('   - All keys are present in both languages');
  console.log('   - No placeholders found');
  console.log('   - No empty values');
  console.log('   - Translation structure is consistent');
}

console.log('\n' + '═'.repeat(60));

// Exit with error code if there are errors
if (hasErrors) {
  console.log('\n💡 Tip: Run "node sync-translations.js" to fix missing keys\n');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('\n💡 Warnings detected but validation passed\n');
  process.exit(0);
} else {
  console.log('\n🎉 Translation files are in perfect sync!\n');
  process.exit(0);
}
