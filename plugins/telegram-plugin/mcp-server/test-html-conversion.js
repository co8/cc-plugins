#!/usr/bin/env node
/**
 * Test the markdownToHTML conversion function
 */

// Copy of the function from telegram-bot.js
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
const testCases = [
  {
    name: "Bold text",
    input: "*Bold text*",
    expected: "<b>Bold text</b>"
  },
  {
    name: "Italic text",
    input: "_Italic text_",
    expected: "<i>Italic text</i>"
  },
  {
    name: "Code text",
    input: "`Code text`",
    expected: "<code>Code text</code>"
  },
  {
    name: "Mixed formatting",
    input: "*Bold* and _italic_ and `code`",
    expected: "<b>Bold</b> and <i>italic</i> and <code>code</code>"
  },
  {
    name: "Complex message",
    input: "🧪 *HTML Test* 🎨\n\nThis is *bold*\nThis is _italic_\nThis is `code`",
    expected: "🧪 <b>HTML Test</b> 🎨\n\nThis is <b>bold</b>\nThis is <i>italic</i>\nThis is <code>code</code>"
  }
];

console.log("Testing markdownToHTML conversion\n");
console.log("=".repeat(70));

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  console.log(`\n[Test ${index + 1}] ${test.name}`);
  console.log(`Input:    "${test.input}"`);

  const result = markdownToHTML(test.input, { preserveFormatting: true });
  console.log(`Output:   "${result}"`);
  console.log(`Expected: "${test.expected}"`);

  if (result === test.expected) {
    console.log("✅ PASS");
    passed++;
  } else {
    console.log("❌ FAIL");
    failed++;
  }
});

console.log("\n" + "=".repeat(70));
console.log(`\nResults: ${passed} passed, ${failed} failed`);

process.exit(failed > 0 ? 1 : 0);
