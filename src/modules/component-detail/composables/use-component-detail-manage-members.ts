/**
 * Composable for managing grouping member logic
 *
 * Extracts computed properties and reorder logic from the
 * ComponentDetailDialogManageMembers dialog component.
 */

import { computed } from 'vue';

import type { ComponentGroupingMember, OccurrenceWithKanji } from '@/api/component';
import type { ComputedRef } from 'vue';

interface MemberEntry {
  member: ComponentGroupingMember;
  occurrence: OccurrenceWithKanji;
}

interface UseComponentDetailManageMembersOptions {
  members: () => ComponentGroupingMember[];
  occurrences: () => OccurrenceWithKanji[];
  groupingName: () => string;
}

interface UseComponentDetailManageMembersReturn {
  /** Members joined with occurrence data, sorted by displayOrder */
  memberOccurrences: ComputedRef<MemberEntry[]>;
  /** Occurrences not yet in the grouping */
  availableOccurrences: ComputedRef<OccurrenceWithKanji[]>;
  /** Dialog title with grouping name */
  dialogTitle: ComputedRef<string>;
  /** Calculate reordered IDs after moving an item one place up or down. Returns null if the move is invalid. */
  getReorderedIds: (index: number, direction: 'up' | 'down') => number[] | null;
}

/**
 * Manages grouping member logic for the Manage Members dialog.
 *
 * @param options - Members, occurrences, and grouping name getters
 * @returns Computed members with occurrences, available occurrences, dialog title, and reorder helper
 */
export function useComponentDetailManageMembers(
  options: UseComponentDetailManageMembersOptions
): UseComponentDetailManageMembersReturn {
  const memberOccurrences = computed(() => {
    const sorted = [...options.members()].sort((a, b) => a.displayOrder - b.displayOrder);

    return sorted
      .map((m) => {
        const occ = options.occurrences().find((o) => o.id === m.occurrenceId);
        return occ ? { member: m, occurrence: occ } : null;
      })
      .filter((entry): entry is MemberEntry => entry !== null);
  });

  const availableOccurrences = computed(() => {
    const memberOccIds = new Set(options.members().map((m) => m.occurrenceId));
    return options.occurrences().filter((o) => !memberOccIds.has(o.id));
  });

  const dialogTitle = computed(() => `Manage Members — ${options.groupingName()}`);

  function getReorderedIds(index: number, direction: 'up' | 'down'): number[] | null {
    const entries = memberOccurrences.value;
    if (direction === 'up' && index === 0) return null;
    if (direction === 'down' && index >= entries.length - 1) return null;

    const ids = entries.map((e) => e.member.occurrenceId);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const current = ids[index];
    const swap = ids[swapIndex];
    if (current === undefined || swap === undefined) return null;

    ids[index] = swap;
    ids[swapIndex] = current;
    return ids;
  }

  return {
    memberOccurrences,
    availableOccurrences,
    dialogTitle,
    getReorderedIds,
  };
}
