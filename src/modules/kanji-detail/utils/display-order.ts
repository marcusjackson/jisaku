/**
 * Display Order Utilities
 *
 * Shared by the reading and meaning processors, which save a dialog's rows
 * and then number every row from the dialog's order.
 */

/**
 * Renumber a list from the dialog's order when that order differs from what
 * is saved. `orderedIds` holds every kept and newly created row, in dialog
 * order, so new rows get a position among the existing ones rather than
 * tying with them.
 */
export function reorderIfNeeded(
  orderedIds: number[],
  existing: { id: number }[],
  reorder: (ids: number[]) => void
): void {
  const kept = new Set(orderedIds);
  const saved = existing.filter((e) => kept.has(e.id)).map((e) => e.id);
  if (orderedIds.join() !== saved.join()) reorder(orderedIds);
}
