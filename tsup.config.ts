import { defineConfig } from "tsup";

export default defineConfig([
  // ESM build with all exports
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    noExternal: ["vis-timeline"],
    outDir: "dist",
  },
  // CJS build with named exports only to avoid warning
  {
    entry: ["src/cjs-entry.ts"],
    format: ["cjs"],
    sourcemap: true,
    splitting: false,
    treeshake: true,
    noExternal: ["vis-timeline"],
    outDir: "dist",
    outExtension: () => ({ js: ".cjs" }),
  },
  // IIFE build with only ChronosTimeline as global
  {
    entry: ["src/iife-entry.ts"],
    format: ["iife"],
    sourcemap: true,
    splitting: false,
    treeshake: true,
    noExternal: ["vis-timeline"],
    globalName: "ChronosTimeline",
    outDir: "dist",
    outExtension: () => ({ js: ".global.js" }),
  },
]);
