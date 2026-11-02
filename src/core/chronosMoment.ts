import { ChronosSettings } from "../utils/types";
import { moment } from "vis-timeline/standalone";

const chronosMomentInstance = (moment as any).clone?.() || moment;

export function chronosMoment(date: Date, settings: ChronosSettings) {
  const m = chronosMomentInstance(date).locale(settings.selectedLocale);
  return settings.useUtc ? m.utc() : m;
}
