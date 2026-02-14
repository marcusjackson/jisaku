/**
 * Component List Types
 *
 * Type definitions for the component list module.
 * Includes extended filter types beyond the base API filters.
 *
 * @module modules/component-list
 */

import type { Component } from '@/api/component'

// ============================================================================
// Re-exports for convenience
// ============================================================================

export type { Component }

// ============================================================================
// Presence Filter Types
// ============================================================================

/** Filter options for field presence */
export type PresenceFilterValue = 'has' | 'missing' | null

// ============================================================================
// Extended Filter Types
// ============================================================================

/**
 * Extended filter state for component list
 *
 * Includes all filters from API plus additional UI-specific filters
 */
export interface ComponentListFilters {
  /** Search by component character */
  character?: string
  /** Search in short display and keywords */
  searchKeywords?: string
  /** Search in kangxi number or meaning */
  kangxiSearch?: string
  /** Minimum stroke count */
  strokeCountMin?: number
  /** Maximum stroke count */
  strokeCountMax?: number
  /** Filter by radical status (true = is radical, false = not radical, undefined = any) */
  canBeRadical?: boolean
  /** Filter by description field presence */
  descriptionPresence?: PresenceFilterValue
  /** Filter by forms data presence */
  formsPresence?: PresenceFilterValue
  /** Filter by groupings presence */
  groupingsPresence?: PresenceFilterValue
}

// ============================================================================
// URL Query Param Keys
// ============================================================================

/**
 * Mapping of filter keys to URL query parameter keys
 */
export const FILTER_QUERY_KEYS = {
  character: 'character',
  searchKeywords: 'keywords',
  kangxiSearch: 'kangxi',
  strokeCountMin: 'strokeMin',
  strokeCountMax: 'strokeMax',
  canBeRadical: 'radical',
  descriptionPresence: 'description',
  formsPresence: 'forms',
  groupingsPresence: 'groupings'
} as const satisfies Record<keyof ComponentListFilters, string>

// ============================================================================
// Storage Keys
// ============================================================================

/** LocalStorage key for filter collapsed state */
export const STORAGE_KEY_FILTERS_COLLAPSED = 'component-list-filters-collapsed'

// ============================================================================
// Filter Labels
// ============================================================================

/** Presence filter option labels */
export const PRESENCE_LABELS: Record<'has' | 'missing' | 'any', string> = {
  has: 'Has content',
  missing: 'Empty',
  any: 'Any'
}

/** Radical status filter option labels */
export const RADICAL_STATUS_LABELS: Record<'yes' | 'no' | 'any', string> = {
  yes: 'Is radical',
  no: 'Not radical',
  any: 'Any'
}
