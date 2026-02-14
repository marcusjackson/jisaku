<script setup lang="ts">
/**
 * KanjiDetailRadicalInput
 *
 * Combobox for selecting a radical with support for creating new radicals on the fly.
 */

import { computed } from 'vue'

import { BaseCombobox } from '@/base/components'

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
    label: `${c.character}${c.kangxiMeaning ? ` (${c.kangxiMeaning})` : ''}`,
    character: c.character
  }))
)

const handleRadicalChange = (val: string | number | null | undefined) => {
  radicalValue.value = val == null ? null : String(val)
  if (val != null) newRadicalCharacter.value = undefined
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
        <div
          v-if="searchTerm && searchTerm.length === 1"
          class="create-new"
        >
          <button
            class="create-btn"
            type="button"
            @click="handleCreateRadical(searchTerm)"
          >
            Create new "{{ searchTerm }}"
          </button>
        </div>
        <div
          v-else
          class="empty"
        >
          No results
        </div>
      </template>
    </BaseCombobox>
    <p
      v-if="newRadicalCharacter"
      class="notice"
    >
      New: <strong>{{ newRadicalCharacter }}</strong>
    </p>
  </div>
</template>

<style scoped>
.radical-input {
  display: contents;
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
.create-btn:focus {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.create-btn:focus {
  box-shadow: var(--focus-ring);
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
