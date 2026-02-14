/**
 * Component List Data Composable
 *
 * Handles data fetching for the component list.
 * Loads component list with extended filtering.
 *
 * @module modules/component-list/composables
 */

import { ref } from 'vue'

import { useComponentRepository } from '@/api/component'

import type {
  ComponentListFilters,
  PresenceFilterValue
} from '../component-list-types'
import type { Component } from '@/api/component'
import type { Ref } from 'vue'

export interface UseComponentListData {
  componentList: Ref<Component[]>
  fetchError: Ref<Error | null>
  loadComponents: (filters: ComponentListFilters) => void
}

/**
 * Check if a component matches the presence filter for a field
 */
function matchesPresenceFilter(
  value: string | null | undefined,
  filter: PresenceFilterValue
): boolean {
  if (filter === null) return true
  const hasContent = value != null && value.trim().length > 0
  return filter === 'has' ? hasContent : !hasContent
}

/**
 * Check if presence filter matches count-based data
 */
function matchesCountPresence(
  count: number,
  filter: PresenceFilterValue
): boolean {
  if (filter === null) return true
  const hasContent = count > 0
  return filter === 'has' ? hasContent : !hasContent
}

/**
 * Apply description presence filter
 */
function applyDescriptionFilter(
  components: Component[],
  filter: PresenceFilterValue | undefined
): Component[] {
  if (filter === undefined || filter === null) return components
  return components.filter((comp) =>
    matchesPresenceFilter(comp.description, filter)
  )
}

/**
 * Apply forms presence filter
 */
function applyFormsFilter(
  components: Component[],
  filter: PresenceFilterValue | undefined,
  formsCount: Map<number, number>
): Component[] {
  if (filter === undefined || filter === null) return components
  return components.filter((comp) =>
    matchesCountPresence(formsCount.get(comp.id) ?? 0, filter)
  )
}

/**
 * Apply groupings presence filter
 */
function applyGroupingsFilter(
  components: Component[],
  filter: PresenceFilterValue | undefined,
  groupingsCount: Map<number, number>
): Component[] {
  if (filter === undefined || filter === null) return components
  return components.filter((comp) =>
    matchesCountPresence(groupingsCount.get(comp.id) ?? 0, filter)
  )
}

/**
 * Apply character filter
 */
function applyCharacterFilter(
  components: Component[],
  character: string | undefined
): Component[] {
  if (!character) return components
  return components.filter((c) => c.character.includes(character))
}

export function useComponentListData(): UseComponentListData {
  const componentList = ref<Component[]>([])
  const fetchError = ref<Error | null>(null)

  function loadComponents(filters: ComponentListFilters): void {
    try {
      const repo = useComponentRepository()

      // Build API filters - only include defined properties
      const apiFilters: Record<string, unknown> = {}
      if (filters.searchKeywords !== undefined) {
        apiFilters['search'] = filters.searchKeywords
      }
      if (filters.kangxiSearch !== undefined) {
        apiFilters['kangxiSearch'] = filters.kangxiSearch
      }
      if (filters.canBeRadical !== undefined) {
        apiFilters['canBeRadical'] = filters.canBeRadical
      }
      if (filters.strokeCountMin !== undefined) {
        apiFilters['strokeCountMin'] = filters.strokeCountMin
      }
      if (filters.strokeCountMax !== undefined) {
        apiFilters['strokeCountMax'] = filters.strokeCountMax
      }

      // Get base results from API
      let results = repo.search(apiFilters)

      // Apply client-side filters sequentially
      results = applyCharacterFilter(results, filters.character)
      results = applyDescriptionFilter(results, filters.descriptionPresence)

      // Get counts for presence filters
      const formsCount = repo.getFormsCount()
      const groupingsCount = repo.getGroupingsCount()

      results = applyFormsFilter(results, filters.formsPresence, formsCount)
      results = applyGroupingsFilter(
        results,
        filters.groupingsPresence,
        groupingsCount
      )

      componentList.value = results
    } catch (err) {
      fetchError.value = err instanceof Error ? err : new Error(String(err))
    }
  }

  return {
    componentList,
    fetchError,
    loadComponents
  }
}
