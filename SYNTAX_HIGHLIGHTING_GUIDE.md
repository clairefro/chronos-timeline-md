# Chronos Markdown Syntax Highlighting Integration Guide

This guide shows you how to add lightweight custom syntax highlighting to your Chronos Timeline Markdown playground using highlight.js.

## Option 1: Use Library's Built-in Highlighting (Recommended)

### For ES Modules:

```javascript
import { ui } from "chronos-timeline-md";

// Register the language and inject CSS
ui.registerChronosLanguage(hljs);
ui.injectChronosHighlightCSS();

// Use the highlighting function
function updateSyntaxHighlighting() {
  const textarea = document.getElementById("markdown-input");
  const backdrop = document.getElementById("highlight-backdrop");

  if (textarea && backdrop) {
    const content = textarea.value;
    const highlighted = ui.highlightChronosText(content, hljs);
    backdrop.innerHTML = highlighted;
  }
}
```

### For IIFE/Global Usage:

```javascript
// After loading the Chronos library globally
const { ui } = window.ChronosTimeline;

// Register the language and inject CSS
ui.registerChronosLanguage(hljs);
ui.injectChronosHighlightCSS();

// Use the highlighting function
function updateSyntaxHighlighting() {
  const textarea = document.getElementById("markdown-input");
  const backdrop = document.getElementById("highlight-backdrop");

  if (textarea && backdrop) {
    const content = textarea.value;
    const highlighted = ui.highlightChronosText(content, hljs);
    backdrop.innerHTML = highlighted;
  }
}
```

### Complete HTML Example:

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Include highlight.js -->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
    />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  </head>
  <body>
    <!-- Your textarea with highlighting overlay -->
    <div class="editor-container" style="position: relative; flex: 1;">
      <textarea
        id="markdown-input"
        placeholder="Enter Chronos markdown here"
        style="width: 100%; height: 100%; background: transparent; color: transparent; caret-color: #000; position: relative; z-index: 2;"
      ></textarea>
      <div
        id="highlight-backdrop"
        style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; padding: 1rem; pointer-events: none; z-index: 1; white-space: pre-wrap; overflow: hidden;"
      ></div>
    </div>

    <!-- Load Chronos library and set up highlighting -->
    <script src="https://unpkg.com/chronos-timeline-md@latest/dist/iife-entry.global.js"></script>
    <script>
      const { ui } = window.ChronosTimeline;

      // Initialize syntax highlighting
      ui.registerChronosLanguage(hljs);
      ui.injectChronosHighlightCSS();

      function updateSyntaxHighlighting() {
        const textarea = document.getElementById("markdown-input");
        const backdrop = document.getElementById("highlight-backdrop");

        if (textarea && backdrop) {
          const content = textarea.value;
          const highlighted = ui.highlightChronosText(content, hljs);
          backdrop.innerHTML = highlighted;
        }
      }

      // Set up event listeners
      document
        .getElementById("markdown-input")
        .addEventListener("input", updateSyntaxHighlighting);

      // Initial highlighting
      updateSyntaxHighlighting();
    </script>
  </body>
</html>
```

## Option 2: Advanced Real-time Highlighter

For a more sophisticated solution with real-time highlighting overlay, you can use the `ChronosHighlighter` class:

```javascript
import { ChronosHighlighter } from "chronos-timeline-md";

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
```

## Library Exports

The Chronos Timeline library exports these highlighting utilities:

```javascript
import {
  chronosLanguageDefinition, // Raw language definition object
  chronosHighlightCSS, // CSS styles string
  registerChronosLanguage, // Function to register with hljs
  highlightChronosText, // Function to highlight text
  injectChronosHighlightCSS, // Function to inject CSS
  ChronosHighlighter, // Advanced highlighter class
} from "chronos-timeline-md/ui";
```

#

## Quick Start

1. **Install highlight.js** (if not already included):

   ```html
   <link
     rel="stylesheet"
     href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
   />
   <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
   ```

2. **Load Chronos Timeline library**:

   ```html
   <script src="https://unpkg.com/chronos-timeline-md@latest/dist/iife-entry.global.js"></script>
   ```

3. **Initialize highlighting**:

   ```javascript
   const { ui } = window.ChronosTimeline;
   ui.registerChronosLanguage(hljs);
   ui.injectChronosHighlightCSS();
   ```

4. **Set up your textarea with overlay** (see complete example above)

5. **Call highlighting on input**:
   ```javascript
   textarea.addEventListener("input", () => {
     const highlighted = ui.highlightChronosText(textarea.value, hljs);
     backdrop.innerHTML = highlighted;
   });
   ```

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

The highlighting should show different colors for each syntax element
