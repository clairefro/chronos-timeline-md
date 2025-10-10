# Chronos Timeline MD

A timeline visualization library for rendering interactive vis.js timelines from markdown using a simple chronological syntax.

## Installation

```bash
npm install chronos-timeline-md vis-timeline
```

Note: `vis-timeline` is a peer dependency and must be installed separately.

## Quick Start

### Method 1: Static Function

```typescript
import { ChronosTimeline } from "chronos-timeline-md";

// Render timeline directly
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

// Access version info
console.log(ChronosTimeline.version); // "1.0.0"
```

### Method 2: Constructor API

```typescript
import { ChronosTimeline } from "chronos-timeline-md";

// Create timeline instance
const timeline = new ChronosTimeline(
  document.getElementById("timeline-container")
);

// Render timeline from markdown
timeline.render(markdownSource);
```

## API Reference

### Core Functions

#### `parseChronos(source, options?)`

Parses markdown source containing chronological data and returns structured timeline data.

**Parameters:**

- `source` (string): Markdown source with chronos syntax
- `options` (CoreParseOptions, optional): Configuration options

**Returns:** ParseResult object with items, markers, groups, and flags

**Example:**

```typescript
import { parseChronos } from "chronos-timeline-md";

const result = parseChronos(
  `
- [2023] Event
@ [2023~2024] Period
`,
  {
    selectedLocale: "en",
    roundRanges: true,
  }
);

console.log(result.items); // Timeline items
console.log(result.markers); // Custom markers
console.log(result.groups); // Item groups
console.log(result.flags); // Parsing flags
```

#### Utility Functions

For backward compatibility and alternative usage patterns, these utility functions are also available:

**`renderChronos(container, source, options?)`**

Renders a complete timeline visualization to the specified DOM container.

**Parameters:**

- `container` (HTMLElement): DOM element to render timeline into
- `source` (string): Markdown source with chronos syntax
- `options` (CoreParseOptions, optional): Configuration options

**Returns:** Object with `timeline` (ChronosTimeline instance) and `parsed` (ParseResult)

**Example:**

```typescript
import { renderChronos } from "chronos-timeline-md";

const { timeline, parsed } = renderChronos(
  document.getElementById("container"),
  markdownSource,
  {
    selectedLocale: "ja",
    settings: {
      align: "center",
      useUtc: true,
    },
    callbacks: {
      setTooltip: (element, text) => {
        // Custom tooltip implementation
        element.setAttribute("data-tooltip", text);
      },
    },
  }
);

// Access the vis-timeline instance
timeline.timeline.on("select", (event) => {
  console.log("Item selected:", event);
});
```

#### `attachChronosStyles(document?, css?, cssVars?, cssRootClass?, disableDefaultStyles?)`

Injects default CSS styles into the document head.

**Parameters:**

- `document` (Document, optional): Target document (defaults to global document)
- `css` (string, optional): Custom CSS to inject (defaults to built-in styles)
- `cssVars` (Record<string, string>, optional): CSS custom properties to override
- `cssRootClass` (string, optional): Root class name for scoped styles
- `disableDefaultStyles` (boolean, optional): Skip default styles, only apply custom variables

### Classes

#### `ChronosTimeline`

Main timeline class with two ways to create and render timelines.

**Method 1: Static Function**

```typescript
import { ChronosTimeline } from "chronos-timeline-md";

const timeline = ChronosTimeline.render(
  document.getElementById("timeline"),
  "- [2025] My Event",
  {
    selectedLocale: "en",
    align: "left",
    roundRanges: true,
    useUtc: true,
    useAI: false,
  }
);
```

**Method 2: Constructor API**

```typescript
import { ChronosTimeline } from "chronos-timeline-md";

// Object-based constructor
const timeline = new ChronosTimeline({
  container: document.getElementById("timeline"),
  settings: {
    selectedLocale: "en",
    align: "left",
    clickToUse: false,
    roundRanges: true,
    useUtc: true,
    useAI: false,
  },
  callbacks: {
    setTooltip: (el, text) => el.setAttribute("title", text),
  },
  cssRootClass: "my-timeline",
});

// OR Simple constructor
const timeline = new ChronosTimeline(document.getElementById("timeline"), {
  selectedLocale: "en",
  align: "left",
  roundRanges: true,
});

// Then render
timeline.render("- [2025] My Event");
```

**Methods:**

- `render(source: string)`: Parse and render markdown source
- `renderParsed(result: ParseResult)`: Render from pre-parsed data
- `on(eventType: string, handler: Function)`: Attach timeline event handlers
- `destroy()`: Clean up timeline resources

**Static Properties:**

- `ChronosTimeline.version`: Current library version
- `ChronosTimeline.templates`: Built-in template snippets
- `ChronosTimeline.cheatsheet`: Complete syntax reference
- `ChronosTimeline.prompts.system`: AI system prompt for timeline generation

**Using Static Properties:**

```typescript
// Access version
console.log(ChronosTimeline.version); // "1.0.0"

// Use built-in templates
const basicTemplate = ChronosTimeline.templates.basic;
const blankTemplate = ChronosTimeline.templates.blank;
const advancedTemplate = ChronosTimeline.templates.advanced;
timeline.render(basicTemplate);

// Get syntax reference
const syntaxHelp = ChronosTimeline.cheatsheet;
console.log(syntaxHelp); // Complete markdown syntax guide

// Use AI system prompt
const aiPrompt = ChronosTimeline.prompts.system;
// Use this prompt with your AI service for timeline generation
```

