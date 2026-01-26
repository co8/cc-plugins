#!/usr/bin/env node
/**
 * Test MCP tools directly (simulating how Claude Code calls them)
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

async function testMCPTools() {
  console.log("🔧 Testing MCP Tools Directly");
  console.log("=" .repeat(70));
  console.log("");

  // Start the MCP server
  console.log("🚀 Starting MCP server...");
  const serverProcess = spawn('node', ['telegram-bot.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['telegram-bot.js'],
  });

  const client = new Client({
    name: 'test-client',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  try {
    await client.connect(transport);
    console.log("✅ Connected to MCP server\n");

    // List available tools
    console.log("📋 Available tools:");
    const tools = await client.listTools();
    tools.tools.forEach(tool => {
      console.log(`   - ${tool.name}`);
    });
    console.log("");

    // Test 1: Send a simple formatted message
    console.log("[Test 1] Send formatted message via MCP");
    console.log("   Calling: send_message");
    console.log('   Text: "*Bold* test with _italic_ and `code`"');

    try {
      const result1 = await client.callTool({
        name: 'send_message',
        arguments: {
          text: "*Bold* test with _italic_ and `code`",
          priority: "normal"
        }
      });
      console.log("   ✅ Success:", JSON.stringify(result1, null, 2).substring(0, 200) + "...\n");
    } catch (err) {
      console.error("   ❌ Failed:", err.message, "\n");
    }

    // Test 2: Send approval request
    console.log("[Test 2] Send approval request via MCP");
    console.log("   Calling: send_approval_request");
    console.log('   Question: "Test *approval* with `formatting`?"');

    try {
      const result2 = await client.callTool({
        name: 'send_approval_request',
        arguments: {
          header: "🧪 MCP Test",
          question: "Does this *approval request* show `formatted` text?",
          options: [
            { label: "✅ Yes, formatted", value: "yes" },
            { label: "❌ No, asterisks", value: "no" }
          ]
        }
      });
      console.log("   ✅ Success:", JSON.stringify(result2, null, 2).substring(0, 200) + "...\n");
    } catch (err) {
      console.error("   ❌ Failed:", err.message, "\n");
    }

    // Test 3: Complex message with special characters
    console.log("[Test 3] Complex message with special characters");
    console.log("   Calling: send_message");

    const complexMsg = `📊 *Status Report* 📊

*Project:* telegram-plugin
*Version:* 0.2.1
*Status:* \`TESTING\`

_Features implemented:_
• HTML formatting with *bold*
• Inline _italic_ support
• Code blocks: \`markdownToHTML()\`

*Next steps:*
1. Verify formatting works
2. Test approval requests
3. Check _all edge cases_

Result: *SUCCESS* ✅`;

    try {
      const result3 = await client.callTool({
        name: 'send_message',
        arguments: {
          text: complexMsg,
          priority: "high"
        }
      });
      console.log("   ✅ Success: Complex message sent\n");
    } catch (err) {
      console.error("   ❌ Failed:", err.message, "\n");
    }

    console.log("=".repeat(70));
    console.log("\n✅ MCP Tools Test Complete");
    console.log("\n📱 Check your Telegram to verify:");
    console.log("   1. Messages show formatted text (not asterisks)");
    console.log("   2. Approval request has buttons");
    console.log("   3. Complex message is properly formatted");

    await client.close();
    process.exit(0);

  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

testMCPTools().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
