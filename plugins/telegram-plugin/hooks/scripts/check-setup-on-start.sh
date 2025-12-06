#!/bin/bash
set -euo pipefail

# Source config helper library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/config-helper.sh"

# Check dependencies
if ! check_jq; then
  cat  # Consume stdin to prevent pipe errors
  exit 0
fi

# Read hook input
input=$(cat)

# Initialize status checks
config_exists=false
mcp_enabled=false
hooks_enabled=false
setup_needed=false

# Check 1: Configuration file exists
CONFIG_FILE=$(get_config_path) || true
if [ -n "$CONFIG_FILE" ] && [ -f "$CONFIG_FILE" ]; then
  config_exists=true
fi

# Check 2: MCP server is enabled
# We check if the MCP tools are available by looking for the presence of telegram-bot tools
# This is indirect - we'll prompt Claude to verify this
# For now, we assume if config exists, user might need MCP setup

# Check 3: Hooks are loaded
# If this script is running, hooks are loaded! So we know hooks work.
hooks_enabled=true

# Determine if setup is needed
if [ "$config_exists" = false ]; then
  setup_needed=true

  # Generate helpful setup prompt
  echo "{
  \"continue\": true,
  \"suppressOutput\": false,
  \"systemMessage\": \"🔧 [Telegram Plugin] First-time setup needed\\n\\nThe telegram-plugin is installed but not yet configured.\\n\\nSetup checklist:\\n❌ Configuration file (.claude/telegram.local.md)\\n❓ MCP Server (needs verification)\\n✅ Hooks (active)\\n\\nWould you like to configure it now? Run: /telegram-plugin:configure\\n\\nOr ask me to help you set it up interactively.\"
}"
  exit 0
fi

# If config exists, check if MCP server is likely enabled
# We can't directly test MCP availability from bash hook, but we can check
# if the config was recently created (might indicate incomplete setup)

# Check if config file is very new (created in last 5 minutes)
if [ -f "$CONFIG_FILE" ]; then
  current_time=$(date +%s)
  file_time=$(stat -f %m "$CONFIG_FILE" 2>/dev/null || stat -c %Y "$CONFIG_FILE" 2>/dev/null || echo 0)
  time_diff=$((current_time - file_time))

  # If config was just created (< 5 minutes), remind about MCP setup
  if [ $time_diff -lt 300 ]; then
    echo "{
  \"continue\": true,
  \"suppressOutput\": false,
  \"systemMessage\": \"✅ [Telegram Plugin] Configuration detected\\n\\nSetup status:\\n✅ Configuration file found\\n❓ MCP Server (requires verification)\\n✅ Hooks (active)\\n\\nIMPORTANT: Make sure the MCP server is enabled:\\n\\n1. Check if 'send_message' tool is available\\n2. If not, you may need to restart Claude Code for MCP auto-discovery\\n3. Or manually add to ~/.claude/settings.json (see /telegram-plugin:configure)\\n\\nTest with: /telegram-plugin:test\"
}"
    exit 0
  fi
fi

# Config exists and is not brand new - assume setup is complete
# Suppress output to avoid noise on every session
echo '{"continue": true, "suppressOutput": true}'
exit 0
