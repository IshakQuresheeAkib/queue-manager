/**
 * Date utilities for handling local timezone correctly.
 * Supabase stores dates as strings (DATE type), so we need to ensure
 * we're comparing with local dates, not UTC dates.
 */

/**
 * Get today's date in YYYY-MM-DD format using local timezone.
 * This is important because new Date().toISOString() returns UTC date,
 * which can be a day behind in timezones ahead of UTC (e.g., Bangladesh UTC+6).
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current time in HH:MM:SS format using local timezone.
 */
export function getLocalTimeString(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Get today's date string in local timezone.
 * Shorthand for getLocalDateString().
 */
export function getTodayString(): string {
  return getLocalDateString(new Date());
}
