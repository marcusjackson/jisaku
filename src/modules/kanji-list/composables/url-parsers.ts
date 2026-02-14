/**
 * Kanji List URL Parsing Helpers
 *
 * Functions to parse URL query parameters into typed filter values.
 *
 * @module modules/kanji-list/composables
 */

import {
  ANALYSIS_THRESHOLDS,
  type AnalysisFieldFilter,
  type AnalysisFieldName,
  type AnalysisLengthThreshold,
  type StrokeOrderFilterValue
} from '../kanji-list-types'

import type { JlptLevel, JoyoLevel, KanjiKenteiLevel } from '@/api/kanji'

export function parseString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) return value
  return undefined
}

export function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'string') {
    const num = parseInt(value, 10)
    if (!isNaN(num)) return num
  }
  return undefined
}

export function parseNumberArray(value: unknown): number[] | undefined {
  if (typeof value === 'string' && value.length > 0) {
    const nums = value
      .split(',')
      .map((v) => parseInt(v, 10))
      .filter((n) => !isNaN(n))
    return nums.length > 0 ? nums : undefined
  }
  return undefined
}

export function parseJlptLevels(value: unknown): JlptLevel[] | undefined {
  if (typeof value !== 'string' || value.length === 0) return undefined
  const valid: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']
  const levels = value
    .split(',')
    .filter((v): v is JlptLevel => valid.includes(v as JlptLevel))
  return levels.length > 0 ? levels : undefined
}

export function parseJoyoLevels(value: unknown): JoyoLevel[] | undefined {
  if (typeof value !== 'string' || value.length === 0) return undefined
  const valid: JoyoLevel[] = [
    'elementary1',
    'elementary2',
    'elementary3',
    'elementary4',
    'elementary5',
    'elementary6',
    'secondary'
  ]
  const levels = value
    .split(',')
    .filter((v): v is JoyoLevel => valid.includes(v as JoyoLevel))
  return levels.length > 0 ? levels : undefined
}

export function parseKenteiLevels(
  value: unknown
): KanjiKenteiLevel[] | undefined {
  if (typeof value !== 'string' || value.length === 0) return undefined
  const valid: KanjiKenteiLevel[] = [
    '10',
    '9',
    '8',
    '7',
    '6',
    '5',
    '4',
    '3',
    'pre2',
    '2',
    'pre1',
    '1'
  ]
  const levels = value
    .split(',')
    .filter((v): v is KanjiKenteiLevel => valid.includes(v as KanjiKenteiLevel))
  return levels.length > 0 ? levels : undefined
}

export function parseStrokeOrderFilter(value: unknown): StrokeOrderFilterValue {
  if (value === 'has' || value === 'missing') return value
  return null
}

export function parseAnalysisFilters(
  value: unknown
): AnalysisFieldFilter[] | undefined {
  if (typeof value !== 'string' || value.length === 0) return undefined
  const validFields: AnalysisFieldName[] = [
    'notesEtymology',
    'notesSemantic',
    'notesEducationMnemonics',
    'notesPersonal'
  ]
  const validThresholds = Object.keys(
    ANALYSIS_THRESHOLDS
  ) as AnalysisLengthThreshold[]

  const filters = value
    .split(',')
    .map((pair) => {
      const [field, threshold] = pair.split(':')
      if (
        validFields.includes(field as AnalysisFieldName) &&
        validThresholds.includes(threshold as AnalysisLengthThreshold)
      ) {
        return {
          field: field as AnalysisFieldName,
          threshold: threshold as AnalysisLengthThreshold
        }
      }
      return null
    })
    .filter((f): f is AnalysisFieldFilter => f !== null)

  return filters.length > 0 ? filters : undefined
}
