export type Habit = {
  id: string;
  name: string;
  createdAt: string;
  category?: string;
};

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

export function createHabit(name: string, category?: string, now: Date = new Date()): Habit {
  const habit: Habit = { id: crypto.randomUUID(), name, createdAt: now.toISOString() };
  return category ? { ...habit, category } : habit;
}

export function editHabit(
  habits: Habit[],
  id: string,
  changes: { name: string; category?: string },
): Habit[] {
  return habits.map((habit) => {
    if (habit.id !== id) return habit;
    const { category: _old, ...rest } = habit;
    return changes.category
      ? { ...rest, name: changes.name, category: changes.category }
      : { ...rest, name: changes.name };
  });
}

export function renameHabit(habits: Habit[], id: string, name: string): Habit[] {
  return habits.map((habit) => (habit.id === id ? { ...habit, name } : habit));
}

export function removeHabit(habits: Habit[], id: string): Habit[] {
  return habits.filter((habit) => habit.id !== id);
}
