# Security Audit & Recommendations
**CC-Plugins Repository**
**Date:** December 2024
**Audited Plugin:** telegram-plugin v0.3.1

## Executive Summary

The telegram-plugin demonstrates **strong security practices** overall, with proper credential handling, input validation, and secure defaults. This audit identifies areas for enhancement and provides actionable recommendations.

**Security Rating:** ✅ GOOD (8.5/10)

**Critical Issues:** 0
**High Priority:** 2
**Medium Priority:** 4
**Low Priority:** 3

---

## Critical Issues

### None Found ✅

The plugin has no critical security vulnerabilities. Credentials are properly protected, inputs are validated, and secrets are gitignored.

---

## High Priority Recommendations

### H1. Token Masking in Logs (PARTIAL)

**Current State:**
- Health check masks bot token: `${"*".repeat(10)}...` (telegram-bot.js:108)
- Regular logs do NOT mask the token
- If logging_level is "all", full token could be logged

**Risk:** Token exposure in log files if misconfigured

**Recommendation:**
```javascript
// In utils/logger.js, add token scrubbing
function scrubSensitiveData(obj) {
  const scrubbed = { ...obj };
  const sensitiveKeys = ['bot_token', 'token', 'password', 'secret', 'key'];

  for (const key of sensitiveKeys) {
    if (scrubbed[key]) {
      scrubbed[key] = scrubbed[key].slice(0, 10) + '***';
    }
  }

  return scrubbed;
}

export function log(level, message, context = {}) {
  const scrubbedContext = scrubSensitiveData(context);
  // ... rest of logging logic
}
```

**Files to Update:**
- `mcp-server/utils/logger.js:20-40`

**Priority:** HIGH
**Effort:** LOW (1 hour)

---

### H2. Rate Limiting Configuration

**Current State:**
- Hardcoded: 30 messages/minute (telegram-client.js:9)
- Not configurable per user
- No burst protection

**Risk:** Telegram API rate limit violations (20 msgs/min for groups)

**Recommendation:**
```yaml
# Add to config schema
rate_limiting:
  messages_per_minute: 20  # Configurable
  burst_size: 5            # Allow short bursts
```

```javascript
// In telegram-client.js
export class TelegramClient {
  constructor(config) {
    const rateLimit = config.rate_limiting?.messages_per_minute || 20;
    const burstSize = config.rate_limiting?.burst_size || 5;
    this.rateLimiter = new RateLimiter(rateLimit, burstSize);
  }
}
```

**Files to Update:**
- `mcp-server/config/config-loader.js` - Add schema validation
- `mcp-server/services/telegram-client.js:9` - Use config value
- `mcp-server/utils/rate-limiter.js` - Add burst protection

**Priority:** HIGH
**Effort:** MEDIUM (3 hours)

---

## Medium Priority Recommendations

### M1. Input Sanitization for HTML Injection

**Current State:**
- Markdown to HTML conversion without full sanitization
- Relies on Telegram's HTML subset, but no explicit validation
- Special chars escaped: `<`, `>`, `&` (utils/markdown.js)

**Risk:** Potential HTML injection if Telegram's parser changes

**Recommendation:**
```javascript
// Add HTML sanitization library
import createDOMPurify from 'isomorphic-dompurify';

export function escapeHtml(text) {
  const allowedTags = ['b', 'i', 'u', 's', 'code', 'pre', 'a'];
  return createDOMPurify.sanitize(text, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ['href']
  });
}
```

**Files to Update:**
- `mcp-server/package.json` - Add `isomorphic-dompurify`
- `mcp-server/utils/markdown.js:15-35` - Use DOMPurify

**Priority:** MEDIUM
**Effort:** LOW (2 hours)

---

### M2. Config File Permissions

**Current State:**
- Config files stored in `~/.claude/telegram.local.md`
- No permission checking
- Could be world-readable on misconfigured systems

**Risk:** Token exposure via file system access

**Recommendation:**
```javascript
// In config-loader.js
import { promises as fs } from 'fs';

export function loadConfig(configPath) {
  // Check file permissions
  const stats = await fs.stat(configPath);
  const mode = (stats.mode & parseInt('777', 8)).toString(8);

  if (mode !== '600' && mode !== '640') {
    log('warn', 'Config file has insecure permissions', {
      path: configPath,
      mode: mode,
      recommended: '600'
    });

    // Auto-fix permissions
    await fs.chmod(configPath, 0o600);
    log('info', 'Config file permissions fixed to 600');
  }

  // Continue loading...
}
```

**Files to Update:**
- `mcp-server/config/config-loader.js:25-35` - Add permission check

**Priority:** MEDIUM
**Effort:** LOW (1 hour)

---

### M3. Approval Request Timeout Handling

**Current State:**
- Default timeout: 600 seconds (10 minutes)
- No cleanup of stale approval requests
- Polling continues even after timeout

**Risk:** Resource leak with many timed-out approvals

**Recommendation:**
```javascript
// In approval-manager.js
export function pollResponse(approvalId, timeout = 600) {
  const approval = approvals.get(approvalId);

  // Set explicit timeout
  const timeoutHandle = setTimeout(() => {
    if (!approval.response) {
      approval.timedOut = true;
      approval.response = { selectedOption: null, customInput: null };
      cleanupApproval(approvalId); // Cleanup immediately
    }
  }, timeout * 1000);

  // Clear timeout if response received
  approval.timeoutHandle = timeoutHandle;
}

function cleanupApproval(approvalId) {
  const approval = approvals.get(approvalId);
  if (approval?.timeoutHandle) {
    clearTimeout(approval.timeoutHandle);
  }
  approvals.delete(approvalId);
}
```

**Files to Update:**
- `mcp-server/services/approval-manager.js:45-75` - Add timeout cleanup

