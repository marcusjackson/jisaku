/**
 * type-name-helpers
 *
 * Shared by the position and classification type handlers: normalising an
 * optional text field and checking a required name against the existing ones.
 */

/**
 * Turns an emptied optional field into `null` so label fallbacks (`??`) work.
 *
 * @param value - The raw form value
 * @returns The trimmed text, or `null` when nothing is left
 */
export function optionalText(value: string | undefined | null): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
}

/**
 * Checks a required type name: present, and not already used by another type
 * (compared after trimming).
 *
 * @param name - The name being saved
 * @param existing - Existing items with their id and name
 * @param noun - What the item is called in messages, e.g. "position type"
 * @param ownId - The id being edited, excluded from the duplicate check
 * @returns The message to show, or `null` when the name is fine
 */
export function typeNameError(
  name: string,
  existing: { id: number; name: string }[],
  noun: string,
  ownId?: number
): string | null {
  const wanted = name.trim();
  if (!wanted) return `${noun.charAt(0).toUpperCase()}${noun.slice(1)} name is required`;
  if (existing.some((e) => e.id !== ownId && e.name.trim() === wanted)) {
    return `A ${noun} named "${wanted}" already exists`;
  }
  return null;
}
