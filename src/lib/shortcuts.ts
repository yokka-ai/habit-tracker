import type { MessageKey } from "./i18n/index.ts";

export type ShortcutAction =
  | { type: "focus-new-habit" }
  | { type: "toggle-habit"; position: number }
  | { type: "show-help" }
  | { type: "show-week" }
  | { type: "show-today" };

export type ShortcutKeyEvent = {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  target: EventTarget | null;
};

export const SHORTCUT_LIST: { keys: string; description: MessageKey }[] = [
  { keys: "n", description: "shortcuts.focusNew" },
  { keys: "1 – 9", description: "shortcuts.toggle" },
  { keys: "?", description: "shortcuts.help" },
];

const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return TYPING_TAGS.has(target.tagName) || target.isContentEditable;
}

/** Maps a key press to a shortcut action, or null when it should be left alone. */
export function shortcutForKey(event: ShortcutKeyEvent): ShortcutAction | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null;
  if (isTypingTarget(event.target)) return null;
  if (/^[1-9]$/.test(event.key)) return { type: "toggle-habit", position: Number(event.key) };
  switch (event.key) {
    case "n":
      return { type: "focus-new-habit" };
    case "?":
      return { type: "show-help" };
    case "w":
      return { type: "show-week" };
    case "t":
      return { type: "show-today" };
    default:
      return null;
  }
}
