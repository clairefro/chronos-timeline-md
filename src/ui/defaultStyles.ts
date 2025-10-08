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
  border-radius: var(--chronos-radius-small);
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

.vis-timeline {
  border: 2px solid transparent !important;
  border-radius: 0 !important;
  cursor: default;
}

.vis-timeline.vis-active {
  border-color: var(--chronos-border-active) !important;
  border-radius: 0 !important;
}

.vis-label {
  color: var(--chronos-text-muted) !important;
}

.vis-custom-time,
.vis-custom-time-marker {
  color: var(--chronos-text-normal) !important;
  background-color: var(--chronos-bg-secondary) !important;
}

.chronos-timeline-container .vis-item.vis-background {
  background-color: var(--chronos-accent-alpha);
}

.chronos-timeline-container .vis-item.vis-background .vis-item-content {
  color: var(--chronos-bg-primary);
}

.chronos-timeline-container .vis-item.vis-selected {
  border-color: var(--chronos-interactive-hover);
  background-color: var(--chronos-interactive-hover) !important;
  color: var(--chronos-text-on-accent) !important;
}

.chronos-timeline-container .vis-item {
  border-radius: var(--chronos-radius-small) !important;
  border-color: var(--chronos-accent);
}

.chronos-timeline-container .vis-box,
.chronos-timeline-container .vis-range {
  cursor: default;
  border-color: transparent;
  background-color: var(--chronos-interactive);
  color: var(--chronos-text-on-accent);
}

.chronos-timeline-container .vis-range.with-caps {
  border-radius: 50px !important;
  padding-left: 8px;
}

/* Link styles */
.chronos-timeline-container .is-link {
  cursor: pointer !important;
}

.chronos-timeline-container .is-link .vis-item-content {
  text-transform: none !important;
  text-decoration: underline !important;
  text-decoration-line: underline !important;
  text-decoration-style: solid !important;
  text-decoration-color: currentColor !important;
  text-underline-offset: 5px !important;
}

.chronos-timeline-container .vis-item-content {
  text-decoration: inherit !important;
}

.chronos-timeline-container .vis-point {
  cursor: default;
}

.chronos-timeline-container .vis-text {
  color: var(--chronos-text-muted) !important;
}

.chronos-timeline-container .vis-dot,
.chronos-timeline-container .vis-line {
  background-color: var(--chronos-interactive) !important;
  color: var(--chronos-interactive) !important;
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
    --chronos-border-active: rgba(88, 166, 255, 0.5);
    --chronos-interactive: #58a6ff;
    --chronos-interactive-hover: #388bfd;
    --chronos-icon-color: #8b949e;
    
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
`;
