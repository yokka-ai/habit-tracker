import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App.tsx";

describe("App", () => {
  it("shows the header", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Habit Tracker" })).toBeInTheDocument();
  });

  it("shows the empty state when there are no habits", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "No habits yet" })).toBeInTheDocument();
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
    expect(screen.queryByRole("heading", { name: "No habits yet" })).not.toBeInTheDocument();
  });

  it("keeps the empty state when the name is blank", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No habits yet" })).toBeInTheDocument();
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
