/**
 * Kanji Constants
 *
 * Shared constants for JLPT and Joyo levels used in forms and filters.
 */

import type { JlptLevel, JoyoLevel } from '@/shared/types/database-types'

// =============================================================================
// Types
// =============================================================================

export interface LevelOption<T extends string> {
  label: string
  value: T
}

// =============================================================================
// JLPT Level Options
// =============================================================================

export const JLPT_OPTIONS: LevelOption<JlptLevel>[] = [
  { label: 'N5', value: 'N5' },
  { label: 'N4', value: 'N4' },
  { label: 'N3', value: 'N3' },
  { label: 'N2', value: 'N2' },
  { label: 'N1', value: 'N1' },
  { label: '非JLPT', value: 'non-jlpt' }
] as const

export const JLPT_LEVELS: JlptLevel[] = [
  'N5',
  'N4',
  'N3',
  'N2',
  'N1',
  'non-jlpt'
] as const

// =============================================================================
// Joyo Level Options
// =============================================================================

export const JOYO_OPTIONS: LevelOption<JoyoLevel>[] = [
  { label: '小1', value: 'elementary1' },
  { label: '小2', value: 'elementary2' },
  { label: '小3', value: 'elementary3' },
  { label: '小4', value: 'elementary4' },
  { label: '小5', value: 'elementary5' },
  { label: '小6', value: 'elementary6' },
  { label: '中学', value: 'secondary' },
  { label: '非常用', value: 'non-joyo' }
] as const

export const JOYO_LEVELS: JoyoLevel[] = [
  'elementary1',
  'elementary2',
  'elementary3',
  'elementary4',
  'elementary5',
  'elementary6',
  'secondary',
  'non-joyo'
] as const
