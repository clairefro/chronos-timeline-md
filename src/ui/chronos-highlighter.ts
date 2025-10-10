/**
 * Chronos Markdown Real-time Syntax Highlighter
 * Provides real-time syntax highlighting overlay for textareas
 */

export interface ChronosHighlightOptions {
  theme?: "light" | "dark" | "auto";
  showLineNumbers?: boolean;
  highlightCurrentLine?: boolean;
  enableHover?: boolean;
}

export class ChronosHighlighter {
  private textarea: HTMLTextAreaElement;
  private container: HTMLElement;
  private highlightLayer: HTMLElement;
  private lineNumbersLayer?: HTMLElement;
  private options: ChronosHighlightOptions;
  private isInitialized = false;

  constructor(
    textarea: HTMLTextAreaElement,
    options: ChronosHighlightOptions = {}
  ) {
    this.textarea = textarea;
    this.options = {
      theme: "light",
      showLineNumbers: false,
      highlightCurrentLine: false,
      enableHover: true,
      ...options,
    };

    this.container = this.createContainer();
    this.highlightLayer = this.createHighlightLayer();

    if (this.options.showLineNumbers) {
      this.lineNumbersLayer = this.createLineNumbersLayer();
    }
  }

  public initialize(): void {
    if (this.isInitialized) return;

    this.injectStyles();
    this.setupDOM();
    this.bindEvents();
    this.updateHighlighting();

    this.isInitialized = true;
  }

  public destroy(): void {
    if (!this.isInitialized) return;

    // Restore original textarea
    const parent = this.container.parentNode;
    if (parent) {
      parent.insertBefore(this.textarea, this.container);
      parent.removeChild(this.container);
    }

    // Remove event listeners
    this.unbindEvents();

    this.isInitialized = false;
  }

  public updateHighlighting(): void {
    if (!this.isInitialized) return;

    const text = this.textarea.value;
    const highlightedHTML = this.highlightText(text);

    this.highlightLayer.innerHTML = highlightedHTML;
    this.syncScroll();

    if (this.lineNumbersLayer) {
      this.updateLineNumbers(text);
    }
  }

  private createContainer(): HTMLElement {
    const container = document.createElement("div");
    container.className = "chronos-highlight-container";
    return container;
  }

  private createHighlightLayer(): HTMLElement {
    const layer = document.createElement("div");
    layer.className = "chronos-highlight-layer";
    return layer;
  }

  private createLineNumbersLayer(): HTMLElement {
    const layer = document.createElement("div");
    layer.className = "chronos-line-numbers";
    return layer;
  }

  private setupDOM(): void {
    // Wrap textarea in container
    const parent = this.textarea.parentNode;
    if (parent) {
      parent.insertBefore(this.container, this.textarea);
      this.container.appendChild(this.textarea);

      if (this.lineNumbersLayer) {
        this.container.appendChild(this.lineNumbersLayer);
      }

      this.container.appendChild(this.highlightLayer);
    }

    // Style the textarea to be transparent on top
    this.textarea.classList.add("chronos-highlight-textarea");
  }

  private bindEvents(): void {
    this.textarea.addEventListener("input", () => this.updateHighlighting());
    this.textarea.addEventListener("scroll", () => this.syncScroll());
    this.textarea.addEventListener("resize", () => this.syncScroll());

    // Handle window resize
    window.addEventListener("resize", () => this.syncScroll());
  }

  private unbindEvents(): void {
    this.textarea.removeEventListener("input", () => this.updateHighlighting());
    this.textarea.removeEventListener("scroll", () => this.syncScroll());
    this.textarea.removeEventListener("resize", () => this.syncScroll());
    window.removeEventListener("resize", () => this.syncScroll());
  }

  private syncScroll(): void {
    this.highlightLayer.scrollTop = this.textarea.scrollTop;
    this.highlightLayer.scrollLeft = this.textarea.scrollLeft;

    if (this.lineNumbersLayer) {
      this.lineNumbersLayer.scrollTop = this.textarea.scrollTop;
    }
  }

  private updateLineNumbers(text: string): void {
    if (!this.lineNumbersLayer) return;

    const lines = text.split("\n");
    const lineNumberHTML = lines
      .map((_, index) => `<div class="line-number">${index + 1}</div>`)
      .join("");

    this.lineNumbersLayer.innerHTML = lineNumberHTML;
  }

  private highlightText(text: string): string {
    if (!text) return "";

    const lines = text.split("\n");
    const highlightedLines = lines.map((line) => this.highlightLine(line));

    return highlightedLines
      .map((line) => `<div class="line">${line}</div>`)
      .join("");
  }

