const assert = require("node:assert");
const test = require("node:test");

/** ------  HELPERS --------  */
function ensureHTMLElementShim() {
  if (typeof globalThis.HTMLElement === "undefined") {
    class FakeHTMLElement {
      constructor() {
        this.classList = { add() {} };
        this.style = { setProperty() {} };
      }
      querySelector() {
        return null;
      }
      appendChild() {}
    }
    globalThis.HTMLElement = FakeHTMLElement;
  }
}

function createFakeContainer(overrides = {}) {
  const base = {
    classList: { add() {} },
    querySelector() {
      return null;
    },
    appendChild() {},
    style: { setProperty() {} },
  };
  return Object.assign(base, overrides || {});
}
/** ------  END HELPERS --------  */

ensureHTMLElementShim();

const pkg = require("..");
const { parser, ChronosTimeline, parseChronos } = pkg;

const minimalSettings = {
  selectedLocale: "en",
  align: "left",
  clickToUse: false,
  roundRanges: false,
  useUtc: true,
  useAI: false,
};

const sample = [
  "# Sample timeline",
  "> height 300",
  "- [2020-01-01] #ff0000 {Group A} New Year Event | Fireworks",
  "* [2020-02-02] {Group B} Groundhog Day",
  "@ [2020-03-01~2020-03-05] {Group A} Conference",
  "- [2020-05-01] {Group A} {Subgroup A1} Subgroup Event",
  "= [2020-04-01] Marker Label",
].join("\n");

test("Parse — Happy path and invocations", async (t) => {
  await t.test(
    "HELPER: parseChronos returns expected items, markers, groups and flags",
    async () => {
      const sample = [
        "# Sample timeline",
        "> height 300",
        "- [2020-01-01] #ff0000 {Group A} New Year Event | Fireworks",
        "* [2020-02-02] {Group B} Groundhog Day",
        "@ [2020-03-01~2020-03-05] {Group A} Conference",
        "- [2020-05-01] {Group A} {Subgroup A1} Subgroup Event",
        "= [2020-04-01] Marker Label",
      ].join("\n");

      const result = parseChronos(sample);

      // Basic shape
      assert.ok(result, "parse result should be defined");
      assert.ok(Array.isArray(result.items), "items should be an array");
      assert.ok(Array.isArray(result.markers), "markers should be an array");
      assert.ok(Array.isArray(result.groups), "groups should be an array");
      assert.ok(
        result.flags && typeof result.flags === "object",
        "flags should be an object"
      );

      // Flags
      assert.strictEqual(
        result.flags.height,
        300,
        "height flag parsed as number"
      );

      // Items and markers counts
      assert.strictEqual(
        result.items.length,
        4,
        "four timeline items expected"
      );
      assert.strictEqual(result.markers.length, 1, "one marker expected");

      // Marker content
      const marker = result.markers[0];
      assert.strictEqual(marker.content, "Marker Label");
      assert.match(
        marker.start,
        /2020-04-01/,
        "marker.start should contain the date string"
      );

      // Groups: should contain Group A, Group B, Subgroup A1
      const groupNames = result.groups.map((g) => g.content);
      assert.ok(groupNames.includes("Group A"), "Group A should be present");
      assert.ok(groupNames.includes("Group B"), "Group B should be present");
      assert.ok(
        groupNames.includes("Subgroup A1"),
        "Subgroup A1 should be present"
      );

      // Find items by content
      const newYear = result.items.find((it) =>
        String(it.content).includes("New Year")
      );
      const groundhog = result.items.find((it) =>
        String(it.content).includes("Groundhog")
      );
      const conference = result.items.find((it) =>
        String(it.content).includes("Conference")
      );
      const subgroupEvent = result.items.find((it) =>
        String(it.content).includes("Subgroup Event")
      );

      assert.ok(newYear, "New Year item parsed");
      assert.ok(groundhog, "Groundhog item parsed");
      assert.ok(conference, "Conference period parsed");
      assert.ok(subgroupEvent, "Subgroup event parsed");

      // Dates are Date objects
      assert.ok(newYear.start instanceof Date, "item.start should be a Date");
      assert.ok(
        conference.start instanceof Date && conference.end instanceof Date,
        "period should have start and end Dates"
      );

      // Color applied to style for first item (hex color -> background-color)
      assert.ok(
        newYear.style && newYear.style.includes("background-color"),
        "colored item should have background-color style"
      );

      // Group ids map consistently: New Year and Conference both belong to Group A
      const groupA = result.groups.find((g) => g.content === "Group A");
      const subgroupA1 = result.groups.find((g) => g.content === "Subgroup A1");
      assert.ok(groupA, "group A exists");
      assert.ok(subgroupA1, "subgroup A1 exists");
      assert.strictEqual(groupA.treeLevel, 0, "group A treeLevel is 0");
      assert.strictEqual(subgroupA1.treeLevel, 1, "subgroup A1 treeLevel is 1");
      assert.strictEqual(
        newYear.group,
        groupA.id,
        "New Year group id should match Group A"
      );
      assert.strictEqual(
        conference.group,
        groupA.id,
        "Conference group id should match Group A"
      );
      assert.strictEqual(
        subgroupEvent.group,
        subgroupA1.id,
        "Subgroup event group id should match Subgroup A1"
      );
      assert.ok(
        Array.isArray(groupA.nestedGroups) &&
          groupA.nestedGroups.includes(subgroupA1.id),
        "Group A should reference nested Subgroup A1"
      );

      // Point item (Groundhog) should not have an end date
      assert.strictEqual(
        groundhog.end,
        undefined,
        "point item should not have an end date"
      );
    }
  );

  await t.test(
    "STATIC: ChronosMdParser.parse (direct) returns expected shape",
    () => {
      const p = new parser.ChronosMdParser("en");
      const result = p.parse(sample, minimalSettings);

      assert.ok(result.items.length === 4, "expected 4 items");
      assert.ok(result.markers.length === 1, "expected 1 marker");
      assert.strictEqual(result.flags.height, 300);
    }
  );

  await t.test(
    "INSTANCE: ChronosTimeline instance parser.parse returns expected shape",
    () => {
      const fakeContainer = createFakeContainer();

      const timeline = new ChronosTimeline({
        container: fakeContainer,
        settings: minimalSettings,
      });

      // Access internal parser (allowed at runtime) and use the instance settings
      const result = timeline.parser.parse(sample, timeline.settings);

      assert.ok(result.items.length === 4, "expected 4 items");
      assert.ok(result.markers.length === 1, "expected 1 marker");
      assert.strictEqual(result.flags.height, 300);
    }
  );
});
