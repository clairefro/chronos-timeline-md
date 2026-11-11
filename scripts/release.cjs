// Usage: npm run release -- <patch|minor|major> [--dry-run]
// Builds, tests, verifies and publishes the exact packed tarball. Explicit
// steps are used so it works even when npm's ignore-scripts=true is set.
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const bump = args.find((a) => ["patch", "minor", "major"].includes(a));

if (!bump) {
  console.error("Usage: npm run release -- <patch|minor|major> [--dry-run]");
  process.exit(1);
}

const run = (cmd, cmdArgs, opts = {}) =>
  execFileSync(cmd, cmdArgs, { cwd: root, stdio: "inherit", ...opts });
const out = (cmd, cmdArgs) =>
  execFileSync(cmd, cmdArgs, { cwd: root, encoding: "utf8" }).trim();

const branch = out("git", ["branch", "--show-current"]);
if (branch !== "main") {
  throw new Error(`Releases must run from main (currently on "${branch}").`);
}
if (out("git", ["status", "--porcelain"])) {
  throw new Error("Working tree is not clean. Commit or stash changes first.");
}

run("git", ["pull", "--ff-only", "origin", "main"]);
// Bump first so the build and tag carry the new version
run("npm", ["version", bump, "--ignore-scripts"]);
run("npm", ["install"]);
run("npm", ["run", "build"]);
run("npm", ["test"]);
run("node", ["scripts/check-package.cjs"]);

const [{ filename }] = JSON.parse(
  out("npm", ["pack", "--ignore-scripts", "--json"]),
);
try {
  run("npm", ["publish", `./${filename}`, ...(dryRun ? ["--dry-run"] : [])]);
} finally {
  fs.rmSync(path.join(root, filename), { force: true });
}

if (dryRun) {
  console.log(
    "\nDry run complete. The version commit and tag were created locally; " +
      "undo with: git tag -d v<version> && git reset --hard HEAD~1",
  );
} else {
  run("git", ["push", "origin", "main", "--follow-tags"]);
}
