#!/bin/bash
# Message template library for consistent Telegram formatting
# Provides clean, minimal message templates with emoji icons

# Format a key-value pair line
# Usage: format_line "icon" "label" "value"
format_line() {
  local icon="$1"
  local label="$2"
  local value="$3"

  if [ -n "$value" ]; then
    echo "${icon} ${label}: ${value}"
  fi
}

# Generic template function
# Usage: build_message "title_emoji" "title_text" "line1_emoji" "line1_label" "line1_value" ...
build_message() {
  local title_emoji="$1"
  local title_text="$2"
  shift 2

  local message="${title_emoji} ${title_text}\n"

  # Process remaining arguments in groups of 3 (icon, label, value)
  while [ $# -ge 3 ]; do
    local icon="$1"
    local label="$2"
    local value="$3"
    shift 3

    if [ -n "$value" ]; then
      message="${message}\n${icon} ${label}: ${value}"
    fi
  done

  echo -e "$message"
}

# Git commit message template
# Usage: template_git_commit "project_name" "commit_message" "commit_hash"
template_git_commit() {
  local project="$1"
  local msg="$2"
  local hash="${3:-}"

  local message="✅ Committed"
  [ -n "$project" ] && message="${message}\n\n📦 Project: ${project}"
  [ -n "$msg" ] && message="${message}\n💬 Message: ${msg}"
  [ -n "$hash" ] && message="${message}\n🔗 Hash: ${hash}"

  echo -e "$message"
}

# Success message template
# Usage: template_success "title" "details"
template_success() {
  local title="$1"
  local details="$2"

  local message="✅ ${title}"
  [ -n "$details" ] && message="${message}\n\n💬 ${details}"

  echo -e "$message"
}

# Error message template
# Usage: template_error "title" "component" "details"
template_error() {
  local title="$1"
  local component="$2"
  local details="$3"

  local message="❌ ${title}"
  [ -n "$component" ] && message="${message}\n\n🔧 Component: ${component}"
  [ -n "$details" ] && message="${message}\n💬 Details: ${details}"

  echo -e "$message"
}

# Warning message template
# Usage: template_warning "title" "details"
template_warning() {
  local title="$1"
  local details="$2"

  local message="⚠️ ${title}"
  [ -n "$details" ] && message="${message}\n\n💬 ${details}"

  echo -e "$message"
}

# Info message template
# Usage: template_info "title" "details"
template_info() {
  local title="$1"
  local details="$2"

  local message="ℹ️ ${title}"
  [ -n "$details" ] && message="${message}\n\n💬 ${details}"

  echo -e "$message"
}

# Task/Todo message template
# Usage: template_task "status" "description"
template_task() {
  local status="$1"
  local description="$2"

  local icon="🔄"
  case "$status" in
    "completed"|"done") icon="✅" ;;
    "failed"|"error") icon="❌" ;;
    "in_progress"|"working") icon="🔄" ;;
    "pending"|"waiting") icon="⏳" ;;
  esac

  echo -e "${icon} ${description}"
}

# Bug fix message template
# Usage: template_bugfix "version" "bug_description" "fix_description" "commit_hash"
template_bugfix() {
  local version="$1"
  local bug="$2"
  local fix="$3"
  local hash="${4:-}"

  local message="✅ Fixed ${version}"
  [ -n "$bug" ] && message="${message}\n\n🐛 Bug: ${bug}"
  [ -n "$fix" ] && message="${message}\n🔧 Fix: ${fix}"
  [ -n "$hash" ] && message="${message}\n📦 Commit: ${hash}"

  echo -e "$message"
}

# Feature message template
# Usage: template_feature "version" "feature_title" "description"
template_feature() {
  local version="$1"
  local title="$2"
  local description="$3"

  local message="✨ New Feature ${version}"
  [ -n "$title" ] && message="${message}\n\n🎯 ${title}"
  [ -n "$description" ] && message="${message}\n💬 ${description}"

  echo -e "$message"
}

# Session message template
# Usage: template_session "status" "project" "details"
template_session() {
  local status="$1"
  local project="$2"
  local details="${3:-}"

  local icon="🟢"
  local action="Started"
  case "$status" in
    "start"|"started") icon="🟢"; action="Started" ;;
    "end"|"ended") icon="🔴"; action="Ended" ;;
    "pause"|"paused") icon="🟡"; action="Paused" ;;
  esac

  local message="${icon} Session ${action}"
  [ -n "$project" ] && message="${message}\n\n📦 Project: ${project}"
  [ -n "$details" ] && message="${message}\n💬 ${details}"

  echo -e "$message"
}

# Export all template functions
export -f format_line
export -f build_message
export -f template_git_commit
export -f template_success
export -f template_error
export -f template_warning
export -f template_info
export -f template_task
export -f template_bugfix
export -f template_feature
export -f template_session
