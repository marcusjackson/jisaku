<script setup lang="ts">
/**
 * VocabularyHeaderEditDialog
 *
 * Dialog for editing vocabulary header fields: word, kana, short meaning, search keywords.
 */

import { ref, watch } from 'vue'

import BaseButton from '@/legacy/base/components/BaseButton.vue'
import BaseDialog from '@/legacy/base/components/BaseDialog.vue'
import BaseInput from '@/legacy/base/components/BaseInput.vue'
import BaseTextarea from '@/legacy/base/components/BaseTextarea.vue'

const props = defineProps<{
  open: boolean
  word: string
  kana: string | null
  shortMeaning: string | null
  searchKeywords: string | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [
    data: {
      word: string
      kana: string | null
      shortMeaning: string | null
      searchKeywords: string | null
    }
  ]
}>()

// Form state
const formWord = ref(props.word)
const formKana = ref(props.kana ?? '')
const formShortMeaning = ref(props.shortMeaning ?? '')
const formSearchKeywords = ref(props.searchKeywords ?? '')

// Validation
const wordError = ref('')

// Sync form state when props change (dialog opens with new data)
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      formWord.value = props.word
      formKana.value = props.kana ?? ''
      formShortMeaning.value = props.shortMeaning ?? ''
      formSearchKeywords.value = props.searchKeywords ?? ''
      wordError.value = ''
    }
  }
)

function validateForm(): boolean {
  wordError.value = ''

  if (!formWord.value.trim()) {
    wordError.value = 'Word is required'
    return false
  }

  return true
}

function handleSave() {
  if (!validateForm()) return

  emit('save', {
    word: formWord.value.trim(),
    kana: formKana.value.trim() || null,
    shortMeaning: formShortMeaning.value.trim() || null,
    searchKeywords: formSearchKeywords.value.trim() || null
  })
}

function handleCancel() {
  emit('update:open', false)
}
</script>

<template>
  <BaseDialog
    :open="props.open"
    title="Edit Vocabulary Header"
    @update:open="emit('update:open', $event)"
  >
    <form
      class="vocabulary-header-edit-form"
      @submit.prevent="handleSave"
    >
      <BaseInput
        v-model="formWord"
        :error="wordError"
        label="Word"
        required
      />

      <BaseInput
        v-model="formKana"
        label="Kana"
        placeholder="Reading in kana (optional)"
      />

      <BaseInput
        v-model="formShortMeaning"
        label="Short Meaning"
        placeholder="Brief meaning for display"
      />

      <BaseTextarea
        v-model="formSearchKeywords"
        label="Search Keywords"
        placeholder="Additional search terms (comma separated)"
        :rows="2"
      />

      <div class="vocabulary-header-edit-form-actions">
        <BaseButton
          type="button"
          variant="ghost"
          @click="handleCancel"
        >
          Cancel
        </BaseButton>
        <BaseButton type="submit"> Save </BaseButton>
      </div>
    </form>
  </BaseDialog>
</template>

<style scoped>
.vocabulary-header-edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.vocabulary-header-edit-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}
</style>
