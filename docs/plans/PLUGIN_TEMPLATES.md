# Plugin Template System
**CC-Plugins Repository**
**Date:** December 2024

## Overview

A comprehensive template and scaffolding system for creating new Claude Code plugins with best practices built-in.

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Template Structure](#template-structure)
3. [Plugin Generator](#plugin-generator)
4. [Template Categories](#template-categories)
5. [Reusable Components](#reusable-components)
6. [Testing Templates](#testing-templates)
7. [Documentation Templates](#documentation-templates)

---

## Quick Start

### Create a New Plugin

```bash
# Using the generator
npm run create-plugin my-awesome-plugin

# Or manually
cp -r templates/plugin-template plugins/my-awesome-plugin
cd plugins/my-awesome-plugin
./scripts/setup.sh
```

### Generator Prompts

```
? Plugin name: my-awesome-plugin
? Display name: My Awesome Plugin
? Description: A plugin that does awesome things
? Author name: Your Name
? Author email: you@example.com
? License: MIT
? Include MCP server? (Y/n): Y
? Include hooks? (Y/n): Y
? Include commands? (Y/n): Y
? Include skills? (Y/n): Y
? Plugin category:
  ❯ Productivity
    Development Tools
    Communication
    Integration
    Other
```

---

## Template Structure

### Base Plugin Template

```
templates/
├── plugin-template/                    # Full-featured template
│   ├── .claude-plugin/
│   │   ├── plugin.json.template
│   │   └── marketplace.json.template
│   ├── .mcp.json.template
│   ├── commands/
│   │   └── .gitkeep
│   ├── skills/
│   │   └── .gitkeep
│   ├── hooks/
│   │   ├── hooks.json.template
│   │   └── scripts/
│   │       ├── lib/
│   │       │   └── core.sh
│   │       └── .gitkeep
│   ├── mcp-server/
│   │   ├── package.json.template
│   │   ├── server.js.template
│   │   ├── config/
│   │   │   ├── config-loader.js
│   │   │   └── validation.js
│   │   ├── services/
│   │   │   └── .gitkeep
│   │   ├── utils/
│   │   │   └── logger.js
│   │   └── server/
│   │       ├── schemas.js
│   │       └── handlers.js
│   ├── tests/
│   │   ├── fixtures/
│   │   │   └── config.js
│   │   ├── hooks.test.sh
│   │   └── server.test.js
│   ├── docs/
│   │   ├── SETUP.md
│   │   └── API.md
│   ├── scripts/
│   │   ├── setup.sh
│   │   └── test.sh
│   ├── .gitignore
│   ├── README.md.template
│   ├── CHANGELOG.md
│   ├── LICENSE
│   └── package.json
│
├── minimal-plugin/                     # Minimal template (hooks only)
│   ├── .claude-plugin/
│   ├── hooks/
│   └── README.md
│
├── mcp-only-plugin/                    # MCP server only
│   ├── .claude-plugin/
│   ├── .mcp.json
│   ├── mcp-server/
│   └── README.md
│
└── shared/                             # Reusable components
    ├── config/
    ├── utils/
    ├── tests/
    └── docs/
```

---

## Plugin Generator

### Implementation

**File:** `scripts/create-plugin.js`

```javascript
#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

const TEMPLATES_DIR = path.join(__dirname, '../templates');
const PLUGINS_DIR = path.join(__dirname, '../plugins');

async function createPlugin() {
  console.log(chalk.blue.bold('\n🚀 Claude Code Plugin Generator\n'));

  // Gather plugin information
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Plugin name (kebab-case):',
      validate: (input) => {
        if (!/^[a-z][a-z0-9-]*$/.test(input)) {
          return 'Plugin name must be kebab-case (lowercase, hyphens allowed)';
        }
        if (fs.existsSync(path.join(PLUGINS_DIR, input))) {
          return 'Plugin already exists';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'displayName',
      message: 'Display name:',
      default: (answers) => {
        return answers.name
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'Short description:',
      validate: (input) => input.length > 0 || 'Description required'
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author name:',
      default: 'Your Name'
    },
    {
      type: 'input',
      name: 'email',
      message: 'Author email:',
      default: 'you@example.com'
    },
    {
      type: 'list',
      name: 'license',
      message: 'License:',
      choices: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC'],
      default: 'MIT'
    },
    {
      type: 'list',
      name: 'template',
      message: 'Template type:',
      choices: [
        { name: 'Full-featured (MCP + Hooks + Commands + Skills)', value: 'plugin-template' },
        { name: 'MCP Server Only', value: 'mcp-only-plugin' },
        { name: 'Hooks Only (minimal)', value: 'minimal-plugin' },
        { name: 'Custom (choose components)', value: 'custom' }
      ]
    },
    {
      type: 'checkbox',
      name: 'components',
      message: 'Select components to include:',
      when: (answers) => answers.template === 'custom',
      choices: [
        { name: 'MCP Server', value: 'mcp', checked: true },
        { name: 'Hooks', value: 'hooks', checked: true },
        { name: 'Commands', value: 'commands', checked: true },
        { name: 'Skills', value: 'skills', checked: false },
        { name: 'Tests', value: 'tests', checked: true },
        { name: 'CI/CD', value: 'cicd', checked: false }
      ]
    },
    {
      type: 'list',
      name: 'category',
      message: 'Plugin category:',
      choices: [
        'Productivity',
        'Development Tools',
        'Communication',
        'Integration',
        'Testing',
        'Documentation',
        'Other'
      ]
    }
  ]);

  // Create plugin directory
  const pluginDir = path.join(PLUGINS_DIR, answers.name);
  await fs.ensureDir(pluginDir);

  console.log(chalk.green(`\n✓ Created directory: ${pluginDir}`));

  // Copy template files
  const templateDir = path.join(TEMPLATES_DIR, answers.template);
  if (answers.template !== 'custom') {
    await fs.copy(templateDir, pluginDir);
  } else {
    await copyCustomTemplate(pluginDir, answers.components);
  }

  console.log(chalk.green('✓ Copied template files'));

  // Replace template variables
  await replaceTemplateVariables(pluginDir, answers);

  console.log(chalk.green('✓ Configured plugin metadata'));

  // Install dependencies
  const mcpServerDir = path.join(pluginDir, 'mcp-server');
  if (fs.existsSync(mcpServerDir)) {
    console.log(chalk.blue('\n📦 Installing dependencies...'));
    execSync('npm install', { cwd: mcpServerDir, stdio: 'inherit' });
    console.log(chalk.green('✓ Dependencies installed'));
  }

  // Update root marketplace.json
  await addToMarketplace(answers);

  console.log(chalk.green('✓ Added to marketplace'));

  // Success message
  console.log(chalk.green.bold('\n✅ Plugin created successfully!\n'));
  console.log(chalk.blue('Next steps:'));
  console.log(chalk.gray(`  1. cd plugins/${answers.name}`));
  console.log(chalk.gray('  2. Edit the plugin files to implement your features'));
  console.log(chalk.gray('  3. Run tests: npm test'));
  console.log(chalk.gray('  4. Update README.md with usage instructions\n'));
}

async function copyCustomTemplate(pluginDir, components) {
  const baseFiles = [
    '.claude-plugin',
    '.gitignore',
    'README.md.template',
    'CHANGELOG.md',
    'package.json'
  ];

  // Copy base files
  for (const file of baseFiles) {
    const src = path.join(TEMPLATES_DIR, 'plugin-template', file);
    const dest = path.join(pluginDir, file);
    await fs.copy(src, dest);
  }

  // Copy selected components
  for (const component of components) {
    const componentMap = {
      'mcp': ['mcp-server', '.mcp.json.template'],
      'hooks': ['hooks'],
      'commands': ['commands'],
      'skills': ['skills'],
      'tests': ['tests'],
      'cicd': ['.github']
    };

    for (const dir of componentMap[component]) {
      const src = path.join(TEMPLATES_DIR, 'plugin-template', dir);
      const dest = path.join(pluginDir, dir);
      if (await fs.pathExists(src)) {
        await fs.copy(src, dest);
      }
    }
  }
}

async function replaceTemplateVariables(pluginDir, answers) {
  const replacements = {
    '{{PLUGIN_NAME}}': answers.name,
    '{{DISPLAY_NAME}}': answers.displayName,
    '{{DESCRIPTION}}': answers.description,
    '{{AUTHOR_NAME}}': answers.author,
    '{{AUTHOR_EMAIL}}': answers.email,
    '{{LICENSE}}': answers.license,
    '{{CATEGORY}}': answers.category,
    '{{VERSION}}': '0.1.0',
    '{{YEAR}}': new Date().getFullYear().toString()
  };

  // Find all .template files
  const templateFiles = await findTemplateFiles(pluginDir);

  for (const templateFile of templateFiles) {
    let content = await fs.readFile(templateFile, 'utf8');

    // Replace all variables
    for (const [key, value] of Object.entries(replacements)) {
      content = content.replace(new RegExp(key, 'g'), value);
    }

    // Write to non-.template file
    const outputFile = templateFile.replace('.template', '');
    await fs.writeFile(outputFile, content);
    await fs.remove(templateFile);
  }
}

async function findTemplateFiles(dir) {
  const files = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.endsWith('.template')) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

async function addToMarketplace(answers) {
  const marketplacePath = path.join(__dirname, '../.claude-plugin/marketplace.json');
  const marketplace = await fs.readJson(marketplacePath);

  marketplace.plugins.push({
    name: answers.name,
    source: `./plugins/${answers.name}`,
    version: '0.1.0',
    description: answers.description,
    category: answers.category
  });

  await fs.writeJson(marketplacePath, marketplace, { spaces: 2 });
}

// Run the generator
createPlugin().catch(error => {
  console.error(chalk.red('\n❌ Error creating plugin:'), error.message);
  process.exit(1);
});
```

**Usage:**
```bash
npm run create-plugin
```

---

## Template Categories

### 1. Full-Featured Template

**Use Case:** Complex plugins with MCP server, hooks, and commands

**Includes:**
- MCP server with modular architecture
- Hook system with library
- Command implementations
- Skill knowledge base
- Comprehensive testing
- Full documentation

**Example:** telegram-plugin

---

### 2. MCP Server Only

**Use Case:** Plugins that only need to provide tools to Claude

**Includes:**
- MCP server skeleton
- Tool schema definitions
- Configuration system
- Basic testing

**Example Use Cases:**
- Database connectors
- API integrations
- File processors

**File:** `templates/mcp-only-plugin/mcp-server/server.js.template`

```javascript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Tool schemas
const TOOLS = [
  {
    name: "{{PLUGIN_NAME}}:example_tool",
    description: "An example tool",
    inputSchema: {
      type: "object",
      properties: {
        input: {
          type: "string",
          description: "Input parameter"
        }
      },
      required: ["input"]
    }
  }
];

// MCP Server
const server = new Server(
  {
    name: "{{PLUGIN_NAME}}",
    version: "{{VERSION}}",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "{{PLUGIN_NAME}}:example_tool":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ result: `Processed: ${args.input}` })
          }
        ]
      };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("{{DISPLAY_NAME}} MCP server started");
}

main();
```

---

### 3. Hooks Only (Minimal)

**Use Case:** Simple plugins that only need to react to events

**Includes:**
- Hook scripts
- Minimal configuration
- Basic documentation

**Example Use Cases:**
- Logging plugins
- Notification systems
- Simple automations

---

### 4. Integration Template

**Use Case:** Plugins that integrate with external services

**Includes:**
- API client library
- Authentication handling
- Rate limiting
- Retry logic
- Error handling

**File:** `templates/integration-plugin/mcp-server/services/api-client.js`

```javascript
import { log } from '../utils/logger.js';
import { RateLimiter } from '../utils/rate-limiter.js';

export class ApiClient {
  constructor(config) {
    this.baseUrl = config.api_url;
    this.apiKey = config.api_key;
    this.rateLimiter = new RateLimiter(config.rate_limit || 10);
  }

  async request(endpoint, options = {}, retries = 3) {
    await this.rateLimiter.throttle();

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        if (attempt === retries) throw error;

        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}
```

---

## Reusable Components

### Shared Libraries

**Location:** `templates/shared/`

These components can be copied into any plugin:

#### 1. Configuration System

**File:** `templates/shared/config/config-loader.js`

```javascript
import { readFileSync } from 'fs';
import { load as yamlLoad } from 'js-yaml';
import { homedir } from 'os';
import { join } from 'path';

export function getConfigPath() {
  const projectDir = process.env.CLAUDE_PROJECT_DIR;

  if (projectDir) {
    const projectConfig = join(projectDir, '.claude', '{{PLUGIN_NAME}}.local.md');
    if (existsSync(projectConfig)) {
      return projectConfig;
    }
  }

  return join(homedir(), '.claude', '{{PLUGIN_NAME}}.local.md');
}

export function loadConfig(configPath) {
  const content = readFileSync(configPath, 'utf8');
  const config = yamlLoad(content);

  validateConfig(config);

  return config;
}

function validateConfig(config) {
  const required = [/* your required fields */];

  for (const field of required) {
    if (!config[field]) {
      throw new Error(`Missing required config field: ${field}`);
    }
  }
}
```

#### 2. Logger

**File:** `templates/shared/utils/logger.js`

```javascript
import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const LOG_DIR = join(homedir(), '.claude', 'logs');
const LOG_FILE = join(LOG_DIR, '{{PLUGIN_NAME}}.log');

if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

let config = null;

export function setConfig(cfg) {
  config = cfg;
}

export function log(level, message, context = {}) {
  if (!shouldLog(level)) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context
  };

  const line = JSON.stringify(entry) + '\n';

  if (level === 'error') {
    console.error(line);
  }

  appendFileSync(LOG_FILE, line);
}

function shouldLog(level) {
  if (!config) return level === 'error';

  const levels = {
    'all': ['info', 'warn', 'error'],
    'errors': ['error'],
    'none': []
  };

  return levels[config.logging_level || 'errors'].includes(level);
}
```

#### 3. Rate Limiter

**File:** `templates/shared/utils/rate-limiter.js`

```javascript
export class RateLimiter {
  constructor(maxRequests = 30, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async throttle() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);

      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.requests.push(Date.now());
  }
}
```

#### 4. Bash Hook Library (Core)

**File:** `templates/shared/hooks/lib/core.sh`

```bash
#!/bin/bash

# JSON output helpers
json_output() {
  local continue="${1:-true}"
  local suppress="${2:-false}"
  local message="${3:-}"

  cat <<EOF
{
  "continue": $continue,
  "suppressOutput": $suppress,
  "systemMessage": "$message"
}
EOF
}

json_success() {
  json_output true false "$1"
}

json_error() {
  json_output true false "[Error] $1"
}

# Config helpers
get_config_path() {
  if [ -n "$CLAUDE_PROJECT_DIR" ]; then
    local project_config="$CLAUDE_PROJECT_DIR/.claude/{{PLUGIN_NAME}}.local.md"
    if [ -f "$project_config" ]; then
      echo "$project_config"
      return
    fi
  fi

  echo "$HOME/.claude/{{PLUGIN_NAME}}.local.md"
}

# Logging
log_info() {
  echo "[INFO] $1" >&2
}

log_error() {
  echo "[ERROR] $1" >&2
}
```

---

## Testing Templates

### Jest Test Template

**File:** `templates/shared/tests/example.test.js`

```javascript
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

describe('{{PLUGIN_NAME}}', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Feature Name', () => {
    test('should do something', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = someFunction(input);

      // Assert
      expect(result).toBe('expected');
    });

    test('should handle errors', () => {
      expect(() => {
        someFunction(null);
      }).toThrow('error message');
    });
  });
});
```

### Bash Test Template

**File:** `templates/shared/tests/hooks.test.sh`

```bash
#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$SCRIPT_DIR/../hooks/scripts"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test helper
assert_equals() {
  local expected="$1"
  local actual="$2"
  local message="${3:-Assertion failed}"

  TESTS_RUN=$((TESTS_RUN + 1))

  if [ "$expected" = "$actual" ]; then
    echo -e "${GREEN}✓${NC} $message"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗${NC} $message"
    echo "  Expected: $expected"
    echo "  Actual: $actual"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

# Test: Example
test_example() {
  local result=$(echo "test" | tr 'a-z' 'A-Z')
  assert_equals "TEST" "$result" "Should convert to uppercase"
}

# Run tests
echo "Running {{PLUGIN_NAME}} Tests"
echo "================================"

test_example

# Summary
echo ""
echo "================================"
echo "Tests run: $TESTS_RUN"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
  echo -e "${RED}Failed: $TESTS_FAILED${NC}"
  exit 1
else
  echo "All tests passed!"
fi
```

---

## Documentation Templates

### README Template

**File:** `templates/plugin-template/README.md.template`

```markdown
# {{DISPLAY_NAME}}

{{DESCRIPTION}}

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

1. Clone the cc-plugins repository
2. Navigate to the plugin directory:
   ```bash
   cd plugins/{{PLUGIN_NAME}}
   ```
3. Install dependencies:
   ```bash
   cd mcp-server && npm install
   ```
4. Run the setup command:
   ```
   /{{PLUGIN_NAME}}:configure
   ```

## Configuration

Create a configuration file at `~/.claude/{{PLUGIN_NAME}}.local.md`:

\`\`\`yaml
---
# Your configuration here
setting1: value1
setting2: value2
---
\`\`\`

## Usage

### Commands

- `/{{PLUGIN_NAME}}:command1` - Description
- `/{{PLUGIN_NAME}}:command2` - Description

### MCP Tools

- `tool_name` - Description

## Development

### Running Tests

\`\`\`bash
npm test
\`\`\`

### Project Structure

\`\`\`
{{PLUGIN_NAME}}/
├── mcp-server/          # MCP server implementation
├── hooks/               # Event hooks
├── commands/            # Slash commands
├── skills/              # Knowledge bases
└── tests/               # Test suites
\`\`\`

## License

{{LICENSE}}

## Author

{{AUTHOR_NAME}} ({{AUTHOR_EMAIL}})
```

---

## Implementation Timeline

### Week 1: Core Templates
- Create base plugin template
- Implement shared libraries
- Write documentation templates

### Week 2: Generator
- Build plugin generator CLI
- Add template variable replacement
- Test with sample plugins

### Week 3: Specialized Templates
- Create MCP-only template
- Create hooks-only template
- Create integration template

### Week 4: Testing & Documentation
- Write template tests
- Create usage guides
- Document best practices

**Total Effort:** ~40 hours

---

## Success Metrics

- **Plugin Creation Time:** < 30 minutes (vs 4 hours manual)
- **Code Consistency:** 100% of new plugins follow structure
- **Bug Rate:** 50% reduction in common setup errors
- **Developer Satisfaction:** ⭐⭐⭐⭐⭐

---

## Next Steps

1. Implement plugin generator (`scripts/create-plugin.js`)
2. Create all template categories
3. Populate shared library components
4. Write generator tests
5. Document template system
6. Create video tutorial
