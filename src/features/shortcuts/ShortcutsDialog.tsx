import { useEffect, useRef } from "react";
import { SHORTCUT_LIST } from "../../lib/shortcuts.ts";
import { useI18n } from "../i18n/I18nProvider.tsx";

type Props = { open: boolean; onClose: () => void };

export function ShortcutsDialog({ open, onClose }: Props) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.() ?? dialog.setAttribute("open", "");
    if (!open && dialog.open) dialog.close?.() ?? dialog.removeAttribute("open");
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby="shortcuts-title"
      onClose={onClose}
      onCancel={onClose}
      className="m-auto w-full max-w-md rounded-lg border border-stone-300 bg-white p-6 text-stone-900 backdrop:bg-black/40 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
    >
      <h2 id="shortcuts-title" className="mb-4 text-lg font-semibold">
        {t("shortcuts.title")}
      </h2>
      <dl className="space-y-2">
        {SHORTCUT_LIST.map((item) => (
          <div key={item.keys} className="flex items-center justify-between gap-4">
            <dt>
              <kbd className="rounded border border-stone-300 bg-stone-100 px-2 py-0.5 font-mono text-sm dark:border-stone-600 dark:bg-stone-800">
                {item.keys}
              </kbd>
            </dt>
            <dd className="text-sm">{t(item.description)}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        onClick={onClose}
        className="mt-6 rounded-lg border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-stone-600 dark:hover:bg-stone-800"
      >
        {t("shortcuts.close")}
      </button>
    </dialog>
  );
}
