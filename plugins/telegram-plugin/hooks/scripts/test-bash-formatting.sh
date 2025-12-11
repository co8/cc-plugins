#!/bin/bash
# Test script for bash helper HTML formatting

set -euo pipefail

# Source config helper library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/config-helper.sh"

# Load configuration
CONFIG_FILE=$(get_config_path)
if [ $? -ne 0 ]; then
  echo "❌ Config not found"
  exit 1
fi

# Get credentials
bot_token=$(get_config_value "$CONFIG_FILE" "bot_token")
chat_id=$(get_config_value "$CONFIG_FILE" "chat_id")

if [ -z "$bot_token" ] || [ -z "$chat_id" ]; then
  echo "❌ Missing bot_token or chat_id in config"
  exit 1
fi

# Test message with formatting
message="🧪 *Bash Helper HTML Test* 🔧\n\nFormatting checks:\n• *Bold text*\n• _Italic text_\n• \`Code text\`\n\n✅ If formatting is correct (no asterisks), bash helper works!"

echo "📤 Sending test message via bash helper..."

if send_telegram_message "$message" "$chat_id" "$bot_token"; then
  echo "✅ Message sent successfully"
  exit 0
else
  echo "❌ Failed to send message"
  exit 1
fi
