#!/usr/bin/env node

/**
 * Production Cleanup Script
 * Removes development-specific code for production deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONSOLE_LOG_REGEX = /console\.(log|debug|info|warn|error)\([^)]*\);?\s*\n?/g;
const DEBUG_COMMENT_REGEX = /\/\/ DEBUG:.*\n?/g;

function cleanupFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let cleanedContent = content;
    
    // Remove console.log statements (but keep console.error for production errors)
    cleanedContent = cleanedContent.replace(
      /console\.(log|debug|info|warn)\([^)]*\);?\s*\n?/g, 
      ''
    );
    
    // Remove DEBUG comments
    cleanedContent = cleanedContent.replace(DEBUG_COMMENT_REGEX, '');
    
    // Remove empty lines that were left behind
    cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content !== cleanedContent) {
      fs.writeFileSync(filePath, cleanedContent);
      console.log(`✅ Cleaned: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir, extensions = ['.js', '.jsx']) {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other unnecessary directories
        if (!['node_modules', '.git', 'dist', 'build', 'logs'].includes(item)) {
          walk(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walk(dir);
  return files;
}

function main() {
  console.log('🧹 Starting production cleanup...\n');
  
  const projectRoot = __dirname;
  const clientDir = path.join(projectRoot, 'client', 'src');
  const serverDir = path.join(projectRoot, 'server', 'src');
  
  let totalCleaned = 0;
  
  // Clean client files
  if (fs.existsSync(clientDir)) {
    console.log('📱 Cleaning client files...');
    const clientFiles = walkDirectory(clientDir, ['.js', '.jsx']);
    for (const file of clientFiles) {
      if (cleanupFile(file)) totalCleaned++;
    }
  }
  
  // Clean server files
  if (fs.existsSync(serverDir)) {
    console.log('🖥️  Cleaning server files...');
    const serverFiles = walkDirectory(serverDir, ['.js']);
    for (const file of serverFiles) {
      if (cleanupFile(file)) totalCleaned++;
    }
  }
  
  console.log(`\n✨ Production cleanup complete!`);
  console.log(`📊 Files cleaned: ${totalCleaned}`);
  console.log(`\n⚠️  Note: This script removes console.log statements.`);
  console.log(`   Make sure to commit your changes before running this script.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
