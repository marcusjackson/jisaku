/**
 * Tests for use-component-detail-form-handlers composable.
 */

import { ref } from 'vue';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useComponentDetailFormHandlers } from './use-component-detail-form-handlers';

import type { ComponentForm } from '@/api/component';

// Mock dependencies
const mockFormCreate = vi.fn();
const mockFormUpdate = vi.fn();
const mockFormRemove = vi.fn();
const mockFormReorder = vi.fn();
const mockFormGetByParentId = vi.fn();

vi.mock('@/api/component', () => ({
  useComponentFormRepository: () => ({
    create: mockFormCreate,
    update: mockFormUpdate,
    remove: mockFormRemove,
    reorder: mockFormReorder,
    getByParentId: mockFormGetByParentId,
  }),
}));

const mockReloadOccurrences = vi.fn();
const mockSuccess = vi.fn();
const mockError = vi.fn();

vi.mock('@/shared/composables', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError,
  }),
}));

describe('useComponentDetailFormHandlers', () => {
  const componentId = ref<number | null>(100);
  const forms = ref<ComponentForm[]>([]);

  beforeEach(() => {
    vi.clearAllMocks();
    componentId.value = 100;
    forms.value = [];
    mockFormGetByParentId.mockReturnValue([]);
  });

  describe('handleFormAdd', () => {
    it('creates form and reloads list', () => {
      const { handleFormAdd } = useComponentDetailFormHandlers({
        componentId,
        forms,
        reloadOccurrences: mockReloadOccurrences,
      });

      const added = handleFormAdd({
        formCharacter: '氵',
        formName: 'water radical',
        strokeCount: 3,
        usageNotes: null,
      });

      expect(added).toBe(true);
      expect(mockFormCreate).toHaveBeenCalledWith({
        componentId: 100,
        formCharacter: '氵',
        formName: 'water radical',
        strokeCount: 3,
        usageNotes: null,
      });
      expect(mockFormGetByParentId).toHaveBeenCalledWith(100);
      expect(mockSuccess).toHaveBeenCalledWith('Form added');
    });

    it('shows error toast on failure', () => {
      mockFormCreate.mockImplementation(() => {
        throw new Error('Create failed');
      });

      const { handleFormAdd } = useComponentDetailFormHandlers({
        componentId,
        forms,
        reloadOccurrences: mockReloadOccurrences,
      });

      const added = handleFormAdd({
        formCharacter: '氵',
        formName: null,
        strokeCount: null,
        usageNotes: null,
      });

      expect(added).toBe(false);
      expect(mockError).toHaveBeenCalledWith('Create failed');
    });

    it('refuses a form character the component already has', () => {
      forms.value = [{ id: 1, componentId: 100, formCharacter: '氵' } as ComponentForm];
      const { handleFormAdd } = useComponentDetailFormHandlers({
        componentId,
        forms,
        reloadOccurrences: mockReloadOccurrences,
      });

      const added = handleFormAdd({
        formCharacter: '氵',
        formName: null,
        strokeCount: null,
        usageNotes: null,
      });

      expect(added).toBe(false);
      expect(mockError).toHaveBeenCalledWith('This form already exists on this component');
      expect(mockFormCreate).not.toHaveBeenCalled();
    });

    it('does nothing if component ID is null', () => {
      componentId.value = null;

      const { handleFormAdd } = useComponentDetailFormHandlers({
        componentId,
        forms,
        reloadOccurrences: mockReloadOccurrences,
      });

      const added = handleFormAdd({
        formCharacter: '氵',
        formName: null,
        strokeCount: null,
        usageNotes: null,
      });

      expect(added).toBe(false);
      expect(mockFormCreate).not.toHaveBeenCalled();
    });
  });

  describe('handleFormUpdate', () => {
    it('updates form and reloads list', () => {
      const { handleFormUpdate } = useComponentDetailFormHandlers({
        componentId,
        forms,
        reloadOccurrences: mockReloadOccurrences,
      });

      const updated = handleFormUpdate(5, {
        formCharacter: '氵',
        formName: 'updated name',
        strokeCount: 4,
        usageNotes: 'notes',
      });

      expect(updated).toBe(true);
      expect(mockFormGetByParentId).toHaveBeenCalledWith(100);

      expect(mockFormUpdate).toHaveBeenCalledWith(5, {
        formName: 'updated name',
        strokeCount: 4,
        usageNotes: 'notes',
      });
      expect(mockSuccess).toHaveBeenCalledWith('Form updated');
    });
  });

  describe('handleFormUpdate failure', () => {
    it('returns false and shows the error toast', () => {
      mockFormUpdate.mockImplementation(() => {
        throw new Error('Update failed');
      });
      const { handleFormUpdate } = useComponentDetailFormHandlers({
        componentId,
        forms,
        reloadOccurrences: mockReloadOccurrences,
      });

      const updated = handleFormUpdate(5, {
        formCharacter: '氵',
        formName: null,
        strokeCount: null,
        usageNotes: null,
      });

      expect(updated).toBe(false);
      expect(mockError).toHaveBeenCalledWith('Update failed');
      expect(mockSuccess).not.toHaveBeenCalled();
    });
  });

  describe('handleFormRemove', () => {
    it('removes form and reloads list', () => {
      const { handleFormRemove } = useComponentDetailFormHandlers({
        componentId,
        forms,
        reloadOccurrences: mockReloadOccurrences,
      });

      handleFormRemove(7);

      expect(mockFormRemove).toHaveBeenCalledWith(7);
      expect(mockFormGetByParentId).toHaveBeenCalledWith(100);
      expect(mockSuccess).toHaveBeenCalledWith('Form deleted');
    });

    it('reloads occurrences because deleting a form clears it from them', () => {
      const { handleFormRemove } = useComponentDetailFormHandlers({
        componentId,
        forms,
        reloadOccurrences: mockReloadOccurrences,
      });

      handleFormRemove(7);

      expect(mockReloadOccurrences).toHaveBeenCalledTimes(1);
    });

    it('shows error toast and skips reloads on failure', () => {
      mockFormRemove.mockImplementation(() => {
        throw new Error('Delete failed');
      });
      const { handleFormRemove } = useComponentDetailFormHandlers({
        componentId,
        forms,
        reloadOccurrences: mockReloadOccurrences,
      });

      handleFormRemove(7);

      expect(mockError).toHaveBeenCalledWith('Delete failed');
      expect(mockReloadOccurrences).not.toHaveBeenCalled();
      expect(mockSuccess).not.toHaveBeenCalled();
    });
  });

  describe('handleFormReorder', () => {
    it('reorders forms and reloads list', () => {
      const { handleFormReorder } = useComponentDetailFormHandlers({
        componentId,
        forms,
        reloadOccurrences: mockReloadOccurrences,
      });

      handleFormReorder([3, 1, 2]);

      expect(mockFormReorder).toHaveBeenCalledWith([3, 1, 2]);
      expect(mockFormGetByParentId).toHaveBeenCalledWith(100);
    });

    it('shows error toast and skips the reload on failure', () => {
      mockFormReorder.mockImplementation(() => {
        throw new Error('Reorder failed');
      });
      const { handleFormReorder } = useComponentDetailFormHandlers({
        componentId,
        forms,
        reloadOccurrences: mockReloadOccurrences,
      });

      handleFormReorder([3, 1, 2]);

      expect(mockError).toHaveBeenCalledWith('Reorder failed');
      expect(mockFormGetByParentId).not.toHaveBeenCalled();
    });
  });
});
