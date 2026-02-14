<script setup lang="ts">
/**
 * ComponentDetailBasicInfoFormFields
 *
 * Form fields for editing component basic info.
 * Extracted to keep dialog under file size limit.
 */

import { BaseCombobox, BaseInput, BaseSwitch } from '@/base/components'

import type { Kanji } from '@/api/kanji'

interface KanjiOption {
  value: string | number
  label: string
  shortMeaning?: string | null
  [key: string]: unknown
}

defineProps<{
  kanjiOptions: Kanji[]
  strokeCountError?: string | undefined
  kangxiNumberError?: string | undefined
}>()

const NONE_VALUE = '__none__'

const strokeCount = defineModel<string>('strokeCount', { required: true })
const sourceKanjiId = defineModel<string>('sourceKanjiId', { required: true })
const canBeRadical = defineModel<boolean>('canBeRadical', { required: true })
const kangxiNumber = defineModel<string>('kangxiNumber', { required: true })
const kangxiMeaning = defineModel<string>('kangxiMeaning', { required: true })
const radicalNameJapanese = defineModel<string>('radicalNameJapanese', {
  required: true
})

function buildKanjiOptions(kanji: Kanji[]): KanjiOption[] {
  const opts: KanjiOption[] = [{ value: NONE_VALUE, label: 'None' }]
  for (const k of kanji) {
    opts.push({
      value: String(k.id),
      label: k.character,
      shortMeaning: k.shortMeaning
    })
  }
  return opts
}

function displayKanji(opt: KanjiOption | undefined): string {
  if (!opt || opt.value === NONE_VALUE) return ''
  return opt.shortMeaning ? `${opt.label} (${opt.shortMeaning})` : opt.label
}

function displayKanjiOption(opt: KanjiOption): string {
  if (opt.value === NONE_VALUE) return 'None'
  return opt.shortMeaning ? `${opt.label} (${opt.shortMeaning})` : opt.label
}
</script>

<template>
  <div class="component-detail-basic-info-form-fields">
    <BaseInput
      v-model="strokeCount"
      :error="strokeCountError"
      inputmode="numeric"
      label="Stroke Count"
      placeholder="1-64"
    />
    <BaseCombobox
      v-model="sourceKanjiId"
      :display-fn="displayKanjiOption"
      :display-value="displayKanji"
      label="Source Kanji"
      :options="buildKanjiOptions(kanjiOptions)"
      placeholder="Select source kanji..."
      :search-keys="['label', 'shortMeaning']"
    />
    <BaseSwitch
      v-model="canBeRadical"
      label="Can be Radical"
    />

    <template v-if="canBeRadical">
      <div class="component-detail-basic-info-form-fields-divider" />
      <BaseInput
        v-model="kangxiNumber"
        :error="kangxiNumberError"
        inputmode="numeric"
        label="Kangxi Number"
        placeholder="1-214"
      />
      <BaseInput
        v-model="kangxiMeaning"
        label="Kangxi Meaning"
        placeholder="e.g., water"
      />
      <BaseInput
        v-model="radicalNameJapanese"
        label="Radical Name (Japanese)"
        placeholder="e.g., さんずい"
      />
    </template>
  </div>
</template>

<style scoped>
.component-detail-basic-info-form-fields {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.component-detail-basic-info-form-fields-divider {
  border-top: 1px solid var(--color-border);
  margin-block: var(--spacing-xs);
}
</style>
