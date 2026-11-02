import { isRtl } from "../utils/knownLocales";
import { toUTCDate } from "./utcUtil";

// Locale-aware "year + era" (e.g. "101 BCE", "紀元前101年", "101 г. до н. э.")
function _yearWithEra(date: Date, locale: string) {
  let out: string;
  try {
    out = new Intl.DateTimeFormat(locale, {
      year: "numeric",
      era: "short",
      timeZone: "UTC",
    }).format(date);
  } catch {
    out = new Intl.DateTimeFormat("en", {
      year: "numeric",
      era: "short",
      timeZone: "UTC",
    }).format(date);
  }
  return _eraToCE(out, locale);
}

function _eraToCE(text: string, locale: string) {
  return locale.toLowerCase().startsWith("en")
    ? text.replace(/\bBC\b/, "BCE").replace(/\bAD\b/, "CE")
    : text;
}

function _formatYearByLocale(date: Date, locale: string, showEra = false) {
  if (showEra) return _yearWithEra(date, locale);
  switch (locale) {
    case "en":
      return `${date.getUTCFullYear()}`;
    case "ja":
    case "zh":
    case "zh-cn":
    case "zh-tw":
      return `${date.getUTCFullYear()}年`;
    case "ko":
      return `${date.getUTCFullYear()}년`;
    case "ru":
      return `${date.getUTCDate()} г.`;
    default:
      return `${date.getUTCFullYear()}`;
  }
}

function _justShowYear(date: Date) {
  return (
    date.getUTCMonth() === 0 &&
    date.getUTCDate() === 1 &&
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0
  );
}

function _rangeJustShowYear(startDate: Date, endDate: Date) {
  return _justShowYear(startDate) && _justShowYear(endDate);
}

export function smartDateRange(
  startStr: string,
  endStr: string | null = null,
  locale: string
) {
  const start = toUTCDate(startStr);
  const end = endStr ? toUTCDate(endStr) : null;

  const showEra =
    start.getUTCFullYear() <= 0 || (!!end && end.getUTCFullYear() <= 0);
  const fy = (d: Date) =>
    showEra ? _yearWithEra(d, locale) : `${d.getUTCFullYear()}`;
  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) => {
    const out = d.toLocaleDateString(locale, opts);
    return showEra ? _eraToCE(out, locale) : out;
  };

  const monthOptions = { month: "short", timeZone: "UTC" };
  const fullDateOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
    ...(showEra ? { era: "short" } : {}),
  };

  const localeIsRtl = isRtl(locale);

  const startMonth = start.toLocaleDateString(
    locale,
    monthOptions as Intl.DateTimeFormatOptions
  );

  if (
    end &&
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCDate() === end.getUTCDate()
  ) {
    if (localeIsRtl) {
      return `${start.getUTCDate()} \u200E${startMonth} \u200E${fy(start)}`;
    } else {
      return fmt(start, fullDateOptions as Intl.DateTimeFormatOptions);
    }
  }

  if (
    end &&
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth()
  ) {
    if (localeIsRtl) {
      return `${start.getUTCDate()}-${end.getUTCDate()} \u200E${startMonth} \u200E${fy(start)}`;
    } else {
      switch (locale) {
        case "en":
          return `${startMonth} ${start.getUTCDate()}-${end.getUTCDate()}, ${fy(start)}`;
        case "ja":
        case "zh":
        case "zh-cn":
        case "zh-tw":
          return `${_formatYearByLocale(
            start,
            locale,
            showEra
          )}${startMonth}${start.getUTCDate()}~${end.getUTCDate()}日`;
        case "ko":
          return `${_formatYearByLocale(
            start,
            locale,
            showEra
          )}${" "}${startMonth}${start.getUTCDate()}~${end.getUTCDate()}일`;
        case "ru":
          return `${start.getUTCDate()}-${end.getUTCDate()} ${startMonth} ${_formatYearByLocale(
            start,
            locale,
            showEra
          )}`;
        default:
          return `${start.getUTCDate()}-${end.getUTCDate()} ${startMonth} ${fy(start)}`;
      }
    }
  } else if (end) {
    const endMonth = end.toLocaleDateString(
      locale,
      monthOptions as Intl.DateTimeFormatOptions
    );
    if (localeIsRtl) {
      if (_rangeJustShowYear(start, end)) {
        return `\u200E${fy(start)} - \u200E${fy(end)}`;
      } else {
        return `${start.getUTCDate()} \u200E${startMonth} \u200E${fy(start)} - ${end.getUTCDate()} \u200E${endMonth} \u200E${fy(end)}`;
      }
    } else {
      if (_rangeJustShowYear(start, end)) {
        return `${_formatYearByLocale(start, locale, showEra)} - ${_formatYearByLocale(
          end,
          locale,
          showEra
        )}`;
      }
      return `${fmt(start, fullDateOptions as Intl.DateTimeFormatOptions)} - ${fmt(end, fullDateOptions as Intl.DateTimeFormatOptions)}`;
    }
  } else {
    if (_justShowYear(start)) {
      return _formatYearByLocale(start, locale, showEra);
    }
    if (localeIsRtl) {
      return `${start.getUTCDate()} \u200E${startMonth} \u200E${fy(start)}`;
    }
    return fmt(start, fullDateOptions as Intl.DateTimeFormatOptions);
  }
}
