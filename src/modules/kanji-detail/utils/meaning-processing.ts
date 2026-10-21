/**
 * Meaning Processing Utilities
 *
 * Helper functions for processing meaning, reading group, and group member changes.
 */

import { reorderIfNeeded } from './display-order';

import type {
  EditGroupMember,
  EditMeaning,
  EditReadingGroup,
  MeaningsSaveData,
} from '../kanji-detail-types';
import type { KanjiMeaning, KanjiMeaningGroupMember, KanjiMeaningReadingGroup } from '@/api/kanji';
import type { useGroupMemberRepository } from '@/api/kanji/group-member-repository';
import type { useKanjiMeaningRepository } from '@/api/kanji/meaning-repository';
import type { useReadingGroupRepository } from '@/api/kanji/reading-group-repository';

/**
 * Drop new rows whose text is blank, so a forgotten empty row is never saved.
 * Run it on the whole save payload before any index-based processing.
 */
export function dropBlankNewRows(data: MeaningsSaveData): MeaningsSaveData {
  return {
    ...data,
    meanings: data.meanings.filter((m) => !m.isNew || m.meaningText.trim()),
    readingGroups: data.readingGroups.filter((g) => !g.isNew || g.readingText.trim()),
  };
}

/**
 * Process meaning changes (creates, updates, deletes, reorder)
 *
 * @returns Created meaning ids keyed by the temporary id the edit dialog gave them
 */
export function processMeanings(
  edits: EditMeaning[],
  existing: KanjiMeaning[],
  kanjiId: number,
  repo: ReturnType<typeof useKanjiMeaningRepository>
): Map<number, number> {
  const createdIds = new Map<number, number>();
  const editIds = new Set(edits.filter((m) => !m.isNew).map((m) => m.id));
  for (const m of existing) {
    if (!editIds.has(m.id)) repo.remove(m.id);
  }

  const orderedIds: number[] = [];
  edits.forEach((m, i) => {
    if (m.isNew) {
      const created = repo.create({
        additionalInfo: m.additionalInfo || null,
        displayOrder: i,
        kanjiId,
        meaningText: m.meaningText,
      });
      createdIds.set(m.id, created.id);
      orderedIds.push(created.id);
    } else {
      orderedIds.push(m.id);
      const orig = existing.find((o) => o.id === m.id);
      if (orig) {
        const changed =
          orig.meaningText !== m.meaningText || (orig.additionalInfo ?? '') !== m.additionalInfo;
        if (changed)
          repo.update(m.id, {
            additionalInfo: m.additionalInfo || null,
            meaningText: m.meaningText,
          });
      }
    }
  });

  reorderIfNeeded(orderedIds, existing, (ids) => {
    repo.reorder(ids);
  });
  return createdIds;
}

/**
 * Process reading group changes (creates, updates, deletes, reorder)
 *
 * @returns Created group ids keyed by the temporary id the edit dialog gave them
 */
export function processReadingGroups(
  edits: EditReadingGroup[],
  existing: KanjiMeaningReadingGroup[],
  kanjiId: number,
  groupRepo: ReturnType<typeof useReadingGroupRepository>,
  memberRepo: ReturnType<typeof useGroupMemberRepository>
): Map<number, number> {
  const createdIds = new Map<number, number>();
  const editIds = new Set(edits.filter((g) => !g.isNew).map((g) => g.id));
  for (const g of existing) {
    if (!editIds.has(g.id)) {
      memberRepo.removeAllByGroupId(g.id);
      groupRepo.remove(g.id);
    }
  }

  const orderedIds: number[] = [];
  edits.forEach((g, i) => {
    if (g.isNew) {
      const created = groupRepo.create({
        displayOrder: i,
        kanjiId,
        readingText: g.readingText,
      });
      createdIds.set(g.id, created.id);
      orderedIds.push(created.id);
    } else {
      orderedIds.push(g.id);
      const orig = existing.find((o) => o.id === g.id);
      if (orig && orig.readingText !== g.readingText)
        groupRepo.update(g.id, { readingText: g.readingText });
    }
  });

  reorderIfNeeded(orderedIds, existing, (ids) => {
    groupRepo.reorder(ids);
  });
  return createdIds;
}

/**
 * Process group member changes (recreate all)
 */
export function processGroupMembers(
  edits: EditGroupMember[],
  existingMembers: KanjiMeaningGroupMember[],
  createdMeaningIds: Map<number, number>,
  createdGroupIds: Map<number, number>,
  memberRepo: ReturnType<typeof useGroupMemberRepository>
): void {
  for (const m of existingMembers) memberRepo.remove(m.id);

  for (const m of edits) {
    const groupId = createdGroupIds.get(m.readingGroupId) ?? m.readingGroupId;
    const meaningId = createdMeaningIds.get(m.meaningId) ?? m.meaningId;
    if (groupId > 0 && meaningId > 0) {
      memberRepo.create({
        displayOrder: m.displayOrder,
        meaningId,
        readingGroupId: groupId,
      });
    }
  }
}
