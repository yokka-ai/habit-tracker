import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.tsx";

describe("App", () => {
  it("shows the header", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Habit Tracker" })).toBeInTheDocument();
  });

  it("shows the empty state when there are no habits", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Start your first habit" })).toBeInTheDocument();
  });
});

describe("adding habits", () => {
  it("shows an added habit and hides the empty state", () => {
    render(<App />);
    fireEvent.change(screen.getByRole("textbox", { name: "Habit name" }), {
      target: { value: "Read 10 pages" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("list", { name: "Habits" })).toHaveTextContent("Read 10 pages");
    expect(
      screen.queryByRole("heading", { name: "Start your first habit" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the empty state when the name is blank", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Start your first habit" })).toBeInTheDocument();
  });
});

describe("starter habits", () => {
  it("adds a habit when a suggestion is clicked and hides the empty state", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Walk 20 minutes" }));
    expect(screen.getByRole("list", { name: "Habits" })).toHaveTextContent("Walk 20 minutes");
    expect(screen.queryByRole("list", { name: "Starter habits" })).not.toBeInTheDocument();
  });
});

describe("theme toggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("cycles System, Light and Dark, applies the dark class and remembers the choice", () => {
    const { unmount } = render(<App />);
    const toggle = () => screen.getByRole("button", { name: /^Theme: / });
    expect(toggle()).toHaveAccessibleName("Theme: System. Switch theme");
    fireEvent.click(toggle());
    expect(toggle()).toHaveAccessibleName("Theme: Light. Switch theme");
    expect(document.documentElement).not.toHaveClass("dark");
    fireEvent.click(toggle());
    expect(toggle()).toHaveAccessibleName("Theme: Dark. Switch theme");
    expect(document.documentElement).toHaveClass("dark");

    unmount();
    render(<App />);
    expect(toggle()).toHaveAccessibleName("Theme: Dark. Switch theme");
    expect(document.documentElement).toHaveClass("dark");
  });
});

