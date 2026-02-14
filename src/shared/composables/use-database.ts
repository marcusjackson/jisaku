/**
 * Database access composable
 *
 * Re-exports from legacy during the transition period.
 * This ensures all parts of the app use the same database singleton.
 *
 * After migration is complete, the legacy implementation can be
 * moved here and the re-export removed.
 */

// Re-export from legacy to ensure single database singleton
export type { UseDatabase } from '@/legacy/shared/composables/use-database'
export { useDatabase } from '@/legacy/shared/composables/use-database'
