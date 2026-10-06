import { describe, expect, it } from "vitest";
import { shortcutForKey } from "./shortcuts.ts";

const press = (key: string, extra: Partial<Parameters<typeof shortcutForKey>[0]> = {}) =>
  shortcutForKey({
    key,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    target: document.body,
    ...extra,
  });

describe("shortcutForKey", () => {
  it("maps the documented keys", () => {
    expect(press("n")).toEqual({ type: "focus-new-habit" });
    expect(press("?")).toEqual({ type: "show-help" });
    expect(press("1")).toEqual({ type: "toggle-habit", position: 1 });
    expect(press("9")).toEqual({ type: "toggle-habit", position: 9 });
    expect(press("w")).toEqual({ type: "show-week" });
    expect(press("t")).toEqual({ type: "show-today" });
  });

  it("ignores other keys, including 0", () => {
    expect(press("0")).toBeNull();
    expect(press("x")).toBeNull();
  });

  it("ignores keys with modifiers", () => {
    expect(press("n", { ctrlKey: true })).toBeNull();
    expect(press("1", { metaKey: true })).toBeNull();
    expect(press("t", { altKey: true })).toBeNull();
  });

  it("ignores keys typed in fields", () => {
    for (const tag of ["input", "textarea", "select"]) {
      expect(press("n", { target: document.createElement(tag) })).toBeNull();
    }
    const editable = document.createElement("div");
    editable.contentEditable = "true";
    Object.defineProperty(editable, "isContentEditable", { value: true });
    expect(press("1", { target: editable })).toBeNull();
  });
});
