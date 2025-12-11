#!/usr/bin/env node
/**
 * Final verification test with approval request
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function finalTest() {
  console.log("🎯 Final Verification Test");
  console.log("=" .repeat(70));
  console.log("");

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['telegram-bot.js'],
  });

  const client = new Client({
    name: 'final-test-client',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  try {
    await client.connect(transport);
    console.log("✅ Connected to MCP server\n");

    // Send comprehensive test message
    console.log("📤 Sending comprehensive test message...");
    const testMsg = `🎉 *Telegram Plugin v0.2.1* - Final Test 🎉

*HTML Formatting Status:* \`ACTIVE\`

_This message tests all formatting:_

*Bold Features:*
• *Inline bold* text
• *Multiple* *bold* *words*
• Bold with _italic_ mixed

_Italic Features:_
• _Inline italic_ text
• Multiple _italic_ _words_
• Italic with *bold* mixed

\`Code Features:\`
• \`inline code\` blocks
• Function names: \`markdownToHTML()\`
• Variables: \`parse_mode\`

*Special Characters:*
• Emoji support: 🚀 ✅ 🎨 📱
• Punctuation: ! @ # $ % ^ & * ( )
• Symbols: < > & " '

*Nested Formatting Test:*
This has *bold with _italic inside_* it.

*Status:* ✅ \`READY\`
*Mode:* HTML (not MarkdownV2)
*Result:* *SUCCESS* 🎯`;

    const result1 = await client.callTool({
      name: 'send_message',
      arguments: {
        text: testMsg,
        priority: "high"
      }
    });
    console.log("✅ Comprehensive message sent\n");

    // Send approval request with proper schema
    console.log("📤 Sending approval request with buttons...");
    const result2 = await client.callTool({
      name: 'send_approval_request',
      arguments: {
        header: "🧪 *Final Formatting Test*",
        question: "Are you seeing *properly formatted* text with _italics_ and `code` (not asterisks)?",
        options: [
          {
            label: "✅ Yes - All formatted",
            value: "yes_formatted",
            description: "I see bold, italic, and code formatting"
          },
          {
            label: "❌ No - Asterisks visible",
            value: "no_asterisks",
            description: "I still see asterisks and underscores"
          },
          {
            label: "⚠️ Partial formatting",
            value: "partial",
            description: "Some formatting works, some doesn't"
          }
        ]
      }
    });
    console.log("✅ Approval request sent\n");

    console.log("=".repeat(70));
    console.log("\n✅ Final Verification Complete!");
    console.log("\n📱 Please check your Telegram and:");
    console.log("   1. Verify ALL text is properly formatted");
    console.log("   2. No asterisks (*), underscores (_), or backticks (`) visible");
    console.log("   3. Click a button in the approval request");
    console.log("   4. Report which option you selected");
    console.log("");
    console.log("If everything works, the formatting issue is RESOLVED! ✅");

    await client.close();
    process.exit(0);

  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

finalTest().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
