<script setup lang="ts">
/**
 * SettingsSectionClassificationTypes
 *
 * Settings section for managing classification types (pictograph, ideograph, etc.).
 * Provides CRUD operations and reordering via dialog-based UI.
 */

import BaseButton from '@/base/components/BaseButton.vue'
import BaseDialog from '@/base/components/BaseDialog.vue'
import BaseInput from '@/base/components/BaseInput.vue'
import BaseTextarea from '@/base/components/BaseTextarea.vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import SharedSection from '@/shared/components/SharedSection.vue'

import { useClassificationTypeSection } from '../composables/use-settings-classification-type-section'

const {
  classificationTypes,
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
  showCreateDialog,
  showDeleteDialog,
  showEditDialog
} = useClassificationTypeSection()
</script>

<template>
  <SharedSection
    collapsible
    :default-open="false"
    test-id="settings-classification-types"
    title="Classification Types"
  >
    <p class="settings-type-section__description">
      Manage classification types for kanji (pictograph, ideograph, etc.).
    </p>

    <div class="settings-type-section__actions">
      <BaseButton
        variant="primary"
        @click="handleCreateClick"
      >
        Add Classification Type
      </BaseButton>
    </div>

    <div
      v-if="classificationTypes.length === 0"
      class="settings-type-section__empty-state"
    >
      <p class="settings-type-section__empty-text">
        No classification types defined. Click "Add Classification Type" to
        create one.
      </p>
    </div>

    <ul
      v-else
      class="settings-type-section__list"
    >
      <li
        v-for="(item, index) in classificationTypes"
        :key="item.id"
        class="settings-type-section__list-item"
      >
        <div class="settings-type-section__item-content">
          <div class="settings-type-section__item-main">
            <span class="settings-type-section__item-name">{{
              item.typeName
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
            v-if="item.descriptionShort"
            class="settings-type-section__item-description"
          >
            {{ item.descriptionShort }}
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
            :disabled="index === classificationTypes.length - 1"
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
      title="Add Classification Type"
    >
      <form
        class="settings-type-section__form"
        @submit.prevent="handleCreateSubmit"
      >
        <BaseInput
          v-model="createForm.typeName"
          label="Type Name"
          name="typeName"
          placeholder="e.g., phonetic_loan"
          required
        />
        <BaseInput
          v-model="createForm.nameJapanese"
          label="Japanese Name"
          name="nameJapanese"
          placeholder="e.g., 仮借字"
        />
        <BaseInput
          v-model="createForm.nameEnglish"
          label="English Name"
          name="nameEnglish"
          placeholder="e.g., Phonetic Loan"
        />
        <BaseInput
          v-model="createForm.descriptionShort"
          label="Short Description"
          name="descriptionShort"
          placeholder="e.g., Borrowed character for sound alone"
        />
        <BaseTextarea
          v-model="createForm.description"
          label="Full Description"
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
      title="Edit Classification Type"
    >
      <form
        class="settings-type-section__form"
        @submit.prevent="handleEditSubmit"
      >
        <BaseInput
          v-model="editForm.typeName"
          label="Type Name"
          name="typeName"
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
        <BaseInput
          v-model="editForm.descriptionShort"
          label="Short Description"
          name="descriptionShort"
        />
        <BaseTextarea
          v-model="editForm.description"
          label="Full Description"
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
          ? `This classification type is used by ${String(deleteUsageCount)} kanji. Deleting it will remove the classification from those kanji. Are you sure?`
          : 'Are you sure you want to delete this classification type? This action cannot be undone.'
      "
      :open="showDeleteDialog"
      title="Delete Classification Type"
      variant="danger"
      @cancel="handleDeleteCancel"
      @confirm="handleDeleteConfirm"
    />
  </SharedSection>
</template>

<style scoped>
@import url('../settings-type-section.css');
</style>
