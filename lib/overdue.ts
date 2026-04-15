import type { CommitteeReport } from "./types";

const DEADLINE_DAYS = 60;

export function getDeadline(report: CommitteeReport): Date {
  const published = new Date(report.reportPublishedDate);
  const deadline = new Date(published);
  deadline.setDate(deadline.getDate() + DEADLINE_DAYS);
  return deadline;
}

export function isOverdue(report: CommitteeReport): boolean {
  if (report.governmentResponseDate) return false;
  return new Date() > getDeadline(report);
}

export function isPending(report: CommitteeReport): boolean {
  if (report.governmentResponseDate) return false;
  return !isOverdue(report);
}

export function isResponded(report: CommitteeReport): boolean {
  return !!report.governmentResponseDate;
}

/** Returns days overdue (positive) or days remaining (negative). */
export function daysFromDeadline(report: CommitteeReport): number {
  const deadline = getDeadline(report);
  return Math.floor((Date.now() - deadline.getTime()) / (1000 * 60 * 60 * 24));
}

/** Days overdue for an overdue report (always positive). */
export function daysOverdue(report: CommitteeReport): number {
  return Math.max(0, daysFromDeadline(report));
}

/** Days remaining for a pending report (always positive). */
export function daysRemaining(report: CommitteeReport): number {
  return Math.max(0, -daysFromDeadline(report));
}

/** How many days after publication the government eventually responded. */
export function daysToRespond(report: CommitteeReport): number | null {
  if (!report.governmentResponseDate) return null;
  const published = new Date(report.reportPublishedDate);
  const responded = new Date(report.governmentResponseDate);
  return Math.floor(
    (responded.getTime() - published.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/** Format a date in UK format: 14 January 2025 */
export function formatUKDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Was this report responded to within the last N days? */
export function respondedWithinDays(
  report: CommitteeReport,
  days: number
): boolean {
  if (!report.governmentResponseDate) return false;
  const responded = new Date(report.governmentResponseDate);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return responded >= cutoff;
}
