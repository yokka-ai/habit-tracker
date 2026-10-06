import { useEffect, useRef } from "react";
import { type ShortcutAction, shortcutForKey } from "../../lib/shortcuts.ts";

export function useKeyboardShortcuts(onAction: (action: ShortcutAction) => void) {
  const latest = useRef(onAction);
  latest.current = onAction;
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const action = shortcutForKey(event);
      if (!action) return;
      event.preventDefault();
      latest.current(action);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
}
