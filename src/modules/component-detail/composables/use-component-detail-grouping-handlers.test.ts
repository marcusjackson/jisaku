/**
 * Wiring tests for use-component-detail-grouping-handlers: the facade hands the
 * repository, toast and reloaders to the leaf handlers, which have their own tests
 * (grouping-crud-handlers, grouping-member-handlers).
 */

import { ref } from 'vue';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useComponentDetailGroupingHandlers } from './use-component-detail-grouping-handlers';

import type { ComponentGroupingMember, ComponentGroupingWithMembers } from '@/api/component';

// Mock dependencies
const mockGroupingCreate = vi.fn();
const mockGroupingUpdate = vi.fn();
const mockGroupingRemove = vi.fn();
const mockGroupingReorder = vi.fn();
const mockGroupingGetByParentId = vi.fn();
const mockGetMembers = vi.fn();
const mockAddMember = vi.fn();
const mockRemoveMember = vi.fn();
const mockReorderMembers = vi.fn();
const mockGetMembersByComponentId = vi.fn();

vi.mock('@/api/component', () => ({
  useComponentGroupingRepository: () => ({
    create: mockGroupingCreate,
    update: mockGroupingUpdate,
    remove: mockGroupingRemove,
    reorder: mockGroupingReorder,
    getByParentId: mockGroupingGetByParentId,
    getMembers: mockGetMembers,
    addMember: mockAddMember,
    removeMember: mockRemoveMember,
    reorderMembers: mockReorderMembers,
    getMembersByComponentId: mockGetMembersByComponentId,
  }),
}));

const mockSuccess = vi.fn();
const mockError = vi.fn();

vi.mock('@/shared/composables', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError,
  }),
}));

describe('useComponentDetailGroupingHandlers', () => {
  const componentId = ref<number | null>(100);
  const groupings = ref<ComponentGroupingWithMembers[]>([]);
  const managingGroupingId = ref<number | null>(null);
  const allGroupingMembers = ref(new Map<number, ComponentGroupingMember[]>());
  const managingGroupingMembers = ref<ComponentGroupingMember[]>([]);

  function setup() {
    return useComponentDetailGroupingHandlers({
      componentId,
      groupings,
      allGroupingMembers,
      managingGroupingId,
      managingGroupingMembers,
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    componentId.value = 100;
    groupings.value = [];
    managingGroupingId.value = null;
    allGroupingMembers.value = new Map();
    managingGroupingMembers.value = [];
    mockGroupingGetByParentId.mockReturnValue([]);
    mockGetMembersByComponentId.mockReturnValue(new Map());
    mockGetMembers.mockReturnValue([]);
  });

  it('creates a grouping and reloads groupings and the members map', () => {
    const added = setup().handleGroupingAdd({ name: 'Left side', description: null });

    expect(added).toBe(true);
    expect(mockGroupingCreate).toHaveBeenCalledWith({
      componentId: 100,
      name: 'Left side',
      description: null,
    });
    expect(mockGroupingGetByParentId).toHaveBeenCalledWith(100);
    expect(mockGetMembersByComponentId).toHaveBeenCalledWith(100);
    expect(mockSuccess).toHaveBeenCalledWith('Grouping added');
  });

  it('adds a member, then reloads the managed members and the groupings', () => {
    mockAddMember.mockReturnValue(true);

    setup().handleMemberAdd(5, 10);

    expect(mockAddMember).toHaveBeenCalledWith(5, 10);
    expect(mockGetMembers).toHaveBeenCalledWith(5);
    expect(mockGroupingGetByParentId).toHaveBeenCalledWith(100);
    expect(mockSuccess).toHaveBeenCalledWith('Member added');
  });

  it('reloads the groupings after a member reorder', () => {
    setup().handleMemberReorder(5, [3, 1, 2]);

    expect(mockReorderMembers).toHaveBeenCalledWith(5, [3, 1, 2]);
    expect(mockGroupingGetByParentId).toHaveBeenCalledWith(100);
  });

  it('exposes a reloader that skips when there is no component', () => {
    componentId.value = null;

    setup().reloadGroupings();

    expect(mockGroupingGetByParentId).not.toHaveBeenCalled();
  });
});
