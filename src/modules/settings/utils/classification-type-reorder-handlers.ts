/**
 * classification-type-reorder-handlers
 *
 * Reorder handler factory for the Classification Types settings section.
 * Split from classification-type-handlers.ts to keep each file manageable.
 */

import { loadClassificationTypes } from './classification-type-handlers'

import type { ClassificationTypeSectionState } from '../settings-types'

/**
 * Creates move-up/move-down reorder handlers for classification types.
 *
 * @param s - The classification type section state object
 * @returns Handlers for reordering items up or down
 */
export function makeReorderHandlers(s: ClassificationTypeSectionState): {
  handleMoveUp: (index: number) => void
  handleMoveDown: (index: number) => void
} {
  function handleMoveUp(index: number): void {
    if (index === 0) return
    const updated = [...s.classificationTypes.value]
    const prev = updated[index - 1]
    const curr = updated[index]
    if (!prev || !curr) return
    updated[index - 1] = curr
    updated[index] = prev
    try {
      s.repo.reorder(updated.map((ct) => ct.id))
      loadClassificationTypes(s)
      s.toast.success('Classification types reordered')
    } catch (err) {
      s.toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to reorder classification types'
      )
    }
  }
  function handleMoveDown(index: number): void {
    if (index === s.classificationTypes.value.length - 1) return
    const updated = [...s.classificationTypes.value]
    const curr = updated[index]
    const next = updated[index + 1]
    if (!curr || !next) return
    updated[index] = next
    updated[index + 1] = curr
    try {
      s.repo.reorder(updated.map((ct) => ct.id))
      loadClassificationTypes(s)
      s.toast.success('Classification types reordered')
    } catch (err) {
      s.toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to reorder classification types'
      )
    }
  }
  return { handleMoveUp, handleMoveDown }
}
