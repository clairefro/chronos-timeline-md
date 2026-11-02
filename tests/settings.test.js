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
