# Changelog

All notable changes to the Telegram Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.1.5] - 2025-12-06

### Added

- **Configuration Schema Validation**: Robust YAML parsing with js-yaml library and comprehensive validation
- **Retry Logic**: Automatic retry with exponential backoff (3 attempts) for network failures
- **Log Rotation**: Automatic log file rotation when exceeding 10MB (keeps 3 backup files)
- **Health Check Command**: New `/telegram-plugin:health` command and `npm run health` script
- **Unit Tests**: Comprehensive test suite for configuration, validation, and markdown escaping
- **Config Helper Library**: Shared bash library for hook scripts with CLAUDE_PROJECT_DIR support
- **Dependency Warnings**: Hook scripts now warn users when jq is missing instead of failing silently

### Changed

- **MCP SDK Updated**: Upgraded from 0.5.0 to 1.24.3 (latest version)
- **Markdown Format**: Standardized on MarkdownV2 for all Telegram messages
- **Polling Cleanup**: Improved polling state management to prevent resource leaks
- **Hook Scripts**: All hooks now use centralized config discovery matching MCP server behavior
- **Version Sync**: Synchronized version numbers across plugin.json, marketplace.json, and package.json

### Improved

- Better error messages for configuration validation failures
- More robust config file discovery (project-specific vs global)
- Enhanced cleanup mechanism in pollResponse with proper state tracking
- Immediate approval cleanup when response received
- Log rotation prevents disk space issues

### Technical

- Added CONFIG_SCHEMA with type validation and range checks
- Implemented rotateLogFile() function with configurable limits
- Enhanced sendMessage() with retry logic and exponential backoff
- Improved pollResponse() to track and restore polling state
- Created config-helper.sh library for bash hook scripts

## [0.1.4] - 2025-12-06

### Fixed

- Fixed regex bug in `escapeMarkdown()` function that caused `send_approval_request` to crash with "Invalid regular expression: /\\[/g: Unterminated character class" error. Replaced loop-based string concatenation with single regex pattern using proper character class escaping. See [BUGFIXES.md](BUGFIXES.md) for technical details.

### Changed

- Improved `escapeMarkdown()` performance by using single regex pass instead of multiple replace operations

## [0.1.0] - Initial Release

### Added
- MCP server integration for Telegram Bot API
- Three core tools:
  - `send_message` - Send text messages with priority levels
  - `send_approval_request` - Send questions with inline keyboard buttons
  - `poll_response` - Wait for user responses to approval requests
- Configuration via `~/.claude/telegram.local.md` with YAML frontmatter
- Smart notification system with keyword detection
- Message batching with configurable time windows
- Five event hooks:
  - `PostToolUse` (TodoWrite) - Task completion notifications
  - `PreToolUse` (AskUserQuestion) - Approval workflows
  - `Notification` - Smart detection of important messages
  - `SessionStart` - Session start notifications
  - `SessionEnd` - Session end notifications
- Logging system with configurable levels (all/errors/none)
- Automatic approval cleanup (24-hour retention)
- Project-specific and global configuration support
- Interactive setup command (`/telegram-plugin:configure`)
- Connection test command (`/telegram-plugin:test`)

### Security
- Bot token stored in local `.md` files (gitignored)
- No tokens in code or version control
- Markdown escaping to prevent injection attacks
