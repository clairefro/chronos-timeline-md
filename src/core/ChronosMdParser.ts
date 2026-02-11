import {
  ParseResult,
  Marker,
  ChronosDataItem,
  Group,
  ConstructItemParams,
  Flags,
  ChronosPluginSettings,
} from "../utils/types";
import { Color, Opacity } from "../utils/enums";
import { DEFAULT_LOCALE } from "../utils/constants";
import { toPaddedISOZ, toUTCDate, validateUTCDate } from "../parser/utcUtil";
import { FLAGS_PREFIX } from "../flags";

export class ChronosMdParser {
  private errors: string[] = [];
  private items: ChronosDataItem[] = [];
  private markers: Marker[] = [];
  private groups: Group[] = [];
  private groupPathMap: { [key: string]: Group } = {};
  private locale: string;
  private flags: Flags = {};
  private settings!: ChronosPluginSettings;

  constructor(locale = DEFAULT_LOCALE) {
    this.locale = locale;
  }

  parse(data: string, settings: ChronosPluginSettings): ParseResult {
    this.settings = settings;
    const lines = data.split("\n");
    this._resetVars();

    lines.forEach((line, i) => {
      line = line.trim();
      const lineNumber = i + 1;

      if (line.startsWith("#")) {
        return;
      } else if (line.startsWith("-")) {
        this._parseEvent(line, lineNumber);
      } else if (line.startsWith("@")) {
        this._parsePeriod(line, lineNumber);
      } else if (line.startsWith("*")) {
        this._parsePoint(line, lineNumber);
      } else if (line.startsWith("=")) {
        this._parseMarker(line, lineNumber);
      } else if (line.startsWith(FLAGS_PREFIX)) {
        this._parseFlag(line, lineNumber);
      } else if (line) {
        this._addParserError(lineNumber, `Unrecognized format: ${line}`);
      }
    });

    if (this.errors.length > 0) {
      throw new Error(this.errors.join(";;"));
    }

    const flags = this.flags;
    const items = this.items;
    const markers = this.markers;
    const groups = this.groups;

    return { items, markers, groups, flags };
  }

  private _parseTimeItem(line: string, lineNumber: number) {
    const itemTypeP = `[-@=\\*]`;
    const dateP = `-?\\d{1,}(?:-?(?:\\d{2})?-?(?:\\d{2})?T?(?:\\d{2})?:?(?:\\d{2})?:?(?:\\d{2})?)?`;
    const optSp = `\\s*`;

    const separatorP = `(?<separator>[^-\\d\\s]*?)?`;
    const colorP = `(?<color>#\\w+)?`;
    const groupP = `(?<groupBlock>(?:\\s*\\{[^}]+\\})*)`;

    const contentP = `(?<content>.+?)`;
    const descriptionP = `(?:\\|\\s*(?<!\\[\\[[^\\]]*)\\s*(?<description>.*))?`;

    const re = new RegExp(
      `^${itemTypeP}${optSp}\\[${optSp}(?<start>${dateP})?${optSp}${separatorP}${optSp}(?<end>${dateP})?${optSp}\\]${optSp}${colorP}${optSp}${groupP}${optSp}${contentP}${optSp}${descriptionP}$`,
    );

    const match = line.match(re);
    if (!match) {
      this._addParserError(lineNumber, `Invalid format: ${line}`);
      return null;
    } else {
      const start = match.groups?.start;
      const end = match.groups?.end;
      const separator = match.groups?.separator;
      const color = match.groups?.color;
      const groupBlock = match.groups?.groupBlock;
      const description = match.groups?.description;
      const content = match.groups?.content ?? "";

      const now = new Date().toISOString().split("T")[0];

      const contentLink = content ? this._extractWikiLink(content) : null;
      const descriptionLink = description
        ? this._extractWikiLink(description)
        : undefined;
      const link = contentLink || descriptionLink;

      return {
        start: start ? toPaddedISOZ(start) : toPaddedISOZ(now),
        separator,
        end: separator
          ? end
            ? toPaddedISOZ(end)
            : toPaddedISOZ(now)
          : undefined,
        color,
        groupPath: this._parseGroupBlock(groupBlock),
        content,
        description,
        cLink: link,
      };
    }
  }

