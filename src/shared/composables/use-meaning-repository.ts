/**
 * Meaning Repository Composable
 *
 * Provides data access methods for kanji meanings with optional reading group support.
 * Uses the shared database composable for SQL operations.
 *
 * Three-table architecture:
 * - kanji_meanings: Core meanings independent of groupings
 * - kanji_meaning_reading_groups: Optional reading groupings
 * - kanji_meaning_group_members: Junction table for meaning-group assignments
 */

import { useDatabase } from '@/shared/composables/use-database'

import type {
  CreateGroupMemberInput,
  CreateKanjiMeaningInput,
  CreateReadingGroupInput,
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup,
  UpdateKanjiMeaningInput,
  UpdateReadingGroupInput
} from '@/shared/types/database-types'

// =============================================================================
// Row Mapping
// =============================================================================

interface MeaningRow {
  id: number
  kanji_id: number
  meaning_text: string
  additional_info: string | null
  display_order: number
  created_at: string
  updated_at: string
}

interface ReadingGroupRow {
  id: number
  kanji_id: number
  reading_text: string
  display_order: number
  created_at: string
  updated_at: string
}

interface GroupMemberRow {
  id: number
  reading_group_id: number
  meaning_id: number
  display_order: number
  created_at: string
  updated_at: string
}

function mapRowToMeaning(row: MeaningRow): KanjiMeaning {
  return {
    id: row.id,
    kanjiId: row.kanji_id,
    meaningText: row.meaning_text,
    additionalInfo: row.additional_info,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapRowToReadingGroup(row: ReadingGroupRow): KanjiMeaningReadingGroup {
  return {
    id: row.id,
    kanjiId: row.kanji_id,
    readingText: row.reading_text,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapRowToGroupMember(row: GroupMemberRow): KanjiMeaningGroupMember {
  return {
    id: row.id,
    readingGroupId: row.reading_group_id,
    meaningId: row.meaning_id,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function resultToMeaningList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): KanjiMeaning[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToMeaning(obj as unknown as MeaningRow)
  })
}

function resultToReadingGroupList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): KanjiMeaningReadingGroup[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToReadingGroup(obj as unknown as ReadingGroupRow)
  })
}

function resultToGroupMemberList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): KanjiMeaningGroupMember[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToGroupMember(obj as unknown as GroupMemberRow)
  })
}

// =============================================================================
// Composable Interface
// =============================================================================

export interface UseMeaningRepository {
  // Meaning methods
  /** Get all meanings for a kanji, ordered by display_order */
  getMeaningsByKanjiId: (kanjiId: number) => KanjiMeaning[]
  /** Get a single meaning by ID */
  getMeaningById: (id: number) => KanjiMeaning | null
  /** Create a new meaning */
  createMeaning: (input: CreateKanjiMeaningInput) => KanjiMeaning
  /** Update a meaning */
  updateMeaning: (id: number, input: UpdateKanjiMeaningInput) => KanjiMeaning
  /** Delete a meaning (and its group assignments) */
  removeMeaning: (id: number) => void
  /** Reorder meanings for a kanji */
  reorderMeanings: (kanjiId: number, meaningIds: number[]) => void

  // Reading group methods
  /** Get all reading groups for a kanji, ordered by display_order */
  getReadingGroupsByKanjiId: (kanjiId: number) => KanjiMeaningReadingGroup[]
  /** Get a single reading group by ID */
  getReadingGroupById: (id: number) => KanjiMeaningReadingGroup | null
  /** Create a new reading group */
  createReadingGroup: (
    input: CreateReadingGroupInput
  ) => KanjiMeaningReadingGroup
  /** Update a reading group */
  updateReadingGroup: (
    id: number,
    input: UpdateReadingGroupInput
  ) => KanjiMeaningReadingGroup
  /** Delete a reading group (and its member assignments) */
  removeReadingGroup: (id: number) => void
  /** Reorder reading groups for a kanji */
  reorderReadingGroups: (kanjiId: number, groupIds: number[]) => void
  /** Delete all reading groups for a kanji (disable grouping) */
  removeAllReadingGroups: (kanjiId: number) => void

