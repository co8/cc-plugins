#!/bin/bash
set -euo pipefail

# Test the plugin generator with automated responses
echo "Testing plugin generator..."

# Create test input file
cat > /tmp/test-plugin-input.txt <<EOF
test-sample-plugin
Sample Test Plugin
A sample plugin created by the generator for testing
Test Author
test@example.com
1
1
1
EOF

# Run generator with test input
node scripts/create-plugin.js < /tmp/test-plugin-input.txt

# Verify the plugin was created
if [ -d "plugins/test-sample-plugin" ]; then
  echo "✓ Plugin directory created"
else
  echo "✗ Plugin directory not created"
  exit 1
fi

# Check for key files
FILES=(
  "plugins/test-sample-plugin/.claude-plugin/plugin.json"
  "plugins/test-sample-plugin/.claude-plugin/marketplace.json"
  "plugins/test-sample-plugin/.mcp.json"
  "plugins/test-sample-plugin/mcp-server/server.js"
  "plugins/test-sample-plugin/mcp-server/package.json"
  "plugins/test-sample-plugin/README.md"
  "plugins/test-sample-plugin/hooks/hooks.json"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file exists"
  else
    echo "✗ $file missing"
    exit 1
  fi
done

# Check that placeholders were replaced
if grep -q "{{PLUGIN_NAME}}" "plugins/test-sample-plugin/README.md" 2>/dev/null; then
  echo "✗ Placeholders not replaced in README.md"
  exit 1
else
  echo "✓ Placeholders replaced correctly"
fi

# Verify plugin.json is valid JSON
if jq empty "plugins/test-sample-plugin/.claude-plugin/plugin.json" 2>/dev/null; then
  echo "✓ plugin.json is valid JSON"
else
  echo "✗ plugin.json is not valid JSON"
  exit 1
fi

# Clean up
echo ""
echo "Cleaning up test plugin..."
rm -rf "plugins/test-sample-plugin"
rm -f /tmp/test-plugin-input.txt

echo ""
echo "✅ Plugin generator test passed!"
