import type { Habit } from "./habit.ts";

/** Fixed palette. Each fill is a -700 shade, so white text on it keeps 4.5:1 contrast or better. */
export const PALETTE = [
  { id: "emerald", label: "Green", fill: "bg-emerald-700", ring: "border-emerald-700" },
  { id: "sky", label: "Blue", fill: "bg-sky-700", ring: "border-sky-700" },
  { id: "violet", label: "Purple", fill: "bg-violet-700", ring: "border-violet-700" },
  { id: "pink", label: "Pink", fill: "bg-pink-700", ring: "border-pink-700" },
  { id: "red", label: "Red", fill: "bg-red-700", ring: "border-red-700" },
  { id: "orange", label: "Orange", fill: "bg-orange-700", ring: "border-orange-700" },
  { id: "amber", label: "Amber", fill: "bg-amber-700", ring: "border-amber-700" },
  { id: "teal", label: "Teal", fill: "bg-teal-700", ring: "border-teal-700" },
] as const;

export type HabitColor = (typeof PALETTE)[number]["id"];

export const DEFAULT_COLOR: HabitColor = "emerald";

export const EMOJI_CHOICES = [
  "💧",
  "📖",
  "🚶",
  "🧘",
  "✍️",
  "😴",
  "🏃",
  "🍎",
  "🥗",
  "💪",
  "🧹",
  "🎸",
  "🎨",
  "💻",
  "🌱",
  "☀️",
  "🦷",
  "💊",
  "🧠",
  "📵",
  "🛏️",
  "🚴",
  "🍵",
  "🙏",
] as const;

export function isHabitColor(value: unknown): value is HabitColor {
  return PALETTE.some((entry) => entry.id === value);
}

export function paletteEntry(color: string | undefined) {
  return PALETTE.find((entry) => entry.id === color) ?? PALETTE[0];
}

/** Keeps only an emoji from the offered list; anything else means "no emoji". */
export function normalizeEmoji(input: string | undefined): string | undefined {
  return EMOJI_CHOICES.find((emoji) => emoji === input);
}

export const STORAGE_VERSION = 2;

type StoredHabit = Omit<Habit, "color"> & { color?: unknown };

/**
 * Brings stored habits up to the current storage version. Version 1 habits had no
 * colour, so they get the default one; unknown colours and emoji are dropped.
 */
export function migrateHabits(version: number, habits: StoredHabit[]): Habit[] {
  if (version > STORAGE_VERSION) return habits as Habit[];
  return habits.map((habit) => {
    const { color, emoji, ...rest } = habit as StoredHabit & { emoji?: unknown };
    const valid = normalizeEmoji(typeof emoji === "string" ? emoji : undefined);
    const migrated: Habit = { ...rest, color: isHabitColor(color) ? color : DEFAULT_COLOR };
    return valid ? { ...migrated, emoji: valid } : migrated;
  });
}
