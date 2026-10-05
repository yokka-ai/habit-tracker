import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHabit, type Habit, setReminder, toggleCheckIn } from "./habit.ts";
import { isValidTime, msUntilNext, scheduleReminders } from "./reminders.ts";

describe("isValidTime", () => {
  it("accepts HH:MM and rejects the rest", () => {
    expect(isValidTime("08:30")).toBe(true);
    expect(isValidTime("23:59")).toBe(true);
    expect(isValidTime("24:00")).toBe(false);
    expect(isValidTime("8:30")).toBe(false);
    expect(isValidTime("")).toBe(false);
  });
});

describe("msUntilNext", () => {
  it("counts to later today", () => {
    expect(msUntilNext("09:00", new Date(2026, 9, 5, 8, 0, 0))).toBe(3_600_000);
  });

  it("rolls over to tomorrow when the time has passed", () => {
    expect(msUntilNext("07:00", new Date(2026, 9, 5, 8, 0, 0))).toBe(23 * 3_600_000);
  });

  it("rolls over exactly at the time", () => {
    expect(msUntilNext("08:00", new Date(2026, 9, 5, 8, 0, 0))).toBe(24 * 3_600_000);
  });
});

describe("setReminder", () => {
  it("sets and clears a reminder", () => {
    const habit = createHabit("Drink water");
    const set = setReminder([habit], habit.id, "09:00");
    expect(set[0]?.reminder).toBe("09:00");
    expect(setReminder(set, habit.id, undefined)[0]).not.toHaveProperty("reminder");
  });
});

describe("scheduleReminders", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 5, 8, 0, 0));
  });
  afterEach(() => vi.useRealTimers());

  const withReminder = (): Habit => {
    const habit = createHabit("Drink water");
    return { ...habit, reminder: "09:00" };
  };

  it("notifies at the set time, then again the next day", () => {
    const notify = vi.fn();
    scheduleReminders([withReminder()], { notify });
    vi.advanceTimersByTime(59 * 60_000);
    expect(notify).not.toHaveBeenCalled();
    vi.advanceTimersByTime(60_000);
    expect(notify).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(24 * 3_600_000);
    expect(notify).toHaveBeenCalledTimes(2);
  });

  it("stays quiet when the habit is done today", () => {
    const habit = withReminder();
    const [done] = toggleCheckIn([habit], habit.id, "2026-10-05") as [Habit];
    const notify = vi.fn();
    scheduleReminders([done], { notify });
    vi.advanceTimersByTime(3_600_000);
    expect(notify).not.toHaveBeenCalled();
  });

  it("skips archived habits and habits without a reminder", () => {
    const notify = vi.fn();
    scheduleReminders([{ ...withReminder(), archived: true }, createHabit("Stretch")], { notify });
    vi.advanceTimersByTime(3_600_000);
    expect(notify).not.toHaveBeenCalled();
  });

  it("stops when cancelled", () => {
    const notify = vi.fn();
    const cancel = scheduleReminders([withReminder()], { notify });
    cancel();
    vi.advanceTimersByTime(3_600_000);
    expect(notify).not.toHaveBeenCalled();
  });
});
