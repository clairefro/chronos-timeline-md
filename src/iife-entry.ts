// IIFE entry point - exports all necessary functions for sandbox usage
import { ChronosTimeline } from "./core/ChronosTimeline";
import { parseChronos, renderChronos, attachChronosStyles } from "./index";

// Import version from package.json
// @ts-ignore
import pkg from "../package.json" assert { type: "json" };

// Add version to ChronosTimeline class
ChronosTimeline.version = pkg.version;

// Create a complete library object with all the exports the sandbox expects
const ChronosTimelineLibrary = {
  ChronosTimeline,
  parseChronos,
  renderChronos,
  attachChronosStyles,
};

// Export the complete library for IIFE build
export default ChronosTimelineLibrary;
