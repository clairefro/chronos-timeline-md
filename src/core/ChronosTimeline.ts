import { Timeline, TimelineOptions } from "vis-timeline";
import { DataSet } from "vis-timeline/standalone";
import crosshairsSvg from "../assets/icons/crosshairs.svg";
import {
  Marker,
  Group,
  ChronosPluginSettings,
  ChronosTimelineConstructor,
  ChronosDataItem,
  ChronosDataSetDataItem,
} from "../utils/types";
import { enDateStrToISO } from "../parser/enDateStrToISO";
import { smartDateRange } from "../parser/smartDateRange";
import { ChronosMdParser } from "./ChronosMdParser";
import { orderFunctionBuilder } from "../flags";
import { chronosMoment } from "./chronosMoment";
import {
  cheatsheet,
  templateBlank,
  templateBasic,
  templateAdvanced,
} from "../ui/snippets";
import { systemPrompt } from "../utils/prompts";
import { CHRONOS_DEFAULT_CSS } from "../ui/defaultStyles";

const MS_UNTIL_REFIT = 100;

function setTooltipFallback(el: Element, text: string) {
  // simple tooltip fallback using title attribute for portability
  (el as HTMLElement).setAttribute("title", text);
}

export class ChronosTimeline {
  // Static version property (will be set in index.ts)
  static version: string;

