import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../../App.tsx";
import { LOCALE_STORAGE_KEY } from "../../lib/i18n/index.ts";
import { axeViolations } from "../../test/axe.ts";

afterEach(() => vi.restoreAllMocks());

const pickLanguage = (name: string) =>
  fireEvent.change(screen.getByRole("combobox", { name: /^(Language|Taal)$/ }), {
    target: { value: name },
  });

describe("language", () => {
  it("starts in English when the browser prefers English", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
  });

  it("starts in Dutch when the browser prefers Dutch", () => {
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["nl-NL", "en"]);
    render(<App />);
    expect(screen.getByRole("button", { name: "Toevoegen" })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("nl");
  });

  it("switches the whole UI and remembers the choice", () => {
    const first = render(<App />);
    pickLanguage("nl");
    expect(
      screen.getByRole("heading", { name: "Begin met je eerste gewoonte" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Statistieken" })).toBeInTheDocument();
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("nl");
    first.unmount();

    render(<App />);
    expect(screen.getByRole("button", { name: "Toevoegen" })).toBeInTheDocument();
    pickLanguage("en");
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("translates validation messages, habit rows and dates", () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "nl");
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Toevoegen" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Vul een naam in voor de gewoonte.");
    fireEvent.click(screen.getByRole("button", { name: "Water drinken" }));
    expect(
      screen.getByRole("button", { name: "Vandaag gedaan: Water drinken" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Water drinken bewerken" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Week" }));
    expect(screen.getByRole("button", { name: "Vorige week" })).toBeInTheDocument();
    expect(screen.getByText("ma")).toBeInTheDocument();
  });

  it("has no accessibility violations in Dutch", async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "nl");
    const { container } = render(<App />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
