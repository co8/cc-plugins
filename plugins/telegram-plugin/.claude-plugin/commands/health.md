---
description: Check MCP server health and connection status
allowed-tools: [Bash]
---

Check the health status of the Telegram MCP server.

Execute health check:

```bash
cd ${CLAUDE_PLUGIN_ROOT}/mcp-server && npm run health
```

This will verify:
- MCP server can start
- Configuration file is valid
- Bot token is functional
- Dependencies are installed

Report results to user with:
- ✅ Server status
- ✅ Config validation
- ✅ Bot connectivity
- ⚠️ Any warnings or issues
