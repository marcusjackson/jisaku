/**
 * Use Component Detail Occurrence Handlers
 *
 * Handles occurrence CRUD operations for the component detail page.
 * Link operations (add/create) are handled by
 * use-component-detail-occurrence-link-handlers.ts.
 */

import { useComponentOccurrenceRepository } from '@/api/component';

import { useToast } from '@/shared/composables';

import { useComponentDetailOccurrenceLinkHandlers } from './use-component-detail-occurrence-link-handlers';

import type { OccurrenceUpdateData } from '../component-detail-types';
import type { OccurrenceWithKanji } from '@/api/component';
import type { Kanji } from '@/api/kanji';
import type { QuickCreateKanjiData } from '@/shared/validation';
import type { Ref } from 'vue';

interface UseComponentDetailOccurrenceHandlersDeps {
  componentId: Ref<number | null>;
  occurrences: Ref<OccurrenceWithKanji[]>;
  kanjiOptions: Ref<Kanji[]>;
  /** Reloads groupings; unlinking an occurrence cascades to its grouping memberships */
  reloadGroupings: () => void;
}

interface UseComponentDetailOccurrenceHandlersReturn {
  handleOccurrenceAdd: (kanjiId: number) => boolean;
  handleOccurrenceCreate: (data: QuickCreateKanjiData) => boolean;
  handleOccurrenceUpdate: (id: number, data: OccurrenceUpdateData) => boolean;
  handleOccurrenceRemove: (id: number) => void;
  handleOccurrenceReorder: (ids: number[]) => void;
  /** Reloads the occurrences list */
  reloadOccurrences: () => void;
}

type OccurrenceRepo = ReturnType<typeof useComponentOccurrenceRepository>;
type Toast = ReturnType<typeof useToast>;

function createOccurrencesReloader(
  componentId: Ref<number | null>,
  occurrences: Ref<OccurrenceWithKanji[]>,
  repo: OccurrenceRepo
): () => void {
  return (): void => {
    if (componentId.value === null) return;
    occurrences.value = repo.getByComponentIdWithKanji(componentId.value);
  };
}

function createUpdateHandler(
  reloadOccurrences: () => void,
  repo: OccurrenceRepo,
  toast: Toast
): (id: number, data: OccurrenceUpdateData) => boolean {
  return (id: number, data: OccurrenceUpdateData): boolean => {
    try {
      repo.update(id, data);
      reloadOccurrences();
      toast.success('Occurrence updated');
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update occurrence');
      return false;
    }
  };
}

function createRemoveHandler(
  componentId: Ref<number | null>,
  reloadOccurrences: () => void,
  reloadGroupings: () => void,
  repo: OccurrenceRepo,
  toast: Toast
): (id: number) => void {
  return (id: number): void => {
    if (componentId.value === null) return;
    try {
      repo.remove(id);
      reloadOccurrences();
      reloadGroupings();
      toast.success('Kanji unlinked');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to unlink kanji');
    }
  };
}

function createReorderHandler(
  componentId: Ref<number | null>,
  reloadOccurrences: () => void,
  repo: OccurrenceRepo,
  toast: Toast
): (ids: number[]) => void {
  return (ids: number[]): void => {
    if (componentId.value === null) return;
    try {
      repo.reorder(ids);
      reloadOccurrences();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reorder occurrences');
    }
  };
}

/**
 * Provides handlers for component occurrence management (update, remove, reorder).
 * Link operations are handled by use-component-detail-occurrence-link-handlers.
 *
 * @param deps - Component ID, occurrences ref, kanji options, and the groupings reloader
 * @returns Handlers for occurrence CRUD and reorder operations
 */
export function useComponentDetailOccurrenceHandlers(
  deps: UseComponentDetailOccurrenceHandlersDeps
): UseComponentDetailOccurrenceHandlersReturn {
  const occurrenceRepo = useComponentOccurrenceRepository();
  const toast = useToast();

  const reloadOccurrences = createOccurrencesReloader(
    deps.componentId,
    deps.occurrences,
    occurrenceRepo
  );

  const { handleOccurrenceAdd, handleOccurrenceCreate } = useComponentDetailOccurrenceLinkHandlers({
    componentId: deps.componentId,
    kanjiOptions: deps.kanjiOptions,
    reloadOccurrences,
    occurrenceRepo,
  });

  return {
    handleOccurrenceAdd,
    handleOccurrenceCreate,
    handleOccurrenceUpdate: createUpdateHandler(reloadOccurrences, occurrenceRepo, toast),
    handleOccurrenceRemove: createRemoveHandler(
      deps.componentId,
      reloadOccurrences,
      deps.reloadGroupings,
      occurrenceRepo,
      toast
    ),
    handleOccurrenceReorder: createReorderHandler(
      deps.componentId,
      reloadOccurrences,
      occurrenceRepo,
      toast
    ),
    reloadOccurrences,
  };
}
