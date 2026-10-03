import { type KeyboardEvent, useState } from "react";
import { normalizeCategory } from "../../lib/category.ts";
import { type Habit, MAX_HABIT_NAME_LENGTH, validateHabitName } from "../../lib/habit.ts";

import { CategoryInput } from "./CategoryInput.tsx";

type Props = {
  habits: Habit[];
  onEdit: (id: string, name: string, category?: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
};

const buttonClass =
  "rounded-lg border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-stone-600 dark:hover:bg-stone-800";

export function HabitList({ habits, onEdit, onDelete, onArchive }: Props) {
  return (
    <ul aria-label="Habits" className="space-y-2">
      {habits.map((habit) => (
        <HabitRow
          key={habit.id}
          habit={habit}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
        />
      ))}
    </ul>
  );
}

type RowProps = {
  habit: Habit;
  onEdit: (id: string, name: string, category?: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
};

function HabitRow({ habit, onEdit, onDelete, onArchive }: RowProps) {
  const [mode, setMode] = useState<"view" | "edit" | "confirm">("view");
  const [value, setValue] = useState(habit.name);
  const [category, setCategory] = useState(habit.category ?? "");
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setValue(habit.name);
    setCategory(habit.category ?? "");
    setError(null);
    setMode("edit");
  }

  function save() {
    const result = validateHabitName(value);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onEdit(habit.id, result.name, normalizeCategory(category));
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
    <li className="rounded-lg border border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
      {mode === "edit" ? (
        <div>
          <div className="flex gap-2">
            <label htmlFor={`rename-${habit.id}`} className="sr-only">
              Rename habit
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
              Save
            </button>
            <button type="button" onClick={() => setMode("view")} className={buttonClass}>
              Cancel
            </button>
          </div>
          {error ? (
            <p
              id={`rename-${habit.id}-error`}
              role="alert"
              className="mt-2 text-sm text-red-700 dark:text-red-400"
            >
              {error}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 break-words">{habit.name}</span>
          {habit.category ? (
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs dark:bg-stone-800">
              {habit.category}
            </span>
          ) : null}
          {mode === "confirm" ? (
            <>
              <span className="text-sm">Delete this habit?</span>
              <button
                type="button"
                onClick={() => onDelete(habit.id)}
                aria-label={`Confirm delete ${habit.name}`}
                className={buttonClass}
              >
                Delete
              </button>
              <button type="button" onClick={() => setMode("view")} className={buttonClass}>
                Keep
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={startEdit}
                aria-label={`Edit ${habit.name}`}
                className={buttonClass}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onArchive(habit.id)}
                aria-label={`Archive ${habit.name}`}
                className={buttonClass}
              >
                Archive
              </button>
              <button
                type="button"
                onClick={() => setMode("confirm")}
                aria-label={`Delete ${habit.name}`}
                className={buttonClass}
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </li>
  );
}
