import type {
  ChronosDocumentSettings,
  ChronosSettings,
  ChronosSettingOverrides,
} from "../utils/types";

export type { ChronosSettingOverrides };

type BooleanOverrideKey = {
  [K in keyof ChronosDocumentSettings]-?: ChronosDocumentSettings[K] extends
    | boolean
    | undefined
    ? K
    : never;
}[keyof ChronosDocumentSettings];

// `> NAME` sets the setting to true, `> NONAME` sets it to false
const BOOLEAN_FLAGS: Record<string, BooleanOverrideKey> = {
  rounded: "roundRanges",
  translucent: "translucentEvents",
  overflowtitles: "overflowRangeTitles",
  utc: "useUtc",
};

const ALIGNMENTS = ["left", "center", "right"] as const;

export type SettingFlagResult =
  | { overrides: ChronosSettingOverrides }
  | { error: string };

/** Returns null when the flag isn't a setting flag. `arg` is the text after the flag name. */
export function parseSettingFlag(
  flagName: string,
  arg: string | undefined,
): SettingFlagResult | null {
  const name = flagName.toLowerCase();

  if (BOOLEAN_FLAGS[name]) {
    return { overrides: { [BOOLEAN_FLAGS[name]]: true } };
  }
  if (name.startsWith("no") && BOOLEAN_FLAGS[name.slice(2)]) {
    return { overrides: { [BOOLEAN_FLAGS[name.slice(2)]]: false } };
  }
  if (name === "align") {
    const value = arg?.trim().toLowerCase();
    if (value && (ALIGNMENTS as readonly string[]).includes(value)) {
      return { overrides: { align: value as (typeof ALIGNMENTS)[number] } };
    }
    return { error: "Must provide left, center or right for ALIGN flag" };
  }
  if (name === "axis") {
    const value = arg?.trim().toLowerCase();
    if (value === "top" || value === "bottom") {
      return { overrides: { axisPosition: value } };
    }
    return { error: "Must provide top or bottom for AXIS flag" };
  }
  return null;
}

/**
 * Single place where setting precedence is decided:
 * host settings (e.g. plugin-wide) < document flag overrides.
 */
export function resolveSettings(
  host: ChronosSettings,
  overrides: ChronosSettingOverrides = {},
): ChronosSettings {
  return { ...host, ...overrides };
}
