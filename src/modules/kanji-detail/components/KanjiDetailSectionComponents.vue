<script setup lang="ts">
/**
 * KanjiDetailSectionComponents
 *
 * Section orchestrator for managing component occurrences on a kanji.
 * Wraps display and dialog, manages dialog state, emits events to parent.
 */

import { ref } from 'vue'

import { BaseButton } from '@/base/components'

import { SharedSection } from '@/shared/components'

import KanjiDetailComponentsDisplay from './KanjiDetailComponentsDisplay.vue'
import KanjiDetailDialogComponents from './KanjiDetailDialogComponents.vue'

import type {
  ComponentOccurrenceWithDetails,
  DialogComponentChanges
} from '../kanji-detail-types'
import type { Component } from '@/api/component/component-types'
import type { QuickCreateComponentData } from '@/shared/validation/quick-create-component-schema'

const props = defineProps<{
  /** All available components for selection */
  allComponents: Component[]
  /** Component occurrences linked to the kanji */
  linkedOccurrences: ComponentOccurrenceWithDetails[]
  /** Enable destructive operations (unlink) */
  destructiveMode?: boolean
  /** Saves component changes; returns whether it saved, so the dialog can close */
  save: (changes: DialogComponentChanges) => boolean
  /** Creates a component; returns whether it saved */
  create: (data: QuickCreateComponentData) => boolean
}>()

const dialogOpen = ref(false)

function handleSave(changes: DialogComponentChanges): void {
  if (props.save(changes)) dialogOpen.value = false
}
</script>

<template>
  <SharedSection title="Components">
    <template #actions>
      <BaseButton
        aria-label="Edit components"
        data-testid="components-edit-button"
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
      :create="props.create"
      :destructive-mode="props.destructiveMode"
      :linked-occurrences="props.linkedOccurrences"
      @save="handleSave"
    />
  </SharedSection>
</template>
