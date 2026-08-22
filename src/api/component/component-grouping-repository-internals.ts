/**
 * Component Grouping Repository Internals
 *
 * Internal row types and mapping utilities for the grouping repository.
 *
 * @internal
 */

import type { ComponentGroupingMember } from './component-types'

// ============================================================================
// Row Type
// ============================================================================

/** Row type for component_grouping_members table */
export interface ComponentGroupingMemberRow {
  id: number
  grouping_id: number
  occurrence_id: number
  display_order: number
}

// ============================================================================
// Row Mapper
// ============================================================================

/** Map a database row to a ComponentGroupingMember entity */
export function mapGroupingMemberRow(
  row: Record<string, unknown>
): ComponentGroupingMember {
  const r = row as unknown as ComponentGroupingMemberRow
  return {
    id: r.id,
    groupingId: r.grouping_id,
    occurrenceId: r.occurrence_id,
    displayOrder: r.display_order
  }
}
