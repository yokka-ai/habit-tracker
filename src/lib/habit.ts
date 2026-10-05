import { DEFAULT_COLOR, type HabitColor } from "./appearance.ts";

export type Habit = {
  id: string;
  name: string;
  createdAt: string;
  category?: string;
  archived?: boolean;
  color: HabitColor;
  emoji?: string;
  /** Local days (`YYYY-MM-DD`) this habit was done, sorted and without duplicates. */
  checkIns?: string[];
};

export type Appearance = { color: HabitColor; emoji?: string };

export const MAX_HABIT_NAME_LENGTH = 60;

export type NameResult = { ok: true; name: string } | { ok: false; error: string };

export function validateHabitName(input: string): NameResult {
  const name = input.trim();
  if (name.length === 0) {
    return { ok: false, error: "Enter a habit name." };
  }
  if (name.length > MAX_HABIT_NAME_LENGTH) {
    return { ok: false, error: `Keep the name to ${MAX_HABIT_NAME_LENGTH} characters or fewer.` };
  }
  return { ok: true, name };
}

export function createHabit(
  name: string,
  category?: string,
  appearance: Appearance = { color: DEFAULT_COLOR },
  now: Date = new Date(),
): Habit {
  const habit: Habit = {
    id: crypto.randomUUID(),
    name,
    createdAt: now.toISOString(),
    color: appearance.color,
  };
  const withEmoji = appearance.emoji ? { ...habit, emoji: appearance.emoji } : habit;
  return category ? { ...withEmoji, category } : withEmoji;
}

export function editHabit(
  habits: Habit[],
  id: string,
  changes: { name: string; category?: string; color?: HabitColor; emoji?: string },
): Habit[] {
  return habits.map((habit) => {
    if (habit.id !== id) return habit;
    const { category: _category, emoji: _emoji, ...rest } = habit;
    const edited: Habit = { ...rest, name: changes.name, color: changes.color ?? habit.color };
    const withEmoji = changes.emoji ? { ...edited, emoji: changes.emoji } : edited;
    return changes.category ? { ...withEmoji, category: changes.category } : withEmoji;
  });
}

export function renameHabit(habits: Habit[], id: string, name: string): Habit[] {
  return habits.map((habit) => (habit.id === id ? { ...habit, name } : habit));
}

export function removeHabit(habits: Habit[], id: string): Habit[] {
  return habits.filter((habit) => habit.id !== id);
}

export function archiveHabit(habits: Habit[], id: string): Habit[] {
  return habits.map((habit) => (habit.id === id ? { ...habit, archived: true } : habit));
}

export function restoreHabit(habits: Habit[], id: string): Habit[] {
  return habits.map((habit) => {
    if (habit.id !== id) return habit;
    const { archived: _archived, ...rest } = habit;
    return rest;
  });
}

export function activeHabits(habits: Habit[]): Habit[] {
  return habits.filter((habit) => !habit.archived);
}

export function archivedHabits(habits: Habit[]): Habit[] {
  return habits.filter((habit) => habit.archived);
}

/** Moves the habit `id` to the position currently held by `targetId`. */
export function moveHabit(habits: Habit[], id: string, targetId: string): Habit[] {
  const from = habits.findIndex((habit) => habit.id === id);
  const to = habits.findIndex((habit) => habit.id === targetId);
  if (from === -1 || to === -1 || from === to) return habits;
  const next = [...habits];
  const [moved] = next.splice(from, 1);
  if (moved) next.splice(to, 0, moved);
  return next;
}

export function isCheckedIn(habit: Habit, day: string): boolean {
  return habit.checkIns?.includes(day) ?? false;
}

/** Marks `day` done for habit `id`, or un-marks it if it already was. */
export function toggleCheckIn(habits: Habit[], id: string, day: string): Habit[] {
  return habits.map((habit) => {
    if (habit.id !== id) return habit;
    const days = habit.checkIns ?? [];
    const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort();
    return { ...habit, checkIns: next };
  });
}