  private highlightLine(line: string): string {
    // Handle empty lines
    if (!line.trim()) {
      return "&nbsp;";
    }

    // Comments (markdown headers)
    if (line.match(/^\s*#+/)) {
      return `<span class="chronos-comment">${this.escapeHtml(line)}</span>`;
    }

    // Flags/Options
    if (line.match(/^\s*>\s*(ORDERBY|DEFAULTVIEW|NOTODAY|HEIGHT)\b/)) {
      return this.highlightFlag(line);
    }

    // Events (-)
    if (line.match(/^\s*-/)) {
      return this.highlightTimeItem(line, "event");
    }

    // Periods (@)
    if (line.match(/^\s*@/)) {
      return this.highlightTimeItem(line, "period");
    }

    // Points (*)
    if (line.match(/^\s*\*/)) {
      return this.highlightTimeItem(line, "point");
    }

    // Markers (=)
    if (line.match(/^\s*=/)) {
      return this.highlightMarker(line);
    }

    // Default: no special highlighting
    return this.escapeHtml(line);
  }

  private highlightFlag(line: string): string {
    return line
      .replace(
        /^(\s*>\s*)(ORDERBY|DEFAULTVIEW|NOTODAY|HEIGHT)(\b.*)/,
        '$1<span class="chronos-flag-keyword">$2</span><span class="chronos-flag-args">$3</span>'
      )
      .replace(
        /\b(start|end|color)\b/g,
        '<span class="chronos-flag-option">$1</span>'
      );
  }

  private highlightTimeItem(
    line: string,
    type: "event" | "period" | "point"
  ): string {
    const className = `chronos-${type}`;
    const indicator = type === "event" ? "-" : type === "period" ? "@" : "*";

    // Match the time item pattern
    const pattern = new RegExp(
      `^(\\s*)(${indicator === "*" ? "\\*" : indicator})(\\s*)(\\[.*?\\])(.*?)$`
    );

    const match = line.match(pattern);
    if (!match) {
      return `<span class="${className}">${this.escapeHtml(line)}</span>`;
    }

    const [, leadingSpace, typeIndicator, space, dateSection, rest] = match;

    return (
      this.escapeHtml(leadingSpace) +
      `<span class="${className}-indicator">${this.escapeHtml(
        typeIndicator
      )}</span>` +
      this.escapeHtml(space) +
      this.highlightDateSection(dateSection) +
      this.highlightRestOfLine(rest)
    );
  }

  private highlightMarker(line: string): string {
    const pattern = /^(\s*)(=)(\s*)(\[.*?\])(.*?)$/;
    const match = line.match(pattern);

    if (!match) {
      return `<span class="chronos-marker">${this.escapeHtml(line)}</span>`;
    }

    const [, leadingSpace, indicator, space, dateSection, rest] = match;

    return (
      this.escapeHtml(leadingSpace) +
      `<span class="chronos-marker-indicator">${this.escapeHtml(
        indicator
      )}</span>` +
      this.escapeHtml(space) +
      this.highlightDateSection(dateSection) +
      this.highlightRestOfLine(rest)
    );
  }

  private highlightDateSection(dateSection: string): string {
    return dateSection
      .replace(/\[/g, '<span class="chronos-bracket">[</span>')
      .replace(/\]/g, '<span class="chronos-bracket">]</span>')
      .replace(
        /(-?\d{1,4}(-\d{2})?(-\d{2})?(T\d{2}(:\d{2})?(:\d{2})?)?)/g,
        '<span class="chronos-date">$1</span>'
      )
      .replace(/~/g, '<span class="chronos-range-separator">~</span>');
  }

  private highlightRestOfLine(rest: string): string {
    return (
      rest
        // Colors
        .replace(/(#\w+)\b/g, '<span class="chronos-color">$1</span>')
        // Groups
        .replace(
          /\{([^}]+)\}/g,
          '<span class="chronos-group-bracket">{</span><span class="chronos-group">$1</span><span class="chronos-group-bracket">}</span>'
        )
        // Wiki links
        .replace(
          /\[\[([^\]]+)\]\]/g,
          '<span class="chronos-wiki-link">[[</span><span class="chronos-link-content">$1</span><span class="chronos-wiki-link">]]</span>'
        )
        // Description (everything after |)
        .replace(
          /(\|)(.*)/,
          '<span class="chronos-pipe">$1</span><span class="chronos-description">$2</span>'
        )
    );
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private injectStyles(): void {
    const styleId = "chronos-realtime-highlight-css";

    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = this.getCSS();
    document.head.appendChild(style);
  }

  private getCSS(): string {
    const theme =
      this.options.theme === "auto"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : this.options.theme;

    return `
      /* Chronos Real-time Syntax Highlighting */
      .chronos-highlight-container {
        position: relative;
        display: flex;
        width: 100%;
        height: 100%;
        font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
        font-size: 14px;
        line-height: 1.5;
      }

      .chronos-line-numbers {
        background: ${theme === "dark" ? "#2d3748" : "#f7fafc"};
        border-right: 1px solid ${theme === "dark" ? "#4a5568" : "#e2e8f0"};
        color: ${theme === "dark" ? "#a0aec0" : "#718096"};
        padding: 1rem 0.5rem;
        min-width: 3rem;
        text-align: right;
        user-select: none;
        overflow: hidden;
        white-space: nowrap;
      }

      .chronos-line-numbers .line-number {
        height: 1.5em;
        font-size: 12px;
      }

      .chronos-highlight-textarea {
        background: transparent !important;
        color: transparent;
        caret-color: ${theme === "dark" ? "#ffffff" : "#000000"};
        resize: none;
        border: none;
        outline: none;
        position: relative;
        z-index: 2;
        flex: 1;
      }

      .chronos-highlight-layer {
        position: absolute;
        top: 0;
        left: ${this.options.showLineNumbers ? "3rem" : "0"};
        right: 0;
        bottom: 0;
        padding: 1rem;
        pointer-events: none;
        overflow: hidden;
        white-space: pre-wrap;
        word-wrap: break-word;
        background: ${theme === "dark" ? "#1a202c" : "#ffffff"};
        color: ${theme === "dark" ? "#e2e8f0" : "#2d3748"};
        z-index: 1;
      }

      .chronos-highlight-layer .line {
        min-height: 1.5em;
      }

      /* Event indicators (-) */
      .chronos-event-indicator {
        color: ${theme === "dark" ? "#68d391" : "#22863a"};
        font-weight: 600;
      }

      /* Period indicators (@) */
      .chronos-period-indicator {
        color: ${theme === "dark" ? "#b794f6" : "#6f42c1"};
        font-weight: 600;
      }

      /* Point indicators (*) */
      .chronos-point-indicator {
        color: ${theme === "dark" ? "#63b3ed" : "#005cc5"};
        font-weight: 600;
      }

      /* Marker indicators (=) */
      .chronos-marker-indicator {
        color: ${theme === "dark" ? "#f6ad55" : "#e36209"};
        font-weight: 600;
      }

      /* Date brackets */
      .chronos-bracket {
        color: ${theme === "dark" ? "#4fd1c7" : "#032f62"};
        font-weight: 500;
      }

      /* Dates */
      .chronos-date {
        color: ${theme === "dark" ? "#63b3ed" : "#005cc5"};
        font-weight: 600;
      }

      /* Range separator */
      .chronos-range-separator {
        color: ${theme === "dark" ? "#fc8181" : "#d73a49"};
        font-weight: bold;
      }

      /* Colors */
      .chronos-color {
        color: ${theme === "dark" ? "#f6ad55" : "#e36209"};
        font-weight: 600;
      }

      /* Groups */
      .chronos-group-bracket {
        color: ${theme === "dark" ? "#b794f6" : "#6f42c1"};
      }

      .chronos-group {
        color: ${theme === "dark" ? "#b794f6" : "#6f42c1"};
        font-style: italic;
      }

      /* Descriptions */
      .chronos-pipe {
        color: ${theme === "dark" ? "#a0aec0" : "#6a737d"};
      }

      .chronos-description {
        color: ${theme === "dark" ? "#a0aec0" : "#6a737d"};
        font-style: italic;
      }

      /* Comments */
      .chronos-comment {
        color: ${theme === "dark" ? "#a0aec0" : "#6a737d"};
        font-style: italic;
      }

      /* Flags */
      .chronos-flag-keyword {
        color: ${theme === "dark" ? "#d69e2e" : "#735c0f"};
        font-weight: 600;
      }

      .chronos-flag-args {
        color: ${theme === "dark" ? "#e2e8f0" : "#2d3748"};
      }

      .chronos-flag-option {
        color: ${theme === "dark" ? "#f6ad55" : "#e36209"};
      }

      /* Wiki links */
      .chronos-wiki-link {
        color: ${theme === "dark" ? "#63b3ed" : "#0366d6"};
      }

      .chronos-link-content {
        color: ${theme === "dark" ? "#63b3ed" : "#0366d6"};
        text-decoration: underline;
      }

      /* Hover effects */
      ${
        this.options.enableHover
          ? `
      .chronos-color:hover,
      .chronos-date:hover {
        background-color: ${
          theme === "dark"
            ? "rgba(255, 212, 0, 0.2)"
            : "rgba(255, 212, 0, 0.15)"
        };
        border-radius: 2px;
      }

      .chronos-group:hover {
        background-color: ${
          theme === "dark"
            ? "rgba(183, 148, 246, 0.2)"
            : "rgba(111, 66, 193, 0.1)"
        };
        border-radius: 2px;
      }
      `
          : ""
      }
    `;
  }
}
