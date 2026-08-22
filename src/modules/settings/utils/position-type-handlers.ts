/**
 * position-type-handlers
 *
 * CRUD handler factories for the Position Types settings section.
 * Reorder handlers: position-type-reorder-handlers.ts.
 * Shared types: ../settings-types.ts.
 */

import { emptyPositionTypeForm } from '../settings-types'

import type { PositionTypeSectionState } from '../settings-types'
import type { PositionType } from '@/api/position'

/**
 * Reloads all position types from the repository into the section state.
 *
 * @param s - The position type section state object
 */
export function loadPositionTypes(s: PositionTypeSectionState): void {
  try {
    s.positionTypes.value = s.repo.getAll()
  } catch {
    s.positionTypes.value = []
    s.toast.error('Failed to load position types')
  }
}

/**
 * Creates create-dialog handlers (open, submit, cancel) for position types.
 *
 * @param s - The position type section state object
 * @returns Handlers for the create dialog lifecycle
 */
export function makeCreateHandlers(s: PositionTypeSectionState): {
  handleCreateClick: () => void
  handleCreateSubmit: () => void
  handleCreateCancel: () => void
} {
  function handleCreateClick(): void {
    s.createForm.value = emptyPositionTypeForm()
    s.showCreateDialog.value = true
  }
  function handleCreateSubmit(): void {
    if (!s.createForm.value.positionName.trim()) {
      s.toast.error('Position name is required')
      return
    }
    try {
      s.repo.create({
        positionName: s.createForm.value.positionName,
        nameJapanese: s.createForm.value.nameJapanese ?? null,
        nameEnglish: s.createForm.value.nameEnglish ?? null,
        description: s.createForm.value.description ?? null
      })
      s.toast.success('Position type created')
      s.showCreateDialog.value = false
      s.createForm.value = emptyPositionTypeForm()
      loadPositionTypes(s)
    } catch (err) {
      s.toast.error(
        err instanceof Error ? err.message : 'Failed to create position type'
      )
    }
  }
  function handleCreateCancel(): void {
    s.showCreateDialog.value = false
    s.createForm.value = emptyPositionTypeForm()
  }
  return { handleCreateClick, handleCreateSubmit, handleCreateCancel }
}

/**
 * Creates edit-dialog handlers (open, submit, cancel) for position types.
 *
 * @param s - The position type section state object
 * @returns Handlers for the edit dialog lifecycle
 */
export function makeEditHandlers(s: PositionTypeSectionState): {
  handleEditClick: (item: PositionType) => void
  handleEditSubmit: () => void
  handleEditCancel: () => void
} {
  function handleEditClick(item: PositionType): void {
    s.editingItem.value = item
    s.editForm.value = {
      positionName: item.positionName,
      nameJapanese: item.nameJapanese ?? undefined,
      nameEnglish: item.nameEnglish ?? undefined,
      description: item.description ?? undefined
    }
    s.showEditDialog.value = true
  }
  function handleEditSubmit(): void {
    if (!s.editingItem.value) return
    try {
      s.repo.update(s.editingItem.value.id, {
        positionName: s.editForm.value.positionName,
        nameJapanese: s.editForm.value.nameJapanese ?? null,
        nameEnglish: s.editForm.value.nameEnglish ?? null,
        description: s.editForm.value.description ?? null
      })
      s.toast.success('Position type updated')
      s.showEditDialog.value = false
      s.editingItem.value = null
      loadPositionTypes(s)
    } catch (err) {
      s.toast.error(
        err instanceof Error ? err.message : 'Failed to update position type'
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
 * Creates delete-dialog handlers (open, confirm, cancel) for position types.
 *
 * @param s - The position type section state object
 * @returns Handlers for the delete dialog lifecycle
 */
export function makeDeleteHandlers(s: PositionTypeSectionState): {
  handleDeleteClick: (item: PositionType) => void
  handleDeleteConfirm: () => void
  handleDeleteCancel: () => void
} {
  function handleDeleteClick(item: PositionType): void {
    s.deletingItem.value = item
    s.deleteUsageCount.value = s.repo.getUsageCount(item.id)
    s.showDeleteDialog.value = true
  }
  function handleDeleteConfirm(): void {
    if (!s.deletingItem.value) return
    try {
      s.repo.remove(s.deletingItem.value.id)
      s.toast.success('Position type deleted')
      s.showDeleteDialog.value = false
      s.deletingItem.value = null
      s.deleteUsageCount.value = 0
      loadPositionTypes(s)
    } catch (err) {
      s.toast.error(
        err instanceof Error ? err.message : 'Failed to delete position type'
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
