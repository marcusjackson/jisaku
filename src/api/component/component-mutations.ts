/**
 * Component Repository - Mutation Operations
 *
 * Write operations for component entities.
 *
 * @module api/component
 */

import { useDatabase } from '@/shared/composables/use-database'

import { schedulePersist } from '@/db/indexeddb'
import { EntityNotFoundError } from '../types'

import type { ComponentQueries } from './component-queries'
import type {
  Component,
  CreateComponentInput,
  UpdateComponentInput
} from './component-types'

// ============================================================================
// Mutation Operations
// ============================================================================

export class ComponentMutations {
  private readonly run: ReturnType<typeof useDatabase>['run']
  private readonly queries: ComponentQueries

  constructor(queries: ComponentQueries) {
    const db = useDatabase()
    this.run = db.run
    this.queries = queries
  }

  create(input: CreateComponentInput): Component {
    this.run(
      `INSERT INTO components (
        character, stroke_count, short_meaning, search_keywords,
        source_kanji_id, description, can_be_radical,
        kangxi_number, kangxi_meaning, radical_name_japanese
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.character,
        input.strokeCount ?? null,
        input.shortMeaning ?? null,
        input.searchKeywords ?? null,
        input.sourceKanjiId ?? null,
        input.description ?? null,
        input.canBeRadical ? 1 : 0,
        input.kangxiNumber ?? null,
        input.kangxiMeaning ?? null,
        input.radicalNameJapanese ?? null
      ]
    )

    const { exec } = useDatabase()
    const idResult = exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const created = this.queries.getById(newId)
    if (!created) {
      throw new Error('Failed to retrieve created component')
    }

    schedulePersist()
    return created
  }

  /** Build SQL SET clauses from input object */
  private buildUpdateSets(input: UpdateComponentInput): {
    sets: string[]
    values: unknown[]
  } {
    const sets: string[] = []
    const values: unknown[] = []

    const fieldMap: Record<string, string> = {
      character: 'character',
      strokeCount: 'stroke_count',
      shortMeaning: 'short_meaning',
      searchKeywords: 'search_keywords',
      sourceKanjiId: 'source_kanji_id',
      description: 'description',
      kangxiNumber: 'kangxi_number',
      kangxiMeaning: 'kangxi_meaning',
      radicalNameJapanese: 'radical_name_japanese'
    }

    for (const [key, column] of Object.entries(fieldMap)) {
      const value = input[key as keyof UpdateComponentInput]
      if (value !== undefined) {
        sets.push(`${column} = ?`)
        values.push(value)
      }
    }

    if (input.canBeRadical !== undefined) {
      sets.push('can_be_radical = ?')
      values.push(input.canBeRadical ? 1 : 0)
    }

    return { sets, values }
  }

  update(id: number, input: UpdateComponentInput): Component {
    const existing = this.queries.getById(id)
    if (!existing) {
      throw new EntityNotFoundError('Component', id)
    }

    const { sets, values } = this.buildUpdateSets(input)
    if (sets.length === 0) {
      return existing
    }

    sets.push('updated_at = datetime("now")')
    values.push(id)

    this.run(`UPDATE components SET ${sets.join(', ')} WHERE id = ?`, values)

    const updated = this.queries.getById(id)
    if (!updated) {
      throw new Error('Component disappeared after update')
    }

    schedulePersist()
    return updated
  }

  updateField<K extends keyof Component>(
    id: number,
    field: K,
    value: Component[K]
  ): Component {
    return this.update(id, { [field]: value } as UpdateComponentInput)
  }

  remove(id: number): void {
    this.run('DELETE FROM components WHERE id = ?', [id])
    schedulePersist()
  }
}
