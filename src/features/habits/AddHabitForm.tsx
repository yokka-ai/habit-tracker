import { type FormEvent, useState } from "react";
import { DEFAULT_COLOR, type HabitColor, normalizeEmoji } from "../../lib/appearance.ts";
import { normalizeCategory } from "../../lib/category.ts";
import { type Appearance, MAX_HABIT_NAME_LENGTH, validateHabitName } from "../../lib/habit.ts";
import { AppearancePicker } from "./AppearancePicker.tsx";
import { CategoryInput } from "./CategoryInput.tsx";

type Props = { onAdd: (name: string, category?: string, appearance?: Appearance) => void };

export function AddHabitForm({ onAdd }: Props) {
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState<HabitColor>(DEFAULT_COLOR);
  const [emoji, setEmoji] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const result = validateHabitName(value);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onAdd(result.name, normalizeCategory(category), { color, emoji: normalizeEmoji(emoji) });
    setValue("");
    setCategory("");
    setColor(DEFAULT_COLOR);
    setEmoji("");
    setError(null);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mb-6">
      <div className="flex gap-2">
        <label htmlFor="habit-name" className="sr-only">
          Habit name
        </label>
        <input
          id="habit-name"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Drink water"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "habit-name-error" : undefined}
          className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 py-2 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600"
        />
        <CategoryInput
          id="habit-category"
          value={category}
          onChange={setCategory}
          className="w-32 rounded-lg border border-stone-300 bg-white px-3 py-2 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          Add
        </button>
      </div>
      <AppearancePicker
        idPrefix="new-habit"
        color={color}
        emoji={emoji}
        onColor={setColor}
        onEmoji={setEmoji}
      />
      {error ? (
        <p
          id="habit-name-error"
          role="alert"
          className="mt-2 text-sm text-red-700 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}
      <p className="sr-only">Up to {MAX_HABIT_NAME_LENGTH} characters.</p>
    </form>
  );
}
