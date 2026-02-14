/**
 * Reading Processing Utilities
 *
 * Helper functions for processing on-yomi and kun-yomi reading changes.
 */

import type { EditKunReading, EditOnReading } from '../kanji-detail-types'
import type { KunReading, OnReading } from '@/api/kanji'
import type { useKunReadingRepository } from '@/api/kanji/kun-reading-repository'
import type { useOnReadingRepository } from '@/api/kanji/on-reading-repository'

// Process on-reading deletes
function processOnDeletes(
  existing: OnReading[],
  edits: EditOnReading[],
  remove: (id: number) => void
): void {
  const editIds = new Set(edits.filter((r) => !r.isNew).map((r) => r.id))
  for (const r of existing) {
    if (!editIds.has(r.id)) remove(r.id)
  }
}

// Process kun-reading deletes
function processKunDeletes(
  existing: KunReading[],
  edits: EditKunReading[],
  remove: (id: number) => void
): void {
  const editIds = new Set(edits.filter((r) => !r.isNew).map((r) => r.id))
  for (const r of existing) {
    if (!editIds.has(r.id)) remove(r.id)
  }
}

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
 * Process on-reading changes (creates, updates, deletes, reorder)
 */
export function processOnReadings(
  edits: EditOnReading[],
  existing: OnReading[],
  kanjiId: number,
  repo: ReturnType<typeof useOnReadingRepository>
): void {
  processOnDeletes(existing, edits, (id) => {
    repo.remove(id)
  })

  edits.forEach((r, i) => {
    if (r.isNew) {
      repo.create({
        displayOrder: i,
        kanjiId,
        reading: r.reading,
        readingLevel: r.readingLevel
      })
    } else {
      const orig = existing.find((o) => o.id === r.id)
      if (
        orig &&
        (orig.reading !== r.reading || orig.readingLevel !== r.readingLevel)
      ) {
        repo.update(r.id, { reading: r.reading, readingLevel: r.readingLevel })
      }
    }
  })

  const order = needsReorder(edits, existing)
  if (order) repo.reorder(order)
}

/**
 * Process kun-reading changes (creates, updates, deletes, reorder)
 */
export function processKunReadings(
  edits: EditKunReading[],
  existing: KunReading[],
  kanjiId: number,
  repo: ReturnType<typeof useKunReadingRepository>
): void {
  processKunDeletes(existing, edits, (id) => {
    repo.remove(id)
  })

  edits.forEach((r, i) => {
    if (r.isNew) {
      repo.create({
        displayOrder: i,
        kanjiId,
        okurigana: r.okurigana || null,
        reading: r.reading,
        readingLevel: r.readingLevel
      })
    } else {
      const orig = existing.find((o) => o.id === r.id)
      if (orig) {
        const changed =
          orig.reading !== r.reading ||
          orig.readingLevel !== r.readingLevel ||
          (orig.okurigana ?? '') !== r.okurigana
        if (changed) {
          repo.update(r.id, {
            okurigana: r.okurigana || null,
            reading: r.reading,
            readingLevel: r.readingLevel
          })
        }
      }
    }
  })

  const order = needsReorder(edits, existing)
  if (order) repo.reorder(order)
}
