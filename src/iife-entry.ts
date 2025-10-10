// IIFE entry point - exports only ChronosTimeline for global usage
import { ChronosTimeline } from "./core/ChronosTimeline";

// Import version from package.json
// @ts-ignore
import pkg from "../package.json" assert { type: "json" };

// Add version to ChronosTimeline class
ChronosTimeline.version = pkg.version;

// Export only ChronosTimeline for IIFE build
export default ChronosTimeline;
