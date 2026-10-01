import { describe, expect, it } from "vitest";
import {
  nextThemePreference,
  parseThemePreference,
  readStoredTheme,
  resolveTheme,
  storeTheme,
  THEME_STORAGE_KEY,
} from "./theme.ts";

function fakeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
}

describe("parseThemePreference", () => {
  it("accepts known values and falls back to system", () => {
    expect(parseThemePreference("light")).toBe("light");
    expect(parseThemePreference("dark")).toBe("dark");
    expect(parseThemePreference("system")).toBe("system");
    expect(parseThemePreference("purple")).toBe("system");
    expect(parseThemePreference(null)).toBe("system");
  });
});

describe("nextThemePreference", () => {
  it("cycles system, light, dark", () => {
    expect(nextThemePreference("system")).toBe("light");
    expect(nextThemePreference("light")).toBe("dark");
    expect(nextThemePreference("dark")).toBe("system");
  });
});

describe("resolveTheme", () => {
  it("follows the system only when the preference is system", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});

describe("theme storage", () => {
  it("round-trips the preference", () => {
    const storage = fakeStorage();
    storeTheme(storage, "dark");
    expect(storage.data[THEME_STORAGE_KEY]).toBe("dark");
    expect(readStoredTheme(storage)).toBe("dark");
  });

  it("defaults to system when nothing is stored or storage throws", () => {
    expect(readStoredTheme(fakeStorage())).toBe("system");
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readStoredTheme(broken)).toBe("system");
    expect(() => storeTheme(broken, "dark")).not.toThrow();
  });
});
