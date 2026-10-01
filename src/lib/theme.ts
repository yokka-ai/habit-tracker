export type ThemePreference = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "habit-tracker:theme";

const ORDER: ThemePreference[] = ["system", "light", "dark"];

export function parseThemePreference(value: string | null | undefined): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}

export function nextThemePreference(current: ThemePreference): ThemePreference {
  return ORDER[(ORDER.indexOf(current) + 1) % ORDER.length] ?? "system";
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): "light" | "dark" {
  if (preference === "system") return systemPrefersDark ? "dark" : "light";
  return preference;
}

export function readStoredTheme(storage: Pick<Storage, "getItem">): ThemePreference {
  try {
    return parseThemePreference(storage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

export function storeTheme(storage: Pick<Storage, "setItem">, preference: ThemePreference) {
  try {
    storage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for this visit only.
  }
}
