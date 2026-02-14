/**
 * Seed Data Helpers
 *
 * Helper functions for seeding database tables.
 * Extracted to reduce complexity in use-seed-data composable.
 */

import {
  seedClassifications,
  seedComponentOccurrences,
  seedComponents,
  seedKanji,
  seedKunReadings,
  seedMeanings,
  seedOnReadings,
  seedPositionTypes,
  seedReadingGroups,
  seedVocabKanji,
  seedVocabulary
} from './index'

import type { UseDatabase } from '../use-database'

type ExecFn = UseDatabase['exec']
type RunFn = UseDatabase['run']

/**
 * Extracts first scalar value from sql.js query result
 */
function getFirstValue(result: { values: unknown[][] }[]): unknown {
  return result[0]?.values[0]?.[0]
}

/**
 * Check if a table is empty
 */
function isTableEmpty(exec: ExecFn, table: string): boolean {
  const count = getFirstValue(exec(`SELECT COUNT(*) FROM ${table}`))
  return typeof count === 'number' && count === 0
}

export interface SeedResults {
  positionTypes: number
  kanji: number
  components: number
  onReadings: number
  kunReadings: number
  meanings: number
  readingGroups: number
  classifications: number
  vocabulary: number
  vocabKanji: number
}

/**
 * Seed all tables with sample data
 */
export function seedAllTables(exec: ExecFn, run: RunFn): SeedResults {
  const results: SeedResults = {
    positionTypes: 0,
    kanji: 0,
    components: 0,
    onReadings: 0,
    kunReadings: 0,
    meanings: 0,
    readingGroups: 0,
    classifications: 0,
    vocabulary: 0,
    vocabKanji: 0
  }

  if (isTableEmpty(exec, 'position_types')) {
    results.positionTypes = seedPositionTypes(run)
  }

  if (isTableEmpty(exec, 'kanjis')) {
    results.kanji = seedKanji(run)
  }

  if (isTableEmpty(exec, 'components')) {
    results.components = seedComponents(exec, run)
    seedComponentOccurrences(exec, run)
  }

  if (isTableEmpty(exec, 'on_readings')) {
    results.onReadings = seedOnReadings(run, exec)
  }

  if (isTableEmpty(exec, 'kun_readings')) {
    results.kunReadings = seedKunReadings(run, exec)
  }

  if (isTableEmpty(exec, 'kanji_meanings')) {
    results.meanings = seedMeanings(run, exec)
    results.readingGroups = seedReadingGroups(run, exec)
  }

  if (isTableEmpty(exec, 'kanji_classifications')) {
    results.classifications = seedClassifications(run, exec)
  }

  if (isTableEmpty(exec, 'vocabulary')) {
    results.vocabulary = seedVocabulary(run)
    results.vocabKanji = seedVocabKanji(exec, run)
  }

  return results
}

/**
 * Check if any data was seeded
 */
export function hasSeededData(results: SeedResults): boolean {
  return (
    results.positionTypes > 0 ||
    results.kanji > 0 ||
    results.components > 0 ||
    results.onReadings > 0 ||
    results.kunReadings > 0 ||
    results.meanings > 0 ||
    results.classifications > 0 ||
    results.vocabulary > 0
  )
}

/**
 * Format seed results as a message
 */
export function formatSeedMessage(results: SeedResults): string {
  const messages: string[] = []

  if (results.positionTypes > 0) {
    messages.push(`${String(results.positionTypes)} position types`)
  }
  if (results.kanji > 0) {
    messages.push(`${String(results.kanji)} kanji`)
  }
  if (results.components > 0) {
    messages.push(`${String(results.components)} components`)
  }
  if (results.onReadings > 0 || results.kunReadings > 0) {
    messages.push(
      `${String(results.onReadings + results.kunReadings)} readings`
    )
  }
  if (results.meanings > 0) {
    let msg = `${String(results.meanings)} meanings`
    if (results.readingGroups > 0) {
      msg += ` (${String(results.readingGroups)} grouped)`
    }
    messages.push(msg)
  }
  if (results.classifications > 0) {
    messages.push(`${String(results.classifications)} classifications`)
  }
  if (results.vocabulary > 0) {
    let msg = `${String(results.vocabulary)} vocabulary`
    if (results.vocabKanji > 0) {
      msg += ` (${String(results.vocabKanji)} kanji links)`
    }
    messages.push(msg)
  }

  return `Seeded ${messages.join(', ')}`
}

/**
 * Clear all seeded data from tables
 */
export function clearAllTables(run: RunFn): void {
  // Delete from junction/dependent tables first
  run('DELETE FROM vocab_kanji')
  run('DELETE FROM vocabulary')
  run('DELETE FROM component_occurrences')
  run('DELETE FROM kanji_classifications')
  run('DELETE FROM on_readings')
  run('DELETE FROM kun_readings')
  run('DELETE FROM kanji_meaning_group_members')
  run('DELETE FROM kanji_meaning_reading_groups')
  run('DELETE FROM kanji_meanings')
  // Then main tables
  run('DELETE FROM kanjis')
  run('DELETE FROM components')
}
