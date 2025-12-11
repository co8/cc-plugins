#!/bin/bash
# Complete diagnostic test for telegram-plugin formatting

echo "🔍 Telegram Plugin Formatting Diagnostic"
echo "========================================"
echo ""

# Test 1: Node.js HTML conversion function
echo "[Test 1] Node.js HTML Conversion Function"
cd /Users/enrique/.claude/plugins/marketplaces/co8-plugins/plugins/telegram-plugin/mcp-server
if node test-html-conversion.js 2>&1 | grep -q "5 passed"; then
  echo "✅ PASS: HTML conversion function works"
else
  echo "❌ FAIL: HTML conversion function broken"
fi
echo ""

# Test 2: Bash helper formatting
echo "[Test 2] Bash Helper Formatting"
if bash /Users/enrique/.claude/plugins/cache/co8-plugins/telegram-plugin/0.2.1/hooks/scripts/test-bash-formatting.sh 2>&1 | grep -q "Message sent successfully"; then
  echo "✅ PASS: Bash helper sends messages"
else
  echo "❌ FAIL: Bash helper broken"
fi
echo ""

# Test 3: Direct Node.js send with HTML
echo "[Test 3] Direct Node.js Send with HTML"
cd /Users/enrique/.claude/plugins/marketplaces/co8-plugins/plugins/telegram-plugin/mcp-server
if node test-html-send.js 2>&1 | grep -q "5 messages sent successfully"; then
  echo "✅ PASS: Can send HTML formatted messages"
else
  # Count successful sends
  sent_count=$(node test-html-send.js 2>&1 | grep -c "✅ Sent!")
  if [ "$sent_count" -eq 5 ]; then
    echo "✅ PASS: Can send HTML formatted messages (5/5 sent)"
  else
    echo "❌ FAIL: Only $sent_count/5 messages sent"
  fi
fi
echo ""

# Test 4: Check installed version files
echo "[Test 4] Installed Plugin Files"
installed_dir="/Users/enrique/.claude/plugins/cache/co8-plugins/telegram-plugin/0.2.1"

if grep -q 'parse_mode: "HTML"' "$installed_dir/mcp-server/telegram-bot.js"; then
  echo "✅ PASS: telegram-bot.js uses HTML parse mode"
else
  echo "❌ FAIL: telegram-bot.js not using HTML"
fi

if grep -q 'parse_mode: "HTML"' "$installed_dir/hooks/scripts/lib/config-helper.sh"; then
  echo "✅ PASS: config-helper.sh uses HTML parse mode"
else
  echo "❌ FAIL: config-helper.sh not using HTML"
fi

if grep -q 'function markdownToHTML' "$installed_dir/mcp-server/telegram-bot.js"; then
  echo "✅ PASS: markdownToHTML function exists"
else
  echo "❌ FAIL: markdownToHTML function missing"
fi
echo ""

# Test 5: Check if MCP server is running
echo "[Test 5] MCP Server Status"
if ps aux | grep -v grep | grep -q "telegram-bot.js"; then
  echo "⚠️  WARNING: MCP server is running (restart required for changes)"
else
  echo "ℹ️  INFO: MCP server not running (will start fresh)"
fi
echo ""

echo "========================================"
echo "📋 Summary:"
echo ""
echo "If all tests pass but messages still show asterisks:"
echo "1. The MCP server might be cached - restart Claude Code"
echo "2. Check the actual messages being sent by Claude"
echo "3. Verify hooks are using the correct functions"
echo ""
echo "Next steps:"
echo "- If tests fail: Fix the broken component"
echo "- If tests pass: Issue is in message content or MCP invocation"
