/**
 * useSeedData
 *
 * Composable for seeding and clearing development data.
 * Used in settings page for developer tools and kanji list for quick access.
 *
 * This is a shared composable that can be imported by both settings
 * and kanji-list modules without cross-module dependencies.
 *
 * Actual seed data is stored in themed files in the src/shared/composables/seed-data folder.
 */

import { ref } from 'vue'

import {
  SEED_CLASSIFICATIONS,
  SEED_COMPONENTS,
  SEED_KANJI,
  SEED_KUN_READINGS,
  SEED_MEANINGS,
  SEED_ON_READINGS,
  SEED_POSITION_TYPES,
  SEED_READING_GROUPS,
  SEED_VOCABULARY,
  seedClassifications,
  seedComponentForms,
  seedComponentGroupings,
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
} from './seed-data'
import { useDatabase } from './use-database'
import { useToast } from './use-toast'

/**
 * Extracts first scalar value from sql.js query result
 * @param result - Query result from exec()
 * @returns The first value from the result, or undefined
 */
function getFirstValue(result: { values: unknown[][] }[]): unknown {
  return result[0]?.values[0]?.[0]
}

export function useSeedData() {
  const { exec, persist, run } = useDatabase()
  const { error: showError, success: showSuccess } = useToast()

  const isSeeding = ref(false)
  const isClearing = ref(false)

  async function seed() {
    if (isSeeding.value) return

    isSeeding.value = true
    try {
      let seededKanji = 0
      let seededComponents = 0
      let seededPositionTypes = 0
      let seededOnReadings = 0
      let seededKunReadings = 0
      let seededMeanings = 0
      let seededReadingGroups = 0
      let seededClassifications = 0

      // Seed position types (reference data)
      const positionTypeCount = getFirstValue(
        exec('SELECT COUNT(*) as count FROM position_types')
      )
      if (typeof positionTypeCount === 'number' && positionTypeCount === 0) {
        seededPositionTypes = seedPositionTypes(run)
      }

      // Seed kanji
      const kanjiCount = getFirstValue(
        exec('SELECT COUNT(*) as count FROM kanjis')
      )
      if (typeof kanjiCount === 'number' && kanjiCount === 0) {
        seededKanji = seedKanji(run)
      }

      // Seed components
      const componentCount = getFirstValue(
        exec('SELECT COUNT(*) as count FROM components')
      )
      if (typeof componentCount === 'number' && componentCount === 0) {
        seededComponents = seedComponents(exec, run)
        // Seed kanji-component relationships
        seedComponentOccurrences(exec, run)
      }

      // Seed readings (if kanji exist and readings are empty)
      const onReadingCount = getFirstValue(
        exec('SELECT COUNT(*) as count FROM on_readings')
      )
      if (typeof onReadingCount === 'number' && onReadingCount === 0) {
        seededOnReadings = seedOnReadings(run, exec)
      }

      const kunReadingCount = getFirstValue(
        exec('SELECT COUNT(*) as count FROM kun_readings')
      )
      if (typeof kunReadingCount === 'number' && kunReadingCount === 0) {
        seededKunReadings = seedKunReadings(run, exec)
      }

      // Seed meanings (if kanji exist and meanings are empty)
      const meaningCount = getFirstValue(
        exec('SELECT COUNT(*) as count FROM kanji_meanings')
      )
      if (typeof meaningCount === 'number' && meaningCount === 0) {
        seededMeanings = seedMeanings(run, exec)
        // Also seed reading groups for 日 kanji demo
        seededReadingGroups = seedReadingGroups(run, exec)
      }

      // Seed classifications (if kanji exist and classifications are empty)
      const classificationCount = getFirstValue(
        exec('SELECT COUNT(*) as count FROM kanji_classifications')
      )
      if (
        typeof classificationCount === 'number' &&
        classificationCount === 0
      ) {
        seededClassifications = seedClassifications(run, exec)
      }

      // Seed component forms (if components exist and forms are empty)
      let seededComponentForms = 0
      const componentFormCount = getFirstValue(
        exec('SELECT COUNT(*) as count FROM component_forms')
      )
      if (typeof componentFormCount === 'number' && componentFormCount === 0) {
        seededComponentForms = seedComponentForms(exec, run)
      }

      // Seed component groupings (if components exist and groupings are empty)
      let seededComponentGroupings = 0
      const componentGroupingCount = getFirstValue(
        exec('SELECT COUNT(*) as count FROM component_groupings')
      )
      if (
        typeof componentGroupingCount === 'number' &&
        componentGroupingCount === 0
      ) {
        seededComponentGroupings = seedComponentGroupings(exec, run)
      }

      // Seed vocabulary (if empty)
      let seededVocabCount = 0
      let seededVocabKanjiCount = 0
      const vocabularyCount = getFirstValue(
        exec('SELECT COUNT(*) as count FROM vocabulary')
      )
      if (typeof vocabularyCount === 'number' && vocabularyCount === 0) {
        seededVocabCount = seedVocabulary(run)
        // Seed vocab-kanji links (requires both vocab and kanji to exist)
        seededVocabKanjiCount = seedVocabKanji(exec, run)
      }

      if (
        seededKanji === 0 &&
        seededComponents === 0 &&
        seededPositionTypes === 0 &&
        seededOnReadings === 0 &&
        seededKunReadings === 0 &&
        seededMeanings === 0 &&
        seededClassifications === 0 &&
        seededComponentForms === 0 &&
        seededComponentGroupings === 0 &&
        seededVocabCount === 0
      ) {
        showError('Database already has data')
        return
      }

      await persist()
      const messages: string[] = []
      if (seededPositionTypes > 0) {
        messages.push(`${String(seededPositionTypes)} position types`)
      }
      if (seededKanji > 0) {
        messages.push(`${String(seededKanji)} kanji`)
      }
      if (seededComponents > 0) {
        messages.push(`${String(seededComponents)} components`)
      }
      if (seededOnReadings > 0 || seededKunReadings > 0) {
        messages.push(
          `${String(seededOnReadings + seededKunReadings)} readings`
        )
      }
      if (seededMeanings > 0) {
        let meaningMsg = `${String(seededMeanings)} meanings`
        if (seededReadingGroups > 0) {
          meaningMsg += ` (${String(seededReadingGroups)} grouped)`
        }
        messages.push(meaningMsg)
      }
      if (seededClassifications > 0) {
        messages.push(`${String(seededClassifications)} classifications`)
      }
      if (seededComponentForms > 0) {
        messages.push(`${String(seededComponentForms)} component forms`)
      }
      if (seededComponentGroupings > 0) {
        messages.push(`${String(seededComponentGroupings)} component groupings`)
      }
      if (seededVocabCount > 0) {
        let vocabMsg = `${String(seededVocabCount)} vocabulary`
        if (seededVocabKanjiCount > 0) {
          vocabMsg += ` (${String(seededVocabKanjiCount)} kanji links)`
        }
        messages.push(vocabMsg)
      }
      showSuccess(`Seeded ${messages.join(', ')}`)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to seed data')
    } finally {
      isSeeding.value = false
    }
  }

  async function clear() {
    if (isClearing.value) return

    isClearing.value = true
    try {
      // Delete from junction/dependent tables first
      run('DELETE FROM vocab_kanji')
      run('DELETE FROM vocabulary')
      run('DELETE FROM component_grouping_members')
      run('DELETE FROM component_groupings')
      run('DELETE FROM component_occurrences')
      run('DELETE FROM component_forms')
      run('DELETE FROM kanji_classifications')
      run('DELETE FROM on_readings')
      run('DELETE FROM kun_readings')
      run('DELETE FROM kanji_meaning_group_members')
      run('DELETE FROM kanji_meaning_reading_groups')
      run('DELETE FROM kanji_meanings')
      // Then main tables
      run('DELETE FROM kanjis')
      run('DELETE FROM components')
      // Note: classification_types and position_types are reference data, keep them
      await persist()
      showSuccess('All data cleared')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to clear data')
    } finally {
      isClearing.value = false
    }
  }

  return {
    clear,
    isClearing,
    isSeeding,
    seed,
    // Export data counts for testing
    seedDataCounts: {
      kanji: SEED_KANJI.length,
      components: SEED_COMPONENTS.length,
      positionTypes: SEED_POSITION_TYPES.length,
      onReadings: SEED_ON_READINGS.length,
      kunReadings: SEED_KUN_READINGS.length,
      meanings: SEED_MEANINGS.length,
      readingGroups: SEED_READING_GROUPS.length,
      classifications: SEED_CLASSIFICATIONS.length,
      vocabulary: SEED_VOCABULARY.length
    }
  }
}
