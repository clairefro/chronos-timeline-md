import type { ChronosSettingOverrides } from "../core/resolveSettings";
// Converted from ambient declarations to concrete exports for the portable lib
import { DataItem } from "vis-timeline";

export interface Marker {
  start: string;
  content: string;
  color?: string;
}

export interface ChronosDataItem extends DataItem {
  cDescription?: string;
  cLink?: string;
  align?: "left" | "center" | "right";
}

export interface ChronosDataSetDataItem {
  content: string;
  start: Date;
  end: Date;
  cDescription?: string;
}

export interface ChronosThemeConfig {
  // CSS variables to override (will be applied to timeline container)
  cssVariables?: Record<string, string>;
  // Color mapping with support for solid and transparent variants
  colorMap?: {
    [colorName: string]:
      | {
          solid?: string;
          transparent?: string;
        }
      | string; // backward compatibility
  };
  // Custom CSS class to apply to timeline container
  customClass?: string;
  // Whether to disable default chronos styles entirely
  disableDefaultStyles?: boolean;
}

export interface ChronosPluginSettings {
  selectedLocale: string;
  /** @deprecated unused by the core lib (legacy API key field); do not store secrets here */
  key?: string;
  align: "left" | "center" | "right";
  clickToUse: boolean;
  roundRanges: boolean;
  // Let long range titles continue past the range box (default: true)
  overflowRangeTitles?: boolean;
  // Draw events (ranged or single-date) as borderless, semi-transparent boxes (default: false)
  translucentEvents?: boolean;
  useUtc: boolean;
  /** @deprecated unused by the core lib; AI features belong to the host app */
  useAI?: boolean;
  // Enhanced theming configuration
  theme?: ChronosThemeConfig;
  /** @deprecated use `theme.colorMap` instead */
  colorMap?: Record<string, string>;
}

export type Group = { id: number; content: string };

export type Flags = {
  orderBy?: string[];
  defaultView?: { start?: string; end?: string };
  noToday?: boolean;
  height?: number;
  noStack?: boolean;
};

export interface ParseResult {
  items: ChronosDataItem[];
  markers: Marker[];
  groups: Group[];
  flags: Flags;
  /** Setting overrides set by flags in the document (e.g. `> ROUNDED`) */
  overrides?: ChronosSettingOverrides;
}

export type CoreParseOptions = {
  /** @deprecated use `settings.selectedLocale` */
  selectedLocale?: string;
  /** @deprecated use `settings.roundRanges` */
  roundRanges?: boolean;
  settings?: Partial<ChronosPluginSettings>;
  callbacks?: {
    setTooltip?: (el: Element, text: string) => void;
  };
  cssVars?: Record<string, string>;
  cssRootClass?: string;
};

export type ConstructItemParams = {
  content: string;
  start: string;
  separator: string | undefined;
  end: string | undefined;
  groupName: string | undefined;
  color: string | undefined;
  lineNumber: number;
  type: "default" | "background" | "point";
  cLink?: string;
};

export type ChronosTimelineConstructor = {
  container: HTMLElement;
  settings: ChronosPluginSettings;
  // Optional runtime hooks and styling overrides for host environments
  callbacks?: {
    // Optional tooltip setter override for host environments (e.g. Obsidian)
    setTooltip?: (el: Element, text: string) => void;
  };
  cssRootClass?: string; // optional root class to scope injected styles
};
