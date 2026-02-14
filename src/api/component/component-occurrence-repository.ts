/**
 * Component Occurrence Repository - Data access for component occurrences.
 * @module api/component
 */
import { useDatabase } from '@/shared/composables/use-database'

import { schedulePersist } from '@/db/indexeddb'
import { BaseRepository } from '../base-repository'
import { EntityNotFoundError } from '../types'

import type { ChildRepository, Orderable } from '../types'
import type {
  ComponentOccurrence,
  CreateComponentOccurrenceInput,
  OccurrenceWithKanji,
  UpdateComponentOccurrenceInput
} from './component-types'

/** Row type for component_occurrences table */

interface ComponentOccurrenceRow {
  id: number
  kanji_id: number
  component_id: number
  component_form_id: number | null
  position_type_id: number | null
  is_radical: number
  analysis_notes: string | null
  display_order: number
  created_at: string
  updated_at: string
}

/** Repository implementation */

class ComponentOccurrenceRepositoryImpl
  extends BaseRepository<ComponentOccurrence>
  implements
    ChildRepository<
      ComponentOccurrence,
      CreateComponentOccurrenceInput,
      UpdateComponentOccurrenceInput
    >,
    Orderable
{
  protected tableName = 'component_occurrences'

  private readonly exec: ReturnType<typeof useDatabase>['exec']
  private readonly run: ReturnType<typeof useDatabase>['run']

  constructor() {
    super()
    const db = useDatabase()
    this.exec = db.exec
    this.run = db.run
  }

  protected mapRow(row: Record<string, unknown>): ComponentOccurrence {
    const r = row as unknown as ComponentOccurrenceRow
    return {
      id: r.id,
      kanjiId: r.kanji_id,
      componentId: r.component_id,
      componentFormId: r.component_form_id,
      positionTypeId: r.position_type_id,
      isRadical: r.is_radical === 1,
      analysisNotes: r.analysis_notes,
      displayOrder: r.display_order,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }
  }

  // Read Operations

  getById(id: number): ComponentOccurrence | null {
    const result = this.exec(
      'SELECT * FROM component_occurrences WHERE id = ?',
      [id]
    )
    return this.resultToEntity(result)
  }

  getAll(): ComponentOccurrence[] {
    const result = this.exec(
      'SELECT * FROM component_occurrences ORDER BY display_order ASC'
    )
    return this.resultToList(result)
  }

  /** Get occurrences by kanji (parent) */
  getByParentId(kanjiId: number): ComponentOccurrence[] {
    const result = this.exec(
      'SELECT * FROM component_occurrences WHERE kanji_id = ? ORDER BY display_order ASC',
      [kanjiId]
    )
    return this.resultToList(result)
  }

  /** Get all occurrences of a specific component across all kanji */
  getByComponentId(componentId: number): ComponentOccurrence[] {
    const result = this.exec(
      'SELECT * FROM component_occurrences WHERE component_id = ? ORDER BY kanji_id, display_order',
      [componentId]
    )
    return this.resultToList(result)
  }

  /** Get occurrences by component with joined kanji and position data */
  getByComponentIdWithKanji(componentId: number): OccurrenceWithKanji[] {
    const result = this.exec(
      `SELECT
        co.id, co.kanji_id, co.component_id, co.component_form_id,
        co.position_type_id, co.is_radical, co.analysis_notes,
        co.display_order, co.created_at, co.updated_at,
        k.id as k_id, k.character as k_character,
        k.short_meaning as k_short_meaning, k.stroke_count as k_stroke_count,
        pt.id as pt_id, pt.position_name, pt.name_japanese, pt.name_english,
        pt.description as pt_description, pt.display_order as pt_display_order
      FROM component_occurrences co
      LEFT JOIN kanjis k ON co.kanji_id = k.id
      LEFT JOIN position_types pt ON co.position_type_id = pt.id
      WHERE co.component_id = ?
      ORDER BY co.display_order`,
      [componentId]
    )
    return this.mapJoinedResult(result)
  }

  /** Map joined query result to OccurrenceWithKanji array */
  private mapJoinedResult(
    result: ReturnType<typeof this.exec>
  ): OccurrenceWithKanji[] {
    if (result.length === 0 || !result[0]) return []
    const columns = result[0].columns
    const values = result[0].values
    return values.map((row) => {
      const getValue = (col: string) => {
        const idx = columns.indexOf(col)
        return row[idx]
      }
      return {
        id: getValue('id') as number,
        kanjiId: getValue('kanji_id') as number,
        componentId: getValue('component_id') as number,
        componentFormId: getValue('component_form_id') as number | null,
        positionTypeId: getValue('position_type_id') as number | null,
        isRadical: (getValue('is_radical') as number) === 1,
        analysisNotes: getValue('analysis_notes') as string | null,
        displayOrder: getValue('display_order') as number,
        createdAt: getValue('created_at') as string,
        updatedAt: getValue('updated_at') as string,
        kanji: {
          id: getValue('k_id') as number,
          character: getValue('k_character') as string,
          shortMeaning: getValue('k_short_meaning') as string | null,
          strokeCount: getValue('k_stroke_count') as number | null
        },
        position: (getValue('pt_id') as number | null)
          ? {
              id: getValue('pt_id') as number,
              positionName: getValue('position_name') as string,
              nameJapanese: getValue('name_japanese') as string | null,
              nameEnglish: getValue('name_english') as string | null,
              description: getValue('pt_description') as string | null,
              displayOrder: getValue('pt_display_order') as number
            }
          : null
      }
    })
  }

  /** Get the radical occurrence for a kanji (if exists) */
  getRadicalOccurrence(kanjiId: number): ComponentOccurrence | null {
    const result = this.exec(
      'SELECT * FROM component_occurrences WHERE kanji_id = ? AND is_radical = 1',
      [kanjiId]
    )
    return this.resultToEntity(result)
  }

  // Write Operations

  create(input: CreateComponentOccurrenceInput): ComponentOccurrence {
    const maxResult = this.exec(
      'SELECT MAX(display_order) as max_order FROM component_occurrences WHERE kanji_id = ?',
      [input.kanjiId]
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1
    const displayOrder = input.displayOrder ?? maxOrder + 1

    this.run(
      `INSERT INTO component_occurrences (
        kanji_id, component_id, component_form_id, position_type_id,
        is_radical, analysis_notes, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.kanjiId,
        input.componentId,
        input.componentFormId ?? null,
        input.positionTypeId ?? null,
        input.isRadical ? 1 : 0,
        input.analysisNotes ?? null,
        displayOrder
      ]
    )

    const idResult = this.exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const created = this.getById(newId)
    if (!created) {
      throw new Error('Failed to retrieve created component occurrence')
    }

    schedulePersist()
    return created
  }

  update(
    id: number,
    input: UpdateComponentOccurrenceInput
  ): ComponentOccurrence {
    const existing = this.getById(id)
    if (!existing) {
      throw new EntityNotFoundError('ComponentOccurrence', id)
    }

    const sets: string[] = []
    const values: unknown[] = []

    if (input.componentFormId !== undefined) {
      sets.push('component_form_id = ?')
      values.push(input.componentFormId)
    }
    if (input.positionTypeId !== undefined) {
      sets.push('position_type_id = ?')
      values.push(input.positionTypeId)
    }
    if (input.isRadical !== undefined) {
      sets.push('is_radical = ?')
      values.push(input.isRadical ? 1 : 0)
    }
    if (input.analysisNotes !== undefined) {
      sets.push('analysis_notes = ?')
      values.push(input.analysisNotes)
    }

    if (sets.length === 0) {
      return existing
    }

    sets.push('updated_at = datetime("now")')
    values.push(id)

    this.run(
      `UPDATE component_occurrences SET ${sets.join(', ')} WHERE id = ?`,
      values
    )

    const updated = this.getById(id)
    if (!updated) {
      throw new Error('ComponentOccurrence disappeared after update')
    }

    schedulePersist()
    return updated
  }

  remove(id: number): void {
    this.run('DELETE FROM component_occurrences WHERE id = ?', [id])
    schedulePersist()
  }

  /** Remove all occurrences for a kanji */
  removeByKanjiId(kanjiId: number): void {
    this.run('DELETE FROM component_occurrences WHERE kanji_id = ?', [kanjiId])
    schedulePersist()
  }

  // Ordering

  reorder(ids: number[]): void {
    ids.forEach((id, index) => {
      this.run(
        'UPDATE component_occurrences SET display_order = ? WHERE id = ?',
        [index, id]
      )
    })
    schedulePersist()
  }
}

/** Factory function */

export function useComponentOccurrenceRepository(): ComponentOccurrenceRepositoryImpl {
  return new ComponentOccurrenceRepositoryImpl()
}

export type {
  ComponentOccurrence,
  CreateComponentOccurrenceInput,
  UpdateComponentOccurrenceInput
}
