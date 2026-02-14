/**
 * Meaning Processing Utilities
 *
 * Helper functions for processing meaning, reading group, and group member changes.
 */

import type {
  EditGroupMember,
  EditMeaning,
  EditReadingGroup
} from '../kanji-detail-types'
import type {
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup
} from '@/api/kanji'
import type { useGroupMemberRepository } from '@/api/kanji/group-member-repository'
import type { useKanjiMeaningRepository } from '@/api/kanji/meaning-repository'
import type { useReadingGroupRepository } from '@/api/kanji/reading-group-repository'

// Check if reorder needed
function needsReorder(
  edits: { id: number; isNew?: boolean }[],
  original: { id: number }[]
): number[] | null {
  const newOrder = edits.filter((e) => !e.isNew).map((e) => e.id)
  const oldOrder = original.map((o) => o.id)
  return JSON.stringify(newOrder) !== JSON.stringify(oldOrder) ? newOrder : null
}

/**
 * Process meaning changes (creates, updates, deletes, reorder)
 */
export function processMeanings(
  edits: EditMeaning[],
  existing: KanjiMeaning[],
  kanjiId: number,
  repo: ReturnType<typeof useKanjiMeaningRepository>
): void {
  const editIds = new Set(edits.filter((m) => !m.isNew).map((m) => m.id))
  for (const m of existing) {
    if (!editIds.has(m.id)) repo.remove(m.id)
  }

  edits.forEach((m, i) => {
    if (m.isNew) {
      repo.create({
        additionalInfo: m.additionalInfo || null,
        displayOrder: i,
        kanjiId,
        meaningText: m.meaningText
      })
    } else {
      const orig = existing.find((o) => o.id === m.id)
      if (orig) {
        const changed =
          orig.meaningText !== m.meaningText ||
          (orig.additionalInfo ?? '') !== m.additionalInfo
        if (changed)
          repo.update(m.id, {
            additionalInfo: m.additionalInfo || null,
            meaningText: m.meaningText
          })
      }
    }
  })

  const order = needsReorder(edits, existing)
  if (order) repo.reorder(order)
}

/**
 * Process reading group changes (creates, updates, deletes, reorder)
 */
export function processReadingGroups(
  edits: EditReadingGroup[],
  existing: KanjiMeaningReadingGroup[],
  kanjiId: number,
  groupRepo: ReturnType<typeof useReadingGroupRepository>,
  memberRepo: ReturnType<typeof useGroupMemberRepository>
): void {
  const editIds = new Set(edits.filter((g) => !g.isNew).map((g) => g.id))
  for (const g of existing) {
    if (!editIds.has(g.id)) {
      memberRepo.removeAllByGroupId(g.id)
      groupRepo.remove(g.id)
    }
  }

  edits.forEach((g, i) => {
    if (g.isNew) {
      groupRepo.create({ displayOrder: i, kanjiId, readingText: g.readingText })
    } else {
      const orig = existing.find((o) => o.id === g.id)
      if (orig && orig.readingText !== g.readingText)
        groupRepo.update(g.id, { readingText: g.readingText })
    }
  })

  const order = needsReorder(edits, existing)
  if (order) groupRepo.reorder(order)
}

/**
 * Process group member changes (recreate all)
 */
export function processGroupMembers(
  edits: EditGroupMember[],
  editGroups: EditReadingGroup[],
  existingMembers: KanjiMeaningGroupMember[],
  freshGroups: KanjiMeaningReadingGroup[],
  memberRepo: ReturnType<typeof useGroupMemberRepository>
): void {
  for (const m of existingMembers) memberRepo.remove(m.id)

  for (const m of edits) {
    let groupId = m.readingGroupId
    if (groupId < 0) {
      const idx = editGroups.findIndex((g) => g.id === groupId)
      if (idx >= 0 && freshGroups[idx]) groupId = freshGroups[idx].id
    }
    if (groupId > 0) {
      memberRepo.create({
        displayOrder: m.displayOrder,
        meaningId: m.meaningId,
        readingGroupId: groupId
      })
    }
  }
}
