# Chronos Timeline MD

A timeline visualization library for markdown-based chronological data using vis-timeline.

## Installation

```bash
npm install chronos-timeline-md
```

## Usage

```typescript
import { parseChronos, renderChronos } from "chronos-timeline-md";

// Parse markdown chronological data
const result = parseChronos(markdownSource, {
  selectedLocale: "en",
  roundRanges: true,
});

// Render timeline to DOM element
const container = document.getElementById("timeline-container");
renderChronos(container, markdownSource, {
  selectedLocale: "en",
  cssVars: {
    "primary-color": "#007acc",
  },
});
```

## API

### parseChronos(source, options)

Parses markdown source containing chronological data.

**Parameters:**

- `source` (string): Markdown source with chronological data
- `options` (CoreParseOptions): Configuration options

**Returns:** ParseResult object

### renderChronos(container, source, options)

Renders a timeline visualization to the specified container.

**Parameters:**

- `container` (HTMLElement): DOM element to render timeline into
- `source` (string): Markdown source with chronological data
- `options` (CoreParseOptions): Configuration options

**Returns:** Object with timeline instance and parsed data

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Development mode with watch
npm run dev

# Clean build artifacts
npm run clean
```

## License

ISC
