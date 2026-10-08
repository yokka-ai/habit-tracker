import { en, type MessageKey } from "./en.ts";
import { nl } from "./nl.ts";

export type { MessageKey };

export const LOCALES = ["en", "nl"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const CATALOGUES: Record<Locale, Record<MessageKey, string>> = { en, nl };

/** A message to show later: lib code returns these so the UI can translate them. */
export type Params = Record<string, string | number>;
export type Message = { key: MessageKey; params?: Params };

export type Translate = (key: MessageKey, params?: Params) => string;

export const LOCALE_STORAGE_KEY = "habit-tracker:locale";

/** The BCP 47 tag handed to `Intl` for each language. */
const INTL_TAGS: Record<Locale, string> = { en: "en-GB", nl: "nl-NL" };

export function intlLocale(locale: Locale): string {
  return INTL_TAGS[locale];
}

export function isLocale(value: unknown): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

export function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

export function translate(locale: Locale, key: MessageKey, params?: Params): string {
  return interpolate(CATALOGUES[locale][key], params);
}

export function translator(locale: Locale): Translate {
  return (key, params) => translate(locale, key, params);
}

export function translateMessage(t: Translate, message: Message): string {
  return t(message.key, message.params);
}

/** `key.one` or `key.other` depending on `count`, with `{count}` filled in. */
export function plural(
  locale: Locale,
  key: "import.habits" | "import.checkIns" | "unit.day",
  count: number,
): string {
  const rule = new Intl.PluralRules(intlLocale(locale)).select(count) === "one" ? "one" : "other";
  return translate(locale, `${key}.${rule}`, { count });
}

/** The first language in the browser's preference list that the app has; English otherwise. */
export function detectLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const base = language.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

export function readStoredLocale(storage: Pick<Storage, "getItem">): Locale | null {
  try {
    const value = storage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

export function storeLocale(storage: Pick<Storage, "setItem">, locale: Locale) {
  try {
    storage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for this visit only.
  }
}

/** Day label such as "3 March" / "3 maart", from a `YYYY-MM-DD` date. */
export function formatDay(locale: Locale, day: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(utcDate(day));
}

export function monthName(locale: Locale, day: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { month: "long", timeZone: "UTC" }).format(
    utcDate(day),
  );
}

export function weekdayName(locale: Locale, day: string, style: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { weekday: style, timeZone: "UTC" }).format(
    utcDate(day),
  );
}

function utcDate(day: string): Date {
  const [year, month, date] = day.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(year, month - 1, date));
}

/** Weekday name for an index where 0 is Sunday. */
export function weekdayNameByIndex(locale: Locale, index: number): string {
  // 2023-01-01 was a Sunday.
  return weekdayName(locale, `2023-01-${String(1 + index).padStart(2, "0")}`);
}
