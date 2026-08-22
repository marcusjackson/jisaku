/**
 * Use Component Detail Grouping Member Handlers
 *
 * Handles member management operations (add, remove, reorder, open)
 * for component grouping members.
 */

import type { useComponentGroupingRepository } from '@/api/component'
import type { ComponentGroupingMember } from '@/api/component'
import type { useToast } from '@/shared/composables'
import type { Ref } from 'vue'

type GroupingRepo = ReturnType<typeof useComponentGroupingRepository>
type Toast = ReturnType<typeof useToast>
type Reloader = () => void
type MemberReloader = (groupingId: number) => void

/** Dependencies for member handler creation */
export interface GroupingMemberHandlerDeps {
  groupingRepo: GroupingRepo
  toast: Toast
  reloadGroupings: Reloader
  reloadMembers: MemberReloader
  managingGroupingId: Ref<number | null>
  managingGroupingMembers: Ref<ComponentGroupingMember[]>
}

/** Return type of member handlers */
export interface GroupingMemberHandlers {
  handleManageMembersOpen: (groupingId: number) => void
  handleMemberAdd: (groupingId: number, occurrenceId: number) => void
  handleMemberRemove: (groupingId: number, occurrenceId: number) => void
  handleMemberReorder: (groupingId: number, ids: number[]) => void
}

export function createGroupingMemberHandlers(
  deps: GroupingMemberHandlerDeps
): GroupingMemberHandlers {
  const {
    groupingRepo,
    managingGroupingId,
    managingGroupingMembers,
    reloadGroupings,
    reloadMembers,
    toast
  } = deps

  return {
    handleManageMembersOpen: createManageMembersOpen(
      managingGroupingId,
      managingGroupingMembers,
      groupingRepo
    ),
    handleMemberAdd: createMemberAdd(
      groupingRepo,
      reloadMembers,
      reloadGroupings,
      toast
    ),
    handleMemberRemove: createMemberRemove(
      groupingRepo,
      reloadMembers,
      reloadGroupings,
      toast
    ),
    handleMemberReorder: createMemberReorder(groupingRepo, reloadMembers, toast)
  }
}

// ============================================================================
// Handler Factories
// ============================================================================

function createManageMembersOpen(
  managingGroupingId: Ref<number | null>,
  managingGroupingMembers: Ref<ComponentGroupingMember[]>,
  repo: GroupingRepo
) {
  return (groupingId: number): void => {
    managingGroupingId.value = groupingId
    managingGroupingMembers.value = repo.getMembers(groupingId)
  }
}

function createMemberAdd(
  repo: GroupingRepo,
  reloadMembers: MemberReloader,
  reloadGroupings: Reloader,
  toast: Toast
) {
  return (groupingId: number, occurrenceId: number): void => {
    try {
      repo.addMember(groupingId, occurrenceId)
      reloadMembers(groupingId)
      reloadGroupings()
      toast.success('Member added')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add member')
    }
  }
}

function createMemberRemove(
  repo: GroupingRepo,
  reloadMembers: MemberReloader,
  reloadGroupings: Reloader,
  toast: Toast
) {
  return (groupingId: number, occurrenceId: number): void => {
    try {
      repo.removeMember(groupingId, occurrenceId)
      reloadMembers(groupingId)
      reloadGroupings()
      toast.success('Member removed')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to remove member'
      )
    }
  }
}

function createMemberReorder(
  repo: GroupingRepo,
  reloadMembers: MemberReloader,
  toast: Toast
) {
  return (groupingId: number, ids: number[]): void => {
    try {
      repo.reorderMembers(groupingId, ids)
      reloadMembers(groupingId)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to reorder members'
      )
    }
  }
}