**Priority:** MEDIUM
**Effort:** MEDIUM (2 hours)

---

### M4. Chat ID Authorization Validation

**Current State:**
- Only checks `chat_id` matches in message listener
- No validation that incoming chat_id is numeric
- Could potentially accept malformed IDs

**Risk:** Potential bypass if Telegram changes ID format

**Recommendation:**
```javascript
// In message-listener.js
function isAuthorizedChat(chatId) {
  const configuredChatId = String(config.chat_id);
  const incomingChatId = String(chatId);

  // Validate format
  if (!/^-?\d+$/.test(incomingChatId)) {
    log('warn', 'Invalid chat_id format', { chatId: incomingChatId });
    return false;
  }

  // Strict equality check
  return incomingChatId === configuredChatId;
}

bot.on('message', (msg) => {
  if (!isAuthorizedChat(msg.chat.id)) {
    log('warn', 'Unauthorized chat_id attempt', {
      attempted: msg.chat.id,
      configured: config.chat_id
    });
    return; // Reject
  }
  // Process message...
});
```

**Files to Update:**
- `mcp-server/services/message-listener.js:85-105` - Add validation

**Priority:** MEDIUM
**Effort:** LOW (1 hour)

---

## Low Priority Recommendations

### L1. Dependency Security Scanning

**Current State:**
- No automated dependency scanning
- Manual `npm audit` required
- Dependencies: `node-telegram-bot-api`, `@modelcontextprotocol/sdk`, `js-yaml`

**Recommendation:**
```json
// Add to package.json
{
  "scripts": {
    "audit": "npm audit --audit-level=moderate",
    "audit:fix": "npm audit fix",
    "pretest": "npm run audit"
  },
  "devDependencies": {
    "npm-audit-resolver": "^3.0.0"
  }
}
```

Add GitHub Actions workflow:
```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm audit --audit-level=high
```

**Priority:** LOW
**Effort:** LOW (1 hour)

---

### L2. Secrets Detection in CI/CD

**Current State:**
- `.gitignore` prevents local config commit
- No pre-commit hook to catch accidental commits
- No CI/CD secret scanning

**Recommendation:**
```bash
# Install pre-commit hook
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run check-secrets"
```

```json
// Add to package.json
{
  "scripts": {
    "check-secrets": "bash -c 'if git diff --cached | grep -iE \"bot_token|[0-9]{8,}:[A-Za-z0-9_-]{35}\"; then echo \"ERROR: Bot token detected in commit\"; exit 1; fi'"
  }
}
```

**Priority:** LOW
**Effort:** LOW (1 hour)

---

### L3. AFK State File Security

**Current State:**
- AFK state stored in `/tmp/telegram-plugin-afk-state.json`
- World-readable on some systems
- Contains user state information

**Recommendation:**
```javascript
// In afk-manager.js
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

// Store in user's home directory with restricted permissions
const AFK_STATE_FILE = path.join(os.homedir(), '.claude', '.telegram-afk-state');

export async function saveAfkState(state) {
  await fs.writeFile(AFK_STATE_FILE, JSON.stringify(state), { mode: 0o600 });
}
```

**Files to Update:**
- `mcp-server/services/afk-manager.js:10-15` - Change file location & permissions

**Priority:** LOW
**Effort:** LOW (30 minutes)

---

## Security Best Practices Currently Followed ✅

1. **Credential Management**
   - Bot token in config file (not hardcoded)
   - `.gitignore` prevents commit of `.local.md` files
   - Config discovery with fallback hierarchy

2. **Input Validation**
   - All MCP tool inputs validated (config/validation.js)
   - Type checking for all parameters
   - Array bounds checking

3. **Error Handling**
   - Try-catch blocks around all Telegram API calls
   - Graceful degradation on errors
   - No sensitive data in error messages

4. **HTML Escaping**
   - Special characters escaped before Telegram HTML parsing
   - Markdown converted safely

5. **Authorization**
   - Only configured `chat_id` can send commands
   - Unauthorized messages rejected

6. **Logging**
   - Structured logging with context
   - Configurable log levels
   - No passwords in standard logs

---

## Implementation Priority

### Phase 1 (Week 1) - High Priority
1. **H1:** Token masking in logs (1 hour)
2. **H2:** Rate limiting configuration (3 hours)

### Phase 2 (Week 2) - Medium Priority
3. **M1:** HTML sanitization (2 hours)
4. **M2:** Config file permissions (1 hour)
5. **M3:** Approval timeout cleanup (2 hours)
6. **M4:** Chat ID validation (1 hour)

### Phase 3 (Week 3) - Low Priority
7. **L1:** Dependency scanning (1 hour)
8. **L2:** Secrets detection (1 hour)
9. **L3:** AFK state file security (30 minutes)

**Total Estimated Effort:** 12.5 hours across 3 weeks

---

## Security Checklist for New Plugins

When creating new plugins, ensure:

- [ ] All credentials in config files (not hardcoded)
- [ ] Config files added to `.gitignore`
- [ ] Input validation for all user-provided data
- [ ] Output escaping for all display formats
- [ ] Error messages don't leak sensitive information
- [ ] File permissions set to 600 for sensitive files
- [ ] Dependencies scanned with `npm audit`
- [ ] Rate limiting for external API calls
- [ ] Authorization checks for all actions
- [ ] Graceful shutdown handlers
- [ ] Structured logging with scrubbing
- [ ] Timeout handling for long-running operations

---

## References

- Telegram Bot API Security: https://core.telegram.org/bots/api#making-requests
- OWASP API Security Top 10: https://owasp.org/www-project-api-security/
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/

---

**Next Steps:**
1. Review and prioritize recommendations
2. Create GitHub issues for each recommendation
3. Assign implementation timeline
4. Update security documentation after fixes
