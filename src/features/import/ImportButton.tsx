import { useRef, useState } from "react";
import type { Habit } from "../../lib/habit.ts";
import { formatSummary, mergeCsv, parseJsonBackup } from "../../lib/import.ts";

type Props = { habits: Habit[]; onReplace: (habits: Habit[]) => void };

const BUTTON =
  "rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-stone-600 dark:hover:bg-stone-800";

type Message = { kind: "ok" | "error"; text: string };

export function ImportButton({ habits, onReplace }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    const isCsv = file.name.toLowerCase().endsWith(".csv");
    const result = isCsv ? mergeCsv(text, habits) : parseJsonBackup(text);
    if (!result.ok) {
      setMessage({ kind: "error", text: `Nothing was imported. ${result.error}` });
      return;
    }
    if (
      !isCsv &&
      !window.confirm("Importing this backup replaces all your current habits. Continue?")
    ) {
      return;
    }
    onReplace(result.habits);
    setMessage({ kind: "ok", text: formatSummary(result.summary) });
  };

  return (
    <div className="relative">
      <button type="button" onClick={() => input.current?.click()} className={BUTTON}>
        Import
      </button>
      <input
        ref={input}
        type="file"
        accept=".json,.csv,application/json,text/csv"
        aria-label="Import file"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {message ? (
        <p
          role={message.kind === "error" ? "alert" : "status"}
          className="absolute right-0 z-10 mt-1 w-64 rounded-lg border border-stone-300 bg-white p-2 text-sm shadow-md dark:border-stone-600 dark:bg-stone-900"
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
