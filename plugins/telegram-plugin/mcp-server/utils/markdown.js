// Convert Markdown to HTML and escape for Telegram
// Supports: code blocks, inline code, links, bold, italic, underline, strikethrough, blockquote, spoiler

export function markdownToHTML(text, options = { preserveFormatting: false }) {
  if (typeof text !== "string") return "";

  // First, escape HTML special characters
  let result = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (options.preserveFormatting) {
    // Use placeholder approach to handle nested formatting correctly
    const placeholders = [];
    let placeholderIndex = 0;

    // Helper to create placeholder
    const createPlaceholder = (html) => {
      const id = `XXXPH${placeholderIndex++}XXX`;
      placeholders.push({ id, html });
      return id;
    };

    // Helper to restore placeholders
    const restorePlaceholders = (text) => {
      let restored = text;
      // Restore in reverse order to handle nested placeholders
      for (let i = placeholders.length - 1; i >= 0; i--) {
        restored = restored.replace(placeholders[i].id, placeholders[i].html);
      }
      return restored;
    };

    // 1. Protect code blocks first - handle both with and without newline after lang
    result = result.replace(/```(\w+)?[\r\n]*([\s\S]*?)```/g, (match, lang, code) => {
      // Trim leading/trailing whitespace from code, but preserve internal formatting
      const trimmedCode = code.replace(/^[\r\n]+|[\r\n]+$/g, "");
      // Telegram doesn't support language-specific highlighting, just use <pre>
      const html = `<pre>${trimmedCode}</pre>`;
      return createPlaceholder(html);
    });

    // 2. Protect inline code
    result = result.replace(/`([^`\n]+?)`/g, (match, code) => {
      return createPlaceholder(`<code>${code}</code>`);
    });

    // 3. Protect links
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
      return createPlaceholder(`<a href="${url}">${linkText}</a>`);
    });

    // 4. Spoiler text: ||text|| -> <tg-spoiler>text</tg-spoiler>
    result = result.replace(/\|\|([^|]+?)\|\|/g, (match, content) => {
      return createPlaceholder(`<tg-spoiler>${content}</tg-spoiler>`);
    });

    // 5. Process formatting markers - order matters to avoid conflicts

    // Bold: **text** -> <b>text</b>
    result = result.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

    // Underline: __text__ -> <u>text</u> (must come before single underscore)
    result = result.replace(/__(.+?)__/g, "<u>$1</u>");

    // Strikethrough: ~~text~~ -> <s>text</s>
    result = result.replace(/~~(.+?)~~/g, "<s>$1</s>");

    // Italic with asterisk: *text* -> <i>text</i>
    // Use word boundary or whitespace to avoid matching mid-word asterisks
    result = result.replace(/(?<![*\w])\*([^*\n]+?)\*(?![*\w])/g, "<i>$1</i>");

    // Italic with underscore: _text_ -> <i>text</i>
    // Only match at word boundaries to avoid snake_case issues
    result = result.replace(/(?<![_\w])_([^_\n]+?)_(?![_\w])/g, "<i>$1</i>");

    // Blockquote: > text -> <blockquote>text</blockquote>
    // Collapse consecutive blockquote lines into single blockquote
    result = result.replace(/(?:^&gt;\s*(.+)$\n?)+/gm, (match) => {
      const lines = match
        .split("\n")
        .filter((l) => l.trim())
        .map((l) => l.replace(/^&gt;\s*/, ""))
        .join("\n");
      return `<blockquote>${lines}</blockquote>`;
    });

    // Restore all placeholders
    result = restorePlaceholders(result);
  }

  return result;
}

// Legacy function name for compatibility
export function escapeMarkdown(text, options) {
  return markdownToHTML(text, options);
}
