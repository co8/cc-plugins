#!/usr/bin/env node
/**
 * Test sending HTML formatted messages to Telegram
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
    // Bold: *text* -> <b>text</b>
    result = result.replace(/\*([^*]+)\*/g, "<b>$1</b>");

    // Italic: _text_ -> <i>text</i>
    result = result.replace(/_([^_]+)_/g, "<i>$1</i>");

    // Code: `text` -> <code>text</code>
    result = result.replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  return result;
}

// Test cases
const tests = [
  {
    name: "Bold text",
    input: "*Bold text*"
  },
  {
    name: "Italic text",
    input: "_Italic text_"
  },
  {
    name: "Code text",
    input: "`Code text`"
  },
  {
    name: "Mixed formatting",
    input: "This is *bold* with _italic_ and `code`"
  },
  {
    name: "Complex message",
    input: "🧪 *Final Format Test* 🎨\n\nTesting all formatting:\n• This is *bold text*\n• This is _italic text_\n• This is `code text`\n\nMixed: *Bold* with _italic_ and `code`"
  }
];

// Send all test messages
async function runTests() {
  console.log("Sending HTML formatted test messages to Telegram...\n");

  for (const test of tests) {
    console.log(`[${test.name}]`);
    console.log(`Input:  "${test.input}"`);

    const html = markdownToHTML(test.input, { preserveFormatting: true });
    console.log(`HTML:   "${html}"`);

    try {
      const result = await bot.sendMessage(config.chat_id, html, {
        parse_mode: 'HTML'
      });
      console.log(`✅ Sent! Message ID: ${result.message_id}\n`);
    } catch (err) {
      console.error(`❌ Failed: ${err.message}\n`);
    }

    // Wait a bit between messages
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  process.exit(0);
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
