# Plugin Development Guide

Complete guide to developing plugins for Claude Code using the cc-plugins template system.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Plugin Structure](#plugin-structure)
3. [MCP Server Development](#mcp-server-development)
4. [Hooks Development](#hooks-development)
5. [Commands](#commands)
6. [Skills](#skills)
7. [Configuration](#configuration)
8. [Testing](#testing)
9. [Publishing](#publishing)

## Quick Start

### Create a New Plugin

```bash
# Navigate to cc-plugins directory
cd cc-plugins

# Run the generator
npm run create-plugin
```

Answer the prompts:
- **Plugin name:** my-awesome-plugin (kebab-case)
- **Display name:** My Awesome Plugin
- **Description:** What your plugin does
- **Author:** Your Name
- **Email:** you@example.com
- **License:** MIT
- **Template:** Full-featured
- **Category:** Choose appropriate category

The generator creates a complete plugin structure with:
- MCP server implementation
- Hook system
- Configuration loading
- Testing setup
- Documentation

### Install Dependencies

```bash
cd plugins/my-awesome-plugin/mcp-server
npm install
```

### Test Your Plugin

```bash
npm test
```

## Plugin Structure

```
my-awesome-plugin/
├── .claude-plugin/
│   ├── plugin.json              # Plugin metadata
│   └── marketplace.json         # Marketplace listing
├── .mcp.json                    # MCP server config
├── mcp-server/
│   ├── server.js                # Main entry point
│   ├── package.json             # Dependencies
│   ├── config/
│   │   └── config-loader.js     # Config loading
│   ├── server/
│   │   ├── schemas.js           # Tool definitions
│   │   └── handlers.js          # Tool implementations
│   ├── services/                # Business logic
│   └── utils/
│       └── logger.js            # Logging utility
├── hooks/
│   ├── hooks.json               # Hook definitions
│   └── scripts/
│       ├── lib/
│       │   └── core.sh          # Shared utilities
│       ├── session-start.sh
│       └── session-end.sh
├── commands/
│   └── configure.md             # Slash commands
├── skills/
│   └── plugin-knowledge/        # Knowledge bases
├── tests/
│   └── config.test.js           # Tests
└── README.md                    # Documentation
```

## MCP Server Development

### Defining Tools

Edit `mcp-server/server/schemas.js`:

```javascript
export const TOOLS = [
  {
    name: "my-plugin:do_something",
    description: "Does something useful",
    inputSchema: {
      type: "object",
      properties: {
        input: {
          type: "string",
          description: "What to process"
        },
        options: {
          type: "object",
          description: "Optional settings",
          properties: {
            verbose: { type: "boolean" }
          }
        }
      },
      required: ["input"]
    }
  }
];
```

### Implementing Handlers

Edit `mcp-server/server/handlers.js`:

```javascript
export async function handleToolCall(request, config) {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "my-plugin:do_something":
      return handleDoSomething(args, config);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleDoSomething(args, config) {
  const { input, options = {} } = args;

  // Your implementation here
  const result = processInput(input, options);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ result }, null, 2)
      }
    ]
  };
}
```

### Using Services

Create reusable business logic in `mcp-server/services/`:

```javascript
// mcp-server/services/processor.js
import { log } from '../utils/logger.js';

export class Processor {
  constructor(config) {
    this.config = config;
  }

  async process(input) {
    log('info', 'Processing input', { input });
    // Your logic here
    return result;
  }
}
```

Use in handlers:

```javascript
import { Processor } from '../services/processor.js';

async function handleDoSomething(args, config) {
  const processor = new Processor(config);
  const result = await processor.process(args.input);
  return { content: [{ type: "text", text: result }] };
}
```

## Hooks Development

### Hook Types

Claude Code supports these hook events:
- `SessionStart` - When a session begins
- `SessionEnd` - When a session ends
- `PreToolUse` - Before a tool is called
- `PostToolUse` - After a tool is called
- `Notification` - For custom notifications

### Creating Hooks

Edit `hooks/hooks.json`:

```json
{
  "hooks": [
    {
      "event": "SessionStart",
      "script": "scripts/session-start.sh",
      "description": "Initialize plugin state"
    },
    {
      "event": "PostToolUse",
      "script": "scripts/post-tool.sh",
      "description": "Log tool usage"
    }
  ]
}
```

### Writing Hook Scripts

Hook scripts must output JSON with this structure:

```bash
#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/core.sh"

# Your logic here

# Success output
json_success "Operation completed"
```

### Hook Library Functions

The `core.sh` library provides utilities:

```bash
# JSON output
json_success "message"          # Success with message
json_error "error message"      # Error with message
json_suppress                   # Suppress output

# Configuration
config_path=$(get_config_path)
value=$(get_config_value "$config_path" "key")

# Logging
log_info "Information message"
log_warn "Warning message"
log_error "Error message"
```

## Commands

Commands are slash commands users can invoke in Claude Code.

### Creating Commands

Add a markdown file in `commands/`:

```markdown
---
name: configure
description: Interactive configuration wizard
---

# My Plugin Configuration

This command helps you set up the plugin.

## Required Information

1. **API Key**: Your service API key
2. **Endpoint**: API endpoint URL

## Steps

I'll guide you through the configuration process...
```

### Command Best Practices

- Use clear, conversational language
- Break complex tasks into steps
- Validate user input
- Provide helpful error messages
- Save configuration to `.claude/*.local.md`

## Skills

Skills are knowledge bases that help Claude understand your plugin.

### Creating Skills

Create a directory in `skills/`:

```
skills/
└── my-plugin-knowledge/
    └── knowledge.md
```

### Knowledge File Structure

```markdown
---
name: my-plugin-integration
description: Knowledge about integrating with My Plugin
---

# My Plugin Integration Guide

This knowledge base helps Claude understand how to work with My Plugin.

## Common Tasks

### Task 1: Do Something
To accomplish X, use the `my-plugin:do_something` tool with...

### Task 2: Configure Settings
Settings can be configured in `.claude/my-plugin.local.md`...

## Troubleshooting

### Issue: Connection Failed
If you see "connection failed", check...
```

## Configuration

### Configuration File Format

Plugins use YAML frontmatter in `.claude/*.local.md`:

```yaml
---
api_key: your-api-key
api_url: https://api.example.com
timeout_seconds: 30
logging_level: errors  # all, errors, none
---

Optional markdown content here...
```

### Loading Configuration

The template includes a config loader:

```javascript
import { loadConfig, getConfigPath } from './config/config-loader.js';

const configPath = getConfigPath();
const config = loadConfig(configPath);
```

### Validating Configuration

Add validation in `config-loader.js`:

```javascript
function validateConfig(config) {
  const required = ['api_key', 'api_url'];

  const missing = [];
  for (const field of required) {
    if (!config[field]) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}
```

## Testing

### Writing Tests

The template includes Jest configuration. Add tests in `tests/`:

```javascript
import { describe, test, expect } from '@jest/globals';
import { handleToolCall } from '../mcp-server/server/handlers.js';

describe('Tool Handlers', () => {
  test('do_something processes input correctly', async () => {
    const request = {
      params: {
        name: 'my-plugin:do_something',
        arguments: { input: 'test' }
      }
    };

    const config = { /* test config */ };
    const result = await handleToolCall(request, config);

    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('test');
  });
});
```

### Running Tests

```bash
cd mcp-server
npm test                  # Run all tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # With coverage
```

### Test Coverage

Aim for 80%+ coverage:

```bash
npm test -- --coverage
```

## Publishing

### Version Updates

Update version in these files:
1. `.claude-plugin/plugin.json`
2. `.claude-plugin/marketplace.json`
3. `mcp-server/package.json`
4. `CHANGELOG.md`

### Marketplace Entry

Add/update in root `marketplace.json`:

```json
{
  "plugins": [
    {
      "name": "my-awesome-plugin",
      "source": "./plugins/my-awesome-plugin",
      "version": "1.0.0",
      "description": "Short description",
      "category": "Productivity"
    }
  ]
}
```

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in all files
- [ ] README.md has usage examples
- [ ] Configuration documented
- [ ] Troubleshooting section complete
- [ ] Code reviewed
- [ ] Tested in Claude Code

## Best Practices

### Error Handling

```javascript
try {
  const result = await riskyOperation();
  return formatSuccess(result);
} catch (error) {
  log('error', 'Operation failed', {
    operation: 'riskyOperation',
    error: error.message
  });
  throw new Error(`Failed to process: ${error.message}`);
}
```

### Logging

```javascript
import { log } from '../utils/logger.js';

log('info', 'Processing started', { input: data });
log('warn', 'Deprecated feature used', { feature: 'oldApi' });
log('error', 'Operation failed', { error: error.message });
```

### Security

- Never log sensitive data (tokens, passwords)
- Validate all user input
- Use rate limiting for external APIs
- Keep dependencies updated
- Follow principle of least privilege

### Performance

- Cache expensive computations
- Use rate limiting appropriately
- Clean up resources
- Avoid unbounded memory growth
- Profile slow operations

## Resources

- [Template Documentation](../templates/README.md)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [Example: telegram-plugin](../plugins/telegram-plugin/)
- [Roadmap](../docs/plans/ROADMAP.md)

## Support

- GitHub Issues: https://github.com/co8/cc-plugins/issues
- Documentation: This guide and template README files
- Examples: Check existing plugins in `plugins/`
