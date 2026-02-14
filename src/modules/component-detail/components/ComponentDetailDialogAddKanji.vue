<script setup lang="ts">
/**
 * ComponentDetailDialogAddKanji
 *
 * Dialog for searching and linking existing kanji to this component,
 * or creating a new kanji via quick-create.
 */

import { computed, ref } from 'vue'

import BaseDialog from '@/base/components/BaseDialog.vue'

import { SharedEntitySearch, SharedQuickCreateKanji } from '@/shared/components'

import type { Kanji } from '@/api/kanji'
import type { EntityOption } from '@/shared/components'
import type { QuickCreateKanjiData } from '@/shared/validation'

const props = defineProps<{
  /** All kanji for search */
  allKanji: Kanji[]
  /** IDs of kanji already linked (to exclude) */
  excludedKanjiIds: number[]
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  /** Select existing kanji */
  select: [kanjiId: number]
  /** Create new kanji */
  create: [data: QuickCreateKanjiData]
}>()

const open = defineModel<boolean>('open', { default: false })

// Quick create dialog state
const quickCreateOpen = ref(false)
const quickCreateInitialCharacter = ref<string | undefined>(undefined)

// Map kanji to entity options for search component
const kanjiOptions = computed<EntityOption[]>(() =>
  props.allKanji.map((k) => ({
    id: k.id,
    character: k.character,
    shortMeaning: k.shortMeaning,
    strokeCount: k.strokeCount
  }))
)

function handleSelect(entity: EntityOption): void {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  emit('select', entity.id)
  open.value = false
}

function handleCreateNew(searchTerm: string): void {
  quickCreateInitialCharacter.value = searchTerm || undefined
  quickCreateOpen.value = true
}

function handleQuickCreate(data: QuickCreateKanjiData): void {
  emit('create', data)
  quickCreateOpen.value = false
  open.value = false
}

function handleQuickCreateCancel(): void {
  quickCreateOpen.value = false
}
</script>

<template>
  <BaseDialog
    v-model:open="open"
    description="Search for an existing kanji to link, or create a new one."
    title="Add Kanji"
    @update:open="(val: boolean) => emit('update:open', val)"
  >
    <div class="dialog-add-kanji-content">
      <SharedEntitySearch
        entity-type="kanji"
        :exclude-ids="excludedKanjiIds"
        label="Search Kanji"
        :options="kanjiOptions"
        placeholder="Type to search..."
        @create-new="handleCreateNew"
        @select="handleSelect"
      />
    </div>
  </BaseDialog>

  <SharedQuickCreateKanji
    v-model:open="quickCreateOpen"
    :initial-character="quickCreateInitialCharacter"
    @cancel="handleQuickCreateCancel"
    @create="handleQuickCreate"
  />
</template>

<style scoped>
.dialog-add-kanji-content {
  min-height: 200px;
  padding: var(--spacing-md) 0;
}
</style>
