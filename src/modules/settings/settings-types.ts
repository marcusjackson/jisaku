/**
 * settings-types.ts
 *
 * Shared types and utility functions for the Settings module sections.
 */

import type {
  ClassificationType,
  useClassificationTypeRepository
} from '@/api/classification'
import type { PositionType, usePositionTypeRepository } from '@/api/position'
import type { useToast } from '@/shared/composables/use-toast'
import type { Ref } from 'vue'

// Classification Type

export interface ClassificationTypeFormValues {
  typeName: string
  nameJapanese: string | undefined
  nameEnglish: string | undefined
  descriptionShort: string | undefined
  description: string | undefined
}

export interface ClassificationTypeSectionState {
  repo: ReturnType<typeof useClassificationTypeRepository>
  toast: ReturnType<typeof useToast>
  classificationTypes: Ref<ClassificationType[]>
  showCreateDialog: Ref<boolean>
  showEditDialog: Ref<boolean>
  showDeleteDialog: Ref<boolean>
  editingItem: Ref<ClassificationType | null>
  deletingItem: Ref<ClassificationType | null>
  deleteUsageCount: Ref<number>
  createForm: Ref<ClassificationTypeFormValues>
  editForm: Ref<ClassificationTypeFormValues>
}

export function emptyClassificationTypeForm(): ClassificationTypeFormValues {
  return {
    typeName: '',
    nameJapanese: undefined,
    nameEnglish: undefined,
    descriptionShort: undefined,
    description: undefined
  }
}

// Position Type

export interface PositionTypeFormValues {
  positionName: string
  nameJapanese: string | undefined
  nameEnglish: string | undefined
  description: string | undefined
}

export interface PositionTypeSectionState {
  repo: ReturnType<typeof usePositionTypeRepository>
  toast: ReturnType<typeof useToast>
  positionTypes: Ref<PositionType[]>
  showCreateDialog: Ref<boolean>
  showEditDialog: Ref<boolean>
  showDeleteDialog: Ref<boolean>
  editingItem: Ref<PositionType | null>
  deletingItem: Ref<PositionType | null>
  deleteUsageCount: Ref<number>
  createForm: Ref<PositionTypeFormValues>
  editForm: Ref<PositionTypeFormValues>
}

export function emptyPositionTypeForm(): PositionTypeFormValues {
  return {
    positionName: '',
    nameJapanese: undefined,
    nameEnglish: undefined,
    description: undefined
  }
}