  private _constructItem({
    content,
    start,
    separator,
    end,
    groupPath,
    color,
    lineNumber,
    type = "default",
    cLink,
  }: ConstructItemParams) {
    this._validateDates(start, end, separator, lineNumber);

    const groupId = groupPath.length
      ? this._getOrCreateGroupId(groupPath)
      : null;

    let style = "";
    if (color) {
      style += `background-color: ${this._mapToThemeColor(
        color as Color,
        type === "background" ? Opacity.Opaque : Opacity.Solid,
      )};`;
    }

    if (type === "point") {
      style += color
        ? "color: black !important;"
        : "color: var(--text-normal) !important;";
    }

    const isLink = (type === "point" || type === "default") && cLink;

    let classes = "";
    classes += isLink ? "is-link" : "";
    if (start && end && this.settings.roundRanges) {
      classes += " with-caps";
    }
    return {
      content: content || "",
      start: toUTCDate(start),
      end:
        end && toUTCDate(start) !== toUTCDate(end) ? toUTCDate(end) : undefined,
      group: groupId,
      style: style.length ? style : undefined,
      className: classes,
      cLink,
      ...(type === "default" ? {} : { type }),
    };
  }

  private _parseEvent(line: string, lineNumber: number) {
    const components = this._parseTimeItem(line, lineNumber);

    if (components) {
      const {
        start,
        separator,
        end,
        color,
        groupPath,
        content,
        description,
        cLink,
      } = components;

      this.items.push({
        ...this._constructItem({
          content: content ? content : "\u00A0",
          start,
          separator,
          end,
          groupPath,
          color,
          lineNumber,
          type: "default",
          cLink,
        }),
        cDescription: description || undefined,
        cLink,
      });
    }
  }

  private _parsePeriod(line: string, lineNumber: number) {
    const components = this._parseTimeItem(line, lineNumber);

    if (components) {
      const { start, separator, end, color, groupPath, content, description } =
        components;
      this.items.push(
        this._constructItem({
          content: description ? content + " | " + description : content,
          start,
          separator,
          end,
          groupPath,
          color,
          lineNumber,
          type: "background",
        }),
      );
    }
  }

  private _parsePoint(line: string, lineNumber: number) {
    const components = this._parseTimeItem(line, lineNumber);

    if (components) {
      const {
        start,
        separator,
        color,
        groupPath,
        content,
        description,
        cLink,
      } = components;
      this.items.push({
        ...this._constructItem({
          content: content ? content : "\u00A0",
          start,
          separator,
          end: undefined,
          groupPath,
          color,
          lineNumber,
          type: "point",
          cLink,
        }),
        cDescription: description || undefined,
        cLink,
      });
    }
  }

  private _parseMarker(line: string, lineNumber: number) {
    const markerMatch = line.match(/^=\s*\[(.*?)]\s*(.*)?$/);

    if (markerMatch) {
      const [, start, content] = markerMatch;

      this.markers.push({
        start: toUTCDate(start).toISOString(),
        content: content || "",
      });
    } else {
      this._addParserError(lineNumber, `Invalid marker format: ${line}`);
    }
  }

