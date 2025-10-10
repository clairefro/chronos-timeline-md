# Chronos Markdown Syntax Highlighting Integration Guide

This guide shows you how to add lightweight custom syntax highlighting to your Chronos Timeline Markdown playground using highlight.js.

## Option 1: Simple Highlight.js Integration (Easiest)

Add this to your existing `index.html` in the `<head>` section:

```html
<!-- Include highlight.js -->
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>

<!-- Add Chronos language definition -->
<script>
  // Register Chronos language with highlight.js
  hljs.registerLanguage('chronos', function() {
    return {
      name: 'chronos',
      aliases: ['chronos-md', 'chronos-markdown'],
      case_insensitive: false,
      keywords: {
        built_in: 'ORDERBY DEFAULTVIEW NOTODAY HEIGHT start end color'
      },
      contains: [
        // Comments (markdown headers)
        {
          className: 'comment',
          begin: '^\\s*#+',
          end: '$',
          relevance: 0
        },
        // Flags/Options
        {
          className: 'meta',
          begin: '^\\s*>\\s*(ORDERBY|DEFAULTVIEW|NOTODAY|HEIGHT)\\b',
          end: '$',
          keywords: 'ORDERBY DEFAULTVIEW NOTODAY HEIGHT'
        },
        // Events (lines starting with -)
        {
          className: 'section',
          begin: '^\\s*-',
          end: '$',
          contains: [
            // Date ranges in brackets
            {
              className: 'string',
              begin: '\\[',
              end: '\\]',
              contains: [
                // ISO dates and ranges
                {
                  className: 'number',
                  begin: '-?\\d{1,4}(-\\d{2})?(-\\d{2})?(T\\d{2}(:\\d{2})?(:\\d{2})?)?'
                },
                // Range separator
                {
                  className: 'operator',
                  begin: '~'
                }
              ]
            },
            // Colors
            {
              className: 'literal',
              begin: '#\\w+\\b',
              relevance: 5
            },
            // Groups in curly braces
            {
              className: 'title',
              begin: '\\{',
              end: '\\}',
              relevance: 3
            },
            // Descriptions after pipe
            {
              className: 'comment',
              begin: '\\|',
              end: '$',
              relevance: 2
            }
          ]
        },
        // Periods (lines starting with @)
        {
          className: 'keyword',
          begin: '^\\s*@',
          end: '$',
          contains: [
            // Same date/color/group patterns as events
            {
              className: 'string',
              begin: '\\[',
              end: '\\]',
              contains: [
                {
                  className: 'number',
                  begin: '-?\\d{1,4}(-\\d{2})?(-\\d{2})?(T\\d{2}(:\\d{2})?(:\\d{2})?)?'
                },
                {
                  className: 'operator',
                  begin: '~'
                }
              ]
            },
            {
              className: 'literal',
              begin: '#\\w+\\b',
              relevance: 5
            },
            {
              className: 'title',
              begin: '\\{',
              end: '\\}',
              relevance: 3
            }
          ]
        },
        // Points (lines starting with *)
        {
          className: 'attribute',
          begin: '^\\s*\\*',
          end: '$',
          contains: [
            // Same patterns as above
            {
              className: 'string',
              begin: '\\[',
              end: '\\]',
              contains: [
                {
                  className: 'number',
                  begin: '-?\\d{1,4}(-\\d{2})?(-\\d{2})?(T\\d{2}(:\\d{2})?(:\\d{2})?)?'
                }
              ]
            },
            {
              className: 'literal',
              begin: '#\\w+\\b'
            },
            {
              className: 'title',
              begin: '\\{',
              end: '\\}'
            }
          ]
        },
        // Markers (lines starting with =)
        {
          className: 'built_in',
          begin: '^\\s*=',
          end: '$',
          contains: [
            {
              className: 'string',
              begin: '\\[',
              end: '\\]',
              contains: [
                {
                  className: 'number',
                  begin: '-?\\d{1,4}(-\\d{2})?(-\\d{2})?(T\\d{2}(:\\d{2})?(:\\d{2})?)?'
                }
              ]
            }
          ]
        }
      ]
    };
  });

  // Custom CSS for better Chronos highlighting
  const chronosCSS = \`
  /* Chronos-specific highlighting improvements */
  .hljs-chronos .hljs-section { color: #22863a; font-weight: 600; } /* Events (-) */
  .hljs-chronos .hljs-keyword { color: #6f42c1; font-weight: 600; } /* Periods (@) */
  .hljs-chronos .hljs-attribute { color: #005cc5; } /* Points (*) */
  .hljs-chronos .hljs-built_in { color: #e36209; font-weight: 600; } /* Markers (=) */
  .hljs-chronos .hljs-string { color: #032f62; font-weight: 500; } /* Date brackets */
  .hljs-chronos .hljs-number { color: #005cc5; font-weight: 600; } /* Dates */
  .hljs-chronos .hljs-operator { color: #d73a49; font-weight: bold; } /* Range ~ */
  .hljs-chronos .hljs-literal { color: #e36209; font-weight: 600; } /* Colors */
  .hljs-chronos .hljs-title { color: #6f42c1; font-style: italic; } /* Groups */
  .hljs-chronos .hljs-comment { color: #6a737d; font-style: italic; } /* Comments */
  .hljs-chronos .hljs-meta { color: #735c0f; font-weight: 600; } /* Flags */
  \`;

  // Inject the CSS
  const style = document.createElement('style');
  style.textContent = chronosCSS;
  document.head.appendChild(style);
</script>
```

