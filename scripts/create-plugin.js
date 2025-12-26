#!/usr/bin/env node

/**
 * Plugin Generator for CC-Plugins
 * Creates new Claude Code plugins from templates
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATES_DIR = join(__dirname, '../templates');
const PLUGINS_DIR = join(__dirname, '../plugins');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function askChoice(question, choices) {
  console.log(question);
  choices.forEach((choice, i) => {
    console.log(`  ${i + 1}. ${choice}`);
  });

  while (true) {
    const answer = await ask('Enter your choice (1-' + choices.length + '): ');
    const choice = parseInt(answer);
    if (choice >= 1 && choice <= choices.length) {
      return choices[choice - 1];
    }
    log('Invalid choice. Please try again.', 'red');
  }
}

async function askYesNo(question, defaultYes = true) {
  const defaultText = defaultYes ? 'Y/n' : 'y/N';
  const answer = await ask(`${question} (${defaultText}): `);

  if (answer === '') {
    return defaultYes;
  }

  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

function validatePluginName(name) {
  if (!name) {
    return 'Plugin name is required';
  }

  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    return 'Plugin name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens';
  }

  if (fs.existsSync(join(PLUGINS_DIR, name))) {
    return 'Plugin already exists';
  }

  return null;
}

function toTitleCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function gatherPluginInfo() {
  log('\n🚀 Claude Code Plugin Generator\n', 'blue');

  const answers = {};

  // Plugin name
  while (true) {
    answers.name = await ask('Plugin name (kebab-case): ');
    const error = validatePluginName(answers.name);
    if (!error) break;
    log(error, 'red');
  }

  // Display name
  const defaultDisplayName = toTitleCase(answers.name);
  const displayName = await ask(`Display name (${defaultDisplayName}): `);
  answers.displayName = displayName || defaultDisplayName;

  // Description
  while (true) {
    answers.description = await ask('Short description: ');
    if (answers.description) break;
    log('Description is required', 'red');
  }

  // Author
  answers.author = await ask('Author name: ');
  if (!answers.author) answers.author = 'Your Name';

  // Email
  answers.email = await ask('Author email: ');
  if (!answers.email) answers.email = 'you@example.com';

  // License
  answers.license = await askChoice(
    '\nLicense:',
    ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC']
  );

  // Template type
  const templateChoices = [
    'Full-featured (MCP + Hooks + Commands + Skills)',
    'MCP Server Only',
    'Hooks Only (minimal)'
  ];
  const templateMap = {
    'Full-featured (MCP + Hooks + Commands + Skills)': 'plugin-template',
    'MCP Server Only': 'mcp-only-plugin',
    'Hooks Only (minimal)': 'minimal-plugin'
  };
  const templateChoice = await askChoice('\nTemplate type:', templateChoices);
  answers.template = templateMap[templateChoice];

  // Category
  answers.category = await askChoice(
    '\nPlugin category:',
    ['Productivity', 'Development Tools', 'Communication', 'Integration', 'Testing', 'Documentation', 'Other']
  );

  answers.version = '0.1.0';
  answers.year = new Date().getFullYear().toString();

  return answers;
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

async function addToMarketplace(answers) {
  const marketplacePath = join(__dirname, '../.claude-plugin/marketplace.json');

  if (!fs.existsSync(marketplacePath)) {
    log('Warning: marketplace.json not found, skipping marketplace update', 'gray');
    return;
  }

  const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));

  const newPlugin = {
    name: answers.name,
    source: `./plugins/${answers.name}`,
    version: answers.version,
    description: answers.description,
    category: answers.category
  };

  if (!marketplace.plugins) {
    marketplace.plugins = [];
  }

  marketplace.plugins.push(newPlugin);

  fs.writeFileSync(marketplacePath, JSON.stringify(marketplace, null, 2) + '\n');
}

async function installDependencies(pluginDir) {
  const mcpServerDir = join(pluginDir, 'mcp-server');

  if (!fs.existsSync(mcpServerDir)) {
    return;
  }

  log('\n📦 Installing dependencies...', 'blue');

  const { execSync } = await import('child_process');

  try {
    execSync('npm install', {
      cwd: mcpServerDir,
      stdio: 'inherit'
    });
    log('✓ Dependencies installed', 'green');
  } catch (error) {
    log('⚠ Warning: Failed to install dependencies. Run npm install manually.', 'red');
  }
}

async function makeScriptsExecutable(pluginDir) {
  const hooksScriptsDir = join(pluginDir, 'hooks', 'scripts');

  if (!fs.existsSync(hooksScriptsDir)) {
    return;
  }

  const scripts = fs.readdirSync(hooksScriptsDir, { withFileTypes: true });

  for (const script of scripts) {
    if (script.isFile() && script.name.endsWith('.sh')) {
      const scriptPath = join(hooksScriptsDir, script.name);
      fs.chmodSync(scriptPath, 0o755);
    }
  }

  // Also make lib scripts executable
  const libDir = join(hooksScriptsDir, 'lib');
  if (fs.existsSync(libDir)) {
    const libScripts = fs.readdirSync(libDir);
    for (const script of libScripts) {
      if (script.endsWith('.sh')) {
        const scriptPath = join(libDir, script);
        fs.chmodSync(scriptPath, 0o755);
      }
    }
  }
}

async function createPlugin() {
  try {
    const answers = await gatherPluginInfo();

    // Create replacements map
    const replacements = {
      '{{PLUGIN_NAME}}': answers.name,
      '{{DISPLAY_NAME}}': answers.displayName,
      '{{DESCRIPTION}}': answers.description,
      '{{AUTHOR_NAME}}': answers.author,
      '{{AUTHOR_EMAIL}}': answers.email,
      '{{LICENSE}}': answers.license,
      '{{CATEGORY}}': answers.category,
      '{{VERSION}}': answers.version,
      '{{YEAR}}': answers.year
    };

    const pluginDir = join(PLUGINS_DIR, answers.name);
    const templateDir = join(TEMPLATES_DIR, answers.template);

    log('\n📁 Creating plugin directory...', 'blue');
    await copyDirectory(templateDir, pluginDir, replacements);
    log(`✓ Created directory: ${pluginDir}`, 'green');

    log('📝 Making scripts executable...', 'blue');
    await makeScriptsExecutable(pluginDir);
    log('✓ Scripts are executable', 'green');

    await installDependencies(pluginDir);

    log('📋 Adding to marketplace...', 'blue');
    await addToMarketplace(answers);
    log('✓ Added to marketplace', 'green');

    log('\n✅ Plugin created successfully!\n', 'green');
    log('Next steps:', 'blue');
    log(`  1. cd plugins/${answers.name}`, 'gray');
    log('  2. Edit the plugin files to implement your features', 'gray');
    log('  3. Run tests: cd mcp-server && npm test', 'gray');
    log('  4. Update README.md with usage instructions', 'gray');
    log(`  5. Test your plugin with /${answers.name}:configure\n`, 'gray');

  } catch (error) {
    log(`\n❌ Error creating plugin: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

createPlugin();
