export type PermissionState = NotificationPermission | "unsupported";

export function notificationPermission(): PermissionState {
  return typeof Notification === "undefined" ? "unsupported" : Notification.permission;
}

/** Asks for permission only if it hasn't been decided yet; returns the resulting state. */
export async function ensureNotificationPermission(): Promise<PermissionState> {
  const current = notificationPermission();
  if (current !== "default") return current;
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export function showReminder(title: string, body: string, tag: string): void {
  if (notificationPermission() !== "granted") return;
  new Notification(title, { body, tag });
}
