import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toJson } from "../../lib/export.ts";
import type { Habit } from "../../lib/habit.ts";
import { ImportButton } from "./ImportButton.tsx";

afterEach(() => vi.restoreAllMocks());

const habit: Habit = {
  id: "1",
  name: "Drink water",
  createdAt: "2026-09-01T08:00:00.000Z",
  color: "emerald",
};

function upload(name: string, content: string) {
  fireEvent.change(screen.getByLabelText("Import file"), {
    target: { files: [new File([content], name)] },
  });
}

describe("ImportButton", () => {
  it("replaces habits from a JSON backup after confirming", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const onReplace = vi.fn();
    render(<ImportButton habits={[]} onReplace={onReplace} />);
    upload("habits.json", toJson([habit]));
    expect(await screen.findByRole("status")).toHaveTextContent("Imported 1 habit, 0 check-ins");
    expect(onReplace).toHaveBeenCalledWith([habit]);
  });

  it("changes nothing when the confirmation is declined", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const onReplace = vi.fn();
    render(<ImportButton habits={[]} onReplace={onReplace} />);
    upload("habits.json", toJson([habit]));
    await waitFor(() => expect(confirm).toHaveBeenCalled());
    expect(onReplace).not.toHaveBeenCalled();
  });

  it("merges a CSV without confirming", async () => {
    const onReplace = vi.fn();
    render(<ImportButton habits={[habit]} onReplace={onReplace} />);
    upload("habits.csv", "habit,date\nDrink water,2026-10-01\n");
    expect(await screen.findByRole("status")).toHaveTextContent("Imported 0 habits, 1 check-in");
    expect(onReplace).toHaveBeenCalledTimes(1);
  });

  it("refuses a bad file with a message", async () => {
    const onReplace = vi.fn();
    render(<ImportButton habits={[]} onReplace={onReplace} />);
    upload("habits.json", "oops");
    expect(await screen.findByRole("alert")).toHaveTextContent("Nothing was imported");
    expect(onReplace).not.toHaveBeenCalled();
  });
});