### Parser

#### `ChronosMdParser`

Low-level parser class for custom parsing scenarios.

```typescript
import { ChronosMdParser } from "chronos-timeline-md/parser";

const parser = new ChronosMdParser("en");
const result = parser.parse(markdownSource, settings);
```

## Chronos Syntax

### Events

```markdown
- [2023] Simple event
- [2023-06-15] Date with description | This is a description
- [2023-01-01~2023-12-31] Date range event
- [2023] #red Colored event
- [2023] {Group Name} Grouped event
- [2023] #blue {Authors} Combined modifiers | Description
```

### Periods (Background)

```markdown
@ [2020~2025] Background period
@ [2020~2025] #green Named period
@ [2020~2025] {Category} Grouped period
```

### Points

```markdown
- [2023-06-15] Point event
- [2023-06-15] Point with description | Details here
```

### Markers (Vertical Lines)

```markdown
= [2023-01-01] Important date
= [2024-12-31] Deadline
```

### Comments

```markdown
# This is a comment and will be ignored
```

### Flags

```markdown
> ORDERBY start
> ORDERBY -start|color
> DEFAULTVIEW 2020|2025
> NOTODAY
> HEIGHT 400
```

### Colors

Available colors: `#red`, `#orange`, `#yellow`, `#green`, `#blue`, `#purple`, `#pink`, `#cyan`

### Date Formats

- Year: `2023`
- Month: `2023-06`
- Day: `2023-06-15`
- Hour: `2023-06-15T14`
- Minute: `2023-06-15T14:30`
- Second: `2023-06-15T14:30:45`
- BCE dates: `-500` (for 500 BCE)

## Configuration Options

### CoreParseOptions

```typescript
interface CoreParseOptions {
  selectedLocale?: string; // Locale for date formatting
  roundRanges?: boolean; // Apply rounded caps to ranges
  settings?: Partial<ChronosPluginSettings>;
  callbacks?: {
    setTooltip?: (el: Element, text: string) => void;
  };
  cssVars?: Record<string, string>; // CSS custom properties
  cssRootClass?: string; // Root class for scoped styles
}
```

### ChronosPluginSettings

```typescript
interface ChronosPluginSettings {
  selectedLocale: string;
  align: "left" | "center" | "right";
  clickToUse: boolean;
  roundRanges: boolean;
  useUtc: boolean;
  useAI: boolean;
  theme?: ChronosThemeConfig;
  colorMap?: Record<string, string>; // Legacy color mapping
}
```

### Theme Configuration

```typescript
interface ChronosThemeConfig {
  cssVariables?: Record<string, string>;
  colorMap?: {
    [colorName: string]:
      | {
          solid?: string;
          transparent?: string;
        }
      | string;
  };
  customClass?: string;
  disableDefaultStyles?: boolean;
}
```

## Examples

### Custom Color Mapping

```typescript
renderChronos(container, source, {
  settings: {
    theme: {
      colorMap: {
        red: {
          solid: "#ff4444",
          transparent: "rgba(255, 68, 68, 0.3)",
        },
        blue: "#0066cc",
      },
    },
  },
});
```

### Custom CSS Variables

```typescript
renderChronos(container, source, {
  cssVars: {
    "chronos-accent": "#007acc",
    "chronos-bg-primary": "#ffffff",
  },
});
```

### Event Handling

```typescript
const { timeline } = renderChronos(container, source);

timeline.timeline.on("select", (event) => {
  console.log("Selected items:", event.items);
});

timeline.timeline.on("rangechange", (event) => {
  console.log("Time range changed:", event);
});
```

## Theming for Host Applications

### Obsidian Plugin Integration

Override chronos variables in your plugin's `styles.css`:

```css
/* Override chronos variables to match Obsidian theme */
:root {
  --chronos-bg-primary: var(--background-primary);
  --chronos-bg-secondary: var(--background-secondary);
  --chronos-text-normal: var(--text-normal);
  --chronos-text-muted: var(--text-muted);
  --chronos-accent: var(--interactive-accent);
  --chronos-border: var(--background-modifier-border);

  /* Override specific colors */
  --chronos-color-red: var(--text-error);
  --chronos-color-green: var(--text-success);
  --chronos-color-blue: var(--interactive-accent);
}

/* Target specific timeline containers */
.chronos-timeline-container {
  --chronos-bg-primary: var(--background-primary);
  --chronos-text-normal: var(--text-normal);
}
```

### Dynamic Theme Integration

```typescript
// Programmatically sync with host theme
function syncChronosWithHostTheme() {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  root.style.setProperty(
    "--chronos-bg-primary",
    computedStyle.getPropertyValue("--background-primary")
  );
  root.style.setProperty(
    "--chronos-text-normal",
    computedStyle.getPropertyValue("--text-normal")
  );
}

// Call when theme changes
syncChronosWithHostTheme();
```

## Utility Exports

The library also exports utility functions and types:

```typescript
// Parser utilities
export * as parser from "chronos-timeline-md/parser";

// UI components and styles
export * as ui from "chronos-timeline-md/ui";

// Common utilities, types, and constants
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

# Run development sandbox
npm run serve

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