  private _parseFlag(line: string, lineNumber: number) {
    const flagPattern = `(\\w+)(?:\\s+(.+))?$`;
    const re = new RegExp(`${FLAGS_PREFIX}\\s*${flagPattern}`, "i");
    const match = line.match(re);

    if (!match) return;

    const flagName = match[1]?.toLocaleLowerCase();
    const flagContent = match[2]?.split("|") || [];

    switch (flagName) {
      case "orderby":
        this.flags.orderBy = flagContent;
        break;
      case "defaultview":
        if (!flagContent.length) {
          this._addParserError(
            lineNumber,
            `Missing dates in DEFAULTVIEW flag: ${line}`,
          );
          return;
        }
        if (flagContent.length < 2) {
          this._addParserError(
            lineNumber,
            `Must provide a start and end date for DEFAULTVIEW flag in format start|end: ${line}`,
          );
          return;
        }

        try {
          this._validateDates(
            toUTCDate(flagContent[0]).toISOString().split("T")[0],
            toUTCDate(flagContent[1]).toISOString().split("T")[0],
            "~",
            lineNumber,
          );

          this.flags.defaultView = {
            start: toUTCDate(flagContent[0]).toISOString(),
            end: toUTCDate(flagContent[1]).toISOString(),
          };
        } catch (e: any) {
          this._addParserError(lineNumber, `${e.message}: ${line}`);
        }
        break;
      case "notoday":
        this.flags.noToday = true;
        break;
      case "nostack":
        this.flags.noStack = true;
        break;
      case "height":
        if (!flagContent.length) {
          this._addParserError(
            lineNumber,
            `Must provide number of pixels for HEIGHT flag (ex: 500): ${line}`,
          );
          return;
        }
        const arg = flagContent[0].trim();
        if (arg.match(/\s/)) {
          this._addParserError(
            lineNumber,
            `Must provide a single number (of pixels) for HEIGHT flag (ex: 500): ${line}`,
          );
          return;
        }
        if (isNaN(Number(arg))) {
          this._addParserError(
            lineNumber,
            `Must provide a number (of pixels) for HEIGHT flag (ex: 500): ${line}`,
          );
          return;
        }

        this.flags.height = Number(arg);
        break;
      default:
        this._addParserError(lineNumber, `Unrecognized flag: ${line}`);
        break;
    }
  }

  private _getOrCreateGroupId(groupPath: string[]): number {
    let parentPathKey = "";
    let parentId: number | null = null;
    let lastId = 0;

    groupPath.forEach((rawName, depthIndex) => {
      const name = rawName.trim();
      if (!name) return;

      const pathKey = parentPathKey ? `${parentPathKey}::${name}` : name;

      let group = this.groupPathMap[pathKey];
      if (!group) {
        const groupId = this.groups.length + 1;
        group = {
          id: groupId,
          content: name,
          treeLevel: depthIndex,
          ...(parentId !== null ? { parentId } : {}),
        };
        this.groups.push(group);
        this.groupPathMap[pathKey] = group;
      }

      if (parentId !== null) {
        const parentGroup = this.groupPathMap[parentPathKey];
        if (parentGroup) {
          if (!parentGroup.nestedGroups) parentGroup.nestedGroups = [];
          if (!parentGroup.nestedGroups.includes(group.id)) {
            parentGroup.nestedGroups.push(group.id);
          }
          parentGroup.showNested = true;
        }
      }

      parentId = group.id;
      parentPathKey = pathKey;
      lastId = group.id;
    });

    return lastId;
  }

