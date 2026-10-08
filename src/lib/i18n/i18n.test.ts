import { describe, expect, it } from "vitest";
import { en } from "./en.ts";
import {
  CATALOGUES,
  detectLocale,
  formatDay,
  LOCALE_STORAGE_KEY,
  LOCALES,
  plural,
  readStoredLocale,
  storeLocale,
  translate,
  weekdayName,
  weekdayNameByIndex,
} from "./index.ts";

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("catalogues", () => {
  for (const locale of LOCALES) {
    it(`${locale} has exactly the English keys`, () => {
      expect(Object.keys(CATALOGUES[locale]).sort()).toEqual(Object.keys(en).sort());
    });

    it(`${locale} uses the same placeholders as English`, () => {
      for (const key of Object.keys(en) as (keyof typeof en)[]) {
        expect(placeholders(CATALOGUES[locale][key]), key).toEqual(placeholders(en[key]));
      }
    });

    it(`${locale} has no empty messages`, () => {
      for (const [key, text] of Object.entries(CATALOGUES[locale])) {
        expect(text.trim(), key).not.toBe("");
      }
    });
  }
});

describe("translate", () => {
  it("fills in params", () => {
    expect(translate("en", "form.error.tooLong", { max: 60 })).toBe(
      "Keep the name to 60 characters or fewer.",
    );
    expect(translate("nl", "week.range", { from: "1 maart", to: "7 maart" })).toBe(
      "1 maart tot 7 maart",
    );
  });

  it("pluralises per language", () => {
    expect(plural("en", "unit.day", 1)).toBe("day");
    expect(plural("nl", "unit.day", 2)).toBe("dagen");
    expect(plural("nl", "import.checkIns", 1)).toBe("1 afvinking");
    expect(plural("en", "import.habits", 3)).toBe("3 habits");
  });
});

describe("detectLocale", () => {
  it("takes the first supported browser language", () => {
    expect(detectLocale(["fr-FR", "nl-BE", "en"])).toBe("nl");
    expect(detectLocale(["en-US"])).toBe("en");
  });

  it("falls back to English", () => {
    expect(detectLocale(["de", "fr"])).toBe("en");
    expect(detectLocale([])).toBe("en");
  });
});

describe("stored locale", () => {
  it("round-trips and ignores junk", () => {
    const data = new Map<string, string>();
    const storage = {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
    };
    expect(readStoredLocale(storage)).toBeNull();
    storeLocale(storage, "nl");
    expect(readStoredLocale(storage)).toBe("nl");
    data.set(LOCALE_STORAGE_KEY, "xx");
    expect(readStoredLocale(storage)).toBeNull();
  });

  it("survives broken storage", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readStoredLocale(broken)).toBeNull();
    expect(() => storeLocale(broken, "nl")).not.toThrow();
  });
});

describe("date names", () => {
  it("formats days and weekdays with Intl", () => {
    expect(formatDay("en", "2026-03-03")).toBe("3 March");
    expect(formatDay("nl", "2026-03-03")).toBe("3 maart");
    expect(weekdayName("nl", "2026-03-02", "short")).toBe("ma");
    expect(weekdayNameByIndex("en", 0)).toBe("Sunday");
    expect(weekdayNameByIndex("nl", 6)).toBe("zaterdag");
  });

  it("handles a leap day", () => {
    expect(formatDay("nl", "2028-02-29")).toBe("29 februari");
  });
});
