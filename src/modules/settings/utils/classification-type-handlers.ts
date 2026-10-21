/**
 * classification-type-handlers
 *
 * CRUD handler factories for the Classification Types settings section.
 * Reorder handlers: classification-type-reorder-handlers.ts.
 * Shared types: ../settings-types.ts.
 */

import { emptyClassificationTypeForm } from '../settings-types';

import { optionalText, typeNameError } from './type-name-helpers';

import type { ClassificationTypeSectionState } from '../settings-types';
import type { ClassificationType } from '@/api/classification';

/** Normalises the optional text fields of a form for saving. */
function optionalFields(form: ClassificationTypeSectionState['createForm']['value']): {
  nameJapanese: string | null;
  nameEnglish: string | null;
  descriptionShort: string | null;
  description: string | null;
} {
  return {
    nameJapanese: optionalText(form.nameJapanese),
    nameEnglish: optionalText(form.nameEnglish),
    descriptionShort: optionalText(form.descriptionShort),
    description: optionalText(form.description),
  };
}

/** Builds the edit form from a saved type (nulls become undefined). */
function toEditForm(item: ClassificationType): ClassificationTypeSectionState['editForm']['value'] {
  return {
    typeName: item.typeName,
    nameJapanese: item.nameJapanese ?? undefined,
    nameEnglish: item.nameEnglish ?? undefined,
    descriptionShort: item.descriptionShort ?? undefined,
    description: item.description ?? undefined,
  };
}

/**
 * Reloads all classification types from the repository into the section state.
 *
 * @param s - The classification type section state object
 */
export function loadClassificationTypes(s: ClassificationTypeSectionState): void {
  try {
    s.classificationTypes.value = s.repo.getAll();
  } catch {
    s.classificationTypes.value = [];
    s.toast.error('Failed to load classification types');
  }
}

/**
 * Creates create-dialog handlers (open, submit, cancel) for classification types.
 *
 * @param s - The classification type section state object
 * @returns Handlers for the create dialog lifecycle
 */
export function makeCreateHandlers(s: ClassificationTypeSectionState): {
  handleCreateClick: () => void;
  handleCreateSubmit: () => void;
  handleCreateCancel: () => void;
} {
  function handleCreateClick(): void {
    s.createForm.value = emptyClassificationTypeForm();
    s.showCreateDialog.value = true;
  }
  function handleCreateSubmit(): void {
    const error = typeNameError(
      s.createForm.value.typeName,
      s.classificationTypes.value.map((t) => ({ id: t.id, name: t.typeName })),
      'classification type'
    );
    if (error) {
      s.toast.error(error);
      return;
    }
    try {
      s.repo.create({
        ...optionalFields(s.createForm.value),
        typeName: s.createForm.value.typeName,
      });
      s.toast.success('Classification type created');
      s.showCreateDialog.value = false;
      s.createForm.value = emptyClassificationTypeForm();
      loadClassificationTypes(s);
    } catch (err) {
      s.toast.error(err instanceof Error ? err.message : 'Failed to create classification type');
    }
  }
  function handleCreateCancel(): void {
    s.showCreateDialog.value = false;
    s.createForm.value = emptyClassificationTypeForm();
  }
  return { handleCreateClick, handleCreateSubmit, handleCreateCancel };
}

/**
 * Creates edit-dialog handlers (open, submit, cancel) for classification types.
 *
 * @param s - The classification type section state object
 * @returns Handlers for the edit dialog lifecycle
 */
export function makeEditHandlers(s: ClassificationTypeSectionState): {
  handleEditClick: (item: ClassificationType) => void;
  handleEditSubmit: () => void;
  handleEditCancel: () => void;
} {
  function handleEditClick(item: ClassificationType): void {
    s.editingItem.value = item;
    s.editForm.value = toEditForm(item);
    s.showEditDialog.value = true;
  }
  function handleEditSubmit(): void {
    if (!s.editingItem.value) return;
    const error = typeNameError(
      s.editForm.value.typeName,
      s.classificationTypes.value.map((t) => ({ id: t.id, name: t.typeName })),
      'classification type',
      s.editingItem.value.id
    );
    if (error) {
      s.toast.error(error);
      return;
    }
    try {
      s.repo.update(s.editingItem.value.id, {
        ...optionalFields(s.editForm.value),
        typeName: s.editForm.value.typeName,
      });
      s.toast.success('Classification type updated');
      s.showEditDialog.value = false;
      s.editingItem.value = null;
      loadClassificationTypes(s);
    } catch (err) {
      s.toast.error(err instanceof Error ? err.message : 'Failed to update classification type');
    }
  }
  function handleEditCancel(): void {
    s.showEditDialog.value = false;
    s.editingItem.value = null;
  }
  return { handleEditClick, handleEditSubmit, handleEditCancel };
}

/**
 * Creates delete-dialog handlers (open, confirm, cancel) for classification types.
 *
 * @param s - The classification type section state object
 * @returns Handlers for the delete dialog lifecycle
 */
export function makeDeleteHandlers(s: ClassificationTypeSectionState): {
  handleDeleteClick: (item: ClassificationType) => void;
  handleDeleteConfirm: () => void;
  handleDeleteCancel: () => void;
} {
  function handleDeleteClick(item: ClassificationType): void {
    s.deletingItem.value = item;
    try {
      s.deleteUsageCount.value = s.repo.getUsageCount(item.id);
    } catch {
      s.toast.error('Failed to check usage');
      s.deletingItem.value = null;
      return;
    }
    s.showDeleteDialog.value = true;
  }
  function handleDeleteConfirm(): void {
    if (!s.deletingItem.value) return;
    try {
      s.repo.remove(s.deletingItem.value.id);
      s.toast.success('Classification type deleted');
      s.showDeleteDialog.value = false;
      s.deletingItem.value = null;
      s.deleteUsageCount.value = 0;
      loadClassificationTypes(s);
    } catch (err) {
      s.toast.error(err instanceof Error ? err.message : 'Failed to delete classification type');
    }
  }
  function handleDeleteCancel(): void {
    s.showDeleteDialog.value = false;
    s.deletingItem.value = null;
    s.deleteUsageCount.value = 0;
  }
  return { handleDeleteClick, handleDeleteConfirm, handleDeleteCancel };
}
