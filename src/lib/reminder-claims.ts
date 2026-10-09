const KEY = "habit-tracker:reminders-sent";

type Store = Pick<Storage, "getItem" | "setItem">;

function defaultStore(): Store | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/**
 * Records that a habit's reminder for `day` is being shown. Returns true for the
 * first caller (across tabs sharing storage) and false for everyone after, so
 * each reminder notifies once however many tabs are open.
 */
export function claimReminder(
  habitId: string,
  day: string,
  store: Store | undefined = defaultStore(),
): boolean {
  if (!store) return true;
  try {
    let sent: Record<string, string> = {};
    try {
      const parsed: unknown = JSON.parse(store.getItem(KEY) ?? "{}");
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        sent = parsed as Record<string, string>;
      }
    } catch {
      sent = {};
    }
    if (sent[habitId] === day) return false;
    store.setItem(KEY, JSON.stringify({ ...sent, [habitId]: day }));
    return true;
  } catch {
    return true;
  }
}
