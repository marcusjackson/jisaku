/**
 * Shared Components
 *
 * App-specific components shared across modules.
 */

export { default as ImageLightbox } from './ImageLightbox.vue'
export { default as SharedBackButton } from './SharedBackButton.vue'
export { default as SharedConfirmDialog } from './SharedConfirmDialog.vue'
export { default as SharedEntitySearch } from './SharedEntitySearch.vue'
export { default as SharedHeader } from './SharedHeader.vue'
export { default as SharedPositionBadge } from './SharedPositionBadge.vue'
export { default as SharedQuickCreateKanji } from './SharedQuickCreateKanji.vue'
export { default as SharedSearchKeywordsIndicator } from './SharedSearchKeywordsIndicator.vue'
export { default as SharedSection } from './SharedSection.vue'
export { default as SharedSwitchNewUi } from './SharedSwitchNewUi.vue'

// Re-export types
export type { EntityOption, EntityType } from './SharedEntitySearch.vue'
