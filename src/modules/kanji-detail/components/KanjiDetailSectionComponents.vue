<script setup lang="ts">
/**
 * KanjiDetailSectionComponents
 *
 * Section orchestrator for managing component occurrences on a kanji.
 * Wraps display and dialog, manages dialog state, emits events to parent.
 */

import { ref } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'

import SharedSection from '@/shared/components/SharedSection.vue'

import KanjiDetailComponentsDisplay from './KanjiDetailComponentsDisplay.vue'
import KanjiDetailDialogComponents from './KanjiDetailDialogComponents.vue'

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types'
import type { Component } from '@/api/component/component-types'
import type { QuickCreateComponentData } from '@/shared/validation/quick-create-component-schema'

const props = defineProps<{
  /** All available components for selection */
  allComponents: Component[]
  /** Component occurrences linked to the kanji */
  linkedOccurrences: ComponentOccurrenceWithDetails[]
  /** Enable destructive operations (unlink) */
  destructiveMode?: boolean
}>()

const emit = defineEmits<{
  /** User wants to save component changes */
  save: [
    changes: {
      toLink: {
        componentId: number
        positionTypeId: number | null
        componentFormId: number | null
        isRadical: boolean
      }[]
      toUpdate: {
        id: number
        positionTypeId: number | null
        componentFormId: number | null
        isRadical: boolean
      }[]
      toDelete: number[]
    }
  ]
  /** User wants to create a new component and link it */
  create: [data: QuickCreateComponentData]
}>()

const dialogOpen = ref(false)
</script>

<template>
  <SharedSection
    description="Structural parts or graphical elements within this kanji"
    title="Components"
  >
    <template #actions>
      <BaseButton
        data-testid="basic-info-edit-button"
        size="sm"
        variant="secondary"
        @click="dialogOpen = true"
      >
        Edit
      </BaseButton>
    </template>

    <KanjiDetailComponentsDisplay :occurrences="props.linkedOccurrences" />

    <KanjiDetailDialogComponents
      v-model:open="dialogOpen"
      :all-components="props.allComponents"
      :destructive-mode="props.destructiveMode"
      :linked-occurrences="props.linkedOccurrences"
      @create="(data) => emit('create', data)"
      @save="(changes) => emit('save', changes)"
    />
  </SharedSection>
</template>
