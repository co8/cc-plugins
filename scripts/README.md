# CC-Plugins Scripts

Utility scripts for managing the cc-plugins ecosystem.

## Available Scripts

### `create-plugin.js`

Interactive plugin generator that creates new plugins from templates.

**Usage:**
```bash
npm run create-plugin
```

**Features:**
- Interactive prompts for plugin configuration
- Multiple template types (full-featured, MCP-only, minimal)
- Automatic placeholder replacement
- Dependency installation
- Marketplace registration

**Templates:**
1. **Full-featured** - Complete plugin with MCP server, hooks, commands, and skills
2. **MCP Server Only** - Just an MCP server for tools
3. **Hooks Only (minimal)** - Simple event-driven scripts

**Example:**
```bash
$ npm run create-plugin

🚀 Claude Code Plugin Generator

Plugin name (kebab-case): my-awesome-plugin
Display name (My Awesome Plugin):
Short description: Does awesome things
Author name: Your Name
Author email: you@example.com

License:
  1. MIT
  2. Apache-2.0
  3. GPL-3.0
  4. BSD-3-Clause
  5. ISC
Enter your choice (1-5): 1

Template type:
  1. Full-featured (MCP + Hooks + Commands + Skills)
  2. MCP Server Only
  3. Hooks Only (minimal)
Enter your choice (1-3): 1

Plugin category:
  1. Productivity
  2. Development Tools
  3. Communication
  4. Integration
  5. Testing
  6. Documentation
  7. Other
Enter your choice (1-7): 1

📁 Creating plugin directory...
✓ Created directory: /path/to/plugins/my-awesome-plugin
📝 Making scripts executable...
✓ Scripts are executable
📦 Installing dependencies...
✓ Dependencies installed
📋 Adding to marketplace...
✓ Added to marketplace

✅ Plugin created successfully!

Next steps:
  1. cd plugins/my-awesome-plugin
  2. Edit the plugin files to implement your features
  3. Run tests: cd mcp-server && npm test
  4. Update README.md with usage instructions
  5. Test your plugin with /my-awesome-plugin:configure
```

### `test-templates.js`

Validates all plugin templates to ensure they're complete and correct.

**Usage:**
```bash
npm run test:templates
```

**Tests:**
- Template directories exist
- Required files are present
- Template placeholders are correct
- JSON files have valid structure
- Shared libraries are complete

**Output:**
```bash
🧪 Running Template Validation Tests

✓ plugin-template directory exists
✓ plugin-template has plugin.json.template
✓ plugin-template has mcp-server/server.js.template
✓ plugin.json.template contains placeholders
✓ shared has config-loader.js
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tests run: 33
Passed: 33

✅ All template validation tests passed!
```

### `test-generator-simple.js`

Tests the plugin generator by creating a test plugin programmatically.

**Usage:**
```bash
node scripts/test-generator-simple.js
```

**Tests:**
- Plugin directory creation
- File generation from templates
- Placeholder replacement
- JSON validity
- Complete file structure

**Output:**
```bash
🧪 Testing Plugin Generator

Creating plugin from template...
✓ .claude-plugin/plugin.json
✓ mcp-server/server.js
✓ README.md
...

Verifying placeholder replacement...
✓ Placeholders replaced correctly

Verifying JSON files...
✓ .claude-plugin/plugin.json is valid JSON
...

✅ Plugin generator test passed!
```

## Script Details

### create-plugin.js Implementation

The generator follows this workflow:

1. **Gather Information** - Interactive prompts for plugin details
2. **Validate Input** - Ensure valid plugin name and no conflicts
3. **Copy Template** - Copy selected template directory
4. **Replace Variables** - Replace all `{{VARIABLE}}` placeholders
5. **Make Executable** - Set permissions on shell scripts
6. **Install Dependencies** - Run `npm install` in mcp-server
7. **Update Marketplace** - Add entry to root marketplace.json

### Template Variables

The following placeholders are replaced during generation:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{PLUGIN_NAME}}` | Plugin identifier (kebab-case) | `my-awesome-plugin` |
| `{{DISPLAY_NAME}}` | Human-readable name | `My Awesome Plugin` |
| `{{DESCRIPTION}}` | Short description | `Does awesome things` |
| `{{AUTHOR_NAME}}` | Author's name | `Your Name` |
| `{{AUTHOR_EMAIL}}` | Author's email | `you@example.com` |
| `{{LICENSE}}` | License type | `MIT` |
| `{{CATEGORY}}` | Plugin category | `Productivity` |
| `{{VERSION}}` | Initial version | `0.1.0` |
| `{{YEAR}}` | Current year | `2025` |

### Adding New Scripts

When adding new utility scripts:

1. Create the script in `scripts/`
2. Make it executable: `chmod +x scripts/new-script.js`
3. Add shebang: `#!/usr/bin/env node`
4. Add to package.json scripts section
5. Document in this README
6. Add tests if applicable

## Testing Scripts

All scripts should be tested before committing:

```bash
# Test template validation
npm run test:templates

# Test generator
node scripts/test-generator-simple.js

# Manual test of interactive generator
npm run create-plugin
# Then follow prompts with test data
# Clean up: rm -rf plugins/test-*
```

## Troubleshooting

### "Permission denied" when running scripts

Make scripts executable:
```bash
chmod +x scripts/*.js
chmod +x scripts/*.sh
```

### Generator fails to install dependencies

The generator attempts to run `npm install` automatically. If it fails:
```bash
cd plugins/your-plugin/mcp-server
npm install
```

### Template validation fails

Check that all required template files exist:
```bash
ls -la templates/plugin-template/
ls -la templates/shared/
```

If files are missing, refer to the template documentation.

### Placeholder not replaced

Ensure the placeholder follows the exact format:
- Correct: `{{PLUGIN_NAME}}`
- Wrong: `{{ PLUGIN_NAME }}` (spaces)
- Wrong: `{PLUGIN_NAME}` (single braces)

## Development

### Project Structure

```
scripts/
├── create-plugin.js           # Main generator
├── test-templates.js          # Template validator
├── test-generator-simple.js   # Generator test
└── README.md                  # This file
```

### Dependencies

Scripts use only Node.js built-in modules:
- `fs` - File system operations
- `path` - Path manipulation
- `readline` - Interactive prompts
- `child_process` - Spawn npm install

No external dependencies required for scripts.

## Contributing

When modifying scripts:

1. Maintain backward compatibility
2. Add/update tests
3. Update documentation
4. Test thoroughly
5. Follow existing code style

## License

MIT - Same as the parent project
