/**
 * Date Utility Functions
 *
 * Provides date formatting using native JavaScript Date API.
 * All dates use local timezone (no UTC conversion).
 *
 * Always use these utilities instead of inlining date formatting logic.
 */

/**
 * Format date as ISO date string (YYYY-MM-DD)
 *
 * @param date - Date object to format
 * @returns ISO date string in YYYY-MM-DD format
 *
 * @example
 * formatDateISO(new Date(2026, 1, 26)) // '2026-02-26'
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${String(year)}-${month}-${day}`
}

/**
 * Format date as a filename-safe datetime string (YYYY-MM-DD-HHmm)
 *
 * Suitable for use in exported filenames. Contains no special characters
 * that would be unsafe on Windows, macOS, or Linux file systems.
 *
 * @param date - Date object to format
 * @returns Filename-safe datetime string (e.g., "2026-02-26-1423")
 *
 * @example
 * formatDateForFilename(new Date(2026, 1, 26, 14, 23)) // '2026-02-26-1423'
 */
export function formatDateForFilename(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${String(year)}-${month}-${day}-${hours}${minutes}`
}
