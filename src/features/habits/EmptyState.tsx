import { STARTER_HABITS } from "../../lib/starter-habits.ts";
import { useI18n } from "../i18n/I18nProvider.tsx";

type Props = { onPick: (name: string) => void };

export function EmptyState({ onPick }: Props) {
  const { t } = useI18n();
  return (
    <section
      aria-labelledby="empty-title"
      className="rounded-xl border border-dashed border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-900 px-6 py-12 text-center"
    >
      <h2 id="empty-title" className="text-lg font-medium">
        {t("empty.title")}
      </h2>
      <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{t("empty.body")}</p>
      <ul aria-label={t("empty.starters")} className="mt-6 flex flex-wrap justify-center gap-2">
        {STARTER_HABITS.map((key) => (
          <li key={key}>
            <button
              type="button"
              onClick={() => onPick(t(key))}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-600 dark:hover:bg-stone-800"
            >
              {t(key)}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
