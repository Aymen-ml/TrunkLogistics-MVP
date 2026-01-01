import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const en = JSON.parse(fs.readFileSync(path.join(__dirname, 'client/src/i18n/locales/en.json'), 'utf8'));
const fr = JSON.parse(fs.readFileSync(path.join(__dirname, 'client/src/i18n/locales/fr.json'), 'utf8'));

// Deep merge function
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else if (!result.hasOwnProperty(key)) {
        // Only add if it doesn't exist in target
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

// Get French structure with English placeholder values for new keys
function getFrenchStructureInEnglish(fr, en, path = '') {
  const result = {};
  
  for (const key in fr) {
    if (fr.hasOwnProperty(key)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof fr[key] === 'object' && fr[key] !== null && !Array.isArray(fr[key])) {
        result[key] = getFrenchStructureInEnglish(fr[key], en[key] || {}, currentPath);
      } else {
        // If key exists in English, use it; otherwise use placeholder
        result[key] = en[key] || `[EN] ${fr[key]}`;
      }
    }
  }
  
  return result;
}

console.log('Syncing translation files...\n');

// Merge: Add French keys to English
const updatedEn = getFrenchStructureInEnglish(fr, en);

// Write updated English file
fs.writeFileSync(
  path.join(__dirname, 'client/src/i18n/locales/en.json'),
  JSON.stringify(updatedEn, null, 2),
  'utf8'
);

console.log('✅ English file updated with French structure');
console.log(`   Keys before: ${JSON.stringify(en).length} characters`);
console.log(`   Keys after: ${JSON.stringify(updatedEn).length} characters`);

// Create a report of keys that need translation
const needsTranslation = [];

function findPlaceholders(obj, prefix = '') {
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      findPlaceholders(obj[key], fullKey);
    } else if (typeof obj[key] === 'string' && obj[key].startsWith('[EN] ')) {
      needsTranslation.push({
        key: fullKey,
        value: obj[key].replace('[EN] ', ''),
        french: obj[key].replace('[EN] ', '')
      });
    }
  }
}

findPlaceholders(updatedEn);

if (needsTranslation.length > 0) {
  console.log(`\n⚠️  ${needsTranslation.length} keys need English translation:`);
  needsTranslation.slice(0, 10).forEach(item => {
    console.log(`   - ${item.key}: "${item.french}"`);
  });
  if (needsTranslation.length > 10) {
    console.log(`   ... and ${needsTranslation.length - 10} more`);
  }
  
  // Save report
  fs.writeFileSync(
    path.join(__dirname, 'translation-gaps.json'),
    JSON.stringify(needsTranslation, null, 2),
    'utf8'
  );
  console.log('\n📄 Full report saved to: translation-gaps.json');
}

console.log('\n✅ Sync complete!');
