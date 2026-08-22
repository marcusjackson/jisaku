<script setup lang="ts">
/**
 * SettingsSectionPositionTypes
 *
 * Settings section for managing position types (hen, tsukuri, etc.).
 * Provides CRUD operations and reordering via dialog-based UI.
 */

import BaseButton from '@/base/components/BaseButton.vue'
import BaseDialog from '@/base/components/BaseDialog.vue'
import BaseInput from '@/base/components/BaseInput.vue'
import BaseTextarea from '@/base/components/BaseTextarea.vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import SharedSection from '@/shared/components/SharedSection.vue'

import { usePositionTypeSection } from '../composables/use-settings-position-type-section'

const {
  createForm,
  deleteUsageCount,
  editForm,
  handleCreateCancel,
  handleCreateClick,
  handleCreateSubmit,
  handleDeleteCancel,
  handleDeleteClick,
  handleDeleteConfirm,
  handleEditCancel,
  handleEditClick,
  handleEditSubmit,
  handleMoveDown,
  handleMoveUp,
  positionTypes,
  showCreateDialog,
  showDeleteDialog,
  showEditDialog
} = usePositionTypeSection()
</script>

<template>
  <SharedSection
    collapsible
    :default-open="false"
    test-id="settings-position-types"
    title="Position Types"
  >
    <p class="settings-type-section__description">
      Manage position types for components (hen, tsukuri, kanmuri, etc.).
    </p>

    <div class="settings-type-section__actions">
      <BaseButton
        variant="primary"
        @click="handleCreateClick"
      >
        Add Position Type
      </BaseButton>
    </div>

    <div
      v-if="positionTypes.length === 0"
      class="settings-type-section__empty-state"
    >
      <p class="settings-type-section__empty-text">
        No position types defined. Click "Add Position Type" to create one.
      </p>
    </div>

    <ul
      v-else
      class="settings-type-section__list"
    >
      <li
        v-for="(item, index) in positionTypes"
        :key="item.id"
        class="settings-type-section__list-item"
      >
        <div class="settings-type-section__item-content">
          <div class="settings-type-section__item-main">
            <span class="settings-type-section__item-name">{{
              item.positionName
            }}</span>
            <span
              v-if="item.nameJapanese"
              class="settings-type-section__item-japanese"
              >{{ item.nameJapanese }}</span
            >
            <span
              v-if="item.nameEnglish"
              class="settings-type-section__item-english"
              >{{ item.nameEnglish }}</span
            >
          </div>
          <p
            v-if="item.description"
            class="settings-type-section__item-description"
          >
            {{ item.description }}
          </p>
        </div>

        <div class="settings-type-section__item-actions">
          <BaseButton
            :disabled="index === 0"
            size="sm"
            variant="secondary"
            @click="handleMoveUp(index)"
            >↑</BaseButton
          >
          <BaseButton
            :disabled="index === positionTypes.length - 1"
            size="sm"
            variant="secondary"
            @click="handleMoveDown(index)"
            >↓</BaseButton
          >
          <BaseButton
            size="sm"
            variant="secondary"
            @click="handleEditClick(item)"
            >Edit</BaseButton
          >
          <BaseButton
            size="sm"
            variant="danger"
            @click="handleDeleteClick(item)"
            >Delete</BaseButton
          >
        </div>
      </li>
    </ul>

    <!-- Create Dialog -->
    <BaseDialog
      v-model:open="showCreateDialog"
      title="Add Position Type"
    >
      <form
        class="settings-type-section__form"
        @submit.prevent="handleCreateSubmit"
      >
        <BaseInput
          v-model="createForm.positionName"
          label="Position Name"
          name="positionName"
          placeholder="e.g., hen"
          required
        />
        <BaseInput
          v-model="createForm.nameJapanese"
          label="Japanese Name"
          name="nameJapanese"
          placeholder="e.g., 偏"
        />
        <BaseInput
          v-model="createForm.nameEnglish"
          label="English Name"
          name="nameEnglish"
          placeholder="e.g., left side"
        />
        <BaseTextarea
          v-model="createForm.description"
          label="Description"
          name="description"
          placeholder="Detailed explanation..."
          :rows="3"
        />
        <div class="settings-type-section__form-actions">
          <BaseButton
            type="button"
            variant="secondary"
            @click="handleCreateCancel"
            >Cancel</BaseButton
          >
          <BaseButton
            type="submit"
            variant="primary"
            >Create</BaseButton
          >
        </div>
      </form>
    </BaseDialog>

    <!-- Edit Dialog -->
    <BaseDialog
      v-model:open="showEditDialog"
      title="Edit Position Type"
    >
      <form
        class="settings-type-section__form"
        @submit.prevent="handleEditSubmit"
      >
        <BaseInput
          v-model="editForm.positionName"
          label="Position Name"
          name="positionName"
          required
        />
        <BaseInput
          v-model="editForm.nameJapanese"
          label="Japanese Name"
          name="nameJapanese"
        />
        <BaseInput
          v-model="editForm.nameEnglish"
          label="English Name"
          name="nameEnglish"
        />
        <BaseTextarea
          v-model="editForm.description"
          label="Description"
          name="description"
          :rows="3"
        />
        <div class="settings-type-section__form-actions">
          <BaseButton
            type="button"
            variant="secondary"
            @click="handleEditCancel"
            >Cancel</BaseButton
          >
          <BaseButton
            type="submit"
            variant="primary"
            >Save</BaseButton
          >
        </div>
      </form>
    </BaseDialog>

    <!-- Delete Confirmation -->
    <SharedConfirmDialog
      confirm-label="Delete"
      :description="
        deleteUsageCount > 0
          ? `This position type is used by ${String(deleteUsageCount)} component occurrence(s). Deleting it will remove the position from those occurrences. Are you sure?`
          : 'Are you sure you want to delete this position type? This action cannot be undone.'
      "
      :open="showDeleteDialog"
      title="Delete Position Type"
      variant="danger"
      @cancel="handleDeleteCancel"
      @confirm="handleDeleteConfirm"
    />
  </SharedSection>
</template>

<style scoped>
@import url('../settings-type-section.css');
</style>
