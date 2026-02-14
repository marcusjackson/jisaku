/**
 * Classification API Module
 *
 * Exports for classification type repository.
 * Used by kanji to categorize by etymology (象形, 指事, etc.)
 */

// Types
export type {
  ClassificationType,
  CreateClassificationTypeInput,
  CreateKanjiClassificationInput,
  KanjiClassification,
  UpdateClassificationTypeInput
} from './classification-types'

// Repositories
export { useClassificationTypeRepository } from './classification-type-repository'
export { useKanjiClassificationRepository } from './kanji-classification-repository'
