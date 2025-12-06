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
CONFIG_FILE=$(get_config_path)
if [ $? -ne 0 ]; then
  echo '{"continue": true, "suppressOutput": true}'
  exit 0
fi

# Check if session events are enabled
session_events=$(get_bool_config "$CONFIG_FILE" "session_events" "false")

if [ "$session_events" != "true" ]; then
  echo '{"continue": true, "suppressOutput": true}'
  exit 0
fi

# Get project info
project=$(echo "$input" | jq -r '.cwd' 2>/dev/null | xargs basename 2>/dev/null || echo "unknown")
timestamp=$(date "+%H:%M:%S" 2>/dev/null || echo "unknown")

message="🚀 *Claude Code Started*\n\n📁 Project: \`${project}\`\n⏰ Time: ${timestamp}"

# Inform Claude to send notification
echo "{
  \"continue\": true,
  \"suppressOutput\": false,
  \"systemMessage\": \"[Telegram Plugin] Session started. Use send_message tool with priority='low' to send: ${message}\"
}"

exit 0
