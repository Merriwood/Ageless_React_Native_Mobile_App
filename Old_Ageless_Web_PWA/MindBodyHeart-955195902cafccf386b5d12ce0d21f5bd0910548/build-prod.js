#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.join(__dirname, 'web');
const distDir = path.join(__dirname, 'dist');

// Development files to exclude from production
const excludeFiles = [
  // Test files
  'test.html',
  'summary-test.html', 
  'modal-test.html',
  'date-format-test.html',
  'favicon-test.html',
  
  // Development tools
  'logo-color-analyzer.html',
  'create-icon.html',
  'heart-logo-creator.html',
  'professional-logo-editor.html',
  'simple-logo-editor.html',
  'logo-editor-simple.html',
  'exact-color-modifier.html',
  'resize-icon.html',
  'simple.html',
  
  // Login design tools (keep reference)
  'login-redesign-tool.html',
  // 'login-exact-reference.html', // Keep this as documentation
  
  // Development icons
  'icons/icon-192.png.placeholder',
  'icons/icon-512.png.placeholder', 
  'icons/maskable-512.png.placeholder'
];

// Clean and create dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy production files
function copyDirectory(src, dest, excludeList = []) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const relativePath = path.relative(webDir, srcPath).replace(/\\/g, '/');
    
    // Skip excluded files
    if (excludeList.includes(item) || excludeList.includes(relativePath)) {
      console.log(`Excluding: ${relativePath}`);
      continue;
    }
    
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath, excludeList);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${relativePath}`);
    }
  }
}

console.log('Building production version...');
copyDirectory(webDir, distDir, excludeFiles);
console.log('Production build complete!');
