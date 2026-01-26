# Browser Automation Patterns

Tool selection and workflows for browser automation in Claude Code projects.

## Tool Selection Matrix

| Tool | Best For | When to Use |
|------|----------|-------------|
| **Agent Browser** | Quick navigation, form filling, AI-driven tasks | Default choice for most browser tasks |
| **Playwright MCP** | Complex automation, testing, precise selectors, parallel contexts | Testing, CI/CD, network mocking |
| **Chrome DevTools MCP** | Debugging, network inspection, performance profiling | Deep analysis, performance issues |

## Agent Browser (Default)

### Core Workflow

```bash
# 1. Navigate and snapshot
agent-browser open <url>
agent-browser snapshot -i --json

# 2. Interact using refs
agent-browser click @e2
agent-browser fill @e3 "value"

# 3. Re-snapshot after changes
agent-browser snapshot -i --json
```

### Command Reference

| Command | Purpose |
|---------|---------|
| `agent-browser open <url>` | Navigate to URL |
| `agent-browser snapshot -i` | Get interactive elements with refs |
| `agent-browser snapshot -i -c` | Compact snapshot (less verbose) |
| `agent-browser snapshot -i --json` | JSON output for parsing |
| `agent-browser click @ref` | Click element by ref |
| `agent-browser fill @ref "text"` | Fill input by ref |
| `agent-browser screenshot [path]` | Capture screenshot |
| `agent-browser get text @ref` | Extract text from element |
| `agent-browser --help` | Show all commands |

### Best Practices

1. **Always snapshot after navigation** - Page state may change
2. **Use refs, not selectors** - Refs (`@e2`) are stable identifiers from snapshots
3. **Re-snapshot after interactions** - DOM may update after clicks/fills
4. **Use compact mode for large pages** - `-c` flag reduces output

## Playwright MCP

Use Playwright when you need:

- **Test assertions** - Verify element states, text content
- **Complex waits** - Wait for network idle, specific elements
- **Parallel contexts** - Multiple browser instances
- **Network mocking** - Intercept and mock API responses
- **CI/CD integration** - Headless testing in pipelines

### Example Use Cases

```
- E2E test suites
- Screenshot comparison tests
- Form validation testing
- Multi-user flow testing
- API response mocking
```

## Chrome DevTools MCP

Use DevTools when you need:

- **JavaScript errors** - Console error analysis
- **Network requests** - Request/response inspection
- **Performance profiling** - Render timing, memory usage
- **Deep DOM analysis** - Shadow DOM, iframes
- **Debugging** - Breakpoints, step execution

### Example Use Cases

```
- Performance bottleneck investigation
- Network waterfall analysis
- Memory leak detection
- JavaScript error debugging
- Lighthouse audits
```

## Decision Tree

```
Need browser automation?
    |
    +-- Quick task (form fill, navigation)?
    |       --> Agent Browser
    |
    +-- Testing / CI / assertions?
    |       --> Playwright MCP
    |
    +-- Debugging / performance?
            --> Chrome DevTools MCP
```

## Integration Example

Combining tools for comprehensive testing:

```bash
# 1. Quick exploration with Agent Browser
agent-browser open https://example.com
agent-browser snapshot -i

# 2. Write tests with Playwright
# (Use Playwright MCP for test automation)

# 3. Debug issues with DevTools
# (Use Chrome DevTools MCP for network/performance analysis)
```
