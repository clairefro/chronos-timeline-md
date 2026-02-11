// Converted from ambient declarations to concrete exports for the portable lib
import { DataItem } from "vis-timeline";

export interface Marker {
  start: string;
  content: string;
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
  key?: string;
  align: "left" | "center" | "right";
  clickToUse: boolean;
  roundRanges: boolean;
  useUtc: boolean;
  useAI: boolean;
  // Enhanced theming configuration
  theme?: ChronosThemeConfig;
  // Legacy color mapping (deprecated, use theme.colorMap instead)
  colorMap?: Record<string, string>;
}

export type Group = {
  id: number;
  content: string;
  parentId?: number;
  nestedGroups?: number[];
  showNested?: boolean;
  className?: string;
  treeLevel?: number;
};

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
}

export type CoreParseOptions = {
  selectedLocale?: string;
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
  groupPath: string[];
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
