<script setup lang="ts">
/**
 * SharedPositionBadge
 *
 * Displays a position type as a badge with tooltip.
 * Shows the Japanese name or English name, with full description on hover.
 */

import type { PositionType } from '@/shared/types/database-types'

const props = defineProps<{
  position: PositionType
}>()

// Use Japanese name if available, fallback to English, fallback to position name
const displayName =
  props.position.nameJapanese ??
  props.position.nameEnglish ??
  props.position.positionName

// Use short description for tooltip if available, fallback to full description
const tooltipText =
  props.position.descriptionShort ??
  props.position.description ??
  props.position.positionName
</script>

<template>
  <span
    class="shared-position-badge"
    :title="tooltipText"
  >
    {{ displayName }}
  </span>
</template>

<style scoped>
.shared-position-badge {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: help;
  transition: all 0.2s ease;
}

.shared-position-badge:hover {
  border-color: var(--color-border-default);
  background-color: var(--color-bg-tertiary);
}
</style>
