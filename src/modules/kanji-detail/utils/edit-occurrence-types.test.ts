/**
 * Tests for edit-occurrence-types
 *
 * The file only exports an interface, so this keeps one compile-time shape check.
 */

import { describe, expect, it } from 'vitest';

import type { EditOccurrence } from './edit-occurrence-types';

describe('edit-occurrence-types', () => {
  it('EditOccurrence allows a null id for a new occurrence', () => {
    const newOccurrence: EditOccurrence = {
      id: null,
      componentId: 1,
      positionTypeId: null,
      componentFormId: null,
      isRadical: false,
      component: { id: 1, character: '日', shortMeaning: 'sun' },
      position: null,
      form: null,
    };

    expect(newOccurrence.id).toBeNull();
  });
});
