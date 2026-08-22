<script lang="ts">
export type { EntityOption, EntityType } from './shared-entity-search-types'
</script>

<script setup lang="ts">
/**
 * SharedEntitySearch
 *
 * A searchable combobox for finding and selecting existing entities.
 * Includes a "Create New" option that triggers the quick-create flow.
 *
 * Features:
 * - Search by character or meaning
 * - Keyboard navigation via Reka UI Combobox
 * - "Create New" option at bottom
 * - Exclude already-linked IDs
 */

import { computed, ref, useId } from 'vue'

import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
  useFilter
} from 'reka-ui'

import type { EntityOption, EntityType } from './shared-entity-search-types'

const props = withDefaults(
  defineProps<{
    /** Type of entity to search */
    entityType: EntityType
    /** Entity options to search from */
    options: EntityOption[]
    /** IDs to exclude from search results (already linked) */
    excludeIds?: number[]
    /** Placeholder text */
    placeholder?: string
    /** Label text */
    label?: string
    /** Disable the search */
    disabled?: boolean
  }>(),
  {
    excludeIds: () => [],
    placeholder: 'Search...',
    label: '',
    disabled: false
  }
)

const emit = defineEmits<{
  select: [entity: EntityOption]
  createNew: [searchTerm: string]
}>()

// Internal state
const searchTerm = ref('')
const comboboxId = useId()

// Use Reka UI's filter utility for fuzzy matching
const { contains } = useFilter({ sensitivity: 'base' })

// Filter options based on search term and exclusions
const filteredOptions = computed(() => {
  let filtered = props.options.filter(
    (opt) => !props.excludeIds.includes(opt.id)
  )

  if (searchTerm.value.trim()) {
    filtered = filtered.filter((opt) => {
      if (contains(opt.character, searchTerm.value)) return true
      if (opt.shortMeaning && contains(opt.shortMeaning, searchTerm.value)) {
        return true
      }
      return false
    })
  }

  return filtered
})

// Format option for display
function formatOption(opt: EntityOption): string {
  const meaning = opt.shortMeaning ? ` — ${opt.shortMeaning}` : ''
  const stroke =
    opt.strokeCount === null ? '' : ` (${String(opt.strokeCount)}画)`
  return `${meaning}${stroke}`
}

// Handle selection - can be triggered by update:model-value or @select
function handleSelect(option: EntityOption | null): void {
  if (option) {
    emit('select', option)
    searchTerm.value = ''
  }
}

// Handle item select event directly (more reliable than update:model-value)
function handleItemSelect(event: Event, option: EntityOption): void {
  // Prevent default to avoid double-firing with update:model-value
  event.preventDefault()
  handleSelect(option)
}

// Handle "Create New" click
function handleCreateNew(): void {
  emit('createNew', searchTerm.value.trim())
  searchTerm.value = ''
}

// Entity type display name
const entityTypeName = computed(() => {
  switch (props.entityType) {
    case 'kanji':
      return 'Kanji'
    case 'component':
      return 'Component'
    default:
      return 'Entity'
  }
})
</script>

<template>
  <div class="shared-entity-search">
    <label
      v-if="label"
      class="shared-entity-search-label"
      :for="comboboxId"
    >
      {{ label }}
    </label>

    <ComboboxRoot
      :disabled="disabled ?? false"
      ignore-filter
      :model-value="null"
      @update:model-value="handleSelect"
    >
      <ComboboxAnchor class="shared-entity-search-anchor">
        <ComboboxInput
          :id="comboboxId"
          v-model="searchTerm"
          class="shared-entity-search-input"
          :placeholder="placeholder"
        />
        <ComboboxTrigger
          aria-label="Toggle options"
          class="shared-entity-search-trigger"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="16"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="16"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </ComboboxTrigger>
      </ComboboxAnchor>

      <ComboboxPortal>
        <ComboboxContent
          class="shared-entity-search-content"
          position="popper"
          :side-offset="4"
        >
          <ComboboxViewport class="shared-entity-search-viewport">
            <ComboboxItem
              v-for="option in filteredOptions"
              :key="option.id"
              class="shared-entity-search-item"
              :value="option"
              @select="(event: Event) => handleItemSelect(event, option)"
            >
              <ComboboxItemIndicator
                class="shared-entity-search-item-indicator"
              >
                <svg
                  fill="none"
                  height="16"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  width="16"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </ComboboxItemIndicator>
              <span class="shared-entity-search-item-character">{{
                option.character
              }}</span>
              <span class="shared-entity-search-item-text">{{
                formatOption(option)
              }}</span>
            </ComboboxItem>

            <ComboboxEmpty class="shared-entity-search-empty">
              No {{ entityTypeName.toLowerCase() }} found
            </ComboboxEmpty>

            <div class="shared-entity-search-create-separator" />
            <button
              class="shared-entity-search-create-button"
              type="button"
              @click="handleCreateNew"
            >
              <span class="shared-entity-search-create-icon">+</span>
              Create New {{ entityTypeName }}
              <span
                v-if="searchTerm.trim()"
                class="shared-entity-search-create-term"
              >
                "{{ searchTerm.trim() }}"
              </span>
            </button>
          </ComboboxViewport>
        </ComboboxContent>
      </ComboboxPortal>
    </ComboboxRoot>
  </div>
</template>

<style src="./shared-entity-search.css"></style>
