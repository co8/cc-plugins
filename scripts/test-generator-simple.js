#!/usr/bin/env node

/**
 * Simple test of plugin generator - creates a test plugin programmatically
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATES_DIR = join(__dirname, '../templates');
const PLUGINS_DIR = join(__dirname, '../plugins');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function copyDirectory(src, dest, replacements) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath, replacements);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');

      // Replace template variables
      for (const [key, value] of Object.entries(replacements)) {
        content = content.replace(new RegExp(key, 'g'), value);
      }

      // Remove .template extension
      const finalPath = destPath.replace('.template', '');
      fs.writeFileSync(finalPath, content);
    }
  }
}

async function testGenerator() {
  log('\n🧪 Testing Plugin Generator\n', 'blue');

  const testPlugin = 'test-sample-plugin';
  const pluginDir = join(PLUGINS_DIR, testPlugin);

  // Clean up if exists
  if (fs.existsSync(pluginDir)) {
    log('Cleaning up existing test plugin...', 'blue');
    fs.rmSync(pluginDir, { recursive: true, force: true });
  }

  // Test data
  const replacements = {
    '{{PLUGIN_NAME}}': testPlugin,
    '{{DISPLAY_NAME}}': 'Test Sample Plugin',
    '{{DESCRIPTION}}': 'A sample plugin created for testing the generator',
    '{{AUTHOR_NAME}}': 'Test Author',
    '{{AUTHOR_EMAIL}}': 'test@example.com',
    '{{LICENSE}}': 'MIT',
    '{{CATEGORY}}': 'Testing',
    '{{VERSION}}': '0.1.0',
    '{{YEAR}}': '2025'
  };

  log('Creating plugin from template...', 'blue');
  const templateDir = join(TEMPLATES_DIR, 'plugin-template');
  await copyDirectory(templateDir, pluginDir, replacements);

  // Verify files were created
  const requiredFiles = [
    '.claude-plugin/plugin.json',
    '.claude-plugin/marketplace.json',
    '.mcp.json',
    'mcp-server/server.js',
    'mcp-server/package.json',
    'README.md',
    'hooks/hooks.json',
    '.gitignore',
    'CHANGELOG.md'
  ];

  let allFilesExist = true;
  for (const file of requiredFiles) {
    const filePath = join(pluginDir, file);
    if (fs.existsSync(filePath)) {
      log(`✓ ${file}`, 'green');
    } else {
      log(`✗ ${file} missing`, 'red');
      allFilesExist = false;
    }
  }

  // Check that placeholders were replaced
  log('\nVerifying placeholder replacement...', 'blue');
  const readmePath = join(pluginDir, 'README.md');
  const readmeContent = fs.readFileSync(readmePath, 'utf8');

  if (readmeContent.includes('{{PLUGIN_NAME}}')) {
    log('✗ Placeholders not replaced in README.md', 'red');
    allFilesExist = false;
  } else if (readmeContent.includes('test-sample-plugin')) {
    log('✓ Placeholders replaced correctly', 'green');
  } else {
    log('✗ Unexpected content in README.md', 'red');
    allFilesExist = false;
  }

  // Verify JSON validity
  log('\nVerifying JSON files...', 'blue');
  const jsonFiles = [
    '.claude-plugin/plugin.json',
    '.claude-plugin/marketplace.json',
    '.mcp.json',
    'hooks/hooks.json'
  ];

  for (const file of jsonFiles) {
    const filePath = join(pluginDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      JSON.parse(content);
      log(`✓ ${file} is valid JSON`, 'green');
    } catch (error) {
      log(`✗ ${file} is not valid JSON: ${error.message}`, 'red');
      allFilesExist = false;
    }
  }

  // Clean up
  log('\nCleaning up test plugin...', 'blue');
  fs.rmSync(pluginDir, { recursive: true, force: true });

  if (allFilesExist) {
    log('\n✅ Plugin generator test passed!\n', 'green');
    process.exit(0);
  } else {
    log('\n❌ Plugin generator test failed!\n', 'red');
    process.exit(1);
  }
}

testGenerator().catch(error => {
  log(`\n❌ Test error: ${error.message}\n`, 'red');
  console.error(error);
  process.exit(1);
});
