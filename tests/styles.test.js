const assert = require("node:assert/strict");
const test = require("node:test");
const { pathToFileURL } = require("node:url");
const path = require("node:path");

function documentStub() {
  const styles = [];
  return {
    styles,
    head: { appendChild: (element) => styles.push(element) },
    createElement: () => ({
      attributes: {},
      setAttribute(name, value) {
        this.attributes[name] = value;
      },
    }),
    querySelector(selector) {
      const match = selector.match(/^style\[([^=]+)="([^"]+)"\]$/);
      return styles.find((style) => style.attributes[match[1]] === match[2]);
    },
  };
}

for (const [name, load] of [
  ["CommonJS", async () => require("..")],
  [
    "ESM",
    async () =>
      import(pathToFileURL(path.resolve(__dirname, "../dist/index.js")).href),
  ],
]) {
  test(`${name} attaches vis layout styles once before Chronos styles`, async () => {
    const { attachChronosStyles } = await load();
    const doc = documentStub();
    attachChronosStyles(doc);
    attachChronosStyles(doc);
    assert.equal(doc.styles.length, 2);
    assert.equal(doc.styles[0].attributes["data-chronos-vis"], "1");
    assert.match(
      doc.styles[0].textContent,
      /\.vis-panel\s*\{[^}]*position:\s*absolute/s,
    );
    assert.equal(doc.styles[1].attributes["data-chronos-core"], "1");
  });

  test(`${name} retains layout styles when default theme is disabled`, async () => {
    const { attachChronosStyles } = await load();
    const doc = documentStub();
    attachChronosStyles(doc, undefined, undefined, undefined, true);
    assert.equal(doc.styles.length, 1);
    assert.equal(doc.styles[0].attributes["data-chronos-vis"], "1");
  });
}
