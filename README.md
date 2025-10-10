# Chronos Timeline MD

A timeline visualization library for rendering interactive vis.js timelines from markdown using a simple chronological syntax.

📖 **[Complete Syntax Guide](./CHRONOS_SYNTAX_GUIDE.md)**

🎮 **[Live Playground](https://clairefro.github.io/chronos-timeline-md/)**

🪨**[Obsidian Plugin](https://obsidian.md/plugins?search=chronos+timeline)**

## Installation

```bash
npm install chronos-timeline-md vis-timeline
```

Note: `vis-timeline` is a peer dependency and must be installed separately.

## Quick Start

### Method 1: Static Function

```typescript
import { ChronosTimeline } from "chronos-timeline-md";

const markdownSource = `
- [2020] Event 1
- [2021-06-15] Event 2 | Description
@ [2020~2022] Period 1
* [2021-01-01] Point 1
= [2020-12-31] Marker 1
`;

ChronosTimeline.render(
  document.getElementById("timeline-container"),
  markdownSource
);
```

### Method 2: Constructor API

```typescript
import { ChronosTimeline } from "chronos-timeline-md";

const timeline = new ChronosTimeline({
  container: document.getElementById("timeline-container"),
});

timeline.render(markdownSource);
```

## API Reference

### ChronosTimeline Class

**Static Method:**

```typescript
ChronosTimeline.render(container, source, options?)
```

**Constructor:**

```typescript
new ChronosTimeline({ container, settings?, callbacks?, cssRootClass? })
// or
new ChronosTimeline(container, settings?)
```

**Instance Methods:**

- `render(source: string)` - Parse and render markdown
- `on(event: string, handler: Function)` - Attach timeline events
- `destroy()` - Clean up resources

**Static Properties:**

- `ChronosTimeline.version` - Library version
- `ChronosTimeline.templates` - Built-in templates
- `ChronosTimeline.cheatsheet` - Syntax reference

### Core Functions

```typescript
import {
  parseChronos,
  renderChronos,
  attachChronosStyles,
} from "chronos-timeline-md";

// Parse markdown to timeline data
const result = parseChronos(source, options);

// Render complete timeline
const { timeline, parsed } = renderChronos(container, source, options);

// Inject default styles
attachChronosStyles();
```

## Chronos Syntax (Quick Reference)

For complete syntax documentation, see **[CHRONOS_SYNTAX_GUIDE.md](./CHRONOS_SYNTAX_GUIDE.md)**

```markdown
# Basic syntax

- [2023] Event
- [2023-06-15] Event with description | Details here
  @ [2020~2025] Background period

* [2023-06-15] Point in time
  = [2023-01-01] Important marker

# With modifiers

- [2023] #red Colored event
- [2023] {Group} Grouped event
- [2023] #blue {Authors} Combined | Description

# Flags

> ORDERBY start
> DEFAULTVIEW 2020|2025
> NOTODAY
> HEIGHT 400
```

## Configuration Options

```typescript
interface CoreParseOptions {
  selectedLocale?: string;
  roundRanges?: boolean;
  settings?: {
    align?: "left" | "center" | "right";
    clickToUse?: boolean;
    useUtc?: boolean;
    theme?: {
      colorMap?: Record<string, string>;
      cssVariables?: Record<string, string>;
    };
  };
  callbacks?: {
    setTooltip?: (el: Element, text: string) => void;
  };
  cssVars?: Record<string, string>;
  cssRootClass?: string;
}
```

## Examples

### Custom Styling

```typescript
const timeline = new ChronosTimeline({
  container: document.getElementById("timeline"),
  cssVars: {
    "chronos-accent": "#007acc",
    "chronos-bg-primary": "#ffffff",
  },
});
```

### Event Handling

```typescript
const timeline = new ChronosTimeline({
  container: document.getElementById("timeline-container"),
});

timeline.render(markdownSource);

timeline.on("select", (event) => {
  console.log("Selected:", event.items);
});
```

#### Complete List of Timeline Events

**Selection Events:**

- `select` - Items are selected/deselected
- `itemover` - Mouse over an item
- `itemout` - Mouse leaves an item

**Interaction Events:**

- `click` - Mouse click on timeline
- `doubleClick` - Mouse double click
- `contextmenu` - Right-click context menu
- `drop` - Item dropped (drag & drop)

**View Events:**

- `rangechange` - Visible time range changed
- `rangechanged` - Visible time range change completed
- `timechange` - Current time changed
- `timechanged` - Current time change completed

**Group Events:**

- `groupDragover` - Group drag over
- `groupDrop` - Item dropped on group

**Edit Events (if editable):**

- `add` - Item added
- `update` - Item updated
- `remove` - Item removed

**Example Usage:**

```typescript
const timeline = new ChronosTimeline({
  container: document.getElementById("timeline-container"),
});

timeline.render(markdownSource);

// Selection
timeline.on("select", (event) => {
  console.log("Selected items:", event.items);
});

// Hover effects
timeline.on("itemover", (event) => {
  console.log("Hovering over item:", event.item);
});

// View changes
timeline.on("rangechanged", (event) => {
  console.log("New time range:", event.start, "to", event.end);
});

// Click handling
timeline.on("click", (event) => {
  console.log("Clicked at:", event.time);
  console.log("Items at click:", event.item);
});
```

### Templates

```typescript
// Use built-in templates
timeline.render(ChronosTimeline.templates.basic);
timeline.render(ChronosTimeline.templates.advanced);
```

## Theming

### CSS Variables

```css
:root {
  --chronos-bg-primary: var(--background-primary);
  --chronos-text-normal: var(--text-normal);
  --chronos-accent: var(--interactive-accent);
  --chronos-color-red: #ff4444;
  --chronos-color-blue: #0066cc;
}
```

### Dynamic Theme Sync

```typescript
function syncTheme() {
  const root = document.documentElement;
  root.style.setProperty("--chronos-bg-primary", hostThemeColor);
}
```

## Utility Exports

```typescript
// Parser utilities
export * as parser from "chronos-timeline-md/parser";

// UI components and styles
export * as ui from "chronos-timeline-md/ui";

// Common utilities and types
export * as utils from "chronos-timeline-md/utils";
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Development mode with watch
npm run dev

# Run local interactive playground
npm run playground

# Clean build artifacts
npm run clean
```

### Publishing

```bash
# Update version in package.json
npm version patch|minor|major

# Publish to npm
npm publish
```

## Browser Support

This library requires a modern browser environment with ES2020 support. It includes vis-timeline as a bundled dependency.

## License

ISC