  private _extractWikiLink(text: string): string | undefined {
    const wikiLinkRegex = /\[\[([^\]]+)(\|([^\]]+))?\]\]/;
    const match = text.match(wikiLinkRegex);
    return match ? match[1] : undefined;
  }

  private _mapToThemeColor(color: Color, opacity: Opacity) {
    const themeConfig = this.settings?.theme;

    // check enhanced theme colorMap first
    if (themeConfig?.colorMap?.[color]) {
      const colorConfig = themeConfig.colorMap[color];

      if (typeof colorConfig === "string") {
        // Simple string format (backward compatibility)
        return this._applyOpacityToColor(colorConfig, opacity);
      } else if (typeof colorConfig === "object") {
        // Enhanced format with solid/transparent variants
        if (opacity === "solid" && colorConfig.solid) {
          return colorConfig.solid;
        } else if (opacity !== "solid" && colorConfig.transparent) {
          return colorConfig.transparent;
        } else if (colorConfig.solid) {
          // Fallback: use solid color with opacity if transparent not provided
          return this._applyOpacityToColor(colorConfig.solid, opacity);
        }
      }
    }

    // fall back to legacy colorMap for backward compatibility
    if (this.settings?.colorMap && this.settings.colorMap[color]) {
      return this._applyOpacityToColor(this.settings.colorMap[color], opacity);
    }

    const namedColorMap: Record<string, string> = {
      red: "red",
      green: "green",
      blue: "blue",
      yellow: "yellow",
      orange: "orange",
      purple: "purple",
      pink: "pink",
      cyan: "cyan",
    };

    if (namedColorMap[color]) {
      // Use CSS variables for named colors
      return opacity === "solid"
        ? `var(--chronos-color-${namedColorMap[color]})`
        : `rgba(var(--chronos-color-${namedColorMap[color]}-rgb), var(--chronos-opacity))`;
    }

    // Check if color is a hex code (6 characters, all hex digits)
    if (/^[0-9A-Fa-f]{6}$/.test(color)) {
      return this._hexToColor(color, opacity);
    }

    console.warn(`Color "${color}" not recognized as named color or hex code.`);
    return undefined;
  }

  private _applyOpacityToColor(color: string, opacity: Opacity): string {
    if (opacity === "solid") return color;

    // If it's already a CSS variable, convert to RGB variant
    if (color.startsWith("var(--chronos-color-") && color.endsWith(")")) {
      const varContent = color.match(/var\(--chronos-color-(\w+)\)/);
      if (varContent && varContent[1]) {
        return `rgba(var(--chronos-color-${varContent[1]}-rgb), var(--chronos-opacity))`;
      }
    }

    // If it's a hex color (with or without #), convert to rgba
    const hexMatch = color.match(/^#?([0-9A-Fa-f]{6})$/);
    if (hexMatch) {
      return this._hexToColor(hexMatch[1], opacity);
    }

    // If it's rgb(), convert to rgba()
    if (color.match(/^rgb\(/)) {
      return color
        .replace("rgb(", "rgba(")
        .replace(")", `, var(--chronos-opacity))`);
    }

    // For unknown formats, return as-is
    return color;
  }

  private _hexToColor(hex: string, opacity: Opacity): string {
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    if (opacity === "solid") {
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      return `rgba(${r}, ${g}, ${b}, var(--chronos-opacity))`;
    }
  }

  private _ensureChronologicalDates(
    start: string,
    end: string | undefined,
    lineNumber: number,
  ) {
    if (start && end) {
      const startDate = toUTCDate(start);
      const endDate = toUTCDate(end);
      if (startDate > endDate) {
        this._addParserError(
          lineNumber,
          `Start date (${start}) is after end date (${end}).`,
        );
      }
    }
  }

  private _ensureCorrectDateSeparator(
    separator: string,
    lineNumber: number,
  ): void {
    if (separator !== "~") {
      const msg = `Invalid date separator "${separator}". Dates in a range must be separated by a tilde (~).`;
      this._addParserError(lineNumber, msg);
    }
  }

  private _validateDate(dateString: string, lineNumber: number): void {
    try {
      validateUTCDate(dateString);
    } catch (e: any) {
      this._addParserError(lineNumber, e.message);
    }
  }

  private _validateDates(
    start: string,
    end: string | undefined,
    separator: string | undefined,
    lineNumber: number,
  ) {
    this._validateDate(start, lineNumber);
    end && this._validateDate(end, lineNumber);
    separator && this._ensureCorrectDateSeparator(separator, lineNumber);
    this._ensureChronologicalDates(start, end, lineNumber);
  }

  private _addParserError(lineNumber: number, message: string) {
    this.errors.push(`Line ${lineNumber}: ${message}`);
  }

  private _clearErrors() {
    this.errors = [];
  }

  private _clearItems() {
    this.items = [];
  }

  private _clearMarkers() {
    this.markers = [];
  }

  private _clearGroups() {
    this.groups = [];
  }

  private _clearFlags() {
    this.flags = {};
  }

  private _resetVars() {
    this._clearErrors();
    this._clearItems();
    this._clearMarkers();
    this._clearGroups();
    this._clearFlags();
    this.groupPathMap = {};
  }

  private _parseGroupBlock(groupBlock?: string): string[] {
    if (!groupBlock) return [];
    const groups: string[] = [];
    const re = /\{([^}]+)\}/g;
    let match = re.exec(groupBlock);
    while (match) {
      const name = match[1]?.trim();
      if (name) groups.push(name);
      match = re.exec(groupBlock);
    }
    return groups;
  }
}
