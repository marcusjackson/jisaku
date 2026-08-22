/**
 * Vocabulary Repository - Mutation Operations
 *
 * Write operations for vocabulary entities.
 *
 * @module api/vocabulary
 */

import { useDatabase } from '@/shared/composables/use-database'

import { schedulePersist } from '@/db/indexeddb'
import { CreateError, EntityNotFoundError, UpdateError } from '../api-types'

import type { UpdatableField } from '../api-types'
import type { VocabularyQueries } from './vocabulary-queries'
import type {
  CreateVocabularyInput,
  UpdateVocabularyInput,
  Vocabulary
} from './vocabulary-types'

// ============================================================================
// Mutation Operations
// ============================================================================

export class VocabularyMutations {
  private readonly run: ReturnType<typeof useDatabase>['run']
  private readonly exec: ReturnType<typeof useDatabase>['exec']
  private readonly queries: VocabularyQueries

  constructor(queries: VocabularyQueries) {
    const db = useDatabase()
    this.run = db.run
    this.exec = db.exec
    this.queries = queries
  }

  /**
   * Create a new vocabulary entry.
   *
   * @param input - Fields for the new vocabulary entry
   * @returns The created vocabulary entity
   * @throws {CreateError} If the insert fails
   */
  create(input: CreateVocabularyInput): Vocabulary {
    this.run(
      `INSERT INTO vocabulary (
        word, kana, short_meaning, search_keywords,
        jlpt_level, is_common, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.word,
        input.kana,
        input.shortMeaning ?? null,
        input.searchKeywords ?? null,
        input.jlptLevel ?? null,
        input.isCommon ? 1 : 0,
        input.description ?? null
      ]
    )

    const idResult = this.exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const created = this.queries.getById(newId)
    if (!created) {
      throw new CreateError('Vocabulary')
    }

    schedulePersist()
    return created
  }

  /** Build SQL SET clauses from input object */
  private buildUpdateSets(input: UpdateVocabularyInput): {
    sets: string[]
    values: unknown[]
  } {
    const sets: string[] = []
    const values: unknown[] = []

    const fieldMap = {
      word: 'word',
      kana: 'kana',
      shortMeaning: 'short_meaning',
      searchKeywords: 'search_keywords',
      jlptLevel: 'jlpt_level',
      description: 'description'
    } satisfies Partial<Record<UpdatableField<Vocabulary>, string>>

    for (const [key, column] of Object.entries(fieldMap)) {
      const value = input[key as keyof UpdateVocabularyInput]
      if (value !== undefined) {
        sets.push(`${column} = ?`)
        values.push(value)
      }
    }

    if (input.isCommon !== undefined) {
      sets.push('is_common = ?')
      values.push(input.isCommon ? 1 : 0)
    }

    return { sets, values }
  }

  /**
   * Update a vocabulary entry by id.
   *
   * @param id - Vocabulary id
   * @param input - Fields to update (partial)
   * @returns The updated vocabulary entity
   * @throws {EntityNotFoundError} If the entry does not exist
   * @throws {UpdateError} If the update fails to return
   */
  update(id: number, input: UpdateVocabularyInput): Vocabulary {
    const existing = this.queries.getById(id)
    if (!existing) {
      throw new EntityNotFoundError('Vocabulary', id)
    }

    const { sets, values } = this.buildUpdateSets(input)
    if (sets.length === 0) {
      return existing
    }

    sets.push("updated_at = datetime('now')")
    values.push(id)

    this.run(`UPDATE vocabulary SET ${sets.join(', ')} WHERE id = ?`, values)

    const updated = this.queries.getById(id)
    if (!updated) {
      throw new UpdateError('Vocabulary', id)
    }

    schedulePersist()
    return updated
  }

  /**
   * Update a single field on a vocabulary entry.
   *
   * @param id - Vocabulary id
   * @param field - Field name to update
   * @param value - New value
   * @returns The updated vocabulary entity
   * @throws {EntityNotFoundError} If the entry does not exist
   * @throws {UpdateError} If the update fails to return
   */
  updateField<K extends UpdatableField<Vocabulary>>(
    id: number,
    field: K,
    value: Vocabulary[K]
  ): Vocabulary {
    return this.update(id, { [field]: value })
  }

  /**
   * Delete a vocabulary entry and its kanji links by id.
   *
   * @param id - Vocabulary id
   */
  remove(id: number): void {
    try {
      this.run('BEGIN TRANSACTION')
      this.run('DELETE FROM vocab_kanji WHERE vocab_id = ?', [id])
      this.run('DELETE FROM vocabulary WHERE id = ?', [id])
      this.run('COMMIT')
    } catch (e) {
      this.run('ROLLBACK')
      throw e
    }
    schedulePersist()
  }
}
