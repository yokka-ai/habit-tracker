import { describe, expect, it } from "vitest";
import { createPieces, prefersReducedMotion, stepPieces } from "./confetti.ts";

describe("confetti", () => {
  it("starts pieces at the bottom centre, moving upwards", () => {
    const pieces = createPieces(1000, 800, 20);
    expect(pieces).toHaveLength(20);
    for (const p of pieces) {
      expect(p.x).toBe(500);
      expect(p.y).toBe(800);
      expect(p.vy).toBeLessThan(0);
    }
  });

  it("pulls pieces down over time", () => {
    const [piece] = createPieces(100, 100, 1);
    const next = stepPieces([piece as NonNullable<typeof piece>])[0];
    expect(next?.vy).toBeGreaterThan(piece?.vy ?? 0);
  });

  it("reads the reduced motion preference", () => {
    expect(prefersReducedMotion()).toBe(false);
  });
});
