/**
 * Component Occurrence Repository Composable
 *
 * Provides data access methods for component occurrence entries.
 * Handles per-occurrence metadata like position, radical flag, and analysis notes.
 */

import { useDatabase } from '@/shared/composables/use-database'

import type {
  ComponentOccurrence,
  PositionType
} from '@/shared/types/database-types'

// =============================================================================
// Row Mapping
// =============================================================================

interface ComponentOccurrenceRow {
  id: number
  kanji_id: number
  component_id: number
  component_form_id: number | null
  position_type_id: number | null
  is_radical: number
  display_order: number
  analysis_notes: string | null
  created_at: string
  updated_at: string
}

function mapRowToOccurrence(row: ComponentOccurrenceRow): ComponentOccurrence {
  return {
    id: row.id,
    kanjiId: row.kanji_id,
    componentId: row.component_id,
    componentFormId: row.component_form_id,
    positionTypeId: row.position_type_id,
    isRadical: Boolean(row.is_radical),
    displayOrder: row.display_order,
    analysisNotes: row.analysis_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function resultToOccurrenceList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): ComponentOccurrence[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToOccurrence(obj as unknown as ComponentOccurrenceRow)
  })
}

// =============================================================================
// Extended Occurrence Type with Related Data
// =============================================================================

export interface ComponentOccurrenceWithPosition extends ComponentOccurrence {
  position: PositionType | null
}

// =============================================================================
// Composable
// =============================================================================

export interface UseComponentOccurrenceRepository {
  /** Get all occurrences for a kanji */
  getByKanjiId: (kanjiId: number) => ComponentOccurrence[]
  /** Get all occurrences of a component across all kanji */
  getByComponentId: (componentId: number) => ComponentOccurrence[]
  /** Get occurrences with position type data for a kanji */
  getByKanjiIdWithPosition: (
    kanjiId: number
  ) => ComponentOccurrenceWithPosition[]
  /** Get occurrences with position type data for a component */
  getByComponentIdWithPosition: (
    componentId: number
  ) => ComponentOccurrenceWithPosition[]
  /** Create a new component occurrence */
  create: (kanjiId: number, componentId: number) => ComponentOccurrence
  /** Delete a component occurrence */
  remove: (occurrenceId: number) => void
  /** Update analysis notes for an occurrence */
  updateAnalysisNotes: (
    occurrenceId: number,
    analysisNotes: string | null
  ) => void
  /** Update position type for an occurrence */
  updatePosition: (occurrenceId: number, positionTypeId: number | null) => void
  /** Toggle radical flag for an occurrence (auto-syncs kanji.radical_id) */
  updateIsRadical: (occurrenceId: number, isRadical: boolean) => void
  /** Update form assignment for an occurrence */
  updateFormAssignment: (occurrenceId: number, formId: number | null) => void
  /** Reorder occurrences for a component (swaps display_order of two items) */
  reorderOccurrences: (occurrenceIds: number[]) => void
}

