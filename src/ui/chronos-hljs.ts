/**
 * Chronos Markdown Syntax Highlighter for highlight.js
 * Provides lightweight syntax highlighting for Chronos timeline markdown
 */

// Language definition for highlight.js
export const chronosLanguageDefinition = {
  name: "chronos",
  aliases: ["chronos-md", "chronos-markdown"],
  case_insensitive: false,
  keywords: {
    built_in: "ORDERBY DEFAULTVIEW NOTODAY HEIGHT start end color",
  },
  contains: [
    // Comments (markdown headers)
    {
      className: "comment",
      begin: "^\\s*#+",
      end: "$",
      relevance: 0,
    },
    // Flags/Options
    {
      className: "meta",
      begin: "^\\s*>\\s*(ORDERBY|DEFAULTVIEW|NOTODAY|HEIGHT)\\b",
      end: "$",
      keywords: "ORDERBY DEFAULTVIEW NOTODAY HEIGHT",
      contains: [
        {
          className: "string",
          begin: "\\b(start|end|color)\\b",
        },
      ],
    },
    // Events (lines starting with -)
    {
      className: "section",
      begin: "^\\s*-",
      end: "$",
      contains: [
        // Date ranges in brackets
        {
          className: "string",
          begin: "\\[",
          end: "\\]",
          contains: [
            // ISO dates and ranges
            {
              className: "number",
              begin:
                "-?\\d{1,4}(-\\d{2})?(-\\d{2})?(T\\d{2}(:\\d{2})?(:\\d{2})?)?",
            },
            // Range separator
            {
              className: "operator",
              begin: "~",
            },
          ],
        },
        // Colors
        {
          className: "literal",
          begin: "#\\w+\\b",
          relevance: 5,
        },
        // Groups in curly braces
        {
          className: "title",
          begin: "\\{",
          end: "\\}",
          relevance: 3,
        },
        // Descriptions after pipe
        {
          className: "string",
          begin: "\\|",
          end: "$",
          relevance: 2,
        },
      ],
    },
    // Periods (lines starting with @)
    {
      className: "keyword",
      begin: "^\\s*@",
      end: "$",
      contains: [
        // Date ranges in brackets
        {
          className: "string",
          begin: "\\[",
          end: "\\]",
          contains: [
            // ISO dates and ranges
            {
              className: "number",
              begin:
                "-?\\d{1,4}(-\\d{2})?(-\\d{2})?(T\\d{2}(:\\d{2})?(:\\d{2})?)?",
            },
            // Range separator
            {
              className: "operator",
              begin: "~",
            },
          ],
        },
        // Colors
        {
          className: "literal",
          begin: "#\\w+\\b",
          relevance: 5,
        },
        // Groups in curly braces
        {
          className: "title",
          begin: "\\{",
          end: "\\}",
          relevance: 3,
        },
        // Descriptions after pipe
        {
          className: "comment",
          begin: "\\|",
          end: "$",
          relevance: 2,
        },
      ],
    },
    // Points (lines starting with *)
    {
      className: "attribute",
      begin: "^\\s*\\*",
      end: "$",
      contains: [
        // Date ranges in brackets
        {
          className: "string",
          begin: "\\[",
          end: "\\]",
          contains: [
            // ISO dates and ranges
            {
              className: "number",
              begin:
                "-?\\d{1,4}(-\\d{2})?(-\\d{2})?(T\\d{2}(:\\d{2})?(:\\d{2})?)?",
            },
            // Range separator
            {
              className: "operator",
              begin: "~",
            },
          ],
        },
        // Colors
        {
          className: "literal",
          begin: "#\\w+\\b",
          relevance: 5,
        },
        // Groups in curly braces
        {
          className: "title",
          begin: "\\{",
          end: "\\}",
          relevance: 3,
        },
        // Descriptions after pipe
        {
          className: "comment",
          begin: "\\|",
          end: "$",
          relevance: 2,
        },
      ],
    },
    // Markers (lines starting with =)
    {
      className: "built_in",
      begin: "^\\s*=",
      end: "$",
      contains: [
        // Date in brackets
        {
          className: "string",
          begin: "\\[",
          end: "\\]",
          contains: [
            // ISO dates
            {
              className: "number",
              begin:
                "-?\\d{1,4}(-\\d{2})?(-\\d{2})?(T\\d{2}(:\\d{2})?(:\\d{2})?)?",
            },
          ],
        },
      ],
    },
    // Wiki-style links
    {
      className: "link",
      begin: "\\[\\[",
      end: "\\]\\]",
      relevance: 3,
    },
  ],
};

// CSS styles for Chronos syntax highlighting
export const chronosHighlightCSS = `
/* Chronos Markdown Syntax Highlighting */
.hljs-chronos {
  background: #fafbfc;
  color: #24292e;
}

/* Line type indicators */
.hljs-chronos .hljs-section {
  color: #22863a; /* Events (-) - green */
}

.hljs-chronos .hljs-keyword {
  color: #6f42c1; /* Periods (@) - purple */
  font-weight: 600;
}

.hljs-chronos .hljs-attribute {
  color: #005cc5; /* Points (*) - blue */
}

.hljs-chronos .hljs-built_in {
  color: #e36209; /* Markers (=) - orange */
  font-weight: 600;
}

/* Date brackets and content */
.hljs-chronos .hljs-string {
  color: #032f62; /* Date brackets - dark blue */
  font-weight: 500;
}

/* Dates and numbers */
.hljs-chronos .hljs-number {
  color: #005cc5; /* Actual dates - blue */
  font-weight: 600;
}

/* Range operator ~ */
.hljs-chronos .hljs-operator {
  color: #d73a49; /* Range separator - red */
  font-weight: bold;
}

/* Colors (#red, #blue, etc.) */
.hljs-chronos .hljs-literal {
  color: #e36209; /* Color codes - orange */
  font-weight: 600;
}

/* Groups {name} */
.hljs-chronos .hljs-title {
  color: #6f42c1; /* Group names - purple */
  font-style: italic;
}

/* Comments and descriptions */
.hljs-chronos .hljs-comment {
  color: #6a737d; /* Comments and descriptions - gray */
  font-style: italic;
}

/* Meta flags */
.hljs-chronos .hljs-meta {
  color: #735c0f; /* Flag lines - brown */
  font-weight: 600;
}

/* Wiki links */
.hljs-chronos .hljs-link {
  color: #0366d6; /* Wiki-style links - blue */
  text-decoration: underline;
}

/* Hover effects */
.hljs-chronos .hljs-literal:hover,
.hljs-chronos .hljs-number:hover {
  background-color: rgba(255, 212, 0, 0.15);
  border-radius: 2px;
}

.hljs-chronos .hljs-title:hover {
  background-color: rgba(111, 66, 193, 0.1);
  border-radius: 2px;
}
`;

// Function to register the language with highlight.js
export function registerChronosLanguage(hljs: any) {
  hljs.registerLanguage("chronos", () => chronosLanguageDefinition);
}

// Function to apply highlighting to a textarea or element
export function highlightChronosText(text: string, hljs: any): string {
  try {
    return hljs.highlight(text, { language: "chronos" }).value;
  } catch (error) {
    console.warn("Chronos highlighting failed:", error);
    return text;
  }
}

// Function to inject the CSS styles
export function injectChronosHighlightCSS() {
  const styleId = "chronos-highlight-css";

  // Don't inject if already present
  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = chronosHighlightCSS;
  document.head.appendChild(style);
}
