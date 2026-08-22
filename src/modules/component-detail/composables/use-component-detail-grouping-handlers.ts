/**
 * Use Component Detail Grouping Handlers
 *
 * Handles grouping CRUD and member management operations
 * for the component detail page. Member handlers are delegated
 * to use-component-detail-grouping-member-handlers.ts.
 */

import { useComponentGroupingRepository } from '@/api/component'

import { useToast } from '@/shared/composables'

import {
  createGroupingAdd,
  createGroupingRemove,
  createGroupingReorder,
  createGroupingUpdate
} from './use-component-detail-grouping-crud-handlers'
import { createGroupingMemberHandlers } from './use-component-detail-grouping-member-handlers'

import type { GroupingFormData } from '../component-detail-types'
import type { GroupingMemberHandlers } from './use-component-detail-grouping-member-handlers'
import type {
  ComponentGroupingMember,
  ComponentGroupingWithMembers
} from '@/api/component'
import type { Ref } from 'vue'

/** Dependencies for the composable */
interface UseComponentDetailGroupingHandlersDeps {
  componentId: Ref<number | null>
  groupings: Ref<ComponentGroupingWithMembers[]>
  allGroupingMembers: Ref<Map<number, ComponentGroupingMember[]>>
  managingGroupingId: Ref<number | null>
  managingGroupingMembers: Ref<ComponentGroupingMember[]>
}

/** Return type of the composable */
interface UseComponentDetailGroupingHandlersReturn extends GroupingMemberHandlers {
  handleGroupingAdd: (data: GroupingFormData) => void
  handleGroupingUpdate: (id: number, data: GroupingFormData) => void
  handleGroupingRemove: (id: number) => void
  handleGroupingReorder: (ids: number[]) => void
}

// Helper to reload groupings and all members map from repository
function createGroupingsReloader(
  componentId: Ref<number | null>,
  groupings: Ref<ComponentGroupingWithMembers[]>,
  allGroupingMembers: Ref<Map<number, ComponentGroupingMember[]>>,
  repo: ReturnType<typeof useComponentGroupingRepository>
) {
  return (): void => {
    if (componentId.value === null) return
    groupings.value = repo.getByParentId(componentId.value)
    allGroupingMembers.value = repo.getMembersByComponentId(componentId.value)
  }
}

// Helper to reload members from repository
function createMembersReloader(
  managingGroupingMembers: Ref<ComponentGroupingMember[]>,
  repo: ReturnType<typeof useComponentGroupingRepository>
) {
  return (groupingId: number): void => {
    managingGroupingMembers.value = repo.getMembers(groupingId)
  }
}

/**
 * Provides handlers for component grouping management (CRUD and member operations).
 *
 * @param deps - Component ID, groupings, member state, and managing grouping refs
 * @returns Handlers for grouping CRUD and member management
 */
export function useComponentDetailGroupingHandlers(
  deps: UseComponentDetailGroupingHandlersDeps
): UseComponentDetailGroupingHandlersReturn {
  // prettier-ignore
  const { allGroupingMembers, componentId, groupings, managingGroupingId, managingGroupingMembers } = deps
  const groupingRepo = useComponentGroupingRepository()
  const toast = useToast()

  const reloadGroupings = createGroupingsReloader(
    componentId,
    groupings,
    allGroupingMembers,
    groupingRepo
  )
  const reloadMembers = createMembersReloader(
    managingGroupingMembers,
    groupingRepo
  )

  const memberHandlers = createGroupingMemberHandlers({
    groupingRepo,
    toast,
    reloadGroupings,
    reloadMembers,
    managingGroupingId,
    managingGroupingMembers
  })

  return {
    handleGroupingAdd: createGroupingAdd(
      componentId,
      groupingRepo,
      reloadGroupings,
      toast
    ),
    handleGroupingUpdate: createGroupingUpdate(
      groupingRepo,
      reloadGroupings,
      toast
    ),
    handleGroupingRemove: createGroupingRemove(
      groupingRepo,
      reloadGroupings,
      toast
    ),
    handleGroupingReorder: createGroupingReorder(
      groupingRepo,
      reloadGroupings,
      toast
    ),
    ...memberHandlers
  }
}