Then modify your textarea to support highlighting:

```html
<!-- Replace the markdown-input textarea with this: -->
<div class="editor-container" style="position: relative; flex: 1;">
  <textarea
    id="markdown-input"
    placeholder="Enter Chronos markdown here"
    style="width: 100%; height: 100%; border: none; resize: none; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 14px; line-height: 1.5; background: transparent; padding: 1rem; border-radius: 6px; border: 1px solid #e1e4e8; outline: none; position: relative; z-index: 2; color: rgba(0,0,0,0.8);"
  ></textarea>
  <div
    id="highlight-backdrop"
    style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; padding: 1rem; pointer-events: none; z-index: 1; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; overflow: hidden; background: #fafbfc; border-radius: 6px; border: 1px solid #e1e4e8;"
  ></div>
</div>
```

Add this JavaScript to your existing script section:

```javascript
// Add this to your existing JavaScript
function updateSyntaxHighlighting() {
  const textarea = document.getElementById("markdown-input");
  const backdrop = document.getElementById("highlight-backdrop");

  if (textarea && backdrop) {
    const content = textarea.value;
    const highlighted = hljs.highlight(content, { language: "chronos" }).value;
    backdrop.innerHTML = highlighted;
  }
}

// Add event listener to your textarea
markdownInput.addEventListener("input", () => {
  debouncedURLUpdate();
  trackContentChanges();
  updateSyntaxHighlighting(); // Add this line
});

// Call this after setting initial content
updateSyntaxHighlighting();
```

## Option 2: Real-time Overlay Highlighter (Advanced)

For a more sophisticated solution with real-time highlighting overlay, you can use the `ChronosHighlighter` class we created:

```html
<script type="module">
  import { ChronosHighlighter } from "./dist/index.js";

  // After getting your textarea element:
  const markdownInput = document.getElementById("markdown-input");
  const highlighter = new ChronosHighlighter(markdownInput, {
    theme: "light", // or 'dark' or 'auto'
    showLineNumbers: false,
    highlightCurrentLine: false,
    enableHover: true,
  });

  highlighter.initialize();

  // The highlighter will automatically update as the user types
</script>
```

## Features

The syntax highlighting provides:

- **Color-coded syntax** for different Chronos elements:

  - 🟢 Events (`-`) in green
  - 🟣 Periods (`@`) in purple
  - 🔵 Points (`*`) in blue
  - 🟠 Markers (`=`) in orange
  - 📅 Dates in blue with brackets highlighted
  - 🎨 Color codes (`#red`, `#blue`) in orange
  - 📂 Groups `{name}` in purple italic
  - 💬 Descriptions after `|` in gray italic
  - ⚙️ Flags (`> ORDERBY`) in brown

- **Interactive features**:

  - Hover effects on colors and dates
  - Real-time highlighting as you type
  - Support for light/dark themes
  - Optional line numbers

- **Lightweight**: Uses only highlight.js (~50KB) or pure CSS/JS (~10KB)

## Testing

Test with this sample Chronos markdown:

```
# This is a comment

> ORDERBY start|color

- [2024-01-01] #red New Year Event | This is a description
@ [2024-01~2024-12] #blue Year 2024
* [2024-06-15] {Summer} Mid-year point
= [2024-12-31] End of year marker
```

The highlighting should show different colors for each syntax element!
