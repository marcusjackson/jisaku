/**
 * Reading Processing Utilities
 *
 * Helper functions for processing on-yomi and kun-yomi reading changes.
 */

import { reorderIfNeeded } from './display-order';

import type { EditKunReading, EditOnReading, ReadingsSaveData } from '../kanji-detail-types';
import type { KunReading, OnReading } from '@/api/kanji';
import type { useKunReadingRepository } from '@/api/kanji/kun-reading-repository';
import type { useOnReadingRepository } from '@/api/kanji/on-reading-repository';

/**
 * Drop new rows whose reading is blank, so a forgotten empty row is never saved,
 * and trim the reading and okurigana text of every row.
 * Run it on the whole save payload before any index-based processing.
 */
export function normalizeReadings(data: ReadingsSaveData): ReadingsSaveData {
  return {
    onReadings: data.onReadings
      .filter((r) => !r.isNew || r.reading.trim())
      .map((r) => ({ ...r, reading: r.reading.trim() })),
    kunReadings: data.kunReadings
      .filter((r) => !r.isNew || r.reading.trim())
      .map((r) => ({ ...r, okurigana: r.okurigana.trim(), reading: r.reading.trim() })),
  };
}

// Process on-reading deletes
function processOnDeletes(
  existing: OnReading[],
  edits: EditOnReading[],
  remove: (id: number) => void
): void {
  const editIds = new Set(edits.filter((r) => !r.isNew).map((r) => r.id));
  for (const r of existing) {
    if (!editIds.has(r.id)) remove(r.id);
  }
}

// Process kun-reading deletes
function processKunDeletes(
  existing: KunReading[],
  edits: EditKunReading[],
  remove: (id: number) => void
): void {
  const editIds = new Set(edits.filter((r) => !r.isNew).map((r) => r.id));
  for (const r of existing) {
    if (!editIds.has(r.id)) remove(r.id);
  }
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
    repo.remove(id);
  });

  const orderedIds: number[] = [];
  edits.forEach((r, i) => {
    if (r.isNew) {
      const created = repo.create({
        displayOrder: i,
        kanjiId,
        reading: r.reading,
        readingLevel: r.readingLevel,
      });
      orderedIds.push(created.id);
    } else {
      orderedIds.push(r.id);
      const orig = existing.find((o) => o.id === r.id);
      if (orig && (orig.reading !== r.reading || orig.readingLevel !== r.readingLevel)) {
        repo.update(r.id, { reading: r.reading, readingLevel: r.readingLevel });
      }
    }
  });

  reorderIfNeeded(orderedIds, existing, (ids) => {
    repo.reorder(ids);
  });
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
    repo.remove(id);
  });

  const orderedIds: number[] = [];
  edits.forEach((r, i) => {
    if (r.isNew) {
      const created = repo.create({
        displayOrder: i,
        kanjiId,
        okurigana: r.okurigana || null,
        reading: r.reading,
        readingLevel: r.readingLevel,
      });
      orderedIds.push(created.id);
    } else {
      orderedIds.push(r.id);
      const orig = existing.find((o) => o.id === r.id);
      if (orig) {
        const changed =
          orig.reading !== r.reading ||
          orig.readingLevel !== r.readingLevel ||
          (orig.okurigana ?? '') !== r.okurigana;
        if (changed) {
          repo.update(r.id, {
            okurigana: r.okurigana || null,
            reading: r.reading,
            readingLevel: r.readingLevel,
          });
        }
      }
    }
  });

  reorderIfNeeded(orderedIds, existing, (ids) => {
    repo.reorder(ids);
  });
}
