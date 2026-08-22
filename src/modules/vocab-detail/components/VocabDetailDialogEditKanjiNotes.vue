<script setup lang="ts">
/**
 * VocabDetailDialogEditKanjiNotes
 *
 * Dialog for editing analysis notes on a vocab-kanji link.
 * Simpler than component-detail edit: only a notes textarea.
 */

import { ref, watch } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseDialog from '@/base/components/BaseDialog.vue'
import BaseTextarea from '@/base/components/BaseTextarea.vue'

import type { VocabKanjiWithKanji } from '@/api/vocabulary'

const props = defineProps<{
  /** The vocab-kanji link to edit, null when dialog is closed */
  vocabKanji: VocabKanjiWithKanji | null
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  submit: [data: { id: number; notes: string | null }]
  cancel: []
}>()

const open = defineModel<boolean>('open', { default: false })

// Form state
const localNotes = ref('')

// Reset form when dialog opens with new vocabKanji
watch(
  () => [open.value, props.vocabKanji] as const,
  ([isOpen, vk]) => {
    if (isOpen && vk) {
      localNotes.value = vk.analysisNotes ?? ''
    }
  },
  { immediate: true }
)

function handleSubmit(): void {
  if (!props.vocabKanji) return
  emit('submit', {
    id: props.vocabKanji.id,
    notes: localNotes.value.trim() || null
  })
  open.value = false
}

function handleCancel(): void {
  emit('cancel')
  open.value = false
}
</script>

<template>
  <BaseDialog
    v-model:open="open"
    description="Edit the analysis notes for this kanji in the vocabulary breakdown."
    title="Edit Analysis Notes"
    @update:open="(val: boolean) => emit('update:open', val)"
  >
    <div
      v-if="vocabKanji"
      class="dialog-edit-notes-content"
    >
      <div class="dialog-edit-notes-kanji">
        <span class="dialog-edit-notes-kanji-character">
          {{ vocabKanji.kanji.character }}
        </span>
        <span
          v-if="vocabKanji.kanji.shortMeaning"
          class="dialog-edit-notes-kanji-meaning"
        >
          {{ vocabKanji.kanji.shortMeaning }}
        </span>
      </div>

      <form @submit.prevent="handleSubmit">
        <BaseTextarea
          v-model="localNotes"
          label="Analysis Notes"
          name="analysisNotes"
          placeholder="Notes about this kanji's role in the word..."
          :rows="4"
        />

        <div class="dialog-edit-notes-actions">
          <BaseButton
            type="button"
            variant="secondary"
            @click="handleCancel"
          >
            Cancel
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
          >
            Save
          </BaseButton>
        </div>
      </form>
    </div>

    <template #footer>
      <!-- Footer managed by content actions -->
    </template>
  </BaseDialog>
</template>

<style scoped>
.dialog-edit-notes-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.dialog-edit-notes-kanji {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  background: var(--color-surface-secondary);
}

.dialog-edit-notes-kanji-character {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-none);
}

.dialog-edit-notes-kanji-meaning {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.dialog-edit-notes-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}
</style>
