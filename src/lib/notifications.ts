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

export const DENIED_HELP =
  "Notifications are blocked, so reminders can't show. Allow notifications for this site in your browser's site settings, then set the reminder again.";
export const UNSUPPORTED_HELP =
  "This browser does not support notifications, so reminders can't show.";

export function showReminder(name: string): void {
  if (notificationPermission() !== "granted") return;
  new Notification(`Time for: ${name}`, { body: "You haven't done this habit today.", tag: name });
}
