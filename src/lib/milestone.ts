/** Streak lengths worth a small celebration. */
export const STREAK_MILESTONES = [7, 30, 100] as const;

/**
 * The milestone a streak just reached, or null. Only a streak that grew onto a
 * milestone counts, so unrelated re-renders and later check-ins stay quiet.
 */
export function reachedMilestone(previous: number, next: number): number | null {
  if (next <= previous) return null;
  return STREAK_MILESTONES.find((milestone) => milestone === next) ?? null;
}
