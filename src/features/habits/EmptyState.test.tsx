import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "./EmptyState.tsx";

describe("EmptyState", () => {
  it("offers starter habits and reports the one clicked", () => {
    const onPick = vi.fn();
    render(<EmptyState onPick={onPick} />);
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(4);
    fireEvent.click(screen.getByRole("button", { name: "Drink water" }));
    expect(onPick).toHaveBeenCalledWith("Drink water");
  });
});
