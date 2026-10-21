/**
 * Kanji Detail Types Tests
 *
 * The module's types are checked by `make type-check`; this keeps one compile-time
 * shape check so the file is covered by the untested-files scan.
 */

import { describe, expect, it } from 'vitest';

import type { ClassificationChange, ClassificationItem } from './kanji-detail-types';

describe('kanji-detail-types', () => {
  it('uses the saved classification shape for form rows', () => {
    const row: ClassificationItem = { id: undefined, classificationTypeId: 3, displayOrder: 0 };
    const change: ClassificationChange = row;

    expect(change.classificationTypeId).toBe(3);
  });
});
