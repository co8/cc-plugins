#!/usr/bin/env node

/**
 * Template Validation Tests
 * Ensures all templates are valid and complete
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATES_DIR = join(__dirname, '../templates');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m'
};

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  testsRun++;
  try {
    fn();
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  ${colors.red}${error.message}${colors.reset}`);
    testsFailed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function fileExists(path) {
  return fs.existsSync(path);
}

function fileContains(path, text) {
  if (!fs.existsSync(path)) {
    throw new Error(`File does not exist: ${path}`);
  }
  const content = fs.readFileSync(path, 'utf8');
  return content.includes(text);
}

function isValidJSON(path) {
  try {
    const content = fs.readFileSync(path, 'utf8');
    JSON.parse(content);
    return true;
  } catch (error) {
    return false;
  }
}

console.log(`${colors.blue}\n🧪 Running Template Validation Tests\n${colors.reset}`);

// Test: Template directories exist
test('plugin-template directory exists', () => {
  assert(fileExists(join(TEMPLATES_DIR, 'plugin-template')), 'plugin-template not found');
});

test('minimal-plugin directory exists', () => {
  assert(fileExists(join(TEMPLATES_DIR, 'minimal-plugin')), 'minimal-plugin not found');
});

test('mcp-only-plugin directory exists', () => {
  assert(fileExists(join(TEMPLATES_DIR, 'mcp-only-plugin')), 'mcp-only-plugin not found');
});

test('shared directory exists', () => {
  assert(fileExists(join(TEMPLATES_DIR, 'shared')), 'shared directory not found');
});

// Test: Required files in plugin-template
const pluginTemplate = join(TEMPLATES_DIR, 'plugin-template');

test('plugin-template has plugin.json.template', () => {
  assert(fileExists(join(pluginTemplate, '.claude-plugin', 'plugin.json.template')), 'plugin.json.template not found');
});

test('plugin-template has marketplace.json.template', () => {
  assert(fileExists(join(pluginTemplate, '.claude-plugin', 'marketplace.json.template')), 'marketplace.json.template not found');
});

test('plugin-template has .mcp.json.template', () => {
  assert(fileExists(join(pluginTemplate, '.mcp.json.template')), '.mcp.json.template not found');
});

test('plugin-template has mcp-server/server.js.template', () => {
  assert(fileExists(join(pluginTemplate, 'mcp-server', 'server.js.template')), 'server.js.template not found');
});

test('plugin-template has mcp-server/package.json.template', () => {
  assert(fileExists(join(pluginTemplate, 'mcp-server', 'package.json.template')), 'package.json.template not found');
});

test('plugin-template has config-loader.js', () => {
  assert(fileExists(join(pluginTemplate, 'mcp-server', 'config', 'config-loader.js')), 'config-loader.js not found');
});

test('plugin-template has logger.js', () => {
  assert(fileExists(join(pluginTemplate, 'mcp-server', 'utils', 'logger.js')), 'logger.js not found');
});

test('plugin-template has schemas.js', () => {
  assert(fileExists(join(pluginTemplate, 'mcp-server', 'server', 'schemas.js')), 'schemas.js not found');
});

test('plugin-template has handlers.js', () => {
  assert(fileExists(join(pluginTemplate, 'mcp-server', 'server', 'handlers.js')), 'handlers.js not found');
});

test('plugin-template has hooks.json.template', () => {
  assert(fileExists(join(pluginTemplate, 'hooks', 'hooks.json.template')), 'hooks.json.template not found');
});

test('plugin-template has core.sh library', () => {
  assert(fileExists(join(pluginTemplate, 'hooks', 'scripts', 'lib', 'core.sh')), 'core.sh not found');
});

test('plugin-template has README.md.template', () => {
  assert(fileExists(join(pluginTemplate, 'README.md.template')), 'README.md.template not found');
});

test('plugin-template has .gitignore', () => {
  assert(fileExists(join(pluginTemplate, '.gitignore')), '.gitignore not found');
});

test('plugin-template has CHANGELOG.md', () => {
  assert(fileExists(join(pluginTemplate, 'CHANGELOG.md')), 'CHANGELOG.md not found');
});

// Test: Template variable placeholders
test('plugin.json.template contains placeholders', () => {
  const path = join(pluginTemplate, '.claude-plugin', 'plugin.json.template');
  assert(fileContains(path, '{{PLUGIN_NAME}}'), 'Missing {{PLUGIN_NAME}} placeholder');
  assert(fileContains(path, '{{VERSION}}'), 'Missing {{VERSION}} placeholder');
  assert(fileContains(path, '{{DESCRIPTION}}'), 'Missing {{DESCRIPTION}} placeholder');
});

test('server.js.template contains placeholders', () => {
  const path = join(pluginTemplate, 'mcp-server', 'server.js.template');
  assert(fileContains(path, '{{PLUGIN_NAME}}'), 'Missing {{PLUGIN_NAME}} placeholder');
  assert(fileContains(path, '{{DISPLAY_NAME}}'), 'Missing {{DISPLAY_NAME}} placeholder');
});

test('README.md.template contains placeholders', () => {
  const path = join(pluginTemplate, 'README.md.template');
  assert(fileContains(path, '{{DISPLAY_NAME}}'), 'Missing {{DISPLAY_NAME}} placeholder');
  assert(fileContains(path, '{{DESCRIPTION}}'), 'Missing {{DESCRIPTION}} placeholder');
  assert(fileContains(path, '{{LICENSE}}'), 'Missing {{LICENSE}} placeholder');
});

// Test: Shared library files
const sharedDir = join(TEMPLATES_DIR, 'shared');

test('shared has config-loader.js', () => {
  assert(fileExists(join(sharedDir, 'config', 'config-loader.js')), 'shared config-loader.js not found');
});

test('shared has logger.js', () => {
  assert(fileExists(join(sharedDir, 'utils', 'logger.js')), 'shared logger.js not found');
});

test('shared has rate-limiter.js', () => {
  assert(fileExists(join(sharedDir, 'utils', 'rate-limiter.js')), 'shared rate-limiter.js not found');
});

test('shared has core.sh', () => {
  assert(fileExists(join(sharedDir, 'hooks', 'core.sh')), 'shared core.sh not found');
});

// Test: Minimal template
const minimalTemplate = join(TEMPLATES_DIR, 'minimal-plugin');

test('minimal-plugin has plugin.json.template', () => {
  assert(fileExists(join(minimalTemplate, '.claude-plugin', 'plugin.json.template')), 'minimal plugin.json.template not found');
});

test('minimal-plugin has hooks', () => {
  assert(fileExists(join(minimalTemplate, 'hooks', 'hooks.json.template')), 'minimal hooks.json.template not found');
});

test('minimal-plugin has README', () => {
  assert(fileExists(join(minimalTemplate, 'README.md.template')), 'minimal README.md.template not found');
});

// Test: MCP-only template
const mcpOnlyTemplate = join(TEMPLATES_DIR, 'mcp-only-plugin');

test('mcp-only-plugin has plugin.json.template', () => {
  assert(fileExists(join(mcpOnlyTemplate, '.claude-plugin', 'plugin.json.template')), 'mcp-only plugin.json.template not found');
});

test('mcp-only-plugin has .mcp.json.template', () => {
  assert(fileExists(join(mcpOnlyTemplate, '.mcp.json.template')), 'mcp-only .mcp.json.template not found');
});

test('mcp-only-plugin has mcp-server', () => {
  assert(fileExists(join(mcpOnlyTemplate, 'mcp-server', 'server.js.template')), 'mcp-only server.js.template not found');
});

test('mcp-only-plugin has config-loader', () => {
  assert(fileExists(join(mcpOnlyTemplate, 'mcp-server', 'config', 'config-loader.js')), 'mcp-only config-loader.js not found');
});

// Test: JSON template validity (should be valid JSON with placeholders)
test('plugin.json.template is valid JSON structure', () => {
  const path = join(pluginTemplate, '.claude-plugin', 'plugin.json.template');
  const content = fs.readFileSync(path, 'utf8');
  // Replace placeholders with dummy values
  const testContent = content
    .replace(/{{PLUGIN_NAME}}/g, 'test-plugin')
    .replace(/{{VERSION}}/g, '0.1.0')
    .replace(/{{DESCRIPTION}}/g, 'Test description')
    .replace(/{{AUTHOR_NAME}}/g, 'Test Author')
    .replace(/{{AUTHOR_EMAIL}}/g, 'test@example.com')
    .replace(/{{LICENSE}}/g, 'MIT');

  try {
    JSON.parse(testContent);
  } catch (error) {
    throw new Error('Invalid JSON structure in plugin.json.template');
  }
});

// Summary
console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`Tests run: ${testsRun}`);
console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
if (testsFailed > 0) {
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
  console.log(`\n${colors.red}❌ Template validation failed${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}✅ All template validation tests passed!${colors.reset}\n`);
  process.exit(0);
}
