/**
 * useSeedData
 *
 * Composable for seeding and clearing development data.
 * Used in settings page for developer tools and kanji list for quick access.
 *
 * Seed data uses type-safe keys (e.g., '10') that map to display labels
 * (e.g., '10級') via the KENTEI_LABELS lookup.
 */

import { ref } from 'vue';

import {
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
  seedAllTables,
} from './seed-data';
import { useDatabase } from './use-database';
import { useDatabaseExport } from './use-database-export';
import { useToast } from './use-toast';

import type { Ref } from 'vue';

/** Counts of seed data for testing */
const SEED_DATA_COUNTS = {
  classifications: SEED_CLASSIFICATIONS.length,
  components: SEED_COMPONENTS.length,
  kanji: SEED_KANJI.length,
  kunReadings: SEED_KUN_READINGS.length,
  meanings: SEED_MEANINGS.length,
  onReadings: SEED_ON_READINGS.length,
  positionTypes: SEED_POSITION_TYPES.length,
  readingGroups: SEED_READING_GROUPS.length,
  vocabulary: SEED_VOCABULARY.length,
} as const;

/** Return type for useSeedData composable */
export interface UseSeedDataReturn {
  /** Seed the database with sample data */
  seed: () => Promise<void>;
  /** Clear all data from the database */
  clear: () => Promise<void>;
  /** Whether seeding is in progress */
  isSeeding: Ref<boolean>;
  /** Whether clearing is in progress */
  isClearing: Ref<boolean>;
  /** Counts of seed data items by category */
  seedDataCounts: typeof SEED_DATA_COUNTS;
}

export function useSeedData(): UseSeedDataReturn {
  const { exec, persist, run, transaction } = useDatabase();
  const { error: showError, success: showSuccess } = useToast();
  const { clearDatabase } = useDatabaseExport();
  const isSeeding = ref(false);
  const isClearing = ref(false);

  async function seed() {
    if (isSeeding.value) return;
    isSeeding.value = true;
    try {
      const results = transaction(() => seedAllTables(exec, run));
      if (!hasSeededData(results)) {
        showError('Database already has data');
        return;
      }
      await persist();
      showSuccess(formatSeedMessage(results));
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to seed data');
    } finally {
      isSeeding.value = false;
    }
  }

  async function clear() {
    if (isClearing.value) return;
    isClearing.value = true;
    try {
      // The production clear owns the table list, the transaction and the toasts.
      await clearDatabase();
    } finally {
      isClearing.value = false;
    }
  }

  return {
    clear,
    isClearing,
    isSeeding,
    seed,
    seedDataCounts: SEED_DATA_COUNTS,
  };
}
