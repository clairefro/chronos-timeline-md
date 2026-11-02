import type { ChronosPluginSettings } from "../utils/types";

/** Settings a document may override locally via flags (e.g. `> ROUNDED`). */
export type ChronosSettingOverrides = Partial<
  Pick<
    ChronosPluginSettings,
    "roundRanges" | "overflowRangeTitles" | "translucentEvents"
  >
>;

/**
 * Single place where setting precedence is decided:
 * host settings (e.g. plugin-wide) < document flag overrides.
 */
export function resolveSettings(
  host: ChronosPluginSettings,
  overrides: ChronosSettingOverrides = {},
): ChronosPluginSettings {
  return { ...host, ...overrides };
}
