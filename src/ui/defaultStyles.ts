export const CHRONOS_DEFAULT_CSS = `

:root {
  --chronos-semi-gray: hsla(0, 0%, 50%, 0.15);
  --chronos-opacity: 0.2;
  --chronos-bg-primary: #ffffff;
  --chronos-bg-secondary: #f6f8fa;
  --chronos-text-normal: #24292e;
  --chronos-text-muted: #586069;
  --chronos-text-on-accent: #ffffff;
  --chronos-accent: #0366d6;
  --chronos-accent-hover: #0366d6e6;
  --chronos-accent-alpha: rgba(3, 102, 214, 0.2);
  --chronos-border: #e1e4e8;
  --chronos-border-active: rgba(3, 102, 214, 0.5);
  --chronos-interactive: #0366d6;
  --chronos-interactive-hover: #005cc5;
  --chronos-radius: 6px;
  --chronos-radius-small: 3px;
  --chronos-icon-color: #586069;
  --chronos-bg-text: #000000;

  /* Color palette for timeline items */
  --chronos-color-red: #dc3545;
  --chronos-color-red-rgb: 220, 53, 69;
  --chronos-color-green: #28a745;
  --chronos-color-green-rgb: 40, 167, 69;
  --chronos-color-blue: #007bff;
  --chronos-color-blue-rgb: 0, 123, 255;
  --chronos-color-yellow: #ffc107;
  --chronos-color-yellow-rgb: 255, 193, 7;
  --chronos-color-orange: #fd7e14;
  --chronos-color-orange-rgb: 253, 126, 20;
  --chronos-color-purple: #6f42c1;
  --chronos-color-purple-rgb: 111, 66, 193;
  --chronos-color-pink: #e83e8c;
  --chronos-color-pink-rgb: 232, 62, 140;
  --chronos-color-cyan: #17a2b8;
  --chronos-color-cyan-rgb: 23, 162, 184;
}

.chronos-timeline-container {
  background-color: var(--chronos-bg-secondary);
  position: relative;
  border-radius: var(--chronos-radius);
}

.chronos-timeline-container .chronos-timeline-refit-button {
	position: absolute;
	bottom: 2px;
	right: 5px;
	padding: 2px 5px;
	background-color: transparent;
	border: none;
	box-shadow: none;
	border-radius: 5px;
	cursor: pointer;
	z-index: 99;
	color: var(--chronos-icon-color);
}

.chronos-timeline-container .chronos-timeline-refit-button:hover {
  background-color: var(--chronos-semi-gray);
  fill: currentColor;
}

.chronos-timeline-container .chronos-timeline-refit-button svg {
  fill: currentColor;
  width: 16px;
  border-radius: 0;
}

.chronos-error-message-container {
  padding: 1rem 1.5rem;
  color: var(--chronos-text-normal);
}

.chronos-timeline-container .vis-timeline {
  border: 1px solid transparent;
  border-radius: 0;
  cursor: default;
}

.chronos-timeline-container .vis-timeline.vis-active {
  border-color: var(--chronos-border-active);
  border-radius: 0;
}

.chronos-timeline-container .vis-label {
  color: var(--chronos-text-muted);
}

.chronos-timeline-container .vis-custom-time,
.chronos-timeline-container .vis-custom-time-marker {
  color: var(--chronos-bg-secondary);
  background-color: var(--chronos-text-normal);
}

.chronos-timeline-container .vis-item.vis-background {
  background-color: var(--chronos-accent-alpha);
  z-index: 1;
}

.chronos-timeline-container .vis-item.vis-background .vis-item-content {
  color: var(--chronos-bg-text);
}

/* Ensure points and events appear above background periods */
.chronos-timeline-container .vis-item.vis-point {
  z-index: 10;
  pointer-events: auto;
  border: none;
}

.chronos-timeline-container .vis-item.vis-box,
.chronos-timeline-container .vis-item.vis-range {
  z-index: 5;
  pointer-events: auto;
}

/* Ensure item content is hoverable */
.chronos-timeline-container .vis-item-content {
  pointer-events: auto;
  position: relative;
  z-index: inherit;
}

.chronos-timeline-container .vis-item.vis-selected {
  border-color: var(--chronos-interactive-hover);
  background-color: var(--chronos-interactive-hover);
  color: var(--chronos-text-on-accent);
}

.chronos-timeline-container .vis-item {
  border-radius: var(--chronos-radius-small);
  border-color: var(--chronos-accent);
}

.chronos-timeline-container .vis-box,
.chronos-timeline-container .vis-range {
  cursor: default;
  border-color: transparent;
  background-color: var(--chronos-interactive);
  color: var(--chronos-text-on-accent);
  z-index: 5;
  pointer-events: auto;
}

.chronos-timeline-container .vis-range.with-caps {
  border-radius: 50px;
  padding-left: 8px;
}

/* Link styles */
.chronos-timeline-container .is-link {
  cursor: pointer;
}

.chronos-timeline-container .is-link .vis-item-content {
  text-transform: none;
  text-decoration: underline;
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-color: currentColor;
  text-underline-offset: 5px;
}

.chronos-timeline-container .vis-item-content {
  text-decoration: inherit;
}

.chronos-timeline-container .vis-point {
  cursor: default;
  z-index: 10;
  pointer-events: auto;
}

.chronos-timeline-container .vis-text {
  color: var(--chronos-text-muted);
}

.chronos-timeline-container .vis-dot,
.chronos-timeline-container .vis-line {
  background-color: var(--chronos-interactive);
  color: var(--chronos-interactive);
}

.vis-custom-time[title]::after {
  content: attr(title);
  display: none;
}

.chronos-timeline-container
  :is(
    .vis-timeline,
    .vis-panel.vis-center,
    .vis-panel.vis-left,
    .vis-panel.vis-right,
    .vis-panel.vis-top,
    .vis-panel.vis-bottom
  ) {
  border-color: var(--chronos-border);
}

.chronos-timeline-container .vis-time-axis .vis-grid.vis-major {
  border-color: var(--chronos-border);
}

.chronos-timeline-container .vis-time-axis .vis-grid.vis-minor {
  border-color: var(--chronos-semi-gray);
}

.chronos-timeline-container .vis-foreground > .vis-group,
.chronos-timeline-container .vis-labelset > .vis-label {
  border-bottom-color: var(--chronos-border);
}

.chronos-timeline-container .vis-foreground > .vis-group.chronos-group-nested,
.chronos-timeline-container .vis-labelset > .vis-label.chronos-group-nested {
  border-bottom-color: var(--chronos-border-nested);
  background-color: var(--chronos-bg-nested);
}

.chronos-timeline-container .vis-labelset > .vis-label.chronos-group-nested {
  color: var(--chronos-text-nested);
  font-size: 0.95em;
}

.chronos-timeline-container .vis-foreground > .vis-group.chronos-group-parent,
.chronos-timeline-container .vis-labelset > .vis-label.chronos-group-parent {
  border-bottom-color: var(--chronos-border-parent);
}

.chronos-timeline-container .vis-label {
  color: var(--chronos-text-muted);
}

[data-theme="light"],
body:not([data-theme]) {
  --chronos-bg-primary: #ffffff;
  --chronos-bg-secondary: #f6f8fa;
  --chronos-text-normal: #24292e;
  --chronos-text-muted: #586069;
  --chronos-text-on-accent: #ffffff;
  --chronos-accent: #0366d6;
  --chronos-accent-hover: #0366d6e6;
  --chronos-accent-alpha: rgba(3, 102, 214, 0.2);
  --chronos-border: #e1e4e8;
  --chronos-border-parent: #c9d1d9;
  --chronos-border-nested: #d7dde4;
  --chronos-bg-nested: #f3f6fa;
  --chronos-text-nested: #4f5b67;
  --chronos-border-active: rgba(3, 102, 214, 0.5);
  --chronos-interactive: #0366d6;
  --chronos-interactive-hover: #005cc5;
  --chronos-icon-color: #586069;
  --chronos-bg-text: #000000;

  /* Light theme color palette */
  --chronos-color-red: #dc3545;
  --chronos-color-red-rgb: 220, 53, 69;
  --chronos-color-green: #28a745;
  --chronos-color-green-rgb: 40, 167, 69;
  --chronos-color-blue: #007bff;
  --chronos-color-blue-rgb: 0, 123, 255;
  --chronos-color-yellow: #ffc107;
  --chronos-color-yellow-rgb: 255, 193, 7;
  --chronos-color-orange: #fd7e14;
  --chronos-color-orange-rgb: 253, 126, 20;
  --chronos-color-purple: #6f42c1;
  --chronos-color-purple-rgb: 111, 66, 193;
  --chronos-color-pink: #e83e8c;
  --chronos-color-pink-rgb: 232, 62, 140;
  --chronos-color-cyan: #17a2b8;
  --chronos-color-cyan-rgb: 23, 162, 184;
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  :root {
    --chronos-bg-primary: #0d1117;
    --chronos-bg-secondary: #161b22;
    --chronos-text-normal: #f0f6fc;
    --chronos-text-muted: #8b949e;
    --chronos-text-on-accent: #ffffff;
    --chronos-accent: #58a6ff;
    --chronos-accent-hover: #58a6ffe6;
    --chronos-accent-alpha: rgba(88, 166, 255, 0.2);
    --chronos-border: #30363d;
    --chronos-border-parent: #3a4048;
    --chronos-border-nested: #3d4450;
    --chronos-bg-nested: #1f242b;
    --chronos-text-nested: #b1bac4;
    --chronos-border-active: rgba(88, 166, 255, 0.5);
    --chronos-interactive: #58a6ff;
    --chronos-interactive-hover: #388bfd;
    --chronos-icon-color: #8b949e;
    --chronos-bg-text: #ffffff;

    /* Dark theme color palette */
    --chronos-color-red: #f85149;
    --chronos-color-red-rgb: 248, 81, 73;
    --chronos-color-green: #3fb950;
    --chronos-color-green-rgb: 63, 185, 80;
    --chronos-color-blue: #58a6ff;
    --chronos-color-blue-rgb: 88, 166, 255;
    --chronos-color-yellow: #d29922;
    --chronos-color-yellow-rgb: 210, 153, 34;
    --chronos-color-orange: #fb8500;
    --chronos-color-orange-rgb: 251, 133, 0;
    --chronos-color-purple: #a855f7;
    --chronos-color-purple-rgb: 168, 85, 247;
    --chronos-color-pink: #f0649c;
    --chronos-color-pink-rgb: 240, 100, 156;
    --chronos-color-cyan: #39d0d8;
    --chronos-color-cyan-rgb: 57, 208, 216;
  }
}

[data-theme="dark"] {
  --chronos-bg-primary: #0d1117;
  --chronos-bg-secondary: #161b22;
  --chronos-text-normal: #f0f6fc;
  --chronos-text-muted: #8b949e;
  --chronos-text-on-accent: #ffffff;
  --chronos-accent: #58a6ff;
  --chronos-accent-hover: #58a6ffe6;
  --chronos-accent-alpha: rgba(88, 166, 255, 0.2);
  --chronos-border: #30363d;
  --chronos-border-active: rgba(88, 166, 255, 0.5);
  --chronos-interactive: #58a6ff;
  --chronos-interactive-hover: #388bfd;
  --chronos-icon-color: #8b949e;
  --chronos-bg-text: #ffffff;

  /* Dark theme color palette */
  --chronos-color-red: #f85149;
  --chronos-color-red-rgb: 248, 81, 73;
  --chronos-color-green: #3fb950;
  --chronos-color-green-rgb: 63, 185, 80;
  --chronos-color-blue: #58a6ff;
  --chronos-color-blue-rgb: 88, 166, 255;
  --chronos-color-yellow: #d29922;
  --chronos-color-yellow-rgb: 210, 153, 34;
  --chronos-color-orange: #fb8500;
  --chronos-color-orange-rgb: 251, 133, 0;
  --chronos-color-purple: #a855f7;
  --chronos-color-purple-rgb: 168, 85, 247;
  --chronos-color-pink: #f0649c;
  --chronos-color-pink-rgb: 240, 100, 156;
  --chronos-color-cyan: #39d0d8;
  --chronos-color-cyan-rgb: 57, 208, 216;
}
`;
