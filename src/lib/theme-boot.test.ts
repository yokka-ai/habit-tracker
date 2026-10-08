import { afterEach, describe, expect, it, vi } from "vitest";
import html from "../../index.html?raw";
import { THEME_STORAGE_KEY } from "./theme.ts";

function inlineScript(): string {
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!match?.[1]) throw new Error("index.html has no inline theme script");
  return match[1];
}

function runBootScript(stored: string | null, systemDark: boolean) {
  window.localStorage.clear();
  if (stored) window.localStorage.setItem(THEME_STORAGE_KEY, stored);
  vi.stubGlobal("matchMedia", () => ({ matches: systemDark }));
  window.matchMedia = (() => ({ matches: systemDark })) as unknown as typeof window.matchMedia;
  new Function(inlineScript())();
}

afterEach(() => {
  document.documentElement.classList.remove("dark");
  document.documentElement.style.colorScheme = "";
  vi.unstubAllGlobals();
});

describe("inline theme script", () => {
  it("runs before the app module loads", () => {
    expect(html.indexOf("<script>")).toBeLessThan(html.indexOf('type="module"'));
  });

  it("applies a saved dark theme", () => {
    runBootScript("dark", false);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("keeps a saved light theme even when the system is dark", () => {
    runBootScript("light", true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("follows the system when nothing is saved", () => {
    runBootScript(null, true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
