import type { ThemePreference } from "../../lib/theme.ts";
import { useI18n } from "../i18n/I18nProvider.tsx";

type Props = { preference: ThemePreference; onCycle: () => void };

const LABELS = {
  system: "theme.system",
  light: "theme.light",
  dark: "theme.dark",
} as const;

export function ThemeToggle({ preference, onCycle }: Props) {
  const { t } = useI18n();
  const label = t(LABELS[preference]);
  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label={t("theme.aria", { theme: label })}
      className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-stone-600 dark:hover:bg-stone-800"
    >
      {t("theme.button", { theme: label })}
    </button>
  );
}
