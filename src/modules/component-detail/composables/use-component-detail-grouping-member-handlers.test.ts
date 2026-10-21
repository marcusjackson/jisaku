/**
 * Tests for use-component-detail-grouping-member-handlers composable.
 */

import { ref } from 'vue';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createGroupingMemberHandlers } from './use-component-detail-grouping-member-handlers';

import type { GroupingMemberHandlerDeps } from './use-component-detail-grouping-member-handlers';
import type { ComponentGroupingMember } from '@/api/component';

// ============================================================================
// Mock helpers
// ============================================================================

const mockGetMembers = vi.fn();
const mockAddMember = vi.fn();
const mockRemoveMember = vi.fn();
const mockReorderMembers = vi.fn();

const mockSuccess = vi.fn();
const mockError = vi.fn();

const mockReloadGroupings = vi.fn();
const mockReloadMembers = vi.fn();

function makeDeps(): GroupingMemberHandlerDeps {
  return {
    groupingRepo: {
      getMembers: mockGetMembers,
      addMember: mockAddMember,
      removeMember: mockRemoveMember,
      reorderMembers: mockReorderMembers,
    } as unknown as GroupingMemberHandlerDeps['groupingRepo'],
    toast: {
      success: mockSuccess,
      error: mockError,
    } as unknown as GroupingMemberHandlerDeps['toast'],
    reloadGroupings: mockReloadGroupings,
    reloadMembers: mockReloadMembers,
    managingGroupingId: ref<number | null>(null),
    managingGroupingMembers: ref<ComponentGroupingMember[]>([]),
  };
}

const sampleMember: ComponentGroupingMember = {
  id: 10,
  groupingId: 1,
  occurrenceId: 5,
  displayOrder: 1,
};

// ============================================================================
// Tests
// ============================================================================

describe('createGroupingMemberHandlers', () => {
  let deps: GroupingMemberHandlerDeps;

  beforeEach(() => {
    vi.clearAllMocks();
    deps = makeDeps();
  });

  // --------------------------------------------------------------------------
  // handleManageMembersOpen
  // --------------------------------------------------------------------------
  describe('handleManageMembersOpen', () => {
    it('sets managing grouping id and loads members', () => {
      mockGetMembers.mockReturnValue([sampleMember]);
      const { handleManageMembersOpen } = createGroupingMemberHandlers(deps);

      handleManageMembersOpen(1);

      expect(deps.managingGroupingId.value).toBe(1);
      expect(mockGetMembers).toHaveBeenCalledWith(1);
      expect(deps.managingGroupingMembers.value).toEqual([sampleMember]);
    });

    it('clears members when group has none', () => {
      mockGetMembers.mockReturnValue([]);
      const { handleManageMembersOpen } = createGroupingMemberHandlers(deps);

      handleManageMembersOpen(2);

      expect(deps.managingGroupingId.value).toBe(2);
      expect(deps.managingGroupingMembers.value).toEqual([]);
    });
  });

  // --------------------------------------------------------------------------
  // handleMemberAdd
  // --------------------------------------------------------------------------
  describe('handleMemberAdd', () => {
    it('adds member, reloads members and groupings, shows success toast', () => {
      mockAddMember.mockReturnValue(true);
      const { handleMemberAdd } = createGroupingMemberHandlers(deps);

      handleMemberAdd(1, 5);

      expect(mockAddMember).toHaveBeenCalledWith(1, 5);
      expect(mockReloadMembers).toHaveBeenCalledWith(1);
      expect(mockReloadGroupings).toHaveBeenCalled();
      expect(mockSuccess).toHaveBeenCalledWith('Member added');
    });

    it('shows no toast when the kanji is already a member', () => {
      mockAddMember.mockReturnValue(false);
      const { handleMemberAdd } = createGroupingMemberHandlers(deps);

      handleMemberAdd(1, 5);

      expect(mockSuccess).not.toHaveBeenCalled();
      expect(mockError).not.toHaveBeenCalled();
    });

    it('shows error toast when addMember throws', () => {
      mockAddMember.mockImplementation(() => {
        throw new Error('Insert failed');
      });
      const { handleMemberAdd } = createGroupingMemberHandlers(deps);

      handleMemberAdd(1, 5);

      expect(mockError).toHaveBeenCalledWith('Insert failed');
      expect(mockSuccess).not.toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------------------------
  // handleMemberRemove
  // --------------------------------------------------------------------------
  describe('handleMemberRemove', () => {
    it('removes member, reloads members and groupings, shows success toast', () => {
      const { handleMemberRemove } = createGroupingMemberHandlers(deps);

      handleMemberRemove(1, 5);

      expect(mockRemoveMember).toHaveBeenCalledWith(1, 5);
      expect(mockReloadMembers).toHaveBeenCalledWith(1);
      expect(mockReloadGroupings).toHaveBeenCalled();
      expect(mockSuccess).toHaveBeenCalledWith('Member removed');
    });

    it('shows error toast when removeMember throws', () => {
      mockRemoveMember.mockImplementation(() => {
        throw new Error('Not found');
      });
      const { handleMemberRemove } = createGroupingMemberHandlers(deps);

      handleMemberRemove(1, 5);

      expect(mockError).toHaveBeenCalledWith('Not found');
      expect(mockSuccess).not.toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------------------------
  // handleMemberReorder
  // --------------------------------------------------------------------------
  describe('handleMemberReorder', () => {
    it('reorders members and reloads', () => {
      const { handleMemberReorder } = createGroupingMemberHandlers(deps);

      handleMemberReorder(1, [5, 3, 7]);

      expect(mockReorderMembers).toHaveBeenCalledWith(1, [5, 3, 7]);
      expect(mockReloadMembers).toHaveBeenCalledWith(1);
    });

    it('reloads groupings because the card previews the first members', () => {
      const { handleMemberReorder } = createGroupingMemberHandlers(deps);

      handleMemberReorder(1, [5, 3, 7]);

      expect(mockReloadGroupings).toHaveBeenCalledTimes(1);
    });

    it('does not show success toast (silent reorder)', () => {
      const { handleMemberReorder } = createGroupingMemberHandlers(deps);

      handleMemberReorder(1, [5, 3]);

      expect(mockSuccess).not.toHaveBeenCalled();
    });

    it('shows error toast when reorderMembers throws', () => {
      mockReorderMembers.mockImplementation(() => {
        throw new Error('Reorder failed');
      });
      const { handleMemberReorder } = createGroupingMemberHandlers(deps);

      handleMemberReorder(1, [5, 3]);

      expect(mockError).toHaveBeenCalledWith('Reorder failed');
      expect(mockReloadGroupings).not.toHaveBeenCalled();
    });
  });
});
