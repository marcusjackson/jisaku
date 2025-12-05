<script setup lang="ts">
/**
 * BaseFileInput
 *
 * A file input component for uploading images.
 * Converts files to Uint8Array for database storage.
 * Shows preview, size warnings, and supports drag-and-drop.
 */

import { computed, onUnmounted, ref, useId, watch } from 'vue'

const props = defineProps<{
  /** Input label text */
  label?: string
  /** Accepted file types (e.g., 'image/*') */
  accept?: string
  /** Error message to display */
  error?: string | undefined
  /** Disable the input */
  disabled?: boolean
  /** Input name attribute */
  name?: string
  /** Soft limit in bytes (shows warning) */
  warningSizeBytes?: number
  /** Hard limit in bytes (prevents upload) */
  maxSizeBytes?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Uint8Array | null]
}>()

const model = defineModel<Uint8Array | null>()

const inputId = useId()
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const previewUrl = ref<string | null>(null)
const fileName = ref<string | null>(null)
const fileSize = ref<number>(0)
const sizeWarning = ref(false)
const sizeError = ref<string | null>(null)

const DEFAULT_WARNING_SIZE = 500 * 1024 // 500KB
const DEFAULT_MAX_SIZE = 2 * 1024 * 1024 // 2MB

const warningSize = computed(
  () => props.warningSizeBytes ?? DEFAULT_WARNING_SIZE
)
const maxSize = computed(() => props.maxSizeBytes ?? DEFAULT_MAX_SIZE)

const hasFile = computed(() => !!model.value)

