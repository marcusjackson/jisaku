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
}>()

const emit = defineEmits<{
  save: [data: BasicInfoSaveData]
}>()

const isDialogOpen = ref(false)

// Display helpers
const jlptDisplay = computed(() => {
  if (!props.kanji.jlptLevel) return '—'
  return props.kanji.jlptLevel
})

const joyoDisplay = computed(() => {
  if (!props.kanji.joyoLevel) return '—'
  const labels: Record<string, string> = {
    elementary1: '小1',
    elementary2: '小2',
    elementary3: '小3',
    elementary4: '小4',
    elementary5: '小5',
    elementary6: '小6',
    secondary: '中学'
  }
  return labels[props.kanji.joyoLevel] ?? '—'
})

const kenteiDisplay = computed(() => {
  if (!props.kanji.kanjiKenteiLevel) return '—'
  const labels: Record<string, string> = {
    '10': '10級',
    '9': '9級',
    '8': '8級',
    '7': '7級',
    '6': '6級',
    '5': '5級',
    '4': '4級',
    '3': '3級',
    pre2: '準2級',
    '2': '2級',
    pre1: '準1級',
    '1': '1級'
  }
  return labels[props.kanji.kanjiKenteiLevel] ?? '—'
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
  emit('save', data)
  isDialogOpen.value = false
}
</script>

<template>
  <SharedSection
    test-id="kanji-detail-basic-info"
    title="Basic Information"
  >
    <template #actions>
      <BaseButton
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

      <div
        v-if="classifications.length > 0"
        class="kanji-basic-info-classifications"
      >
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
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
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
