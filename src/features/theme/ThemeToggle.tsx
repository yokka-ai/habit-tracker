import type { ThemePreference } from "../../lib/theme.ts";

type Props = { preference: ThemePreference; onCycle: () => void };

const LABELS: Record<ThemePreference, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

export function ThemeToggle({ preference, onCycle }: Props) {
  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label={`Theme: ${LABELS[preference]}. Switch theme`}
      className="ml-auto rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-stone-600 dark:hover:bg-stone-800"
    >
      Theme: {LABELS[preference]}
    </button>
  );
}
