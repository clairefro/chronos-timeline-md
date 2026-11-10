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
    loader: { ".css": "text" },
    outDir: "dist",
    outExtension: () => ({ js: ".js" }),
    target: "es2020",
    // Ensure proper ESM output
    platform: "browser",
  },
  // CJS build with named exports only to avoid warning
  {
    entry: ["src/cjs-entry.ts"],
    format: ["cjs"],
    sourcemap: true,
    splitting: false,
    treeshake: true,
    noExternal: ["vis-timeline"],
    loader: { ".css": "text" },
    outDir: "dist",
    outExtension: () => ({ js: ".cjs" }),
    // Ensure proper CJS exports
    cjsInterop: true,
    target: "node14",
    platform: "node",
  },
  // IIFE build with only ChronosTimeline as global
  {
    entry: ["src/iife-entry.ts"],
    format: ["iife"],
    sourcemap: true,
    splitting: false,
    treeshake: true,
    noExternal: ["vis-timeline"],
    loader: { ".css": "text" },
    globalName: "ChronosTimeline",
    outDir: "dist",
    outExtension: () => ({ js: ".global.js" }),
    target: "es2020",
    platform: "browser",
  },
]);