  // Static collection of named templates/snippets and prompts for hosts to reuse.
  static cheatsheet: string = cheatsheet;
  static templates: Record<string, string> = {
    blank: templateBlank,
    basic: templateBasic,
    advanced: templateAdvanced,
  };
  static prompts: { system: string } = { system: systemPrompt };
  private container: HTMLElement;
  private settings: ChronosPluginSettings;
  private parser: ChronosMdParser;
  private callbacks:
    | {
        setTooltip?: (el: Element, text: string) => void;
      }
    | undefined;
  private cssRootClass: string | undefined;
  // Tooltip setter used by the class (injected or fallback)
  private setTooltip: (el: Element, text: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private eventHandlers: { [key: string]: (event: any) => void } = {};
  items: ChronosDataItem[] | undefined;
  timeline: Timeline | undefined;

  constructor(
    containerOrOptions: HTMLElement | ChronosTimelineConstructor,
    optionsOrUndefined?: ChronosPluginSettings,
  ) {
    // Support both constructor signatures:
    // new ChronosTimeline(container, options)
    // new ChronosTimeline({container, settings, ...})

    let container: HTMLElement;
    let settings: ChronosPluginSettings;
    let callbacks:
      | { setTooltip?: (el: Element, text: string) => void }
      | undefined;
    let cssRootClass: string | undefined;

    if (containerOrOptions instanceof HTMLElement) {
      // Method 2: new ChronosTimeline(container, options)
      container = containerOrOptions;
      settings = optionsOrUndefined || {
        selectedLocale: "en",
        align: "left",
        clickToUse: false,
        roundRanges: false,
        useUtc: true,
        useAI: false,
      };
      callbacks = undefined;
      cssRootClass = undefined;
    } else {
      // Original constructor: new ChronosTimeline({container, settings, ...})
      const options = containerOrOptions;
      container = options.container;
      settings = options.settings;
      callbacks = options.callbacks;
      cssRootClass = options.cssRootClass;
    }

    this.container = container;
    this.settings = settings;
    this.parser = new ChronosMdParser(this.settings.selectedLocale);
    this.callbacks = callbacks;
    this.cssRootClass = cssRootClass;
    // cssRootClass will be applied after render to the visible container element
    // Initialize tooltip setter: prefer injected callback, fallback to local helper
    this.setTooltip =
      (this.callbacks && this.callbacks.setTooltip) || setTooltipFallback;

    // Ensure default styles are attached for this container/document.
    this._attachStylesIfMissing();
  }

  // Ensure default styles are attached to the container's document (best-effort).
  private _attachStylesIfMissing() {
    try {
      const doc =
        (this.container && (this.container as any).ownerDocument) ||
        (typeof document !== "undefined" ? document : undefined);

      const themeConfig = this.settings?.theme;
      const cssVars = themeConfig?.cssVariables;
      const disableDefaultStyles = themeConfig?.disableDefaultStyles;

      if (doc) {
        if (disableDefaultStyles) {
          if (cssVars) {
            const existingCustomStyle = doc.querySelector(
              'style[data-chronos-custom="1"]',
            );
            if (!existingCustomStyle) {
              const style = doc.createElement("style");
              style.setAttribute("data-chronos-custom", "1");
              const vars = Object.entries(cssVars)
                .map(([k, v]) => `  --${k}: ${v};`)
                .join("\n");
              style.textContent = `:root {\n${vars}\n}`;
              doc.head && doc.head.appendChild(style);
            }
          }
        } else {
          const existingStyle = doc.querySelector(
            'style[data-chronos-core="1"]',
          );
          if (!existingStyle) {
            const style = doc.createElement("style");
            style.setAttribute("data-chronos-core", "1");
            let finalCss = CHRONOS_DEFAULT_CSS;
            if (cssVars) {
              const vars = Object.entries(cssVars)
                .map(([k, v]) => `  --${k}: ${v};`)
                .join("\n");
              finalCss = `:root {\n${vars}\n}\n` + finalCss;
            }
            style.textContent = finalCss;
            doc.head && doc.head.appendChild(style);
          }
        }
      }
    } catch (e) {
      // best-effort
    }
  }

  // Static render method for Method 1: ChronosTimeline.render(container, source, options)
  static render(
    container: HTMLElement,
    source: string,
    options?: ChronosPluginSettings,
  ): ChronosTimeline {
    const timeline = new ChronosTimeline(container, options);
    timeline.render(source);
    return timeline;
  }

  render(source: string) {
    try {
      const { items, markers, groups, flags } = this.parser.parse(
        source,
        this.settings,
      );
      this._renderFromResult({ items, markers, groups, flags });
    } catch (error) {
      this._handleParseError(error as Error);
    }
  }

  renderParsed(result: {
    items: ChronosDataItem[];
    markers: Marker[];
    groups: Group[];
    flags: any;
  }) {
    this._renderFromResult(result);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(eventType: string, handler: (event: any) => void) {
    this.eventHandlers[eventType] = handler;
    if (this.timeline) {
      this._setupEventHandlers(this.timeline);
    }
  }

  private _setupEventHandlers(timeline: Timeline) {
    Object.keys(this.eventHandlers).forEach((eventType) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      timeline.on(eventType, (event: any) => {
        this.eventHandlers[eventType](event);
      });
    });
  }

  private _getTimelineOptions(): TimelineOptions {
    return {
      zoomMax: 2.997972e14,
      zoomable: true,
      selectable: true,
      minHeight: "200px",
      align: this.settings.align,
      moment: (date: any) => chronosMoment(date, this.settings),
    };
  }

  private _renderFromResult({
    items,
    markers,
    groups,
    flags,
  }: {
    items: ChronosDataItem[];
    markers: Marker[];
    groups: Group[];
    flags: any;
  }) {
    // Ensure default styles are attached to the correct document (useful when
    // hosts render inside iframes or when consumer didn't call attachChronosStyles).
    try {
      const doc =
        (this.container && (this.container as any).ownerDocument) ||
        (typeof document !== "undefined" ? document : undefined);

      const themeConfig = this.settings?.theme;
      const cssVars = themeConfig?.cssVariables;
      const disableDefaultStyles = themeConfig?.disableDefaultStyles;

      if (doc) {
        if (disableDefaultStyles) {
          if (cssVars) {
            const existingCustomStyle = doc.querySelector(
              'style[data-chronos-custom="1"]',
            );
            if (!existingCustomStyle) {
              const style = doc.createElement("style");
              style.setAttribute("data-chronos-custom", "1");
              const vars = Object.entries(cssVars)
                .map(([k, v]) => `  --${k}: ${v};`)
                .join("\n");
              style.textContent = `:root {\n${vars}\n}`;
              doc.head && doc.head.appendChild(style);
            }
          }
        } else {
          const existingStyle = doc.querySelector(
            'style[data-chronos-core="1"]',
          );
          if (!existingStyle) {
            const style = doc.createElement("style");
            style.setAttribute("data-chronos-core", "1");
            let finalCss = CHRONOS_DEFAULT_CSS;
            if (cssVars) {
              const vars = Object.entries(cssVars)
                .map(([k, v]) => `  --${k}: ${v};`)
                .join("\n");
              finalCss = `:root {\n${vars}\n}\n` + finalCss;
            }
            style.textContent = finalCss;
            doc.head && doc.head.appendChild(style);
          }
        }
      }
    } catch (e) {
      // swallow — style injection is a best-effort convenience
    }
    // Add the chronos-timeline-container class to the container
    this.container.classList.add("chronos-timeline-container");

    // Apply theme configurations
    this._applyThemeConfig();

    const options = this._getTimelineOptions();
    if (flags?.orderBy) {
      options.order = orderFunctionBuilder(flags);
    }

    const hasDefaultViewFlag =
      flags?.defaultView?.start && flags?.defaultView?.end;

    if (hasDefaultViewFlag) {
      options.start = flags?.defaultView?.start;
      options.end = flags?.defaultView?.end;
    }

    if (flags?.noToday) {
      options.showCurrentTime = false;
    }
    if (flags?.noStack) {
      options.stack = false;
    }
    if (flags?.height) {
      options.height = `${flags.height}px`;
      options.verticalScroll = true;
    }

    // Apply cssRootClass to the visible container element if provided
    if (this.cssRootClass) {
      const containerEl = this.container.querySelector(
        ".chronos-timeline-container",
      ) as HTMLElement | null;
      if (containerEl) {
        containerEl.classList.add(this.cssRootClass);
      } else {
        // fallback: add to container itself
        this.container.classList.add(this.cssRootClass);
      }
    }

    const timeline = this._createTimeline(items, groups, options);
    this._addMarkers(timeline, markers);
    this._setupTooltip(timeline, items);
    this._createRefitButton(timeline);
    this._handleZoomWorkaround(timeline, groups);

    // Hosts should attach timeline event handlers directly using timeline.on(...)

    this.timeline = timeline;

    !hasDefaultViewFlag && setTimeout(() => timeline.fit(), MS_UNTIL_REFIT);
  }

  private _handleParseError(error: Error) {
    const errorMsgContainer = document.createElement("div");
    errorMsgContainer.className = "chronos-error-message-container";
    errorMsgContainer.innerText = this._formatErrorMessages(error);
    this.container.appendChild(errorMsgContainer);
  }

  private _formatErrorMessages(error: Error): string {
    return `Error(s) parsing chronos markdown.\n\n${error.message
      .split(";;")
      .map((msg) => `  - ${msg}`)
      .join("\n\n")}`;
  }

  private _createTimeline(
    items: ChronosDataItem[],
    groups: Group[] = [],
    options: TimelineOptions,
  ): Timeline {
    let timeline: Timeline;
    if (groups.length) {
      const { updatedItems, updatedGroups } = this.assignItemsToGroups(
        items,
        groups,
      );
      this.items = updatedItems;
      timeline = new Timeline(
        this.container,
        updatedItems,
        this._createDataGroups(updatedGroups),
        options,
      );
    } else {
      timeline = new Timeline(this.container, items, options);
      this.items = items;
    }

    setTimeout(() => this._updateTooltipCustomMarkers(), MS_UNTIL_REFIT);
    return timeline;
  }

  private _addMarkers(timeline: Timeline, markers: Marker[]) {
    markers.forEach((marker, index) => {
      const id = `marker_${index}`;
      timeline.addCustomTime(new Date(marker.start), id);
      // vis-timeline supports custom marker labels in some builds; fallback to title set later
      try {
        // @ts-ignore
        timeline.setCustomTimeMarker(marker.content, id, true);
      } catch (e) {
        // ignore if method missing in bundled timeline
      }
    });
  }

  private _setupTooltip(timeline: Timeline, items: ChronosDataItem[]) {
    // Store items for lookup
    const itemsDataSet = new DataSet(items);

    // Primary approach - use vis-timeline events
    timeline.on("itemover", (event) => {
      this._showTooltipForItem(event.item, event.event.target, itemsDataSet);
    });

    timeline.on("itemout", (event) => {
      this._hideTooltipForItem(event.event.target);
    });

    // Fallback approach - direct DOM event handling
    // This handles cases where vis-timeline events don't fire properly for layered items
    setTimeout(() => {
      const timelineContainer = this.container.querySelector(".vis-timeline");
      if (timelineContainer) {
        // Add event listeners to all timeline items
        const allItems = timelineContainer.querySelectorAll(".vis-item");
        allItems.forEach((itemElement) => {
          const itemId = itemElement.getAttribute("data-id");
          if (itemId) {
            itemElement.addEventListener("mouseenter", (e) => {
              this._showTooltipForItem(
                itemId,
                e.target as HTMLElement,
                itemsDataSet,
              );
            });

            itemElement.addEventListener("mouseleave", (e) => {
              this._hideTooltipForItem(e.target as HTMLElement);
            });
          }
        });
      }
    }, 150); // Small delay to ensure timeline is fully rendered
  }

  private _showTooltipForItem(
    itemId: string,
    targetElement: HTMLElement,
    itemsDataSet: any,
  ) {
    const item = itemsDataSet.get(itemId) as unknown as ChronosDataSetDataItem;
    if (item) {
      const text = `${item.content} (${smartDateRange(
        item.start.toISOString(),
        item.end?.toISOString() ?? null,
        this.settings.selectedLocale,
      )})${item.cDescription ? " \n " + item.cDescription : ""}`;

      // Find the actual timeline item element for better targeting
      const timelineElement = this.container.querySelector(".vis-timeline");
      let tooltipTarget = targetElement;

      if (timelineElement) {
        const itemElement =
          timelineElement.querySelector(`[data-id="${itemId}"]`) ||
          timelineElement.querySelector(`.vis-item[data-id="${itemId}"]`);
        if (itemElement) {
          tooltipTarget = itemElement as HTMLElement;
        }
      }

      this.setTooltip(tooltipTarget, text);
    }
  }

  private _hideTooltipForItem(targetElement: HTMLElement) {
    // Clear tooltip - handle both title attribute and any custom tooltip systems
    if (targetElement) {
      targetElement.removeAttribute("title");
      // If the host has provided a custom tooltip system that needs cleanup,
      // they can override this method or handle it in their setTooltip callback
    }
  }

  private _createRefitButton(timeline: Timeline) {
    const refitButton = document.createElement("button");
    refitButton.className = "chronos-timeline-refit-button";

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(crosshairsSvg, "image/svg+xml");
    const svgElement = svgDoc.documentElement;

    refitButton.appendChild(document.importNode(svgElement, true));
    this.setTooltip(refitButton, "Fit all");
    refitButton.addEventListener("click", () => timeline.fit());

    this.container.appendChild(refitButton);
  }

  private _updateTooltipCustomMarkers() {
    const customTimeMarkers =
      this.container.querySelectorAll(".vis-custom-time");
    customTimeMarkers.forEach((m) => {
      const titleText = m.getAttribute("title");
      if (titleText) {
        let text = titleText;
        if (this.settings.selectedLocale === "en") {
          const enDateISO = enDateStrToISO(titleText);
          text = smartDateRange(enDateISO, null, this.settings.selectedLocale);
        } else {
          text = titleText.replace(", 0:00:00", "").replace(/^.*?:/, "").trim();
        }
        this.setTooltip(m as HTMLElement, text);

        const observer = new MutationObserver((mutationsList) => {
          for (const mutation of mutationsList) {
            if (
              mutation.type === "attributes" &&
              mutation.attributeName === "title"
            ) {
              m.removeAttribute("title");
            }
          }
        });
        observer.observe(m, { attributes: true });
      }
    });
  }

  private assignItemsToGroups(items: ChronosDataItem[], groups: Group[]) {
    const DEFAULT_GROUP_ID = 0;
    let updatedItems = [...items];
    const updatedGroups = groups.length
      ? [...groups, { id: DEFAULT_GROUP_ID, content: " " }]
      : groups;

    updatedItems = items.map((item) => {
      if (groups.length && !item.group) item.group = DEFAULT_GROUP_ID;
      return item;
    });

    return { updatedItems, updatedGroups };
  }

  private _createDataGroups(rawGroups: Group[]) {
    return new DataSet<Group>(
      rawGroups.map((g) => ({
        id: g.id,
        content: g.content,
        parentId: g.parentId,
        nestedGroups: g.nestedGroups,
        showNested: g.showNested,
        treeLevel: g.treeLevel,
        className: g.parentId
          ? "chronos-group-nested"
          : g.nestedGroups && g.nestedGroups.length
            ? "chronos-group-parent"
            : undefined,
      })),
    );
  }

  private _handleZoomWorkaround(timeline: Timeline, groups: Group[]) {
    if (groups.length) {
      setTimeout(() => this._jiggleZoom(timeline), MS_UNTIL_REFIT + 50);
    }
  }

  private _jiggleZoom(timeline: Timeline) {
    const range = timeline.getWindow();
    const zoomFactor = 1.02;
    const newStart = new Date(
      range.start.valueOf() -
        ((range.end.valueOf() - range.start.valueOf()) * (zoomFactor - 1)) / 2,
    );
    const newEnd = new Date(
      range.end.valueOf() +
        ((range.end.valueOf() - range.start.valueOf()) * (zoomFactor - 1)) / 2,
    );

    timeline.setWindow(newStart, newEnd, { animation: true });
    setTimeout(() => {
      timeline.setWindow(range.start, range.end, { animation: true });
    }, 200);
  }

  destroy() {
    if (this.timeline && typeof this.timeline.destroy === "function") {
      this.timeline.destroy();
      this.timeline = undefined;
    }
  }

  private _applyThemeConfig() {
    const themeConfig = this.settings?.theme;
    if (!themeConfig) return;

    // Apply custom CSS class if specified
    if (themeConfig.customClass) {
      this.container.classList.add(themeConfig.customClass);
    }

    // Apply CSS variable overrides
    if (themeConfig.cssVariables) {
      Object.entries(themeConfig.cssVariables).forEach(([property, value]) => {
        // Ensure the property starts with -- for CSS custom properties
        const cssProperty = property.startsWith("--")
          ? property
          : `--${property}`;
        this.container.style.setProperty(cssProperty, value);
      });
    }

    // If default styles are disabled, add a class to indicate this
    if (themeConfig.disableDefaultStyles) {
      this.container.classList.add("chronos-no-default-styles");
    }
  }
}
