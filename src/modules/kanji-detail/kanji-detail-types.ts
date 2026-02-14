/**
 * Kanji Detail Types
 *
 * Type definitions for the kanji detail module.
 *
 * @module modules/kanji-detail
 */

import type { Component } from '@/api/component/component-types'
import type { ComponentOccurrence } from '@/api/component/component-types'
import type {
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup,
  KunReading,
  OnReading,
  ReadingLevel
} from '@/api/kanji'
import type {
  JlptLevel,
  JoyoLevel,
  Kanji,
  KanjiKenteiLevel
} from '@/api/kanji/kanji-types'
import type { PositionType } from '@/api/position/position-types'

// ============================================================================
// Re-exports for convenience
// ============================================================================

export type {
  Component,
  JlptLevel,
  JoyoLevel,
  Kanji,
  KanjiKenteiLevel,
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup,
  KunReading,
  OnReading,
  ReadingLevel
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for the headline section
 */
export interface HeadlineProps {
  kanji: Kanji
  radical: Component | null
}

/**
 * Data emitted when headline fields are saved
 */
export interface HeadlineSaveData {
  character: string
  shortMeaning: string | null
  searchKeywords: string | null
}

/**
 * Classification change for batch save
 */
export interface ClassificationChange {
  id: number | undefined
  classificationTypeId: number
  displayOrder: number
}

/**
 * Data emitted when basic info fields are saved
 */
export interface BasicInfoSaveData {
  strokeCount: number | null
  jlptLevel: JlptLevel | null
  joyoLevel: JoyoLevel | null
  kanjiKenteiLevel: KanjiKenteiLevel | null
  radicalId: number | null
  /** Character to create as new radical component */
  newRadicalCharacter?: string
  /** Updated classifications list */
  classifications: ClassificationChange[]
}

/**
 * Props for the actions section
 */
export interface ActionsProps {
  /** Whether destructive mode is active */
  destructiveMode: boolean
  /** Whether delete operation is in progress */
  isDeleting: boolean
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Events emitted by the headline section
 */
export type HeadlineEmits = (e: 'save', data: HeadlineSaveData) => void

/**
 * Events emitted by the actions section
 */
export interface ActionsEmits {
  (e: 'update:destructive-mode', value: boolean): void
  (e: 'delete'): void
}

// ============================================================================
// Readings Types
// ============================================================================

/**
 * Edit state for an on-yomi reading (includes temp ID for new readings)
 */
export interface EditOnReading {
  id: number
  reading: string
  readingLevel: ReadingLevel
  isNew?: boolean
}

/**
 * Edit state for a kun-yomi reading (includes temp ID for new readings)
 */
export interface EditKunReading {
  id: number
  reading: string
  okurigana: string
  readingLevel: ReadingLevel
  isNew?: boolean
}

/**
 * Data emitted when readings are saved
 */
export interface ReadingsSaveData {
  onReadings: EditOnReading[]
  kunReadings: EditKunReading[]
}

// ============================================================================
// Meanings Types
// ============================================================================

/**
 * Edit state for a meaning
 */
export interface EditMeaning {
  id: number
  meaningText: string
  additionalInfo: string
  isNew?: boolean
}

/**
 * Edit state for a reading group
 */
export interface EditReadingGroup {
  id: number
  readingText: string
  isNew?: boolean
}

/**
 * Edit state for group member assignments
 */
export interface EditGroupMember {
  readingGroupId: number
  meaningId: number
  displayOrder: number
}

/**
 * Data emitted when meanings are saved
 */
export interface MeaningsSaveData {
  meanings: EditMeaning[]
  readingGroups: EditReadingGroup[]
  groupMembers: EditGroupMember[]
  /** Whether grouping was enabled (created new groups) */
  groupingEnabled: boolean
  /** Whether grouping was disabled (removed all groups) */
  groupingDisabled: boolean
}

// ============================================================================
// Vocabulary Section Types
// ============================================================================

/**
 * Data for quick-creating vocabulary from kanji detail page
 */
export interface QuickCreateVocabularyData {
  word: string
  kana: string
  shortMeaning?: string | null
}

/**
 * Vocabulary list item display data
 * Simplified interface for displaying vocabulary in kanji detail view
 */
export interface VocabularyListItem {
  linkId: number
  vocabularyId: number
  word: string
  kana: string | null
  shortMeaning: string | null
}

// ============================================================================
// Component Section Types
// ============================================================================

/**
 * Component occurrence with populated component details and position info
 * Used for displaying component occurrences in the kanji detail page
 */
export interface ComponentOccurrenceWithDetails extends ComponentOccurrence {
  /** Populated component data */
  component: {
    id: number
    character: string
    shortMeaning: string | null
  }
  /** Position type name (if positionTypeId exists) */
  position: PositionType | null
  /** Form character (if componentFormId exists) */
  form: {
    id: number
    formCharacter: string
    formName: string | null
  } | null
}
