import { useState } from "react";
import type { Habit } from "../../lib/habit.ts";
import { useI18n } from "../i18n/I18nProvider.tsx";

type Props = {
  habits: Habit[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
};

const buttonClass =
  "rounded-lg border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-stone-600 dark:hover:bg-stone-800";

export function ArchivedSection({ habits, onRestore, onDelete }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  if (habits.length === 0) return null;

  return (
    <section className="mt-8">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="archived-habits"
        className={buttonClass}
      >
        {t("archived.button", { count: habits.length })}
      </button>
      {open ? (
        <ul id="archived-habits" aria-label={t("archived.list")} className="mt-3 space-y-2">
          {habits.map((habit) => (
            <li
              key={habit.id}
              className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-3 text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400"
            >
              <span className="min-w-0 flex-1 break-words">{habit.name}</span>
              {confirming === habit.id ? (
                <>
                  <span className="text-sm">{t("habit.confirmDelete")}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirming(null);
                      onDelete(habit.id);
                    }}
                    aria-label={t("habit.confirmDeleteAria", { name: habit.name })}
                    className={buttonClass}
                  >
                    {t("habit.delete")}
                  </button>
                  <button type="button" onClick={() => setConfirming(null)} className={buttonClass}>
                    {t("habit.keep")}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onRestore(habit.id)}
                    aria-label={t("archived.restoreAria", { name: habit.name })}
                    className={buttonClass}
                  >
                    {t("archived.restore")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(habit.id)}
                    aria-label={t("habit.deleteAria", { name: habit.name })}
                    className={buttonClass}
                  >
                    {t("habit.delete")}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
