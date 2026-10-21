<script setup lang="ts">
/**
 * KanjiDetailSectionBasicInfo
 *
 * Section component for kanji basic information display.
 * Shows: stroke count, JLPT, Jōyō, Kentei, radical, and classifications.
 * Edit button opens dialog for editing all fields.
 */

import { computed, ref } from 'vue'

import { BaseBadge, BaseButton } from '@/base/components'

import { SharedSection } from '@/shared/components'

import { JOYO_OPTIONS, KENTEI_OPTIONS, NONE } from '../utils/constants'

import KanjiDetailDialogBasicInfo from './KanjiDetailDialogBasicInfo.vue'

import type { BasicInfoSaveData } from '../kanji-detail-types'
import type {
  ClassificationType,
  KanjiClassification
} from '@/api/classification/classification-types'
import type { Component as RadicalComponent } from '@/api/component/component-types'
import type { Kanji } from '@/api/kanji/kanji-types'

const props = defineProps<{
  kanji: Kanji
  radical: RadicalComponent | null
  /** All available components for radical selection */
  allComponents: RadicalComponent[]
  /** Current kanji's classifications */
  classifications: KanjiClassification[]
  /** All available classification types */
  classificationTypes: ClassificationType[]
  /** Saves basic info; returns whether it saved, so the dialog can close */
  save: (data: BasicInfoSaveData) => boolean
}>()

const isDialogOpen = ref(false)

// Display helpers
const jlptDisplay = computed(() => {
  if (!props.kanji.jlptLevel) return '—'
  return props.kanji.jlptLevel
})

/** Value-to-label lookup for a select option list, leaving out the NONE entry. */
function optionLabels(options: { label: string; value: string }[]): Record<string, string> {
  return Object.fromEntries(options.filter((o) => o.value !== NONE).map((o) => [o.value, o.label]))
}

const joyoLabels = optionLabels(JOYO_OPTIONS)
const kenteiLabels = optionLabels(KENTEI_OPTIONS)

const joyoDisplay = computed(() => {
  if (!props.kanji.joyoLevel) return '—'
  return joyoLabels[props.kanji.joyoLevel] ?? '—'
})

const kenteiDisplay = computed(() => {
  if (!props.kanji.kanjiKenteiLevel) return '—'
  return kenteiLabels[props.kanji.kanjiKenteiLevel] ?? '—'
})

const radicalDisplay = computed(() => {
  if (!props.radical) return '—'
  const meaning = props.radical.kangxiMeaning
    ? ` (${props.radical.kangxiMeaning})`
    : ''
  return `${props.radical.character}${meaning}`
})

// Classification display helpers
function getAbbreviation(type: ClassificationType): string {
  const abbrevs: Record<string, string> = {
    象形文字: '象形',
    指事文字: '指事',
    会意文字: '会意',
    形声文字: '形声',
    仮借字: '仮借'
  }
  return abbrevs[type.nameJapanese ?? ''] ?? type.nameJapanese ?? type.typeName
}

function handleSave(data: BasicInfoSaveData): void {
  if (props.save(data)) isDialogOpen.value = false
}
</script>

<template>
  <SharedSection test-id="kanji-detail-basic-info" title="Basic Information">
    <template #actions>
      <BaseButton
        aria-label="Edit basic info"
        data-testid="basic-info-edit-button"
        size="sm"
        variant="secondary"
        @click="isDialogOpen = true"
      >
        Edit
      </BaseButton>
    </template>

    <div class="kanji-basic-info-content">
      <div class="kanji-basic-info-grid">
        <div class="kanji-basic-info-item">
          <span class="kanji-basic-info-label">Strokes</span>
          <span class="kanji-basic-info-value">{{
            kanji.strokeCount ?? '—'
          }}</span>
        </div>
        <div class="kanji-basic-info-item">
          <span class="kanji-basic-info-label">JLPT</span>
          <span class="kanji-basic-info-value">{{ jlptDisplay }}</span>
        </div>
        <div class="kanji-basic-info-item">
          <span class="kanji-basic-info-label">Jōyō</span>
          <span class="kanji-basic-info-value">{{ joyoDisplay }}</span>
        </div>
        <div class="kanji-basic-info-item">
          <span class="kanji-basic-info-label">Kentei</span>
          <span class="kanji-basic-info-value">{{ kenteiDisplay }}</span>
        </div>
        <div class="kanji-basic-info-item">
          <span class="kanji-basic-info-label">Radical</span>
          <span class="kanji-basic-info-value">{{ radicalDisplay }}</span>
        </div>
      </div>

      <div v-if="classifications.length > 0" class="kanji-basic-info-classifications">
        <span class="kanji-basic-info-label">Classification</span>
        <div class="kanji-basic-info-badges">
          <BaseBadge
            v-for="c in classifications"
            :key="c.id"
            :variant="c.displayOrder === 0 ? 'primary' : 'default'"
          >
            {{
              c.classificationType ? getAbbreviation(c.classificationType) : '—'
            }}
          </BaseBadge>
        </div>
      </div>
    </div>

    <KanjiDetailDialogBasicInfo
      v-model:open="isDialogOpen"
      :all-components="allComponents"
      :classification-types="classificationTypes"
      :classifications="classifications"
      :kanji="kanji"
      :radical="radical"
      @save="handleSave"
    />
  </SharedSection>
</template>

<style scoped>
.kanji-basic-info-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-basic-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--grid-item-min-xs), 1fr));
  gap: var(--spacing-sm) var(--spacing-md);
}

.kanji-basic-info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-0-5);
}

.kanji-basic-info-label {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.kanji-basic-info-value {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.kanji-basic-info-classifications {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.kanji-basic-info-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}
</style>
