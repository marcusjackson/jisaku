/**
 * URL Sync Parsers
 *
 * Helper functions for parsing filter values from URL query params.
 * Extracted from use-kanji-list-url-sync to keep file size manageable.
 *
 * @module modules/kanji-list/composables
 */

import { FILTER_QUERY_KEYS, type KanjiListFilters } from '../kanji-list-types'

import {
  parseAnalysisFilters,
  parseJlptLevels,
  parseJoyoLevels,
  parseKenteiLevels,
  parseNumber,
  parseNumberArray,
  parseStrokeOrderFilter
} from './url-parsers'

import type { Ref } from 'vue'

/**
 * Parse text filters from debounced refs
 */
export function parseTextFiltersFromRefs(
  characterSearch: Ref<string>,
  keywordsSearch: Ref<string>,
  meaningsSearch: Ref<string>,
  onYomiSearch: Ref<string>,
  kunYomiSearch: Ref<string>
): Partial<KanjiListFilters> {
  const filters: Partial<KanjiListFilters> = {}
  if (characterSearch.value) filters.character = characterSearch.value
  if (keywordsSearch.value) filters.searchKeywords = keywordsSearch.value
  if (meaningsSearch.value) filters.meanings = meaningsSearch.value
  if (onYomiSearch.value) filters.onYomi = onYomiSearch.value
  if (kunYomiSearch.value) filters.kunYomi = kunYomiSearch.value
  return filters
}

/**
 * Parse numeric filters (stroke count range)
 */
export function parseNumericFiltersFromQuery(
  q: Record<string, unknown>
): Partial<KanjiListFilters> {
  const filters: Partial<KanjiListFilters> = {}
  const strokeMin = parseNumber(q[FILTER_QUERY_KEYS.strokeCountMin])
  if (strokeMin !== undefined) filters.strokeCountMin = strokeMin

  const strokeMax = parseNumber(q[FILTER_QUERY_KEYS.strokeCountMax])
  if (strokeMax !== undefined) filters.strokeCountMax = strokeMax

  return filters
}

/**
 * Parse level filters (JLPT, Joyo, Kentei)
 */
export function parseLevelFiltersFromQuery(
  q: Record<string, unknown>
): Partial<KanjiListFilters> {
  const filters: Partial<KanjiListFilters> = {}
  const jlpt = parseJlptLevels(q[FILTER_QUERY_KEYS.jlptLevels])
  if (jlpt) filters.jlptLevels = jlpt

  const joyo = parseJoyoLevels(q[FILTER_QUERY_KEYS.joyoLevels])
  if (joyo) filters.joyoLevels = joyo

  const kentei = parseKenteiLevels(q[FILTER_QUERY_KEYS.kenteiLevels])
  if (kentei) filters.kenteiLevels = kentei

  return filters
}

/**
 * Parse relational filters (radical, components, classifications)
 */
export function parseRelationalFiltersFromQuery(
  q: Record<string, unknown>
): Partial<KanjiListFilters> {
  const filters: Partial<KanjiListFilters> = {}
  const radicalId = parseNumber(q[FILTER_QUERY_KEYS.radicalId])
  if (radicalId !== undefined) filters.radicalId = radicalId

  const componentIds = parseNumberArray(q[FILTER_QUERY_KEYS.componentIds])
  if (componentIds) filters.componentIds = componentIds

  const classificationIds = parseNumberArray(
    q[FILTER_QUERY_KEYS.classificationTypeIds]
  )
  if (classificationIds) filters.classificationTypeIds = classificationIds

  return filters
}

/**
 * Parse stroke diagram/animation filters
 */
export function parseStrokeFiltersFromQuery(
  q: Record<string, unknown>
): Partial<KanjiListFilters> {
  const filters: Partial<KanjiListFilters> = {}
  const diagram = parseStrokeOrderFilter(
    q[FILTER_QUERY_KEYS.strokeOrderDiagram]
  )
  if (diagram) filters.strokeOrderDiagram = diagram

  const animation = parseStrokeOrderFilter(
    q[FILTER_QUERY_KEYS.strokeOrderAnimation]
  )
  if (animation) filters.strokeOrderAnimation = animation

  return filters
}

/**
 * Parse analysis field filters
 */
export function parseAnalysisFiltersFromQuery(
  q: Record<string, unknown>
): Partial<KanjiListFilters> {
  const filters: Partial<KanjiListFilters> = {}
  const analysis = parseAnalysisFilters(q[FILTER_QUERY_KEYS.analysisFilters])
  if (analysis) filters.analysisFilters = analysis
  return filters
}
