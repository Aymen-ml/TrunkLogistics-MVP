import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const en = JSON.parse(fs.readFileSync(path.join(__dirname, 'client/src/i18n/locales/en.json'), 'utf8'));
const fr = JSON.parse(fs.readFileSync(path.join(__dirname, 'client/src/i18n/locales/fr.json'), 'utf8'));

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? prefix + '.' + key : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = getAllKeys(en);
const frKeys = getAllKeys(fr);

console.log('English keys:', enKeys.length);
console.log('French keys:', frKeys.length);

console.log('\n=== Missing in French ===');
const missingInFr = enKeys.filter(k => !frKeys.includes(k));
missingInFr.forEach(k => console.log('  -', k));
console.log(`Total missing in FR: ${missingInFr.length}`);

console.log('\n=== Missing in English ===');
const missingInEn = frKeys.filter(k => !enKeys.includes(k));
missingInEn.forEach(k => console.log('  -', k));
console.log(`Total missing in EN: ${missingInEn.length}`);
