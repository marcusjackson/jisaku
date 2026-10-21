<script setup lang="ts">
/**
 * KanjiDetailRadicalInput
 *
 * Combobox for selecting a radical with support for creating new radicals on the fly.
 */

import { computed } from 'vue'

import { BaseButton, BaseCombobox } from '@/base/components'

import type { Component as RadicalComponent } from '@/api/component/component-types'
import type { ComboboxOption } from '@/base/components'

const props = defineProps<{
  allComponents: RadicalComponent[]
}>()

const emit = defineEmits<{
  createRadical: [character: string]
}>()

const radicalValue = defineModel<string | null>('radicalValue')
const newRadicalCharacter = defineModel<string | undefined>(
  'newRadicalCharacter'
)

const radicalOptions = computed<ComboboxOption[]>(() =>
  props.allComponents.map((c) => ({
    value: String(c.id),
    label: c.character + (c.kangxiMeaning ? ` (${c.kangxiMeaning})` : ''),
    character: c.character
  }))
)

const handleRadicalChange = (val: string | number | null | undefined) => {
  radicalValue.value = val == null ? null : String(val)
  if (val != null) newRadicalCharacter.value = undefined
}

const hasRadical = computed(
  () => radicalValue.value != null || Boolean(newRadicalCharacter.value)
)

const handleClearRadical = () => {
  radicalValue.value = null
  newRadicalCharacter.value = undefined
}

const handleCreateRadical = (character: string) => {
  emit('createRadical', character)
}
</script>

<template>
  <div class="radical-input">
    <BaseCombobox
      label="Radical"
      :model-value="radicalValue ?? null"
      :options="radicalOptions"
      placeholder="Search components..."
      :search-keys="['label', 'character']"
      @update:model-value="handleRadicalChange"
    >
      <template #empty="{ searchTerm }">
        <div v-if="searchTerm && searchTerm.length === 1" class="create-new">
          <!-- Raw <button>: search-result row (inline create), bare layout incompatible with BaseButton -->
          <button class="create-btn" type="button" @click="handleCreateRadical(searchTerm)">
            Create new "{{ searchTerm }}"
          </button>
        </div>
        <div v-else class="empty">No results</div>
      </template>
    </BaseCombobox>
    <BaseButton
      v-if="hasRadical"
      class="clear-radical"
      data-testid="radical-clear-button"
      size="sm"
      variant="ghost"
      @click="handleClearRadical"
    >
      Clear radical
    </BaseButton>
    <p v-if="newRadicalCharacter" class="notice" data-testid="radical-creation-notice">
      New: <strong lang="ja">{{ newRadicalCharacter }}</strong>
    </p>
  </div>
</template>

<style scoped>
.radical-input {
  display: contents;
}

.clear-radical {
  grid-column: 1 / -1;
  justify-self: start;
}

.create-new,
.empty {
  padding: var(--spacing-2);
}

.create-btn {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  text-align: left;
  cursor: pointer;
}

.create-btn:hover,
.create-btn:focus-visible {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.create-btn:focus-visible {
  box-shadow: var(--focus-ring);
  outline: none;
}

.empty {
  padding: var(--spacing-3);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
}

.notice {
  grid-column: 1 / -1;
  margin: 0;
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-sm);
  background: var(--color-info-bg);
  color: var(--color-info-text);
  font-size: var(--font-size-sm);
}
</style>
