/**
 * Vocabulary Repository - Mutation Operations
 *
 * Write operations for vocabulary entities.
 *
 * @module api/vocabulary
 */

import { useDatabase } from '@/shared/composables/use-database'

import { schedulePersist } from '@/db/indexeddb'
import { EntityNotFoundError } from '../types'

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
  private readonly queries: VocabularyQueries

  constructor(queries: VocabularyQueries) {
    const db = useDatabase()
    this.run = db.run
    this.queries = queries
  }

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

    const { exec } = useDatabase()
    const idResult = exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const created = this.queries.getById(newId)
    if (!created) {
      throw new Error('Failed to retrieve created vocabulary')
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

    const fieldMap: Record<string, string> = {
      word: 'word',
      kana: 'kana',
      shortMeaning: 'short_meaning',
      searchKeywords: 'search_keywords',
      jlptLevel: 'jlpt_level',
      description: 'description'
    }

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

  update(id: number, input: UpdateVocabularyInput): Vocabulary {
    const existing = this.queries.getById(id)
    if (!existing) {
      throw new EntityNotFoundError('Vocabulary', id)
    }

    const { sets, values } = this.buildUpdateSets(input)
    if (sets.length === 0) {
      return existing
    }

    sets.push('updated_at = datetime("now")')
    values.push(id)

    this.run(`UPDATE vocabulary SET ${sets.join(', ')} WHERE id = ?`, values)

    const updated = this.queries.getById(id)
    if (!updated) {
      throw new Error('Vocabulary disappeared after update')
    }

    schedulePersist()
    return updated
  }

  updateField<K extends keyof Vocabulary>(
    id: number,
    field: K,
    value: Vocabulary[K]
  ): Vocabulary {
    return this.update(id, { [field]: value } as UpdateVocabularyInput)
  }

  remove(id: number): void {
    this.run('DELETE FROM vocabulary WHERE id = ?', [id])
    schedulePersist()
  }
}