  // Group member methods
  /** Get all group members for a reading group */
  getGroupMembersByGroupId: (groupId: number) => KanjiMeaningGroupMember[]
  /** Get all group members for a kanji (across all groups) */
  getGroupMembersByKanjiId: (kanjiId: number) => KanjiMeaningGroupMember[]
  /** Add a meaning to a reading group */
  addMeaningToGroup: (input: CreateGroupMemberInput) => KanjiMeaningGroupMember
  /** Remove a meaning from a reading group */
  removeMeaningFromGroup: (groupId: number, meaningId: number) => void
  /** Reorder meanings within a group */
  reorderMeaningsInGroup: (groupId: number, meaningIds: number[]) => void

  // Utility methods
  /** Check if grouping is enabled (any reading groups exist) */
  isGroupingEnabled: (kanjiId: number) => boolean
  /** Get unassigned meanings (not in any group) */
  getUnassignedMeanings: (kanjiId: number) => KanjiMeaning[]
  /** Delete empty groups for a kanji */
  deleteEmptyGroups: (kanjiId: number) => void
}

// =============================================================================
// Composable
// =============================================================================

export function useMeaningRepository(): UseMeaningRepository {
  const { exec, run } = useDatabase()

  // ===========================================================================
  // Meaning Methods
  // ===========================================================================

  function getMeaningsByKanjiId(kanjiId: number): KanjiMeaning[] {
    const result = exec(
      'SELECT * FROM kanji_meanings WHERE kanji_id = ? ORDER BY display_order ASC',
      [kanjiId]
    )
    return resultToMeaningList(result)
  }

  function getMeaningById(id: number): KanjiMeaning | null {
    const result = exec('SELECT * FROM kanji_meanings WHERE id = ?', [id])
    const list = resultToMeaningList(result)
    return list[0] ?? null
  }

  function createMeaning(input: CreateKanjiMeaningInput): KanjiMeaning {
    // Get current max display_order for this kanji
    const maxResult = exec(
      'SELECT MAX(display_order) as max_order FROM kanji_meanings WHERE kanji_id = ?',
      [input.kanjiId]
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1
    const displayOrder = input.displayOrder ?? maxOrder + 1

    const sql = `
      INSERT INTO kanji_meanings (kanji_id, meaning_text, additional_info, display_order)
      VALUES (?, ?, ?, ?)
    `
    run(sql, [
      input.kanjiId,
      input.meaningText,
      input.additionalInfo ?? null,
      displayOrder
    ])

    // Get the newly created meaning
    const idResult = exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number
    const created = getMeaningById(newId)
    if (!created) {
      throw new Error('Failed to create meaning')
    }
    return created
  }

  function updateMeaning(
    id: number,
    input: UpdateKanjiMeaningInput
  ): KanjiMeaning {
    const fields: string[] = []
    const values: unknown[] = []

    if (input.meaningText !== undefined) {
      fields.push('meaning_text = ?')
      values.push(input.meaningText)
    }
    if (input.additionalInfo !== undefined) {
      fields.push('additional_info = ?')
      values.push(input.additionalInfo)
    }
    if (input.displayOrder !== undefined) {
      fields.push('display_order = ?')
      values.push(input.displayOrder)
    }

    if (fields.length === 0) {
      const existing = getMeaningById(id)
      if (!existing) {
        throw new Error(`Meaning with id ${String(id)} not found`)
      }
      return existing
    }

    values.push(id)
    const sql = `UPDATE kanji_meanings SET ${fields.join(', ')} WHERE id = ?`
    run(sql, values)

    const updated = getMeaningById(id)
    if (!updated) {
      throw new Error(`Meaning with id ${String(id)} not found`)
    }
    return updated
  }

  function removeMeaning(id: number): void {
    // CASCADE will handle group_members deletion
    run('DELETE FROM kanji_meanings WHERE id = ?', [id])
  }

  function reorderMeanings(kanjiId: number, meaningIds: number[]): void {
    meaningIds.forEach((meaningId, index) => {
      run(
        'UPDATE kanji_meanings SET display_order = ? WHERE id = ? AND kanji_id = ?',
        [index, meaningId, kanjiId]
      )
    })
  }

  // ===========================================================================
  // Reading Group Methods
  // ===========================================================================

  function getReadingGroupsByKanjiId(
    kanjiId: number
  ): KanjiMeaningReadingGroup[] {
    const result = exec(
      'SELECT * FROM kanji_meaning_reading_groups WHERE kanji_id = ? ORDER BY display_order ASC',
      [kanjiId]
    )
    return resultToReadingGroupList(result)
  }

  function getReadingGroupById(id: number): KanjiMeaningReadingGroup | null {
    const result = exec(
      'SELECT * FROM kanji_meaning_reading_groups WHERE id = ?',
      [id]
    )
    const list = resultToReadingGroupList(result)
    return list[0] ?? null
  }

  function createReadingGroup(
    input: CreateReadingGroupInput
  ): KanjiMeaningReadingGroup {
    // Get current max display_order for this kanji
    const maxResult = exec(
      'SELECT MAX(display_order) as max_order FROM kanji_meaning_reading_groups WHERE kanji_id = ?',
      [input.kanjiId]
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1
    const displayOrder = input.displayOrder ?? maxOrder + 1

    const sql = `
      INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order)
      VALUES (?, ?, ?)
    `
    run(sql, [input.kanjiId, input.readingText, displayOrder])

    // Get the newly created group
    const idResult = exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number
    const created = getReadingGroupById(newId)
    if (!created) {
      throw new Error('Failed to create reading group')
    }
    return created
  }

  function updateReadingGroup(
    id: number,
    input: UpdateReadingGroupInput
  ): KanjiMeaningReadingGroup {
    const fields: string[] = []
    const values: unknown[] = []

    if (input.readingText !== undefined) {
      fields.push('reading_text = ?')
      values.push(input.readingText)
    }
    if (input.displayOrder !== undefined) {
      fields.push('display_order = ?')
      values.push(input.displayOrder)
    }

    if (fields.length === 0) {
      const existing = getReadingGroupById(id)
      if (!existing) {
        throw new Error(`Reading group with id ${String(id)} not found`)
      }
      return existing
    }

    values.push(id)
    const sql = `UPDATE kanji_meaning_reading_groups SET ${fields.join(', ')} WHERE id = ?`
    run(sql, values)

    const updated = getReadingGroupById(id)
    if (!updated) {
      throw new Error(`Reading group with id ${String(id)} not found`)
    }
    return updated
  }

  function removeReadingGroup(id: number): void {
    // CASCADE will handle group_members deletion
    run('DELETE FROM kanji_meaning_reading_groups WHERE id = ?', [id])
  }

  function reorderReadingGroups(kanjiId: number, groupIds: number[]): void {
    groupIds.forEach((groupId, index) => {
      run(
        'UPDATE kanji_meaning_reading_groups SET display_order = ? WHERE id = ? AND kanji_id = ?',
        [index, groupId, kanjiId]
      )
    })
  }

  function removeAllReadingGroups(kanjiId: number): void {
    // CASCADE will handle group_members deletion
    run('DELETE FROM kanji_meaning_reading_groups WHERE kanji_id = ?', [
      kanjiId
    ])
  }

  // ===========================================================================
  // Group Member Methods
  // ===========================================================================

  function getGroupMembersByGroupId(
    groupId: number
  ): KanjiMeaningGroupMember[] {
    const result = exec(
      'SELECT * FROM kanji_meaning_group_members WHERE reading_group_id = ? ORDER BY display_order ASC',
      [groupId]
    )
    return resultToGroupMemberList(result)
  }

  function getGroupMembersByKanjiId(
    kanjiId: number
  ): KanjiMeaningGroupMember[] {
    const result = exec(
      `SELECT gm.* FROM kanji_meaning_group_members gm
       JOIN kanji_meaning_reading_groups rg ON gm.reading_group_id = rg.id
       WHERE rg.kanji_id = ?
       ORDER BY gm.display_order ASC`,
      [kanjiId]
    )
    return resultToGroupMemberList(result)
  }

  function addMeaningToGroup(
    input: CreateGroupMemberInput
  ): KanjiMeaningGroupMember {
    // Get current max display_order for this group
    const maxResult = exec(
      'SELECT MAX(display_order) as max_order FROM kanji_meaning_group_members WHERE reading_group_id = ?',
      [input.readingGroupId]
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1
    const displayOrder = input.displayOrder ?? maxOrder + 1

    const sql = `
      INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order)
      VALUES (?, ?, ?)
    `
    run(sql, [input.readingGroupId, input.meaningId, displayOrder])

    // Get the newly created member
    const idResult = exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number
    const result = exec(
      'SELECT * FROM kanji_meaning_group_members WHERE id = ?',
      [newId]
    )
    const list = resultToGroupMemberList(result)
    if (!list[0]) {
      throw new Error('Failed to add meaning to group')
    }
    return list[0]
  }

  function removeMeaningFromGroup(groupId: number, meaningId: number): void {
    run(
      'DELETE FROM kanji_meaning_group_members WHERE reading_group_id = ? AND meaning_id = ?',
      [groupId, meaningId]
    )
  }

  function reorderMeaningsInGroup(groupId: number, meaningIds: number[]): void {
    meaningIds.forEach((meaningId, index) => {
      run(
        'UPDATE kanji_meaning_group_members SET display_order = ? WHERE reading_group_id = ? AND meaning_id = ?',
        [index, groupId, meaningId]
      )
    })
  }

  // ===========================================================================
  // Utility Methods
  // ===========================================================================

  function isGroupingEnabled(kanjiId: number): boolean {
    const result = exec(
      'SELECT COUNT(*) as count FROM kanji_meaning_reading_groups WHERE kanji_id = ?',
      [kanjiId]
    )
    const count = result[0]?.values[0]?.[0] as number
    return count > 0
  }

  function getUnassignedMeanings(kanjiId: number): KanjiMeaning[] {
    const result = exec(
      `SELECT m.* FROM kanji_meanings m
       WHERE m.kanji_id = ?
         AND m.id NOT IN (
           SELECT meaning_id FROM kanji_meaning_group_members
         )
       ORDER BY m.display_order ASC`,
      [kanjiId]
    )
    return resultToMeaningList(result)
  }

  function deleteEmptyGroups(kanjiId: number): void {
    // Delete groups that have no members
    run(
      `DELETE FROM kanji_meaning_reading_groups
       WHERE kanji_id = ?
         AND id NOT IN (
           SELECT DISTINCT reading_group_id FROM kanji_meaning_group_members
         )`,
      [kanjiId]
    )
  }

  return {
    // Meaning methods
    getMeaningsByKanjiId,
    getMeaningById,
    createMeaning,
    updateMeaning,
    removeMeaning,
    reorderMeanings,
    // Reading group methods
    getReadingGroupsByKanjiId,
    getReadingGroupById,
    createReadingGroup,
    updateReadingGroup,
    removeReadingGroup,
    reorderReadingGroups,
    removeAllReadingGroups,
    // Group member methods
    getGroupMembersByGroupId,
    getGroupMembersByKanjiId,
    addMeaningToGroup,
    removeMeaningFromGroup,
    reorderMeaningsInGroup,
    // Utility methods
    isGroupingEnabled,
    getUnassignedMeanings,
    deleteEmptyGroups
  }
}
