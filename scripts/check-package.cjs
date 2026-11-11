const { execFileSync } = require("node:child_process");

const output = execFileSync(
  "npm",
  ["pack", "--dry-run", "--json", "--ignore-scripts"],
  { encoding: "utf8", cwd: require("node:path").resolve(__dirname, "..") },
);
const [pack] = JSON.parse(output);
const files = new Set(pack.files.map((file) => file.path));
const required = [
  "dist/index.js",
  "dist/cjs-entry.cjs",
  "dist/iife-entry.global.js",
  "dist/index.d.ts",
];
const missing = required.filter((file) => !files.has(file));
if (missing.length) {
  throw new Error(`Package is missing required build files: ${missing.join(", ")}`);
}
console.log(`Package ${pack.id} contains all required build files.`);
