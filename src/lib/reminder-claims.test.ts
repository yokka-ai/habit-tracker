import { describe, expect, it } from "vitest";
import { claimReminder } from "./reminder-claims.ts";

function memoryStore() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

describe("claimReminder", () => {
  it("lets only the first tab claim a habit's reminder for a day", () => {
    const store = memoryStore();
    expect(claimReminder("a", "2026-10-09", store)).toBe(true);
    expect(claimReminder("a", "2026-10-09", store)).toBe(false);
  });

  it("allows another habit, and the same habit on the next day", () => {
    const store = memoryStore();
    claimReminder("a", "2026-10-09", store);
    expect(claimReminder("b", "2026-10-09", store)).toBe(true);
    expect(claimReminder("a", "2026-10-10", store)).toBe(true);
  });

  it("recovers from corrupt saved data", () => {
    const store = memoryStore();
    store.setItem("habit-tracker:reminders-sent", "not json");
    expect(claimReminder("a", "2026-10-09", store)).toBe(true);
  });

  it("still notifies when storage is unavailable", () => {
    expect(claimReminder("a", "2026-10-09", undefined)).toBe(true);
  });
});
