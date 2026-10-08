import { type KeyboardEvent, useState } from "react";
import { type HabitColor, normalizeEmoji, paletteEntry } from "../../lib/appearance.ts";
import { normalizeCategory } from "../../lib/category.ts";
import {
  type Habit,
  isCheckedIn,
  MAX_HABIT_NAME_LENGTH,
  validateHabitName,
} from "../../lib/habit.ts";
import { type Message, plural, translateMessage } from "../../lib/i18n/index.ts";
import { bestStreak, currentStreak } from "../../lib/streak.ts";

import { useI18n } from "../i18n/I18nProvider.tsx";
import { AppearancePicker } from "./AppearancePicker.tsx";
import { CategoryInput } from "./CategoryInput.tsx";

type Props = {
  habits: Habit[];
  onEdit: (id: string, name: string, category?: string, color?: HabitColor, emoji?: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onMove: (id: string, targetId: string) => void;
  onToggle: (id: string) => void;
  onSetReminder: (id: string, time: string | undefined) => void;
  today: string;
};

const buttonClass =
  "rounded-lg border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-stone-600 dark:hover:bg-stone-800";

export function HabitList({
  habits,
  onEdit,
  onDelete,
  onArchive,
  onMove,
  onToggle,
  onSetReminder,
  today,
}: Props) {
  const { t } = useI18n();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  return (
    <ul aria-label={t("habits.list")} className="space-y-2">
      {habits.map((habit, index) => {
        const prev = habits[index - 1];
        const next = habits[index + 1];
        return (
          <HabitRow
            key={habit.id}
            habit={habit}
            onEdit={onEdit}
            onDelete={onDelete}
            onArchive={onArchive}
            onToggle={onToggle}
            onSetReminder={onSetReminder}
            today={today}
            onMoveUp={prev ? () => onMove(habit.id, prev.id) : undefined}
            onMoveDown={next ? () => onMove(habit.id, next.id) : undefined}
            onDragStart={() => setDraggingId(habit.id)}
            onDragEnd={() => setDraggingId(null)}
            onDropOn={() => {
              if (draggingId) onMove(draggingId, habit.id);
              setDraggingId(null);
            }}
            dragging={draggingId === habit.id}
          />
        );
      })}
    </ul>
  );
}

type RowProps = {
  habit: Habit;
  onEdit: (id: string, name: string, category?: string, color?: HabitColor, emoji?: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onToggle: (id: string) => void;
  onSetReminder: (id: string, time: string | undefined) => void;
  today: string;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropOn: () => void;
  dragging: boolean;
};

function HabitRow({
  habit,
  onEdit,
  onDelete,
  onArchive,
  onToggle,
  onSetReminder,
  today,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragEnd,
  onDropOn,
  dragging,
}: RowProps) {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<"view" | "edit" | "confirm">("view");
  const [value, setValue] = useState(habit.name);
  const [category, setCategory] = useState(habit.category ?? "");
  const [color, setColor] = useState<HabitColor>(habit.color);
  const [emoji, setEmoji] = useState(habit.emoji ?? "");
  const [reminder, setReminder] = useState(habit.reminder ?? "");
  const [error, setError] = useState<Message | null>(null);
  const done = isCheckedIn(habit, today);
  const streak = currentStreak(habit.checkIns, today);
  const best = bestStreak(habit.checkIns);
  const days = (count: number) => plural(locale, "unit.day", count);

  function startEdit() {
    setValue(habit.name);
    setCategory(habit.category ?? "");
    setColor(habit.color);
    setEmoji(habit.emoji ?? "");
    setReminder(habit.reminder ?? "");
    setError(null);
    setMode("edit");
  }

  function save() {
    const result = validateHabitName(value);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onEdit(habit.id, result.name, normalizeCategory(category), color, normalizeEmoji(emoji));
    if (reminder !== (habit.reminder ?? "")) onSetReminder(habit.id, reminder || undefined);
    setMode("view");
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      save();
    } else if (event.key === "Escape") {
      setMode("view");
    }
  }

  return (
    <li
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDropOn();
      }}
      className={`rounded-lg border border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900 ${dragging ? "opacity-50" : ""}`}
    >
      {mode === "edit" ? (
        <div>
          <div className="flex gap-2">
            <label htmlFor={`rename-${habit.id}`} className="sr-only">
              {t("habit.rename")}
            </label>
            <input
              id={`rename-${habit.id}`}
              type="text"
              value={value}
              maxLength={MAX_HABIT_NAME_LENGTH + 20}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={handleKeyDown}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `rename-${habit.id}-error` : undefined}
              className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-1 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
            />
            <CategoryInput
              id={`category-${habit.id}`}
              value={category}
              onChange={setCategory}
              onKeyDown={handleKeyDown}
              className="w-32 rounded-lg border border-stone-300 bg-white px-3 py-1 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
            />
            <button type="button" onClick={save} className={buttonClass}>
              {t("habit.save")}
            </button>
            <button type="button" onClick={() => setMode("view")} className={buttonClass}>
              {t("habit.cancel")}
            </button>
          </div>
          <AppearancePicker
            idPrefix={`edit-${habit.id}`}
            color={color}
            emoji={emoji}
            onColor={setColor}
            onEmoji={setEmoji}
          />
          <div className="mt-2 flex items-center gap-2 text-sm">
            <label htmlFor={`reminder-${habit.id}`}>{t("habit.reminderTime")}</label>
            <input
              id={`reminder-${habit.id}`}
              type="time"
              value={reminder}
              onChange={(event) => setReminder(event.target.value)}
              onKeyDown={handleKeyDown}
              className="rounded-lg border border-stone-300 bg-white px-2 py-1 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
            />
            {reminder ? (
              <button type="button" onClick={() => setReminder("")} className={buttonClass}>
                {t("habit.clearReminder")}
              </button>
            ) : null}
          </div>
          {error ? (
            <p
              id={`rename-${habit.id}-error`}
              role="alert"
              className="mt-2 text-sm text-red-700 dark:text-red-400"
            >
              {translateMessage(t, error)}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", habit.id);
              onDragStart();
            }}
            onDragEnd={onDragEnd}
            title={t("habit.dragToReorder")}
            data-drag-handle={habit.name}
            aria-hidden="true"
            className="cursor-grab select-none px-1 text-stone-400"
          >
            ⠿
          </span>
          <span
            aria-hidden="true"
            className={`h-6 w-1.5 shrink-0 rounded-full ${paletteEntry(habit.color).fill}`}
          />
          <button
            type="button"
            onClick={() => onToggle(habit.id)}
            aria-pressed={done}
            aria-label={t("habit.doneToday", { name: habit.name })}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${done ? "border-emerald-600 bg-emerald-600 text-white" : "border-stone-300 bg-white dark:border-stone-600 dark:bg-stone-900"}`}
          >
            <span aria-hidden="true">{done ? "✓" : ""}</span>
          </button>
          {habit.emoji ? <span aria-hidden="true">{habit.emoji}</span> : null}
          <span className="min-w-0 flex-1 break-words">{habit.name}</span>
          <span
            title={t("habit.bestStreak", { count: best, unit: days(best) })}
            className="text-xs text-stone-600 dark:text-stone-400"
          >
            <span aria-hidden="true">🔥 </span>
            <span className="sr-only">{t("habit.currentStreak")}</span>
            {streak} {days(streak)}
            <span className="ml-1 text-[11px] text-stone-500 dark:text-stone-400">
              {t("habit.best", { count: best })}
            </span>
          </span>
          {habit.reminder ? (
            <span className="text-xs text-stone-500 dark:text-stone-400">
              <span aria-hidden="true">🔔 </span>
              <span className="sr-only">{t("habit.reminderAt")}</span>
              {habit.reminder}
            </span>
          ) : null}
          {habit.category ? (
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs dark:bg-stone-800">
              {habit.category}
            </span>
          ) : null}
          {mode === "confirm" ? (
            <>
              <span className="text-sm">{t("habit.confirmDelete")}</span>
              <button
                type="button"
                onClick={() => onDelete(habit.id)}
                aria-label={t("habit.confirmDeleteAria", { name: habit.name })}
                className={buttonClass}
              >
                {t("habit.delete")}
              </button>
              <button type="button" onClick={() => setMode("view")} className={buttonClass}>
                {t("habit.keep")}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onMoveUp}
                disabled={!onMoveUp}
                aria-label={t("habit.moveUp", { name: habit.name })}
                className={`${buttonClass} disabled:opacity-40`}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                disabled={!onMoveDown}
                aria-label={t("habit.moveDown", { name: habit.name })}
                className={`${buttonClass} disabled:opacity-40`}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={startEdit}
                aria-label={t("habit.editAria", { name: habit.name })}
                className={buttonClass}
              >
                {t("habit.edit")}
              </button>
              <button
                type="button"
                onClick={() => onArchive(habit.id)}
                aria-label={t("habit.archiveAria", { name: habit.name })}
                className={buttonClass}
              >
                {t("habit.archive")}
              </button>
              <button
                type="button"
                onClick={() => setMode("confirm")}
                aria-label={t("habit.deleteAria", { name: habit.name })}
                className={buttonClass}
              >
                {t("habit.delete")}
              </button>
            </>
          )}
        </div>
      )}
    </li>
  );
}