const formattedSize = computed(() => {
  if (!fileSize.value) return ''
  const kb = fileSize.value / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(2)} MB`
})

const containerClasses = computed(() => [
  'base-file-input-drop-zone',
  {
    'base-file-input-drop-zone-dragging': isDragging.value,
    'base-file-input-drop-zone-error': !!props.error || !!sizeError.value,
    'base-file-input-drop-zone-disabled': props.disabled,
    'base-file-input-drop-zone-has-file': hasFile.value
  }
])

// Generate preview URL from Uint8Array
watch(
  model,
  (newValue) => {
    // Revoke previous URL to prevent memory leaks
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }

    if (newValue) {
      const blob = new Blob([newValue.buffer as ArrayBuffer])
      previewUrl.value = URL.createObjectURL(blob)
    }
  },
  { immediate: true }
)

async function processFile(file: File): Promise<void> {
  sizeError.value = null
  sizeWarning.value = false

  // Check hard limit
  if (file.size > maxSize.value) {
    sizeError.value = `File too large. Maximum size is ${(maxSize.value / 1024 / 1024).toFixed(1)} MB`
    return
  }

  // Check soft limit
  if (file.size > warningSize.value) {
    sizeWarning.value = true
  }

  fileName.value = file.name
  fileSize.value = file.size

  // Convert to Uint8Array
  const arrayBuffer = await file.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)

  model.value = uint8Array
  emit('update:modelValue', uint8Array)
}

function handleFileChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) {
    void processFile(file)
  }
}

function handleDragOver(event: DragEvent): void {
  if (props.disabled) return
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave(): void {
  isDragging.value = false
}

function handleDrop(event: DragEvent): void {
  if (props.disabled) return
  event.preventDefault()
  isDragging.value = false

  const file = event.dataTransfer?.files[0]
  if (file) {
    void processFile(file)
  }
}

function handleClick(): void {
  if (props.disabled) return
  fileInputRef.value?.click()
}

function handleKeydown(event: KeyboardEvent): void {
  if (props.disabled) return
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    fileInputRef.value?.click()
  }
}

function removeFile(): void {
  model.value = null
  emit('update:modelValue', null)
  fileName.value = null
  fileSize.value = 0
  sizeWarning.value = false
  sizeError.value = null

  // Reset file input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<template>
  <div class="base-file-input">
    <label
      v-if="label"
      class="base-file-input-label"
      :for="inputId"
    >
      {{ label }}
    </label>

    <div
      :aria-describedby="error || sizeError ? `${inputId}-error` : undefined"
      :aria-disabled="disabled"
      :class="containerClasses"
      role="button"
      :tabindex="disabled ? -1 : 0"
      @click="handleClick"
      @dragleave="handleDragLeave"
      @dragover="handleDragOver"
      @drop="handleDrop"
      @keydown="handleKeydown"
    >
      <input
        :id="inputId"
        ref="fileInputRef"
        :accept="accept"
        class="base-file-input-hidden"
        :disabled="disabled"
        :name="name"
        type="file"
        @change="handleFileChange"
      />

      <!-- Preview state -->
      <template v-if="hasFile && previewUrl">
        <div class="base-file-input-preview">
          <img
            alt="Preview"
            class="base-file-input-preview-image"
            :src="previewUrl"
          />
          <div class="base-file-input-preview-info">
            <span
              v-if="fileName"
              class="base-file-input-file-name"
              >{{ fileName }}</span
            >
            <span
              v-if="fileSize"
              class="base-file-input-file-size"
              :class="{ 'base-file-input-file-size-warning': sizeWarning }"
            >
              {{ formattedSize }}
              <span v-if="sizeWarning">(large file)</span>
            </span>
          </div>
          <button
            aria-label="Remove file"
            class="base-file-input-remove"
            :disabled="disabled"
            type="button"
            @click.stop="removeFile"
          >
            ×
          </button>
        </div>
      </template>

      <!-- Empty state -->
      <template v-else>
        <div class="base-file-input-empty">
          <span class="base-file-input-icon">📷</span>
          <span class="base-file-input-text"
            >Drop image here or click to browse</span
          >
          <span class="base-file-input-hint"
            >PNG, JPG, GIF up to
            {{ (maxSize / 1024 / 1024).toFixed(0) }}MB</span
          >
        </div>
      </template>
    </div>

    <!-- Size warning -->
    <p
      v-if="sizeWarning && !sizeError"
      class="base-file-input-warning"
      role="status"
    >
      Large file size may slow down app performance
    </p>

    <!-- Error message -->
    <p
      v-if="error || sizeError"
      :id="`${inputId}-error`"
      class="base-file-input-error"
      role="alert"
    >
      {{ error || sizeError }}
    </p>
  </div>
</template>

<style scoped>
.base-file-input {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.base-file-input-label {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.base-file-input-hidden {
  display: none;
}

.base-file-input-drop-zone {
  min-height: 120px;
  padding: var(--spacing-4);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface-secondary);
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast);
}

.base-file-input-drop-zone:hover:not(.base-file-input-drop-zone-disabled) {
  border-color: var(--color-primary);
  background-color: var(--color-surface-tertiary);
}

.base-file-input-drop-zone:focus {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
  outline: none;
}

.base-file-input-drop-zone-dragging {
  border-color: var(--color-primary);
  background-color: var(--color-surface-tertiary);
}

.base-file-input-drop-zone-error {
  border-color: var(--color-error);
}

.base-file-input-drop-zone-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-file-input-drop-zone-has-file {
  padding: var(--spacing-2);
}

.base-file-input-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-2);
  text-align: center;
}

.base-file-input-icon {
  font-size: var(--font-size-2xl);
}

.base-file-input-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.base-file-input-hint {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.base-file-input-preview {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.base-file-input-preview-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-primary);
}

.base-file-input-preview-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
}

.base-file-input-file-name {
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.base-file-input-file-size {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.base-file-input-file-size-warning {
  color: var(--color-warning);
}

.base-file-input-remove {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background-color: var(--color-surface-tertiary);
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.base-file-input-remove:hover:not(:disabled) {
  background-color: var(--color-error);
  color: var(--color-text-inverse);
}

.base-file-input-remove:focus {
  box-shadow: var(--focus-ring);
  outline: none;
}

.base-file-input-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-file-input-warning {
  margin: 0;
  color: var(--color-warning);
  font-size: var(--font-size-sm);
}

.base-file-input-error {
  margin: 0;
  color: var(--color-error);
  font-size: var(--font-size-sm);
}
</style>
