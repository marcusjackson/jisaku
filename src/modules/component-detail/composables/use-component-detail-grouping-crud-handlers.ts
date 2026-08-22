/**
 * Grouping CRUD handler factories for use-component-detail-grouping-handlers.ts
 */

import type { GroupingFormData } from '../component-detail-types'
import type { useComponentGroupingRepository } from '@/api/component'
import type { useToast } from '@/shared/composables'
import type { Ref } from 'vue'

export type GroupingRepo = ReturnType<typeof useComponentGroupingRepository>
export type Toast = ReturnType<typeof useToast>
export type Reloader = () => void

/**
 * Creates an add-grouping handler.
 *
 * @param componentId - Reactive component ID
 * @param repo - Grouping repository
 * @param reload - Data reload function
 * @param toast - Toast notification service
 * @returns Handler that creates a new grouping for the component
 */
export function createGroupingAdd(
  componentId: Ref<number | null>,
  repo: GroupingRepo,
  reload: Reloader,
  toast: Toast
): (data: GroupingFormData) => void {
  return (data: GroupingFormData): void => {
    if (componentId.value === null) return
    try {
      repo.create({
        componentId: componentId.value,
        name: data.name,
        description: data.description
      })
      reload()
      toast.success('Grouping added')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add grouping')
    }
  }
}

/**
 * Creates an update-grouping handler.
 *
 * @param repo - Grouping repository
 * @param reload - Data reload function
 * @param toast - Toast notification service
 * @returns Handler that updates a grouping's name and description
 */
export function createGroupingUpdate(
  repo: GroupingRepo,
  reload: Reloader,
  toast: Toast
): (id: number, data: GroupingFormData) => void {
  return (id: number, data: GroupingFormData): void => {
    try {
      repo.update(id, { name: data.name, description: data.description })
      reload()
      toast.success('Grouping updated')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update grouping'
      )
    }
  }
}

/**
 * Creates a remove-grouping handler.
 *
 * @param repo - Grouping repository
 * @param reload - Data reload function
 * @param toast - Toast notification service
 * @returns Handler that deletes a grouping by ID
 */
export function createGroupingRemove(
  repo: GroupingRepo,
  reload: Reloader,
  toast: Toast
): (id: number) => void {
  return (id: number): void => {
    try {
      repo.remove(id)
      reload()
      toast.success('Grouping deleted')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete grouping'
      )
    }
  }
}

/**
 * Creates a reorder-groupings handler.
 *
 * @param repo - Grouping repository
 * @param reload - Data reload function
 * @param toast - Toast notification service
 * @returns Handler that reorders groupings by ID array
 */
export function createGroupingReorder(
  repo: GroupingRepo,
  reload: Reloader,
  toast: Toast
): (ids: number[]) => void {
  return (ids: number[]): void => {
    try {
      repo.reorder(ids)
      reload()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to reorder groupings'
      )
    }
  }
}
