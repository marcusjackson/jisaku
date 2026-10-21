/**
 * Tests for use-component-detail-occurrence-handlers composable.
 */

import { ref } from 'vue';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useComponentDetailOccurrenceHandlers } from './use-component-detail-occurrence-handlers';

import type { OccurrenceWithKanji } from '@/api/component';
import type { Kanji } from '@/api/kanji';

// Mock dependencies
const mockOccurrenceCreate = vi.fn();
const mockOccurrenceUpdate = vi.fn();
const mockOccurrenceRemove = vi.fn();
const mockOccurrenceReorder = vi.fn();
const mockOccurrenceGetByComponentIdWithKanji = vi.fn();

vi.mock('@/api/component', () => ({
  useComponentOccurrenceRepository: () => ({
    create: mockOccurrenceCreate,
    update: mockOccurrenceUpdate,
    remove: mockOccurrenceRemove,
    reorder: mockOccurrenceReorder,
    getByComponentIdWithKanji: mockOccurrenceGetByComponentIdWithKanji,
  }),
}));

const mockKanjiCreate = vi.fn();
const mockKanjiGetAll = vi.fn();

vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({
    create: mockKanjiCreate,
    getAll: mockKanjiGetAll,
    getByCharacter: () => null,
  }),
}));

const mockReloadGroupings = vi.fn();
const mockSuccess = vi.fn();
const mockError = vi.fn();

vi.mock('@/shared/composables', () => ({
  useDatabase: () => ({ transaction: <T>(fn: () => T): T => fn() }),
  useToast: () => ({
    success: mockSuccess,
    error: mockError,
  }),
}));

describe('useComponentDetailOccurrenceHandlers', () => {
  const componentId = ref<number | null>(100);
  const occurrences = ref<OccurrenceWithKanji[]>([]);
  const kanjiOptions = ref<Kanji[]>([]);

  beforeEach(() => {
    vi.clearAllMocks();
    componentId.value = 100;
    occurrences.value = [];
    kanjiOptions.value = [];
    mockOccurrenceGetByComponentIdWithKanji.mockReturnValue([]);
    mockKanjiGetAll.mockReturnValue([]);
  });

  describe('link handlers wiring', () => {
    it('links an existing kanji and creates-and-links a new one, reloading occurrences', () => {
      mockKanjiCreate.mockReturnValue({ id: 999 });
      const { handleOccurrenceAdd, handleOccurrenceCreate } = useComponentDetailOccurrenceHandlers({
        componentId,
        occurrences,
        kanjiOptions,
        reloadGroupings: mockReloadGroupings,
      });

      expect(handleOccurrenceAdd(42)).toBe(true);
      expect(mockOccurrenceCreate).toHaveBeenLastCalledWith({ kanjiId: 42, componentId: 100 });

      expect(handleOccurrenceCreate({ character: '新', shortMeaning: 'new' })).toBe(true);
      expect(mockOccurrenceCreate).toHaveBeenLastCalledWith({ kanjiId: 999, componentId: 100 });

      expect(mockOccurrenceGetByComponentIdWithKanji).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleOccurrenceUpdate', () => {
    it('updates occurrence and reloads list', () => {
      const { handleOccurrenceUpdate } = useComponentDetailOccurrenceHandlers({
        componentId,
        occurrences,
        kanjiOptions,
        reloadGroupings: mockReloadGroupings,
      });

      const updated = handleOccurrenceUpdate(5, {
        positionTypeId: 2,
        componentFormId: null,
        isRadical: true,
        analysisNotes: 'test',
      });

      expect(updated).toBe(true);
      expect(mockOccurrenceGetByComponentIdWithKanji).toHaveBeenCalledWith(100);

      expect(mockOccurrenceUpdate).toHaveBeenCalledWith(5, {
        positionTypeId: 2,
        componentFormId: null,
        isRadical: true,
        analysisNotes: 'test',
      });
      expect(mockSuccess).toHaveBeenCalledWith('Occurrence updated');
    });
  });

  describe('handleOccurrenceUpdate failure', () => {
    it('returns false and shows the error toast', () => {
      mockOccurrenceUpdate.mockImplementation(() => {
        throw new Error('Update failed');
      });
      const { handleOccurrenceUpdate } = useComponentDetailOccurrenceHandlers({
        componentId,
        occurrences,
        kanjiOptions,
        reloadGroupings: mockReloadGroupings,
      });

      const updated = handleOccurrenceUpdate(5, {
        positionTypeId: null,
        componentFormId: null,
        isRadical: false,
        analysisNotes: null,
      });

      expect(updated).toBe(false);
      expect(mockError).toHaveBeenCalledWith('Update failed');
      expect(mockSuccess).not.toHaveBeenCalled();
    });
  });

  describe('handleOccurrenceRemove', () => {
    it('removes occurrence and reloads list', () => {
      const { handleOccurrenceRemove } = useComponentDetailOccurrenceHandlers({
        componentId,
        occurrences,
        kanjiOptions,
        reloadGroupings: mockReloadGroupings,
      });

      handleOccurrenceRemove(7);

      expect(mockOccurrenceRemove).toHaveBeenCalledWith(7);
      expect(mockOccurrenceGetByComponentIdWithKanji).toHaveBeenCalledWith(100);
      expect(mockSuccess).toHaveBeenCalledWith('Kanji unlinked');
    });

    it('reloads groupings because unlinking removes their memberships', () => {
      const { handleOccurrenceRemove } = useComponentDetailOccurrenceHandlers({
        componentId,
        occurrences,
        kanjiOptions,
        reloadGroupings: mockReloadGroupings,
      });

      handleOccurrenceRemove(7);

      expect(mockReloadGroupings).toHaveBeenCalledTimes(1);
    });

    it('shows error toast and skips reloads on failure', () => {
      mockOccurrenceRemove.mockImplementation(() => {
        throw new Error('Remove failed');
      });
      const { handleOccurrenceRemove } = useComponentDetailOccurrenceHandlers({
        componentId,
        occurrences,
        kanjiOptions,
        reloadGroupings: mockReloadGroupings,
      });

      handleOccurrenceRemove(7);

      expect(mockError).toHaveBeenCalledWith('Remove failed');
      expect(mockReloadGroupings).not.toHaveBeenCalled();
      expect(mockSuccess).not.toHaveBeenCalled();
    });
  });

  describe('handleOccurrenceReorder', () => {
    it('reorders occurrences and reloads list', () => {
      const { handleOccurrenceReorder } = useComponentDetailOccurrenceHandlers({
        componentId,
        occurrences,
        kanjiOptions,
        reloadGroupings: mockReloadGroupings,
      });

      handleOccurrenceReorder([3, 1, 2]);

      expect(mockOccurrenceReorder).toHaveBeenCalledWith([3, 1, 2]);
      expect(mockOccurrenceGetByComponentIdWithKanji).toHaveBeenCalledWith(100);
    });

    it('shows error toast on failure', () => {
      mockOccurrenceReorder.mockImplementation(() => {
        throw new Error('Reorder failed');
      });

      const { handleOccurrenceReorder } = useComponentDetailOccurrenceHandlers({
        componentId,
        occurrences,
        kanjiOptions,
        reloadGroupings: mockReloadGroupings,
      });

      handleOccurrenceReorder([1, 2, 3]);

      expect(mockError).toHaveBeenCalledWith('Reorder failed');
    });
  });
});
