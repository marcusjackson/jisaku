import { describe, expect, it } from 'vitest'

import { formatDateForFilename, formatDateISO } from './date-utils'

describe('date-utils', () => {
  describe('formatDateISO', () => {
    it('returns YYYY-MM-DD format', () => {
      const date = new Date(2026, 1, 26) // February 26, 2026
      expect(formatDateISO(date)).toBe('2026-02-26')
    })

    it('pads single-digit months and days with zero', () => {
      const date = new Date(2026, 0, 5) // January 5, 2026
      expect(formatDateISO(date)).toBe('2026-01-05')
    })

    it('handles end-of-year dates', () => {
      const date = new Date(2025, 11, 31) // December 31, 2025
      expect(formatDateISO(date)).toBe('2025-12-31')
    })
  })

  describe('formatDateForFilename', () => {
    it('returns YYYY-MM-DD-HHmm format', () => {
      const date = new Date(2026, 1, 26, 14, 23) // Feb 26, 2026, 14:23
      expect(formatDateForFilename(date)).toBe('2026-02-26-1423')
    })

    it('pads single-digit time components with zero', () => {
      const date = new Date(2026, 0, 5, 9, 5) // Jan 5, 2026, 09:05
      expect(formatDateForFilename(date)).toBe('2026-01-05-0905')
    })

    it('handles midnight', () => {
      const date = new Date(2026, 0, 1, 0, 0) // Jan 1, 2026, 00:00
      expect(formatDateForFilename(date)).toBe('2026-01-01-0000')
    })

    it('returns filename-safe string with no special characters', () => {
      const date = new Date(2026, 5, 15, 23, 59)
      const result = formatDateForFilename(date)
      // Should only contain digits and hyphens
      expect(result).toMatch(/^[\d-]+$/)
    })
  })
})
