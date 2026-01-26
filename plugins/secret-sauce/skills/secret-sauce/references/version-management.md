# Version Management Patterns

Patterns for keeping version numbers synchronized across multiple files in plugin projects.

## Multi-File Version Sync Pattern

Many plugins require version numbers to be synchronized across multiple files. A single version update may need to be reflected in 4-8 different locations.

### Common Version Locations

| File Type | Typical Path | Field |
|-----------|--------------|-------|
| Root marketplace | `.claude-plugin/marketplace.json` | `plugins[].version` |
| Plugin marketplace | `plugins/<name>/.claude-plugin/marketplace.json` | `version` |
| Plugin config | `plugins/<name>/.claude-plugin/plugin.json` | `version` |
| NPM package | `plugins/<name>/*/package.json` | `version` |
| NPM lockfile | `plugins/<name>/*/package-lock.json` | `version` (2 locations) |
| Source code | `*.js`, `*.ts` | Version constant/comment |

## Example: Telegram Plugin (6 Locations)

When updating the telegram-plugin version, update ALL of these files:

### Version Update Checklist

```markdown
## Version Update: X.Y.Z -> A.B.C

- [ ] `.claude-plugin/marketplace.json:19` (root marketplace plugins array)
- [ ] `plugins/telegram-plugin/.claude-plugin/marketplace.json:4` (plugin marketplace)
- [ ] `plugins/telegram-plugin/.claude-plugin/plugin.json:3` (plugin config)
- [ ] `plugins/telegram-plugin/mcp-server/package.json:3` (npm package)
- [ ] `plugins/telegram-plugin/mcp-server/package-lock.json:3` (lockfile name)
- [ ] `plugins/telegram-plugin/mcp-server/package-lock.json:9` (lockfile version)
- [ ] `plugins/telegram-plugin/mcp-server/telegram-bot.js:1109` (source constant)
```

## Version Update Process

### 1. Determine New Version

Follow semantic versioning:
- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features, backward compatible
- **PATCH** (0.0.X): Bug fixes, backward compatible

### 2. Update All Locations

Use find-and-replace with the old version string:

```bash
# Find all version occurrences
grep -rn "0.4.0" plugins/telegram-plugin/

# Verify before updating
grep -rn "0.4.0" .claude-plugin/ plugins/telegram-plugin/
```

### 3. Regenerate Lockfile (if needed)

```bash
cd plugins/<name>/mcp-server
npm install  # Regenerates package-lock.json with new version
```

### 4. Verify Sync

```bash
# All should show the same version
grep -h "version" .claude-plugin/marketplace.json | head -1
grep -h "version" plugins/<name>/.claude-plugin/*.json
grep -h "version" plugins/<name>/*/package.json | head -1
```

## Best Practices

### Document Version Locations

Add to project CLAUDE.md:

```markdown
## VERSION UPDATES: replace all mentions in plugin and marketplace files:
1. .claude-plugin/marketplace.json:19 (root marketplace)
2. plugins/<name>/.claude-plugin/marketplace.json:4
3. plugins/<name>/.claude-plugin/plugin.json:3
4. plugins/<name>/<server>/package.json:3
5. plugins/<name>/<server>/package-lock.json:3,9
6. plugins/<name>/<server>/<main>.js:<line> (if applicable)
```

### Automate with Scripts

Consider adding a version bump script:

```bash
#!/bin/bash
# scripts/bump-version.sh
OLD_VERSION=$1
NEW_VERSION=$2

if [ -z "$OLD_VERSION" ] || [ -z "$NEW_VERSION" ]; then
    echo "Usage: ./bump-version.sh OLD_VERSION NEW_VERSION"
    exit 1
fi

# Update all JSON files
find . -name "*.json" -type f -exec sed -i '' "s/\"$OLD_VERSION\"/\"$NEW_VERSION\"/g" {} \;

# Update source files (customize pattern)
find . -name "*.js" -type f -exec sed -i '' "s/version.*$OLD_VERSION/version: '$NEW_VERSION'/g" {} \;

echo "Updated $OLD_VERSION -> $NEW_VERSION"
echo "Verify changes with: git diff"
```

### Pre-Commit Validation

Add a validation step to catch version mismatches:

```bash
# Extract versions and compare
VERSIONS=$(grep -roh '"version":\s*"[^"]*"' . | sort -u)
if [ $(echo "$VERSIONS" | wc -l) -gt 1 ]; then
    echo "Version mismatch detected:"
    echo "$VERSIONS"
    exit 1
fi
```

## Common Pitfalls

1. **Forgetting package-lock.json** - Has version in TWO places
2. **Source file constants** - Easy to miss version strings in code
3. **Root vs plugin marketplace** - Both need updates
4. **Nested dependencies** - Check all package.json files in monorepos
