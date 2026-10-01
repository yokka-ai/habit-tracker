import { useEffect, useState } from "react";
import {
  nextThemePreference,
  readStoredTheme,
  resolveTheme,
  storeTheme,
  type ThemePreference,
} from "../../lib/theme.ts";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function systemMedia(): MediaQueryList | null {
  return typeof window.matchMedia === "function" ? window.matchMedia(DARK_QUERY) : null;
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(() =>
    readStoredTheme(window.localStorage),
  );

  useEffect(() => {
    const media = systemMedia();
    const apply = () => {
      const theme = resolveTheme(preference, media?.matches ?? false);
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.style.colorScheme = theme;
    };
    apply();
    media?.addEventListener("change", apply);
    return () => media?.removeEventListener("change", apply);
  }, [preference]);

  function cycle() {
    const next = nextThemePreference(preference);
    storeTheme(window.localStorage, next);
    setPreference(next);
  }

  return { preference, cycle };
}
