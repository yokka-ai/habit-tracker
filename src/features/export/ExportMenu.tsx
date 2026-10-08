import { useState } from "react";
import { exportFilename, toCsv, toJson } from "../../lib/export.ts";
import type { Habit } from "../../lib/habit.ts";
import { useI18n } from "../i18n/I18nProvider.tsx";

type Props = { habits: Habit[] };

const BUTTON =
  "rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-stone-600 dark:hover:bg-stone-800";

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportMenu({ habits }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const save = (extension: "json" | "csv") => {
    if (extension === "json") {
      download(exportFilename("json"), toJson(habits), "application/json");
    } else {
      download(exportFilename("csv"), toCsv(habits), "text/csv");
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className={BUTTON}
      >
        {t("export.button")}
      </button>
      {open ? (
        <div className="absolute right-0 z-10 mt-1 flex w-44 flex-col gap-1 rounded-lg border border-stone-300 bg-white p-1 shadow-md dark:border-stone-600 dark:bg-stone-900">
          <button type="button" onClick={() => save("json")} className={BUTTON}>
            {t("export.json")}
          </button>
          <button type="button" onClick={() => save("csv")} className={BUTTON}>
            {t("export.csv")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
