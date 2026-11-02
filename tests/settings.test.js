const assert = require("node:assert");
const test = require("node:test");
const { parseChronos } = require("..");

const src = (flags = "") => `${flags}\n- [2020~2021] Range`;
const caps = (r) => r.items[0].className?.includes("with-caps");

test("flat deprecated roundRanges still works", () => {
  assert.ok(caps(parseChronos(src(), { roundRanges: true })));
});

test("settings.roundRanges is honored by parseChronos", () => {
  assert.ok(caps(parseChronos(src(), { settings: { roundRanges: true } })));
});

test("> ROUNDED flag overrides host setting off", () => {
  const r = parseChronos(src("> ROUNDED"), { settings: { roundRanges: false } });
  assert.ok(caps(r));
  assert.deepStrictEqual(r.overrides, { roundRanges: true });
});

test("> NOROUNDED flag overrides host setting on", () => {
  const r = parseChronos(src("> NOROUNDED"), { settings: { roundRanges: true } });
  assert.ok(!caps(r));
});

test("setting flags are case-insensitive and tolerated anywhere", () => {
  const r = parseChronos(`- [2020~2021] Range\n> translucent`);
  assert.deepStrictEqual(r.overrides, { translucentEvents: true });
});

test("no flags yields no overrides", () => {
  assert.deepStrictEqual(parseChronos(src()).overrides, {});
});

test("> UTC / > NOUTC and > ALIGN set overrides", () => {
  const r = parseChronos("- [2020] x\n> NOUTC\n> ALIGN center");
  assert.deepStrictEqual(r.overrides, { useUtc: false, align: "center" });
});

test("invalid ALIGN value is a parse error", () => {
  assert.throws(() => parseChronos("- [2020] x\n> ALIGN middle"), /ALIGN/);
});

test("locale is not overridable from markdown", () => {
  assert.throws(() => parseChronos("- [2020] x\n> LOCALE fr"), /Unrecognized flag/);
});

test("> GAP sets item gap, one value applies to both axes", () => {
  assert.deepStrictEqual(parseChronos("- [2020] x\n> GAP 12").flags.gap, {
    horizontal: 12,
    vertical: 12,
  });
});

test("> GAP h|v sets axes separately", () => {
  assert.deepStrictEqual(parseChronos("- [2020] x\n> GAP 5|30").flags.gap, {
    horizontal: 5,
    vertical: 30,
  });
});

test("invalid GAP values are parse errors", () => {
  for (const bad of ["> GAP", "> GAP abc", "> GAP -3", "> GAP 1|2|3", "> GAP |", "> GAP 5|x"]) {
    assert.throws(() => parseChronos(`- [2020] x\n${bad}`), /GAP/, bad);
  }
});

test("> AXIS top|bottom sets axisPosition", () => {
  assert.deepStrictEqual(parseChronos("- [2020] x\n> AXIS top").overrides, {
    axisPosition: "top",
  });
  assert.deepStrictEqual(parseChronos("- [2020] x\n> axis BOTTOM").overrides, {
    axisPosition: "bottom",
  });
});

test("invalid AXIS value is a parse error", () => {
  assert.throws(() => parseChronos("- [2020] x\n> AXIS left"), /AXIS/);
  assert.throws(() => parseChronos("- [2020] x\n> AXIS"), /AXIS/);
});

test("> GAP |v and > GAP h| leave the other axis unset", () => {
  assert.deepStrictEqual(parseChronos("- [2020] x\n> GAP |20").flags.gap, {
    horizontal: undefined,
    vertical: 20,
  });
  assert.deepStrictEqual(parseChronos("- [2020] x\n> GAP 8|").flags.gap, {
    horizontal: 8,
    vertical: undefined,
  });
});