describe("editing and deleting habits", () => {
  function addHabit(name: string) {
    fireEvent.change(screen.getByRole("textbox", { name: "Habit name" }), {
      target: { value: name },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
  }

  it("renames a habit with Enter", () => {
    render(<App />);
    addHabit("Drink water");
    fireEvent.click(screen.getByRole("button", { name: "Edit Drink water" }));
    const input = screen.getByRole("textbox", { name: "Rename habit" });
    fireEvent.change(input, { target: { value: "  Drink more water " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByRole("list", { name: "Habits" })).toHaveTextContent("Drink more water");
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });

  it("refuses an empty rename", () => {
    render(<App />);
    addHabit("Drink water");
    fireEvent.click(screen.getByRole("button", { name: "Edit Drink water" }));
    const input = screen.getByRole("textbox", { name: "Rename habit" });
    fireEvent.change(input, { target: { value: " " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a habit name.");
  });

  it("cancels a rename with Escape", () => {
    render(<App />);
    addHabit("Drink water");
    fireEvent.click(screen.getByRole("button", { name: "Edit Drink water" }));
    const input = screen.getByRole("textbox", { name: "Rename habit" });
    fireEvent.change(input, { target: { value: "Nope" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.getByRole("list", { name: "Habits" })).toHaveTextContent("Drink water");
  });

  it("asks before deleting and can be cancelled", () => {
    render(<App />);
    addHabit("Drink water");
    fireEvent.click(screen.getByRole("button", { name: "Delete Drink water" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep" }));
    expect(screen.getByRole("list", { name: "Habits" })).toHaveTextContent("Drink water");
  });

  it("deletes a habit once confirmed and shows the empty state", () => {
    render(<App />);
    addHabit("Drink water");
    fireEvent.click(screen.getByRole("button", { name: "Delete Drink water" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete Drink water" }));
    expect(screen.queryByRole("list", { name: "Habits" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Start your first habit" })).toBeInTheDocument();
  });
});

describe("habit categories", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  function addHabit(name: string, category = "") {
    fireEvent.change(screen.getByRole("textbox", { name: "Habit name" }), {
      target: { value: name },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Category (optional)" }), {
      target: { value: category },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
  }

  const chip = (name: string) => screen.getByRole("button", { name });

  it("shows no filter chips while no habit has a category", () => {
    render(<App />);
    addHabit("Drink water");
    expect(screen.queryByRole("group", { name: "Filter by category" })).not.toBeInTheDocument();
  });

  it("filters by category and keeps uncategorised habits under All only", () => {
    render(<App />);
    addHabit("Drink water", "Health");
    addHabit("Read 10 pages", "Mind");
    addHabit("Water the plants");
    expect(chip("All")).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(chip("Mind"));
    const list = screen.getByRole("list", { name: "Habits" });
    expect(list).toHaveTextContent("Read 10 pages");
    expect(list).not.toHaveTextContent("Drink water");
    expect(list).not.toHaveTextContent("Water the plants");
    fireEvent.click(chip("All"));
    expect(screen.getByRole("list", { name: "Habits" })).toHaveTextContent("Water the plants");
  });

  it("remembers the chosen filter across visits", () => {
    window.localStorage.setItem("habit-tracker:category-filter", "Mind");
    const { unmount } = render(<App />);
    addHabit("Drink water", "Health");
    addHabit("Read 10 pages", "Mind");
    expect(chip("Mind")).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(chip("Health"));
    unmount();
    render(<App />);
    expect(window.localStorage.getItem("habit-tracker:category-filter")).toBe("Health");
  });

  it("falls back to All when the filtered category disappears", () => {
    render(<App />);
    addHabit("Drink water", "Health");
    addHabit("Tidy desk", "Zen");
    fireEvent.click(chip("Zen"));
    fireEvent.click(screen.getByRole("button", { name: "Delete Tidy desk" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete Tidy desk" }));
    expect(screen.getByRole("list", { name: "Habits" })).toHaveTextContent("Drink water");
  });

  it("sets and clears a category when editing", () => {
    render(<App />);
    addHabit("Drink water");
    fireEvent.click(screen.getByRole("button", { name: "Edit Drink water" }));
    const inputs = screen.getAllByRole("combobox", { name: "Category (optional)" });
    fireEvent.change(inputs[inputs.length - 1] as HTMLElement, { target: { value: "Health" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(chip("Health")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit Drink water" }));
    const again = screen.getAllByRole("combobox", { name: "Category (optional)" });
    fireEvent.change(again[again.length - 1] as HTMLElement, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.queryByRole("button", { name: "Health" })).not.toBeInTheDocument();
  });
});

describe("archiving habits", () => {
  function addHabit(name: string) {
    fireEvent.change(screen.getByRole("textbox", { name: "Habit name" }), {
      target: { value: name },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
  }

  it("moves an archived habit to a collapsed section and restores it", () => {
    render(<App />);
    addHabit("Drink water");
    addHabit("Read 10 pages");
    fireEvent.click(screen.getByRole("button", { name: "Archive Drink water" }));
    expect(screen.getByRole("list", { name: "Habits" })).not.toHaveTextContent("Drink water");
    expect(screen.queryByRole("list", { name: "Archived habits" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Archived (1)" }));
    expect(screen.getByRole("list", { name: "Archived habits" })).toHaveTextContent("Drink water");

    fireEvent.click(screen.getByRole("button", { name: "Restore Drink water" }));
    expect(screen.getByRole("list", { name: "Habits" })).toHaveTextContent("Drink water");
    expect(screen.queryByRole("button", { name: /^Archived/ })).not.toBeInTheDocument();
  });

  it("deletes an archived habit after confirming", () => {
    render(<App />);
    addHabit("Drink water");
    addHabit("Read 10 pages");
    fireEvent.click(screen.getByRole("button", { name: "Archive Drink water" }));
    fireEvent.click(screen.getByRole("button", { name: "Archived (1)" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Drink water" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete Drink water" }));
    expect(screen.queryByRole("button", { name: /^Archived/ })).not.toBeInTheDocument();
  });

  it("drops an archived habit's category from the filter chips", () => {
    render(<App />);
    fireEvent.change(screen.getByRole("textbox", { name: "Habit name" }), {
      target: { value: "Drink water" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Category (optional)" }), {
      target: { value: "Health" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    addHabit("Read 10 pages");
    fireEvent.click(screen.getByRole("button", { name: "Archive Drink water" }));
    expect(screen.queryByRole("button", { name: "Health" })).not.toBeInTheDocument();
  });
});

describe("persistence", () => {
  it("keeps habits after the app is reloaded", () => {
    const first = render(<App />);
    fireEvent.change(screen.getByRole("textbox", { name: "Habit name" }), {
      target: { value: "Drink water" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    first.unmount();

    render(<App />);
    expect(screen.getByRole("list", { name: "Habits" })).toHaveTextContent("Drink water");
  });
});

describe("daily check-off", () => {
  it("marks a habit done, un-marks it, and survives a reload", () => {
    window.localStorage.clear();
    const { unmount } = render(<App />);
    fireEvent.change(screen.getByRole("textbox", { name: "Habit name" }), {
      target: { value: "Drink water" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    const toggle = () => screen.getByRole("button", { name: "Done today: Drink water" });
    expect(toggle()).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(toggle());
    expect(toggle()).toHaveAttribute("aria-pressed", "true");

    unmount();
    render(<App />);
    expect(toggle()).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(toggle());
    expect(toggle()).toHaveAttribute("aria-pressed", "false");
  });
});

describe("reminders", () => {
  const original = globalThis.Notification;
  afterEach(() => {
    vi.stubGlobal("Notification", original);
  });

  function setReminderTo(time: string) {
    render(<App />);
    fireEvent.change(screen.getByRole("textbox", { name: "Habit name" }), {
      target: { value: "Drink water" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit Drink water" }));
    fireEvent.change(screen.getByLabelText("Reminder time"), { target: { value: time } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
  }

  it("asks for permission only when a reminder is set", async () => {
    const requestPermission = vi.fn().mockResolvedValue("granted");
    vi.stubGlobal(
      "Notification",
      Object.assign(vi.fn(), { permission: "default", requestPermission }),
    );
    render(<App />);
    expect(requestPermission).not.toHaveBeenCalled();
    cleanup();
    setReminderTo("09:00");
    await waitFor(() => expect(requestPermission).toHaveBeenCalledTimes(1));
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("explains how to enable notifications when denied", async () => {
    const requestPermission = vi.fn();
    vi.stubGlobal(
      "Notification",
      Object.assign(vi.fn(), { permission: "denied", requestPermission }),
    );
    setReminderTo("09:00");
    expect(await screen.findByRole("alert")).toHaveTextContent("site settings");
    expect(requestPermission).not.toHaveBeenCalled();
  });
});

describe("keyboard shortcuts", () => {
  it("n focuses the new-habit field", () => {
    render(<App />);
    fireEvent.keyDown(window, { key: "n" });
    expect(screen.getByRole("textbox", { name: "Habit name" })).toHaveFocus();
  });

  it("number keys toggle today for the habit in that position", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Walk 20 minutes" }));
    const done = () => screen.getAllByRole("button", { name: /^Done today/, pressed: true });
    expect(screen.queryAllByRole("button", { name: /^Done today/, pressed: true })).toHaveLength(0);
    fireEvent.keyDown(window, { key: "1" });
    expect(done()).toHaveLength(1);
    fireEvent.keyDown(window, { key: "1" });
    expect(screen.queryAllByRole("button", { name: /^Done today/, pressed: true })).toHaveLength(0);
    fireEvent.keyDown(window, { key: "5" });
    expect(screen.queryAllByRole("button", { name: /^Done today/, pressed: true })).toHaveLength(0);
  });

  it("typing in the field does not trigger shortcuts", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Walk 20 minutes" }));
    const input = screen.getByRole("textbox", { name: "Habit name" });
    input.focus();
    fireEvent.keyDown(input, { key: "1" });
    fireEvent.keyDown(input, { key: "?" });
    expect(screen.queryAllByRole("button", { name: /^Done today/, pressed: true })).toHaveLength(0);
    expect(screen.queryByRole("dialog", { name: "Keyboard shortcuts" })).not.toBeInTheDocument();
  });

  it("? opens the shortcuts dialog and Close dismisses it", () => {
    render(<App />);
    fireEvent.keyDown(window, { key: "?" });
    const dialog = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
    expect(dialog).toHaveTextContent("Focus the new habit field");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog", { name: "Keyboard shortcuts" })).not.toBeInTheDocument();
  });
});

describe("week view", () => {
  it("switches between Today and Week from the header area", () => {
    render(<App />);
    fireEvent.change(screen.getByRole("textbox", { name: "Habit name" }), {
      target: { value: "Read 10 pages" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("button", { name: "Today" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Week" }));
    expect(screen.getByRole("region", { name: "Week" })).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Habits" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Today" }));
    expect(screen.getByRole("list", { name: "Habits" })).toBeInTheDocument();
  });
});
