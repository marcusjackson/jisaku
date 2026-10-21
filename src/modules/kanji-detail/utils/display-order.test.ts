/**
 * Tests for display-order utilities.
 */

import { describe, expect, it, vi } from 'vitest';

import { reorderIfNeeded } from './display-order';

describe('reorderIfNeeded', () => {
  const existing = [{ id: 1 }, { id: 2 }];

  it('does nothing when the saved order is unchanged', () => {
    const reorder = vi.fn();

    reorderIfNeeded([1, 2], existing, reorder);

    expect(reorder).not.toHaveBeenCalled();
  });

  it('renumbers when rows were moved', () => {
    const reorder = vi.fn();

    reorderIfNeeded([2, 1], existing, reorder);

    expect(reorder).toHaveBeenCalledWith([2, 1]);
  });

  it('renumbers when a new row is placed above existing rows', () => {
    const reorder = vi.fn();

    reorderIfNeeded([9, 1, 2], existing, reorder);

    expect(reorder).toHaveBeenCalledWith([9, 1, 2]);
  });

  it('ignores deleted rows', () => {
    const reorder = vi.fn();

    reorderIfNeeded([2], existing, reorder);

    expect(reorder).not.toHaveBeenCalled();
  });
});
