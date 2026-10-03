import { describe, expect, it } from "vitest";
import {
  DEFAULT_COLOR,
  EMOJI_CHOICES,
  migrateHabits,
  normalizeEmoji,
  PALETTE,
  STORAGE_VERSION,
} from "./appearance.ts";

const v1 = { id: "a", name: "Drink water", createdAt: "2026-01-01T00:00:00.000Z" };

describe("palette and emoji list", () => {
  it("offers 8 colours and about 24 emoji", () => {
    expect(PALETTE).toHaveLength(8);
    expect(EMOJI_CHOICES).toHaveLength(24);
  });

  it("only accepts emoji from the list", () => {
    expect(normalizeEmoji("💧")).toBe("💧");
    expect(normalizeEmoji("x")).toBeUndefined();
    expect(normalizeEmoji("")).toBeUndefined();
  });
});

describe("migrateHabits", () => {
  it("is on storage version 2", () => {
    expect(STORAGE_VERSION).toBe(2);
  });

  it("gives version 1 habits the default colour and keeps their fields", () => {
    expect(migrateHabits(1, [{ ...v1, category: "Health", archived: true }])).toEqual([
      { ...v1, category: "Health", archived: true, color: DEFAULT_COLOR },
    ]);
  });

  it("keeps a valid colour and emoji and drops invalid ones", () => {
    const [kept, dropped] = migrateHabits(2, [
      { ...v1, color: "pink", emoji: "📖" } as never,
      { ...v1, color: "chartreuse", emoji: "nope" } as never,
    ]);
    expect(kept).toMatchObject({ color: "pink", emoji: "📖" });
    expect(dropped).toMatchObject({ color: DEFAULT_COLOR });
    expect(dropped).not.toHaveProperty("emoji");
  });
});
