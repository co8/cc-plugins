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

# Load configuration
CONFIG_FILE=$(get_config_path) || {
  echo '{"continue": true, "suppressOutput": true}'
  exit 0
}

# Clear the todo message ID file at session start
# This ensures each session starts with a fresh todo message
TODO_MESSAGE_ID_FILE="${CLAUDE_PLUGIN_ROOT}/.todo-message-id"
if [ -f "$TODO_MESSAGE_ID_FILE" ]; then
  rm -f "$TODO_MESSAGE_ID_FILE" 2>/dev/null || true
fi

# Session start notifications are disabled
# Notifications are now sent when AFK mode is enabled with /afk command
echo '{"continue": true, "suppressOutput": true}'
exit 0
