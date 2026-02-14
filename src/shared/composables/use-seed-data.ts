/**
 * useSeedData
 *
 * Composable for seeding and clearing development data.
 * Used in settings page for developer tools and kanji list for quick access.
 *
 * Note: This is separate from the legacy implementation to maintain
 * different data formats during the transition period. Legacy uses
 * full display labels (e.g., '10級') while refactored uses type-safe
 * keys (e.g., '10') that map to labels via KENTEI_LABELS lookup.
 */

import { ref } from 'vue'

import {
  clearAllTables,
  formatSeedMessage,
  hasSeededData,
  SEED_CLASSIFICATIONS,
  SEED_COMPONENTS,
  SEED_KANJI,
  SEED_KUN_READINGS,
  SEED_MEANINGS,
  SEED_ON_READINGS,
  SEED_POSITION_TYPES,
  SEED_READING_GROUPS,
  SEED_VOCABULARY,
  seedAllTables
} from './seed-data'
import { useDatabase } from './use-database'
import { useToast } from './use-toast'

/** Counts of seed data for testing */
export const SEED_DATA_COUNTS = {
  classifications: SEED_CLASSIFICATIONS.length,
  components: SEED_COMPONENTS.length,
  kanji: SEED_KANJI.length,
  kunReadings: SEED_KUN_READINGS.length,
  meanings: SEED_MEANINGS.length,
  onReadings: SEED_ON_READINGS.length,
  positionTypes: SEED_POSITION_TYPES.length,
  readingGroups: SEED_READING_GROUPS.length,
  vocabulary: SEED_VOCABULARY.length
} as const

export function useSeedData() {
  const { exec, persist, run } = useDatabase()
  const { error: showError, success: showSuccess } = useToast()
  const isSeeding = ref(false)
  const isClearing = ref(false)

  async function seed() {
    if (isSeeding.value) return
    isSeeding.value = true
    try {
      const results = seedAllTables(exec, run)
      if (!hasSeededData(results)) {
        showError('Database already has data')
        return
      }
      await persist()
      showSuccess(formatSeedMessage(results))
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
      clearAllTables(run)
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
    seedDataCounts: SEED_DATA_COUNTS
  }
}
