/**
 * classification-type-handlers
 *
 * CRUD handler factories for the Classification Types settings section.
 * Reorder handlers: classification-type-reorder-handlers.ts.
 * Shared types: ../settings-types.ts.
 */

import { emptyClassificationTypeForm } from '../settings-types'

import type { ClassificationTypeSectionState } from '../settings-types'
import type { ClassificationType } from '@/api/classification'

/**
 * Reloads all classification types from the repository into the section state.
 *
 * @param s - The classification type section state object
 */
export function loadClassificationTypes(
  s: ClassificationTypeSectionState
): void {
  try {
    s.classificationTypes.value = s.repo.getAll()
  } catch {
    s.classificationTypes.value = []
    s.toast.error('Failed to load classification types')
  }
}

/**
 * Creates create-dialog handlers (open, submit, cancel) for classification types.
 *
 * @param s - The classification type section state object
 * @returns Handlers for the create dialog lifecycle
 */
export function makeCreateHandlers(s: ClassificationTypeSectionState): {
  handleCreateClick: () => void
  handleCreateSubmit: () => void
  handleCreateCancel: () => void
} {
  function handleCreateClick(): void {
    s.createForm.value = emptyClassificationTypeForm()
    s.showCreateDialog.value = true
  }
  function handleCreateSubmit(): void {
    if (!s.createForm.value.typeName.trim()) {
      s.toast.error('Type name is required')
      return
    }
    try {
      s.repo.create({
        typeName: s.createForm.value.typeName,
        nameJapanese: s.createForm.value.nameJapanese ?? null,
        nameEnglish: s.createForm.value.nameEnglish ?? null,
        descriptionShort: s.createForm.value.descriptionShort ?? null,
        description: s.createForm.value.description ?? null
      })
      s.toast.success('Classification type created')
      s.showCreateDialog.value = false
      s.createForm.value = emptyClassificationTypeForm()
      loadClassificationTypes(s)
    } catch (err) {
      s.toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to create classification type'
      )
    }
  }
  function handleCreateCancel(): void {
    s.showCreateDialog.value = false
    s.createForm.value = emptyClassificationTypeForm()
  }
  return { handleCreateClick, handleCreateSubmit, handleCreateCancel }
}

/**
 * Creates edit-dialog handlers (open, submit, cancel) for classification types.
 *
 * @param s - The classification type section state object
 * @returns Handlers for the edit dialog lifecycle
 */
export function makeEditHandlers(s: ClassificationTypeSectionState): {
  handleEditClick: (item: ClassificationType) => void
  handleEditSubmit: () => void
  handleEditCancel: () => void
} {
  function handleEditClick(item: ClassificationType): void {
    s.editingItem.value = item
    s.editForm.value = {
      typeName: item.typeName,
      nameJapanese: item.nameJapanese ?? undefined,
      nameEnglish: item.nameEnglish ?? undefined,
      descriptionShort: item.descriptionShort ?? undefined,
      description: item.description ?? undefined
    }
    s.showEditDialog.value = true
  }
  function handleEditSubmit(): void {
    if (!s.editingItem.value) return
    try {
      s.repo.update(s.editingItem.value.id, {
        typeName: s.editForm.value.typeName,
        nameJapanese: s.editForm.value.nameJapanese ?? null,
        nameEnglish: s.editForm.value.nameEnglish ?? null,
        descriptionShort: s.editForm.value.descriptionShort ?? null,
        description: s.editForm.value.description ?? null
      })
      s.toast.success('Classification type updated')
      s.showEditDialog.value = false
      s.editingItem.value = null
      loadClassificationTypes(s)
    } catch (err) {
      s.toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to update classification type'
      )
    }
  }
  function handleEditCancel(): void {
    s.showEditDialog.value = false
    s.editingItem.value = null
  }
  return { handleEditClick, handleEditSubmit, handleEditCancel }
}

/**
 * Creates delete-dialog handlers (open, confirm, cancel) for classification types.
 *
 * @param s - The classification type section state object
 * @returns Handlers for the delete dialog lifecycle
 */
export function makeDeleteHandlers(s: ClassificationTypeSectionState): {
  handleDeleteClick: (item: ClassificationType) => void
  handleDeleteConfirm: () => void
  handleDeleteCancel: () => void
} {
  function handleDeleteClick(item: ClassificationType): void {
    s.deletingItem.value = item
    s.deleteUsageCount.value = s.repo.getUsageCount(item.id)
    s.showDeleteDialog.value = true
  }
  function handleDeleteConfirm(): void {
    if (!s.deletingItem.value) return
    try {
      s.repo.remove(s.deletingItem.value.id)
      s.toast.success('Classification type deleted')
      s.showDeleteDialog.value = false
      s.deletingItem.value = null
      s.deleteUsageCount.value = 0
      loadClassificationTypes(s)
    } catch (err) {
      s.toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to delete classification type'
      )
    }
  }
  function handleDeleteCancel(): void {
    s.showDeleteDialog.value = false
    s.deletingItem.value = null
    s.deleteUsageCount.value = 0
  }
  return { handleDeleteClick, handleDeleteConfirm, handleDeleteCancel }
}
