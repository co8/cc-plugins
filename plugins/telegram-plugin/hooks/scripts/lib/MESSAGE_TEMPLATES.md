# Message Templates for Telegram Plugin

This library provides consistent, clean, and minimal message formatting for all Telegram notifications sent by the plugin.

## Design Principles

1. **Minimal & Clean**: No underlines, no bold headers, simple emoji icons
2. **Consistent Structure**: Title line + key-value pairs
3. **Scannable**: Easy to read at a glance on mobile
4. **Emoji First**: Each message type has a distinctive emoji

## Template Format

```
🎯 Title

📦 Key: Value
💬 Details: Information
🔗 Link: Reference
```

## Available Templates

### Git Commit Template
```bash
source "${SCRIPT_DIR}/lib/message-templates.sh"
message=$(template_git_commit "project-name" "commit message" "abc1234")
```

**Output:**
```
✅ Committed

📦 Project: project-name
💬 Message: commit message
🔗 Hash: abc1234
```

### Success Template
```bash
message=$(template_success "Operation Complete" "Successfully deployed to production")
```

**Output:**
```
✅ Operation Complete

💬 Successfully deployed to production
```

### Error Template
```bash
message=$(template_error "Build Failed" "webpack" "Module not found: 'react'")
```

**Output:**
```
❌ Build Failed

🔧 Component: webpack
💬 Details: Module not found: 'react'
```

### Warning Template
```bash
message=$(template_warning "Deprecated API" "Using old authentication method")
```

**Output:**
```
⚠️ Deprecated API

💬 Using old authentication method
```

### Info Template
```bash
message=$(template_info "Status Update" "Processing batch 3 of 10")
```

**Output:**
```
ℹ️ Status Update

💬 Processing batch 3 of 10
```

### Task/Todo Template
```bash
message=$(template_task "completed" "Build project")
```

**Output:**
```
✅ Build project
```

Status options: `completed`, `failed`, `in_progress`, `pending`

### Bug Fix Template
```bash
message=$(template_bugfix "v0.2.16" "Placeholders not resolved" "Changed format to avoid conflicts" "defcbc5")
```

**Output:**
```
✅ Fixed v0.2.16

🐛 Bug: Placeholders not resolved
🔧 Fix: Changed format to avoid conflicts
📦 Commit: defcbc5
```

### Feature Template
```bash
message=$(template_feature "v1.2.0" "Dark Mode" "Added system-wide dark mode support")
```

**Output:**
```
✨ New Feature v1.2.0

🎯 Dark Mode
💬 Added system-wide dark mode support
```

### Session Template
```bash
message=$(template_session "start" "my-project" "Branch: feature/new-ui")
```

**Output:**
```
🟢 Session Started

📦 Project: my-project
💬 Branch: feature/new-ui
```

## Emoji Guide

| Emoji | Meaning |
|-------|---------|
| ✅ | Success, completed, committed |
| ❌ | Error, failed |
| ⚠️ | Warning, caution |
| ℹ️ | Information |
| 🐛 | Bug, issue |
| 🔧 | Fix, tool, component |
| 📦 | Project, commit, package |
| 💬 | Message, details, comment |
| 🔗 | Link, hash, reference |
| 🎯 | Target, goal, feature |
| ✨ | New, feature, enhancement |
| 🟢 | Start, active, online |
| 🔴 | End, inactive, offline |
| 🟡 | Pause, waiting |
| 🔄 | In progress, processing |
| ⏳ | Pending, queued |

## Usage in Hook Scripts

1. Source the template library:
```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/message-templates.sh"
```

2. Build your message:
```bash
message=$(template_success "Build Complete" "All tests passed")
```

3. Send via config-helper:
```bash
source "${SCRIPT_DIR}/lib/config-helper.sh"
send_telegram_message "$message" "$chat_id" "$bot_token"
```

## Custom Messages

For custom message formats, use the `build_message` function:

```bash
message=$(build_message \
  "🎉" "Celebration" \
  "🎯" "Goal" "100% test coverage" \
  "📊" "Stats" "1,234 tests passed" \
  "⏱️" "Time" "2.3 seconds")
```

**Output:**
```
🎉 Celebration

🎯 Goal: 100% test coverage
📊 Stats: 1,234 tests passed
⏱️ Time: 2.3 seconds
```

## Migration Guide

### Before (old format):
```bash
message="✅ *Git Commit*\n\n📁 Project: \`${project}\`\n💬 Message: ${commit_message}"
```

### After (new template):
```bash
source "${SCRIPT_DIR}/lib/message-templates.sh"
message=$(template_git_commit "$project" "$commit_message" "$commit_hash")
```

Benefits:
- No manual formatting
- No markdown syntax needed
- Consistent across all messages
- Easier to maintain
