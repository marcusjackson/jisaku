/**
 * Use Kanji Detail Components Dialog State
 *
 * Manages dialog state for component occurrence editing
 *
 * @module modules/kanji-detail
 */

import { computed, ref, watch } from 'vue'

import { useComponentFormRepository } from '@/api/component/component-form-repository'
import { usePositionTypeRepository } from '@/api/position/position-type-repository'

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types'
import type { Component } from '@/api/component/component-types'
import type { Ref } from 'vue'

interface Props {
  open: boolean
  allComponents: Component[]
  linkedOccurrences: ComponentOccurrenceWithDetails[]
}

function loadFormData(
  props: Props,
  componentFormsMap: Ref<
    Map<
      number,
      { id: number; formCharacter: string; formName: string | null }[]
    >
  >,
  formRepo: ReturnType<typeof useComponentFormRepository>
) {
  props.linkedOccurrences.forEach((occ) => {
    if (!componentFormsMap.value.has(occ.componentId)) {
      componentFormsMap.value.set(
        occ.componentId,
        formRepo.getByParentId(occ.componentId).map((f) => ({
          id: f.id,
          formCharacter: f.formCharacter,
          formName: f.formName
        }))
      )
    }
  })
}

export function useKanjiDetailComponentsDialogState(props: Props) {
  const positionTypeRepo = usePositionTypeRepository()
  const positionTypes = ref(positionTypeRepo.getAll())
  const formRepo = useComponentFormRepository()
  const quickCreateSearchTerm = ref('')
  const quickCreateDialogOpen = ref(false)
  const showConfirmDialog = ref(false)
  const pendingRemoveOccurrenceId: Ref<number | null> = ref(null)

  const componentFormsMap = ref<
    Map<
      number,
      { id: number; formCharacter: string; formName: string | null }[]
    >
  >(new Map())

  const linkedComponentIds = computed(() =>
    props.linkedOccurrences.map((occ) => occ.componentId)
  )
  const availableComponents = computed(() =>
    props.allComponents.filter(
      (comp) => !linkedComponentIds.value.includes(comp.id)
    )
  )

  watch(
    () => props.open,
    (isOpen) => {
      if (isOpen) {
        loadFormData(props, componentFormsMap, formRepo)
      } else {
        quickCreateSearchTerm.value = ''
      }
    }
  )

  return {
    positionTypes,
    quickCreateSearchTerm,
    quickCreateDialogOpen,
    showConfirmDialog,
    pendingRemoveOccurrenceId,
    componentFormsMap,
    availableComponents
  }
}
