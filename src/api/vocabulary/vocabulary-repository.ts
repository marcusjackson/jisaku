/**
 * Vocabulary Repository
 *
 * Data access layer for vocabulary entities.
 * Implements CRUD operations, field-level updates, and search.
 *
 * @module api/vocabulary
 */

import { VocabularyMutations } from './vocabulary-mutations'
import { VocabularyQueries } from './vocabulary-queries'

import type { FieldUpdatable, Repository, UpdatableField } from '../types'
import type {
  CreateVocabularyInput,
  UpdateVocabularyInput,
  Vocabulary,
  VocabularyFilters
} from './vocabulary-types'

// ============================================================================
// Repository Implementation
// ============================================================================

class VocabularyRepositoryImpl
  implements
    Repository<Vocabulary, CreateVocabularyInput, UpdateVocabularyInput>,
    FieldUpdatable<Vocabulary>
{
  private readonly queries: VocabularyQueries
  private readonly mutations: VocabularyMutations

  constructor() {
    this.queries = new VocabularyQueries()
    this.mutations = new VocabularyMutations(this.queries)
  }

  // ==========================================================================
  // Read Operations (delegated to queries)
  // ==========================================================================

  getById(id: number): Vocabulary | null {
    return this.queries.getById(id)
  }

  getAll(): Vocabulary[] {
    return this.queries.getAll()
  }

  getByWord(word: string): Vocabulary | null {
    return this.queries.getByWord(word)
  }

  getByIds(ids: number[]): Vocabulary[] {
    return this.queries.getByIds(ids)
  }

  getCommonWords(): Vocabulary[] {
    return this.queries.getCommonWords()
  }

  search(filters?: VocabularyFilters): Vocabulary[] {
    return this.queries.search(filters)
  }

  // ==========================================================================
  // Write Operations (delegated to mutations)
  // ==========================================================================

  create(input: CreateVocabularyInput): Vocabulary {
    return this.mutations.create(input)
  }

  update(id: number, input: UpdateVocabularyInput): Vocabulary {
    return this.mutations.update(id, input)
  }

  updateField<K extends UpdatableField<Vocabulary>>(
    id: number,
    field: K,
    value: Vocabulary[K]
  ): Vocabulary {
    return this.mutations.updateField(id, field, value)
  }

  remove(id: number): void {
    this.mutations.remove(id)
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function useVocabularyRepository(): VocabularyRepositoryImpl {
  return new VocabularyRepositoryImpl()
}

export type {
  CreateVocabularyInput,
  UpdateVocabularyInput,
  Vocabulary,
  VocabularyFilters
}
