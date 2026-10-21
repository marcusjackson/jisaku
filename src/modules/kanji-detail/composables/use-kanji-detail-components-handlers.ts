/**
 * Use Kanji Detail Components Handlers
 *
 * Handles link/unlink/create/update operations for component occurrences.
 *
 * @module modules/kanji-detail
 */

import { computed } from 'vue';

import {
  useComponentFormRepository,
  useComponentOccurrenceRepository,
  useComponentRepository,
} from '@/api/component';
import { usePositionTypeRepository } from '@/api/position';

import { useDatabase } from '@/shared/composables/use-database';
import { useToast } from '@/shared/composables/use-toast';
import { blankToNull } from '@/shared/utils/text-utils';

import { refreshOccurrenceDetails } from './use-kanji-detail-components-occurrences';

import type { ComponentOccurrenceWithDetails, DialogComponentChanges } from '../kanji-detail-types';
import type { Component } from '@/api/component/component-types';
import type { Kanji } from '@/api/kanji/kanji-types';
import type { QuickCreateComponentData } from '@/shared/validation/quick-create-component-schema';
import type { ComputedRef, Ref } from 'vue';

// ============================================================================
// Types
// ============================================================================

interface State {
  kanji: Ref<Kanji | null>;
  componentOccurrences: Ref<ComponentOccurrenceWithDetails[]>;
  /** The kanji's shared component list; reloaded here after a quick-create. */
  allComponents: Ref<Component[]>;
}

interface ComponentsContext {
  state: State;
  toast: ReturnType<typeof useToast>;
  componentRepo: ReturnType<typeof useComponentRepository>;
  occurrenceRepo: ReturnType<typeof useComponentOccurrenceRepository>;
  positionRepo: ReturnType<typeof usePositionTypeRepository>;
  formRepo: ReturnType<typeof useComponentFormRepository>;
  transaction: ReturnType<typeof useDatabase>['transaction'];
}

interface UseKanjiDetailComponentsHandlersReturn {
  allComponents: Ref<Component[]>;
  linkedOccurrences: ComputedRef<ComponentOccurrenceWithDetails[]>;
  handleSave: (changes: DialogComponentChanges) => boolean;
  handleCreate: (data: QuickCreateComponentData) => boolean;
  refreshOccurrences: () => void;
}

// ============================================================================
// Module-scope implementation functions
// ============================================================================

function doHandleSave(changes: DialogComponentChanges, ctx: ComponentsContext): boolean {
  const kanjiVal = ctx.state.kanji.value;
  if (!kanjiVal) {
    ctx.toast.error('No kanji selected');
    return false;
  }
  try {
    // One transaction: a failure part-way leaves nothing written, so a retry
    // from the still-open dialog cannot create duplicate links.
    ctx.transaction(() => {
      changes.toLink.forEach((link) => {
        ctx.occurrenceRepo.create({
          kanjiId: kanjiVal.id,
          componentId: link.componentId,
          positionTypeId: link.positionTypeId,
          componentFormId: link.componentFormId,
          isRadical: link.isRadical,
          analysisNotes: null,
        });
      });
      changes.toUpdate.forEach((update) => {
        ctx.occurrenceRepo.update(update.id, {
          positionTypeId: update.positionTypeId,
          componentFormId: update.componentFormId,
          isRadical: update.isRadical,
        });
      });
      changes.toDelete.forEach((id) => {
        ctx.occurrenceRepo.remove(id);
      });
    });
    refreshOccurrenceDetails(ctx);
    ctx.toast.success('Component changes saved successfully');
    return true;
  } catch {
    ctx.toast.error('Failed to save component changes');
    return false;
  }
}

function doHandleCreate(data: QuickCreateComponentData, ctx: ComponentsContext): boolean {
  try {
    ctx.componentRepo.create({
      character: data.character,
      shortMeaning: blankToNull(data.shortMeaning),
    });
    ctx.state.allComponents.value = ctx.componentRepo.getAll();
    ctx.toast.success(`Created component "${data.character}"`);
    return true;
  } catch {
    ctx.toast.error('Failed to create component');
    return false;
  }
}

// ============================================================================
// Composable
// ============================================================================

/**
 * Provides handlers for managing component occurrences on a kanji.
 *
 * @param state - Reactive kanji detail state (kanji, componentOccurrences and allComponents refs)
 * @returns Handlers and computed values for component occurrence management
 */
export function useKanjiDetailComponentsHandlers(
  state: State
): UseKanjiDetailComponentsHandlersReturn {
  const ctx: ComponentsContext = {
    state,
    toast: useToast(),
    componentRepo: useComponentRepository(),
    occurrenceRepo: useComponentOccurrenceRepository(),
    positionRepo: usePositionTypeRepository(),
    formRepo: useComponentFormRepository(),
    transaction: useDatabase().transaction,
  };

  const linkedOccurrences = computed<ComponentOccurrenceWithDetails[]>(
    () => state.componentOccurrences.value
  );

  return {
    allComponents: state.allComponents,
    linkedOccurrences,
    handleSave: (changes) => doHandleSave(changes, ctx),
    handleCreate: (data) => doHandleCreate(data, ctx),
    refreshOccurrences: () => {
      refreshOccurrenceDetails(ctx);
    },
  };
}
