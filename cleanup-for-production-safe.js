#!/usr/bin/env node

/**
 * Safe Production Cleanup Script
 * Removes development-specific code for production deployment
 * This version is more careful and creates backups
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createBackup(filePath) {
  const backupPath = filePath + '.backup';
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function cleanupFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let cleanedContent = content;
    
    // Create backup first
    const backupPath = createBackup(filePath);
    
    // Only remove simple console.log statements that are complete lines
    // This regex is more conservative and only matches complete console.log lines
    cleanedContent = cleanedContent.replace(
      /^\s*console\.(log|debug|info|warn)\([^)]*\);\s*$/gm, 
      ''
    );
    
    // Remove DEBUG comments
    cleanedContent = cleanedContent.replace(/^\s*\/\/ DEBUG:.*$/gm, '');
    
    // Remove excessive empty lines (more than 2 consecutive)
    cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n\s*\n/g, '\n\n\n');
    
    if (content !== cleanedContent) {
      fs.writeFileSync(filePath, cleanedContent);
      console.log(`✅ Cleaned: ${filePath}`);
      console.log(`📁 Backup: ${backupPath}`);
      return true;
    } else {
      // Remove backup if no changes were made
      fs.unlinkSync(backupPath);
      return false;
    }
    
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
        if (!['node_modules', '.git', 'dist', 'build', 'logs', 'uploads'].includes(item)) {
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

function restoreFromBackups() {
  console.log('\n🔄 Restoring from backups...');
  
  const projectRoot = __dirname;
  const allFiles = [
    ...walkDirectory(path.join(projectRoot, 'client', 'src'), ['.js', '.jsx']),
    ...walkDirectory(path.join(projectRoot, 'server', 'src'), ['.js'])
  ];
  
  let restoredCount = 0;
  
  for (const file of allFiles) {
    const backupPath = file + '.backup';
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, file);
      fs.unlinkSync(backupPath);
      console.log(`🔄 Restored: ${file}`);
      restoredCount++;
    }
  }
  
  console.log(`✅ Restored ${restoredCount} files from backups`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--restore')) {
    restoreFromBackups();
    return;
  }
  
  console.log('🧹 Starting SAFE production cleanup...\n');
  console.log('⚠️  This script creates backups (.backup files) before making changes');
  console.log('⚠️  Run with --restore flag to restore from backups if needed\n');
  
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
    console.log('\n🖥️  Cleaning server files...');
    const serverFiles = walkDirectory(serverDir, ['.js']);
    for (const file of serverFiles) {
      if (cleanupFile(file)) totalCleaned++;
    }
  }
  
  console.log(`\n✨ Safe production cleanup complete!`);
  console.log(`📊 Files cleaned: ${totalCleaned}`);
  console.log(`\n💡 To restore original files, run:`);
  console.log(`   node cleanup-for-production-safe.js --restore`);
  console.log(`\n⚠️  Test your application before deploying!`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
