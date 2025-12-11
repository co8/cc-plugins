#!/usr/bin/env node
/**
 * Comprehensive test of HTML formatting and approval requests
 */

import TelegramBot from 'node-telegram-bot-api';
import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import yaml from 'js-yaml';

// Load config
const configPath = join(homedir(), '.claude', 'telegram.local.md');
const content = readFileSync(configPath, 'utf-8');
const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
const config = yaml.load(yamlMatch[1]);

const bot = new TelegramBot(config.bot_token, { polling: false });

// Convert Markdown to HTML
function markdownToHTML(text, options = { preserveFormatting: false }) {
  if (typeof text !== "string") return "";

  // First, escape HTML special characters
  let result = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (options.preserveFormatting) {
    // Convert Markdown syntax to HTML tags
    result = result.replace(/\*([^*]+)\*/g, "<b>$1</b>");
    result = result.replace(/_([^_]+)_/g, "<i>$1</i>");
    result = result.replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  return result;
}

// Test messages with various formatting
const testMessages = [
  {
    name: "Simple bold",
    text: "*Hello* from Claude Code!"
  },
  {
    name: "Multiple formatting types",
    text: "Testing: *bold*, _italic_, and `code` formatting"
  },
  {
    name: "Complex message with emojis",
    text: "🎨 *Format Test* 🎨\n\nThis message includes:\n• *Bold text*\n• _Italic text_\n• `Code snippets`\n\nMixed: *Bold* and _italic_ together!"
  },
  {
    name: "Task completion notification",
    text: "✅ *Task Completed* 🎯\n\nImplement HTML formatting for telegram-plugin"
  },
  {
    name: "Code review summary",
    text: "*Code Review Complete* 📝\n\nChanges reviewed:\n• Added `markdownToHTML()` function\n• Updated _all hooks_ to use HTML mode\n• Fixed *3 formatting bugs*\n\nStatus: `READY`"
  }
];

// Approval request tests
const approvalTests = [
  {
    name: "Simple yes/no approval",
    question: "Should we proceed with deploying to production?",
    options: [
      { label: "✅ Yes", value: "yes" },
      { label: "❌ No", value: "no" }
    ],
    header: "Deployment Approval"
  },
  {
    name: "Multiple choice with formatting",
    question: "Which *formatting style* should we use for `code blocks` in the _documentation_?",
    options: [
      { label: "HTML tags", value: "html" },
      { label: "Markdown", value: "markdown" },
      { label: "Plain text", value: "plain" }
    ],
    header: "📚 Documentation Style"
  }
];

async function runTests() {
  console.log("🧪 Testing Telegram HTML Formatting");
  console.log("=" .repeat(70));
  console.log("");

  // Test regular messages
  console.log("📤 Sending Test Messages\n");

  for (let i = 0; i < testMessages.length; i++) {
    const test = testMessages[i];
    console.log(`[${i + 1}/${testMessages.length}] ${test.name}`);
    console.log(`   Input: "${test.text}"`);

    const html = markdownToHTML(test.text, { preserveFormatting: true });
    console.log(`   HTML:  "${html.substring(0, 60)}${html.length > 60 ? '...' : ''}"`);

    try {
      const result = await bot.sendMessage(config.chat_id, html, {
        parse_mode: 'HTML'
      });
      console.log(`   ✅ Sent (msg_id: ${result.message_id})\n`);
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}\n`);
    }

    await new Promise(resolve => setTimeout(resolve, 800));
  }

  // Test approval requests
  console.log("\n" + "=".repeat(70));
  console.log("🔘 Testing Approval Requests (Interactive Buttons)\n");

  for (let i = 0; i < approvalTests.length; i++) {
    const test = approvalTests[i];
    console.log(`[${i + 1}/${approvalTests.length}] ${test.name}`);
    console.log(`   Question: "${test.question}"`);
    console.log(`   Options: ${test.options.length} buttons`);

    const escapedHeader = markdownToHTML(test.header || "Approval Request");
    const escapedQuestion = markdownToHTML(test.question);

    let messageText = `🤔 ${escapedHeader}\n\n${escapedQuestion}\n\n`;
    test.options.forEach((opt, idx) => {
      messageText += `${idx + 1}. <b>${markdownToHTML(opt.label)}</b>: ${markdownToHTML(opt.value)}\n`;
    });

    // Create inline keyboard
    const keyboard = {
      inline_keyboard: [
        test.options.map(opt => ({
          text: opt.label,
          callback_data: JSON.stringify({
            type: 'approval',
            value: opt.value,
            label: opt.label
          })
        }))
      ]
    };

    try {
      const result = await bot.sendMessage(config.chat_id, messageText, {
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      console.log(`   ✅ Sent approval request (msg_id: ${result.message_id})`);
      console.log(`   ⏳ Waiting for your response...\n`);
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}\n`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log("=".repeat(70));
  console.log("\n✅ All tests complete!");
  console.log("\n📱 Check your Telegram to verify:");
  console.log("   1. All messages display formatted text (not asterisks)");
  console.log("   2. Approval requests have clickable buttons");
  console.log("   3. Click a button to test bidirectional communication");
  console.log("\nNote: Button responses require MCP server to be running");
  console.log("      with polling enabled to receive callbacks.");

  process.exit(0);
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
