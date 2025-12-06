#!/bin/bash
# Configuration helper library for Telegram plugin hooks
# Provides config file discovery matching MCP server behavior

# Get configuration file path with project-specific support
get_config_path() {
  # Try project-specific config first
  if [ -n "${CLAUDE_PROJECT_DIR:-}" ]; then
    local project_config="${CLAUDE_PROJECT_DIR}/.claude/telegram.local.md"
    if [ -f "$project_config" ]; then
      echo "$project_config"
      return 0
    fi
  fi

  # Fall back to global config
  local global_config="$HOME/.claude/telegram.local.md"
  if [ -f "$global_config" ]; then
    echo "$global_config"
    return 0
  fi

  # No config found
  return 1
}

# Check if jq is available and warn if missing
check_jq() {
  if ! command -v jq >/dev/null 2>&1; then
    echo "{
      \"continue\": true,
      \"suppressOutput\": false,
      \"systemMessage\": \"[Telegram Plugin Warning] jq command not found. Telegram notifications will not work. Install jq: brew install jq (macOS) or apt install jq (Linux)\"
    }"
    return 1
  fi
  return 0
}

# Get a boolean config value with fallback
get_bool_config() {
  local config_file="$1"
  local key_path="$2"
  local default="${3:-false}"

  if [ ! -f "$config_file" ]; then
    echo "$default"
    return
  fi

  # Parse YAML using grep (basic parser for simple structure)
  local value
  value=$(grep -A 10 "notifications:" "$config_file" 2>/dev/null | grep "${key_path}:" | grep -o "true\|false" 2>/dev/null || echo "$default")
  echo "$value"
}

# Export functions for use in other scripts
export -f get_config_path
export -f check_jq
export -f get_bool_config
