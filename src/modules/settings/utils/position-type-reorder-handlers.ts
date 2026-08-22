/**
 * position-type-reorder-handlers
 *
 * Reorder handler factory for the Position Types settings section.
 * Split from position-type-handlers.ts to keep each file manageable.
 */

import { loadPositionTypes } from './position-type-handlers'

import type { PositionTypeSectionState } from '../settings-types'

/**
 * Creates move-up/move-down reorder handlers for position types.
 *
 * @param s - The position type section state object
 * @returns Handlers for reordering items up or down
 */
export function makeReorderHandlers(s: PositionTypeSectionState): {
  handleMoveUp: (index: number) => void
  handleMoveDown: (index: number) => void
} {
  function handleMoveUp(index: number): void {
    if (index === 0) return
    const updated = [...s.positionTypes.value]
    const prev = updated[index - 1]
    const curr = updated[index]
    if (!prev || !curr) return
    updated[index - 1] = curr
    updated[index] = prev
    try {
      s.repo.reorder(updated.map((pt) => pt.id))
      loadPositionTypes(s)
      s.toast.success('Position types reordered')
    } catch (err) {
      s.toast.error(
        err instanceof Error ? err.message : 'Failed to reorder position types'
      )
    }
  }
  function handleMoveDown(index: number): void {
    if (index === s.positionTypes.value.length - 1) return
    const updated = [...s.positionTypes.value]
    const curr = updated[index]
    const next = updated[index + 1]
    if (!curr || !next) return
    updated[index] = next
    updated[index + 1] = curr
    try {
      s.repo.reorder(updated.map((pt) => pt.id))
      loadPositionTypes(s)
      s.toast.success('Position types reordered')
    } catch (err) {
      s.toast.error(
        err instanceof Error ? err.message : 'Failed to reorder position types'
      )
    }
  }
  return { handleMoveUp, handleMoveDown }
}
