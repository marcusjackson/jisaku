/**
 * Vocabulary Detail Constants
 *
 * Constants for the vocabulary detail form fields.
 * Separate from kanji-detail constants because vocabulary
 * supports 'non-jlpt' as an additional JLPT level.
 *
 * @module modules/vocab-detail
 */

export const NONE = '__none__'

export const VOCAB_JLPT_OPTIONS = [
  { label: 'None', value: NONE },
  { label: 'N5', value: 'N5' },
  { label: 'N4', value: 'N4' },
  { label: 'N3', value: 'N3' },
  { label: 'N2', value: 'N2' },
  { label: 'N1', value: 'N1' },
  { label: 'Non-JLPT', value: 'non-jlpt' }
]
