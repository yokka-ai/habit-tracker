export type Habit = {
  id: string;
  name: string;
  createdAt: string;
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

export function createHabit(name: string, now: Date = new Date()): Habit {
  return { id: crypto.randomUUID(), name, createdAt: now.toISOString() };
}