export function useComponentOccurrenceRepository(): UseComponentOccurrenceRepository {
  const { exec, run } = useDatabase()

  function getByKanjiId(kanjiId: number): ComponentOccurrence[] {
    const result = exec(
      'SELECT * FROM component_occurrences WHERE kanji_id = ? ORDER BY display_order',
      [kanjiId]
    )
    return resultToOccurrenceList(result)
  }

  function getByComponentId(componentId: number): ComponentOccurrence[] {
    const result = exec(
      'SELECT * FROM component_occurrences WHERE component_id = ? ORDER BY kanji_id, display_order',
      [componentId]
    )
    return resultToOccurrenceList(result)
  }

  function getByKanjiIdWithPosition(
    kanjiId: number
  ): ComponentOccurrenceWithPosition[] {
    const result = exec(
      `SELECT 
        co.*,
        pt.id as pt_id,
        pt.position_name,
        pt.name_japanese,
        pt.name_english,
        pt.description,
        pt.description_short,
        pt.display_order as pt_display_order,
        pt.created_at as pt_created_at,
        pt.updated_at as pt_updated_at
      FROM component_occurrences co
      LEFT JOIN position_types pt ON co.position_type_id = pt.id
      WHERE co.kanji_id = ?
      ORDER BY co.display_order`,
      [kanjiId]
    )

    if (!result[0]) {
      return []
    }

    const { columns, values } = result[0]

    return values.map((row) => {
      const obj: Record<string, unknown> = {}
      columns.forEach((col, i) => {
        obj[col] = row[i]
      })

      const occurrence = mapRowToOccurrence({
        id: obj['id'] as number,
        kanji_id: obj['kanji_id'] as number,
        component_id: obj['component_id'] as number,
        component_form_id: obj['component_form_id'] as number | null,
        position_type_id: obj['position_type_id'] as number | null,
        is_radical: obj['is_radical'] as number,
        display_order: obj['display_order'] as number,
        analysis_notes: obj['analysis_notes'] as string | null,
        created_at: obj['created_at'] as string,
        updated_at: obj['updated_at'] as string
      })

      const position: PositionType | null = obj['pt_id']
        ? {
            id: obj['pt_id'] as number,
            positionName: obj['position_name'] as string,
            nameJapanese: obj['name_japanese'] as string | null,
            nameEnglish: obj['name_english'] as string | null,
            description: obj['description'] as string | null,
            descriptionShort: obj['description_short'] as string | null,
            displayOrder: obj['pt_display_order'] as number,
            createdAt: obj['pt_created_at'] as string,
            updatedAt: obj['pt_updated_at'] as string
          }
        : null

      return {
        ...occurrence,
        position
      }
    })
  }

  function getByComponentIdWithPosition(
    componentId: number
  ): ComponentOccurrenceWithPosition[] {
    const result = exec(
      `SELECT 
        co.*,
        pt.id as pt_id,
        pt.position_name,
        pt.name_japanese,
        pt.name_english,
        pt.description,
        pt.description_short,
        pt.display_order as pt_display_order,
        pt.created_at as pt_created_at,
        pt.updated_at as pt_updated_at
      FROM component_occurrences co
      LEFT JOIN position_types pt ON co.position_type_id = pt.id
      WHERE co.component_id = ?
      ORDER BY co.kanji_id, co.display_order`,
      [componentId]
    )

    if (!result[0]) {
      return []
    }

    const { columns, values } = result[0]

    return values.map((row) => {
      const obj: Record<string, unknown> = {}
      columns.forEach((col, i) => {
        obj[col] = row[i]
      })

      const occurrence = mapRowToOccurrence({
        id: obj['id'] as number,
        kanji_id: obj['kanji_id'] as number,
        component_id: obj['component_id'] as number,
        component_form_id: obj['component_form_id'] as number | null,
        position_type_id: obj['position_type_id'] as number | null,
        is_radical: obj['is_radical'] as number,
        display_order: obj['display_order'] as number,
        analysis_notes: obj['analysis_notes'] as string | null,
        created_at: obj['created_at'] as string,
        updated_at: obj['updated_at'] as string
      })

      const position: PositionType | null = obj['pt_id']
        ? {
            id: obj['pt_id'] as number,
            positionName: obj['position_name'] as string,
            nameJapanese: obj['name_japanese'] as string | null,
            nameEnglish: obj['name_english'] as string | null,
            description: obj['description'] as string | null,
            descriptionShort: obj['description_short'] as string | null,
            displayOrder: obj['pt_display_order'] as number,
            createdAt: obj['pt_created_at'] as string,
            updatedAt: obj['pt_updated_at'] as string
          }
        : null

      return {
        ...occurrence,
        position
      }
    })
  }

  function updateAnalysisNotes(
    occurrenceId: number,
    analysisNotes: string | null
  ): void {
    run('UPDATE component_occurrences SET analysis_notes = ? WHERE id = ?', [
      analysisNotes,
      occurrenceId
    ])
  }

  function updatePosition(
    occurrenceId: number,
    positionTypeId: number | null
  ): void {
    run('UPDATE component_occurrences SET position_type_id = ? WHERE id = ?', [
      positionTypeId,
      occurrenceId
    ])
  }

  function updateIsRadical(occurrenceId: number, isRadical: boolean): void {
    // First, get the occurrence to know which kanji and component we're working with
    const occurrenceResult = exec(
      'SELECT kanji_id, component_id FROM component_occurrences WHERE id = ?',
      [occurrenceId]
    )

    if (!occurrenceResult[0]?.values[0]) {
      throw new Error(`Occurrence with id ${String(occurrenceId)} not found`)
    }

    const kanjiId = occurrenceResult[0].values[0][0] as number
    const componentId = occurrenceResult[0].values[0][1] as number

    if (isRadical) {
      // Unset any existing radical for this kanji
      run(
        'UPDATE component_occurrences SET is_radical = 0 WHERE kanji_id = ? AND is_radical = 1',
        [kanjiId]
      )

      // Set this occurrence as the radical
      run('UPDATE component_occurrences SET is_radical = 1 WHERE id = ?', [
        occurrenceId
      ])

      // Update the kanji's radical_id
      run('UPDATE kanjis SET radical_id = ? WHERE id = ?', [
        componentId,
        kanjiId
      ])
    } else {
      // Unset the radical flag
      run('UPDATE component_occurrences SET is_radical = 0 WHERE id = ?', [
        occurrenceId
      ])

      // Clear the kanji's radical_id if this was the radical
      run(
        'UPDATE kanjis SET radical_id = NULL WHERE id = ? AND radical_id = ?',
        [kanjiId, componentId]
      )
    }
  }

  function create(kanjiId: number, componentId: number): ComponentOccurrence {
    // Get the next display order for this kanji
    const maxOrderResult = exec(
      'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM component_occurrences WHERE kanji_id = ?',
      [kanjiId]
    )
    const rawOrder = maxOrderResult[0]?.values[0]?.[0]
    const nextOrder = typeof rawOrder === 'number' ? rawOrder : 0

    run(
      `INSERT INTO component_occurrences (kanji_id, component_id, display_order, is_radical)
       VALUES (?, ?, ?, 0)`,
      [kanjiId, componentId, nextOrder]
    )

    // Get the newly created occurrence
    const idResult = exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const result = exec('SELECT * FROM component_occurrences WHERE id = ?', [
      newId
    ])
    const list = resultToOccurrenceList(result)
    if (!list[0]) {
      throw new Error('Failed to create component occurrence')
    }
    return list[0]
  }

  function remove(occurrenceId: number): void {
    // First check if this occurrence was marked as radical
    const occurrenceResult = exec(
      'SELECT kanji_id, component_id, is_radical FROM component_occurrences WHERE id = ?',
      [occurrenceId]
    )

    if (occurrenceResult[0]?.values[0]) {
      const kanjiId = occurrenceResult[0].values[0][0] as number
      const componentId = occurrenceResult[0].values[0][1] as number
      const wasRadical = Boolean(occurrenceResult[0].values[0][2])

      // If this was the radical, clear the kanji's radical_id
      if (wasRadical) {
        run(
          'UPDATE kanjis SET radical_id = NULL WHERE id = ? AND radical_id = ?',
          [kanjiId, componentId]
        )
      }
    }

    run('DELETE FROM component_occurrences WHERE id = ?', [occurrenceId])
  }

  function updateFormAssignment(
    occurrenceId: number,
    formId: number | null
  ): void {
    run(
      'UPDATE component_occurrences SET component_form_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [formId, occurrenceId]
    )
  }

  function reorderOccurrences(occurrenceIds: number[]): void {
    occurrenceIds.forEach((id, index) => {
      run(
        'UPDATE component_occurrences SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [index, id]
      )
    })
  }

  return {
    create,
    getByComponentId,
    getByComponentIdWithPosition,
    getByKanjiId,
    getByKanjiIdWithPosition,
    remove,
    reorderOccurrences,
    updateAnalysisNotes,
    updateFormAssignment,
    updateIsRadical,
    updatePosition
  }
}
