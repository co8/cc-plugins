# Registry API Reference

Complete API reference for the CC-Plugins Registry system.

## Table of Contents

- [Registry Structure](#registry-structure)
- [CLI Commands](#cli-commands)
- [Programmatic API](#programmatic-api)
- [Schema Validation](#schema-validation)
- [Publishing Workflow](#publishing-workflow)
- [Best Practices](#best-practices)

---

## Registry Structure

### Top-Level Schema

```typescript
interface Registry {
  version: string;              // Registry schema version (semver)
  metadata: RegistryMetadata;
  plugins: Record<string, Plugin>;
}

interface RegistryMetadata {
  last_updated: string;         // ISO 8601 timestamp
  total_plugins: number;
  total_downloads?: number;
}
```

### Plugin Schema

```typescript
interface Plugin {
  // Identity
  name: string;                 // Unique identifier (kebab-case)
  displayName: string;          // Human-readable name
  description: string;          // Short description (10-200 chars)
  longDescription?: string;     // Detailed description (markdown)

  // Author & License
  author: Author;
  license: License;

  // Repository
  repository: Repository;
  homepage?: string;

  // Versions
  versions: Record<string, Version>;
  latest: string;               // Latest stable version

  // Classification
  categories: Category[];       // 1-3 categories
  tags: string[];              // 1-10 tags

  // Presentation
  features?: Feature[];
  screenshots?: string[];      // URLs

  // Metrics
  downloads?: number;
  rating?: number;             // 0-5

  // Status
  verified?: boolean;
  deprecated?: boolean;
  deprecationMessage?: string;
}
```

### Version Schema

```typescript
interface Version {
  version: string;              // Semantic version
  releaseDate: string;          // ISO 8601 timestamp
  tarball: string;              // Download URL
  integrity: string;            // SHA-512 hash

  // Dependencies
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;

  // Requirements
  minClaudeVersion?: string;
  minNodeVersion?: string;

  // Documentation
  releaseNotes?: string;        // Markdown

  // Status
  breaking?: boolean;
  deprecated?: boolean;
}
```

### Supporting Types

```typescript
interface Author {
  name: string;
  email?: string;
  url?: string;
  verified?: boolean;
}

interface Repository {
  type: 'git';
  url: string;                  // HTTPS URL
  directory?: string;           // Monorepo subdirectory
}

interface Feature {
  title: string;                // Max 50 chars
  description: string;          // Max 200 chars
  icon?: string;                // Emoji or icon
}

type License =
  | 'MIT'
  | 'Apache-2.0'
  | 'BSD-3-Clause'
  | 'GPL-3.0'
  | 'ISC'
  | 'Unlicense';

type Category =
  | 'notifications'
  | 'remote-control'
  | 'productivity'
  | 'automation'
  | 'communication'
  | 'development-tools'
  | 'testing'
  | 'deployment'
  | 'monitoring'
  | 'security'
  | 'data'
  | 'integration'
  | 'utilities'
  | 'other';
```

---

## CLI Commands

### Search

Search for plugins in the registry.

```bash
plugin-manager search <query>
```

**Arguments:**
- `query` - Search term (matches name, description, tags, categories)

**Returns:** List of matching plugins with key details

**Example:**

```bash
$ plugin-manager search telegram

Found 1 plugin(s):

Claude Code Telegram Bot
  telegram-plugin@0.3.1
  Remote interaction with Claude Code via Telegram...
  Categories: notifications, remote-control, productivity
  Rating: ⭐⭐⭐⭐⭐ (4.8/5)
  ✓ Verified publisher
```

### Info

Show detailed information about a specific plugin.

```bash
plugin-manager info <plugin-name>
```

**Arguments:**
- `plugin-name` - Plugin identifier

**Returns:** Complete plugin metadata and version information

**Example:**

```bash
$ plugin-manager info telegram-plugin

Claude Code Telegram Bot
============================
...
```

### Install

Install a plugin from the registry.

```bash
plugin-manager install <plugin-name> [version]
```

**Arguments:**
- `plugin-name` - Plugin identifier
- `version` - Optional version (default: latest)

**Returns:** Installation confirmation and quick start guide

**Side Effects:**
- Downloads plugin tarball
- Verifies integrity hash
- Extracts to `~/.claude/plugins/<plugin-name>`
- Runs post-install scripts if present

**Example:**

```bash
$ plugin-manager install telegram-plugin
ℹ Downloading telegram-plugin@0.3.1...
ℹ Installing plugin...
✓ Successfully installed telegram-plugin@0.3.1
```

### Update

Update an installed plugin to the latest version.

```bash
plugin-manager update <plugin-name>
```

**Arguments:**
- `plugin-name` - Plugin identifier

**Returns:** Update confirmation

**Side Effects:**
- Refreshes registry cache
- Checks current version
- Downloads latest version if newer
- Backs up current version
- Extracts new version
- Rolls back on failure

**Example:**

```bash
$ plugin-manager update telegram-plugin
ℹ Updating telegram-plugin from 0.3.0 to 0.3.1
✓ Successfully installed telegram-plugin@0.3.1
```

### List

List all installed plugins.

```bash
plugin-manager list
```

**Arguments:** None

**Returns:** List of installed plugins with versions

**Example:**

```bash
$ plugin-manager list

Installed plugins (1):

telegram-plugin@0.3.1
  Remote interaction with Claude Code via Telegram...
```

### Validate

Validate plugin structure against schema.

```bash
plugin-manager validate <plugin-path>
```

**Arguments:**
- `plugin-path` - Path to plugin directory

**Returns:** Validation result with errors if any

**Example:**

```bash
$ plugin-manager validate ./plugins/my-plugin
✓ Plugin structure is valid
```

---

## Programmatic API

### Import

```javascript
import {
  fetchRegistry,
  searchPlugins,
  showPluginInfo,
  installPlugin,
  updatePlugin,
  listInstalledPlugins,
  validatePlugin
} from '@cc-plugins/cli';
```

### fetchRegistry()

Fetch registry data from remote or cache.

```typescript
async function fetchRegistry(forceRefresh?: boolean): Promise<Registry>
```

**Parameters:**
- `forceRefresh` - Skip cache and fetch from remote (default: false)

**Returns:** Registry object

**Example:**

```javascript
const registry = await fetchRegistry();
console.log(`Total plugins: ${registry.metadata.total_plugins}`);
```

### searchPlugins()

Search for plugins matching a query.

```typescript
async function searchPlugins(query: string): Promise<void>
```

**Parameters:**
- `query` - Search term

**Side Effects:** Prints results to console

**Example:**

```javascript
await searchPlugins('telegram');
```

### showPluginInfo()

Display detailed plugin information.

```typescript
async function showPluginInfo(pluginName: string): Promise<void>
```

**Parameters:**
- `pluginName` - Plugin identifier

**Side Effects:** Prints plugin info to console

**Example:**

```javascript
await showPluginInfo('telegram-plugin');
```

### installPlugin()

Install a plugin from the registry.

```typescript
async function installPlugin(
  pluginName: string,
  version?: string
): Promise<void>
```

**Parameters:**
- `pluginName` - Plugin identifier
- `version` - Version to install (default: 'latest')

**Side Effects:**
- Downloads and extracts plugin
- Updates installation directory

**Example:**

```javascript
await installPlugin('telegram-plugin', '0.3.1');
```

### updatePlugin()

Update an installed plugin.

```typescript
async function updatePlugin(pluginName: string): Promise<void>
```

**Parameters:**
- `pluginName` - Plugin identifier

**Side Effects:**
- Updates plugin to latest version
- Creates backup of current version

**Example:**

```javascript
await updatePlugin('telegram-plugin');
```

### listInstalledPlugins()

List all installed plugins.

```typescript
function listInstalledPlugins(): void
```

**Side Effects:** Prints installed plugins to console

**Example:**

```javascript
listInstalledPlugins();
```

### validatePlugin()

Validate plugin structure.

```typescript
function validatePlugin(pluginPath: string): void
```

**Parameters:**
- `pluginPath` - Path to plugin directory

**Side Effects:** Prints validation result to console

**Example:**

```javascript
validatePlugin('./plugins/my-plugin');
```

---

## Schema Validation

### JSON Schema

The registry uses [JSON Schema Draft 7](https://json-schema.org/draft-07/schema) for validation.

Schema file: [registry/schema.json](../registry/schema.json)

### Validation with AJV

```javascript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schema = JSON.parse(readFileSync('registry/schema.json', 'utf8'));
const registry = JSON.parse(readFileSync('registry/registry.json', 'utf8'));

const validate = ajv.compile(schema);
const valid = validate(registry);

if (!valid) {
  console.error('Validation errors:', validate.errors);
}
```

### Common Validation Errors

#### Invalid Plugin Name

```
Error: Plugin name must be kebab-case
Pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/

❌ My-Plugin
❌ my_plugin
✅ my-plugin
```

#### Invalid Version Format

```
Error: Version must be valid semver
Pattern: /^\d+\.\d+\.\d+$/

❌ 1.0
❌ v1.0.0
✅ 1.0.0
```

#### Missing Required Fields

```
Error: Plugin must have required fields

Required:
- name
- displayName
- description
- author
- license
- repository
- versions
- latest
- categories
- tags
```

---

## Publishing Workflow

### Step-by-Step Guide

#### 1. Prepare Plugin

Ensure your plugin has:

```
my-plugin/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── README.md
├── LICENSE
└── ... (plugin files)
```

#### 2. Create Tarball

```bash
cd plugins/my-plugin
tar -czf ../../my-plugin-1.0.0.tar.gz .
```

#### 3. Generate Integrity Hash

```bash
cat my-plugin-1.0.0.tar.gz | \
  openssl dgst -sha512 -binary | \
  openssl base64 -A
```

Output: `sha512-AbCdEf123...`

#### 4. Upload Tarball

Upload to GitHub Releases:

```bash
gh release create v1.0.0 my-plugin-1.0.0.tar.gz
```

Get download URL: `https://github.com/user/repo/releases/download/v1.0.0/my-plugin-1.0.0.tar.gz`

#### 5. Update Registry

Add to `registry/registry.json`:

```json
{
  "plugins": {
    "my-plugin": {
      "name": "my-plugin",
      "displayName": "My Plugin",
      "description": "A sample plugin",
      "author": {
        "name": "Your Name",
        "email": "you@example.com"
      },
      "license": "MIT",
      "repository": {
        "type": "git",
        "url": "https://github.com/user/repo"
      },
      "versions": {
        "1.0.0": {
          "version": "1.0.0",
          "releaseDate": "2024-12-25T00:00:00.000Z",
          "tarball": "https://github.com/user/repo/releases/download/v1.0.0/my-plugin-1.0.0.tar.gz",
          "integrity": "sha512-AbCdEf123...",
          "minClaudeVersion": "1.0.0"
        }
      },
      "latest": "1.0.0",
      "categories": ["utilities"],
      "tags": ["sample", "demo"]
    }
  }
}
```

#### 6. Validate

```bash
cd cli
npm test
```

All tests should pass.

#### 7. Submit PR

```bash
git add registry/registry.json
git commit -m "Add my-plugin v1.0.0"
git push origin add-my-plugin
gh pr create --title "Add my-plugin" --body "New plugin: My Plugin"
```

---

## Best Practices

### Naming Conventions

```
✅ Good Names:
- telegram-plugin
- github-actions
- slack-integration

❌ Bad Names:
- TelegramPlugin (not kebab-case)
- telegram_plugin (underscores)
- plugin-telegram (inconsistent order)
```

### Version Management

```
✅ Good Versioning:
- Follow semantic versioning (semver)
- 1.0.0 - Initial stable release
- 1.1.0 - New features
- 1.0.1 - Bug fixes
- 2.0.0 - Breaking changes

❌ Bad Versioning:
- 1.0 (not full semver)
- v1.0.0 (no 'v' prefix)
- latest (use specific versions)
```

### Descriptions

```
✅ Good Descriptions:
- Clear and concise (10-200 chars)
- Describe what the plugin does
- Mention key features
- Use proper grammar

❌ Bad Descriptions:
- Too short: "Plugin"
- Too long: 500+ characters
- Vague: "A cool plugin"
- Typos and errors
```

### Categories & Tags

```
✅ Good Tags:
- Specific and relevant
- Lowercase with hyphens
- 5-10 tags maximum
- Include primary function

❌ Bad Tags:
- Too generic: "plugin", "tool"
- Too many: 20+ tags
- Mixed case: "MyTag"
- Special chars: "tag_name"
```

### Documentation

```
✅ Good Documentation:
- Complete README.md
- Installation instructions
- Configuration guide
- Examples and screenshots
- Troubleshooting section

❌ Bad Documentation:
- No README
- Unclear instructions
- Missing prerequisites
- No examples
```

### Security

```
✅ Security Best Practices:
- Never commit secrets
- Use environment variables
- Validate all inputs
- Include integrity hashes
- Keep dependencies updated

❌ Security Issues:
- Hardcoded tokens
- No input validation
- Vulnerable dependencies
- Missing integrity checks
```

---

## Error Handling

### Common Errors

#### Plugin Not Found

```
Error: Plugin "xyz" not found in registry

Solution:
- Check plugin name spelling
- Search registry: plugin-manager search xyz
- Verify plugin exists
```

#### Version Not Found

```
Error: Version "2.0.0" not found for plugin

Solution:
- Check available versions: plugin-manager info <plugin>
- Use valid version or "latest"
```

#### Invalid Registry

```
Error: Registry validation failed

Solution:
- Check registry.json syntax
- Validate against schema
- Run tests: cd cli && npm test
```

#### Download Failed

```
Error: Failed to download plugin

Solution:
- Check internet connection
- Verify tarball URL is accessible
- Check integrity hash matches
```

---

## Support & Contributing

### Getting Help

- **Documentation:** [registry/README.md](../registry/README.md)
- **CLI Guide:** [cli/README.md](../cli/README.md)
- **Issues:** [GitHub Issues](https://github.com/co8/cc-plugins/issues)

### Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for:
- Code style guidelines
- Testing requirements
- PR submission process
- Review criteria

### License

MIT License - See [LICENSE](../LICENSE)
