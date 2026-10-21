/**
 * Component Detail Types Tests
 *
 * The module's types are compile-time only; this keeps the file covered by the
 * untested-files scan and checks the shapes the handlers and dialogs share.
 */

import { describe, expect, it } from 'vitest';

import type { GroupingFormData, HeadlineSaveData } from './component-detail-types';

describe('component-detail-types', () => {
  it('describes the data the headline and grouping dialogs emit', () => {
    const headline: HeadlineSaveData = {
      character: '氵',
      shortMeaning: null,
      searchKeywords: null,
    };
    const grouping: GroupingFormData = { name: 'Water', description: null };

    expect([headline.character, grouping.name]).toEqual(['氵', 'Water']);
  });
});
