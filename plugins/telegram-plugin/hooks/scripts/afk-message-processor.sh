#!/bin/bash
set -euo pipefail

# AFK Mode Auto-Processing Hook (Stop Hook)
#
# This hook runs after Claude finishes responding. During AFK mode, it:
# 1. Forwards Claude's response to Telegram
# 2. Checks for pending Telegram messages and continues processing if any exist
#
# This creates an efficient polling loop during AFK sessions with automatic
# communication switching to Telegram.
#
# Token efficiency: Only continues when work exists, minimizes idle token usage.

# Source config helper library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/config-helper.sh"
source "${SCRIPT_DIR}/lib/message-templates.sh"

# Check dependencies
if ! check_jq; then
  cat  # Consume stdin to prevent pipe errors
  exit 0
fi

# Read hook input
input=$(cat)

# Check if AFK mode is enabled by reading the state file
AFK_STATE_FILE="${CLAUDE_PLUGIN_ROOT}/.afk-mode.state"

if [ ! -f "$AFK_STATE_FILE" ]; then
  # No state file means AFK mode is not enabled
  exit 0
fi

# Read the AFK state
afk_state=$(cat "$AFK_STATE_FILE" 2>/dev/null || echo '{"enabled": false}')
afk_enabled=$(echo "$afk_state" | jq -r '.enabled // false' 2>/dev/null || echo "false")

if [ "$afk_enabled" != "true" ]; then
  # AFK mode not active, let Claude stop normally
  exit 0
fi

# State file for storing todo message ID
TODO_MESSAGE_ID_FILE="${CLAUDE_PLUGIN_ROOT}/.todo-message-id"

# Helper function to send or edit message on Telegram
send_or_edit_telegram() {
  local message="$1"
  local is_todo_update="$2"

  # Get config path
  config_file=$(get_config_path 2>/dev/null)
  if [ -z "$config_file" ]; then
    return 1
  fi

  # Extract bot token and chat ID
  bot_token=$(get_config_value "$config_file" "bot_token")
  chat_id=$(get_config_value "$config_file" "chat_id")

  if [ -z "$bot_token" ] || [ -z "$chat_id" ]; then
    return 1
  fi

  # If this is a todo update, try to edit existing message
  if [ "$is_todo_update" = "true" ] && [ -f "$TODO_MESSAGE_ID_FILE" ]; then
    todo_message_id=$(cat "$TODO_MESSAGE_ID_FILE" 2>/dev/null)
    if [ -n "$todo_message_id" ] && [ "$todo_message_id" != "null" ]; then
      # Try to edit the existing message
      if edit_telegram_message "$message" "$chat_id" "$todo_message_id" "$bot_token" 2>/dev/null; then
        return 0
      fi
      # If edit fails, fall through to send new message
    fi
  fi

  # Send new message via Telegram API
  response=$(send_telegram_message "$message" "$chat_id" "$bot_token" 2>/dev/null)

  # If this is a todo update, store the message ID
  if [ "$is_todo_update" = "true" ]; then
    message_id=$(echo "$response" | jq -r '.result.message_id // ""' 2>/dev/null)
    if [ -n "$message_id" ] && [ "$message_id" != "null" ]; then
      echo "$message_id" > "$TODO_MESSAGE_ID_FILE"
    fi
  fi
}

# AFK mode is active - Forward Claude's response to Telegram
# Extract transcript path from hook input
transcript_path=$(echo "$input" | jq -r '.transcript_path // ""' 2>/dev/null)

if [ -n "$transcript_path" ] && [ "$transcript_path" != "null" ]; then
  # Expand ~ to home directory
  transcript_path="${transcript_path/#\~/$HOME}"

  if [ -f "$transcript_path" ]; then
    # Extract the last assistant message from the transcript
    # Read the file in reverse and find the first assistant message
    last_response=$(tac "$transcript_path" | while read -r line; do
      role=$(echo "$line" | jq -r '.role // ""' 2>/dev/null)
      if [ "$role" = "assistant" ]; then
        # Extract the content field - it may be a string or array
        content=$(echo "$line" | jq -r '
          if .content | type == "array" then
            [.content[] | select(.type == "text") | .text] | join("\n\n")
          elif .content | type == "string" then
            .content
          else
            ""
          end
        ' 2>/dev/null)

        if [ -n "$content" ] && [ "$content" != "null" ] && [ "$content" != "[]" ]; then
          echo "$content"
          break
        fi
      fi
    done)

    # Send the response to Telegram if we found one
    if [ -n "$last_response" ] && [ "$last_response" != "null" ] && [ "$last_response" != "" ]; then
      # Check if this is a todo list update
      is_todo_update="false"
      if echo "$last_response" | grep -q "📋.*Todo List"; then
        is_todo_update="true"
        # For todo updates, send as-is without the Claude header
        send_or_edit_telegram "$last_response" "$is_todo_update" >/dev/null 2>&1
      else
        # For regular messages, use clean Claude response format
        send_or_edit_telegram "💬 Claude\n\n$last_response" "false" >/dev/null 2>&1
      fi
    fi
  fi
fi

# AFK mode is active - Check if there are pending Telegram messages
# We use the MCP server's listener status via a simple check of the queue
# Note: This requires the MCP server to expose queue status, which it does via get_listener_status

# Try to get pending message count via a simple state file approach
# The MCP server should maintain a .pending-count file for hooks to read
PENDING_COUNT_FILE="${CLAUDE_PLUGIN_ROOT}/.pending-messages-count"

if [ -f "$PENDING_COUNT_FILE" ]; then
  pending_count=$(cat "$PENDING_COUNT_FILE" 2>/dev/null || echo "0")
else
  pending_count="0"
fi

if [ "$pending_count" -gt 0 ]; then
  # There are pending messages - tell Claude to continue processing
  echo '{"decision": "block", "reason": "📱 Processing pending Telegram messages..."}'
  exit 2  # Exit code 2 tells Claude to continue
else
  # No pending messages, let Claude rest
  exit 0
fi
