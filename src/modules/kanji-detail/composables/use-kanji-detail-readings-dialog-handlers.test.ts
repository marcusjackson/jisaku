/**
 * Tests for useKanjiDetailReadingsDialogHandlers
 */

import { ref } from 'vue'

import { describe, expect, it } from 'vitest'

import { useKanjiDetailReadingsDialogHandlers } from './use-kanji-detail-readings-dialog-handlers'

import type { EditKunReading, EditOnReading } from '../kanji-detail-types'

describe('useKanjiDetailReadingsDialogHandlers', () => {
  describe('on-yomi handlers', () => {
    it('adds a new on-yomi reading', () => {
      const editOnReadings = ref<EditOnReading[]>([])
      const editKunReadings = ref<EditKunReading[]>([])
      const nextTempId = ref(-1)

      const { addOnReading } = useKanjiDetailReadingsDialogHandlers(
        editOnReadings,
        editKunReadings,
        nextTempId
      )

      addOnReading()

      expect(editOnReadings.value).toHaveLength(1)
      expect(editOnReadings.value[0]).toEqual({
        id: -1,
        isNew: true,
        reading: '',
        readingLevel: '小'
      })
      expect(nextTempId.value).toBe(-2)
    })

    it('updates on-yomi reading text', () => {
      const editOnReadings = ref<EditOnReading[]>([
        { id: 1, reading: 'old', readingLevel: '小' }
      ])
      const editKunReadings = ref<EditKunReading[]>([])
      const nextTempId = ref(-1)

      const { updateOnReadingField } = useKanjiDetailReadingsDialogHandlers(
        editOnReadings,
        editKunReadings,
        nextTempId
      )

      updateOnReadingField(0, 'new')

      expect(editOnReadings.value[0]?.reading).toBe('new')
    })

    it('updates on-yomi reading level', () => {
      const editOnReadings = ref<EditOnReading[]>([
        { id: 1, reading: 'test', readingLevel: '小' }
      ])
      const editKunReadings = ref<EditKunReading[]>([])
      const nextTempId = ref(-1)

      const { updateOnReadingLevel } = useKanjiDetailReadingsDialogHandlers(
        editOnReadings,
        editKunReadings,
        nextTempId
      )

      updateOnReadingLevel(0, '中')

      expect(editOnReadings.value[0]?.readingLevel).toBe('中')
    })

    it('moves on-yomi reading up', () => {
      const editOnReadings = ref<EditOnReading[]>([
        { id: 1, reading: 'first', readingLevel: '小' },
        { id: 2, reading: 'second', readingLevel: '小' }
      ])
      const editKunReadings = ref<EditKunReading[]>([])
      const nextTempId = ref(-1)

      const { moveOnReading } = useKanjiDetailReadingsDialogHandlers(
        editOnReadings,
        editKunReadings,
        nextTempId
      )

      moveOnReading(1, -1)

      expect(editOnReadings.value[0]?.reading).toBe('second')
      expect(editOnReadings.value[1]?.reading).toBe('first')
    })

    it('moves on-yomi reading down', () => {
      const editOnReadings = ref<EditOnReading[]>([
        { id: 1, reading: 'first', readingLevel: '小' },
        { id: 2, reading: 'second', readingLevel: '小' }
      ])
      const editKunReadings = ref<EditKunReading[]>([])
      const nextTempId = ref(-1)

      const { moveOnReading } = useKanjiDetailReadingsDialogHandlers(
        editOnReadings,
        editKunReadings,
        nextTempId
      )

      moveOnReading(0, 1)

      expect(editOnReadings.value[0]?.reading).toBe('second')
      expect(editOnReadings.value[1]?.reading).toBe('first')
    })

    it('does not move on-yomi reading beyond boundaries', () => {
      const editOnReadings = ref<EditOnReading[]>([
        { id: 1, reading: 'first', readingLevel: '小' },
        { id: 2, reading: 'second', readingLevel: '小' }
      ])
      const editKunReadings = ref<EditKunReading[]>([])
      const nextTempId = ref(-1)

      const { moveOnReading } = useKanjiDetailReadingsDialogHandlers(
        editOnReadings,
        editKunReadings,
        nextTempId
      )

      moveOnReading(0, -1)
      expect(editOnReadings.value[0]?.reading).toBe('first')

      moveOnReading(1, 1)
      expect(editOnReadings.value[1]?.reading).toBe('second')
    })

    it('removes on-yomi reading', () => {
      const editOnReadings = ref<EditOnReading[]>([
        { id: 1, reading: 'first', readingLevel: '小' },
        { id: 2, reading: 'second', readingLevel: '小' }
      ])
      const editKunReadings = ref<EditKunReading[]>([])
      const nextTempId = ref(-1)

      const { removeOnReading } = useKanjiDetailReadingsDialogHandlers(
        editOnReadings,
        editKunReadings,
        nextTempId
      )

      removeOnReading(0)

      expect(editOnReadings.value).toHaveLength(1)
      expect(editOnReadings.value[0]?.reading).toBe('second')
    })
  })

  describe('kun-yomi handlers', () => {
    it('adds a new kun-yomi reading', () => {
      const editOnReadings = ref<EditOnReading[]>([])
      const editKunReadings = ref<EditKunReading[]>([])
      const nextTempId = ref(-1)

      const { addKunReading } = useKanjiDetailReadingsDialogHandlers(
        editOnReadings,
        editKunReadings,
        nextTempId
      )

      addKunReading()

      expect(editKunReadings.value).toHaveLength(1)
      expect(editKunReadings.value[0]).toEqual({
        id: -1,
        isNew: true,
        okurigana: '',
        reading: '',
        readingLevel: '小'
      })
      expect(nextTempId.value).toBe(-2)
    })

    it('updates kun-yomi reading text', () => {
      const editOnReadings = ref<EditOnReading[]>([])
      const editKunReadings = ref<EditKunReading[]>([
        { id: 1, okurigana: '', reading: 'old', readingLevel: '小' }
      ])
      const nextTempId = ref(-1)

      const { updateKunReadingField } = useKanjiDetailReadingsDialogHandlers(
        editOnReadings,
        editKunReadings,
        nextTempId
      )

      updateKunReadingField(0, 'new')

      expect(editKunReadings.value[0]?.reading).toBe('new')
    })

    it('updates kun-yomi okurigana', () => {
      const editOnReadings = ref<EditOnReading[]>([])
      const editKunReadings = ref<EditKunReading[]>([
        { id: 1, okurigana: '', reading: 'test', readingLevel: '小' }
      ])
      const nextTempId = ref(-1)

      const { updateKunOkurigana } = useKanjiDetailReadingsDialogHandlers(
        editOnReadings,
        editKunReadings,
        nextTempId
      )

      updateKunOkurigana(0, 'る')

      expect(editKunReadings.value[0]?.okurigana).toBe('る')
    })

    it('updates kun-yomi reading level', () => {
      const editOnReadings = ref<EditOnReading[]>([])
      const editKunReadings = ref<EditKunReading[]>([
        { id: 1, okurigana: '', reading: 'test', readingLevel: '小' }
      ])
      const nextTempId = ref(-1)

      const { updateKunReadingLevel } = useKanjiDetailReadingsDialogHandlers(
        editOnReadings,
        editKunReadings,
        nextTempId
      )

      updateKunReadingLevel(0, '中')

      expect(editKunReadings.value[0]?.readingLevel).toBe('中')
    })

    it('moves kun-yomi reading up', () => {
      const editOnReadings = ref<EditOnReading[]>([])
      const editKunReadings = ref<EditKunReading[]>([
        { id: 1, okurigana: '', reading: 'first', readingLevel: '小' },
        { id: 2, okurigana: '', reading: 'second', readingLevel: '小' }
      ])
      const nextTempId = ref(-1)

      const { moveKunReading } = useKanjiDetailReadingsDialogHandlers(
        editOnReadings,
        editKunReadings,
        nextTempId
      )

      moveKunReading(1, -1)

      expect(editKunReadings.value[0]?.reading).toBe('second')
      expect(editKunReadings.value[1]?.reading).toBe('first')
    })

    it('moves kun-yomi reading down', () => {
      const editOnReadings = ref<EditOnReading[]>([])
      const editKunReadings = ref<EditKunReading[]>([
        { id: 1, okurigana: '', reading: 'first', readingLevel: '小' },
        { id: 2, okurigana: '', reading: 'second', readingLevel: '小' }
      ])
      const nextTempId = ref(-1)

      const { moveKunReading } = useKanjiDetailReadingsDialogHandlers(
        editOnReadings,
        editKunReadings,
        nextTempId
      )

      moveKunReading(0, 1)

      expect(editKunReadings.value[0]?.reading).toBe('second')
      expect(editKunReadings.value[1]?.reading).toBe('first')
    })

    it('does not move kun-yomi reading beyond boundaries', () => {
      const editOnReadings = ref<EditOnReading[]>([])
      const editKunReadings = ref<EditKunReading[]>([
        { id: 1, okurigana: '', reading: 'first', readingLevel: '小' },
        { id: 2, okurigana: '', reading: 'second', readingLevel: '小' }
      ])
      const nextTempId = ref(-1)

      const { moveKunReading } = useKanjiDetailReadingsDialogHandlers(
        editOnReadings,
        editKunReadings,
        nextTempId
      )

      moveKunReading(0, -1)
      expect(editKunReadings.value[0]?.reading).toBe('first')

      moveKunReading(1, 1)
      expect(editKunReadings.value[1]?.reading).toBe('second')
    })

    it('removes kun-yomi reading', () => {
      const editOnReadings = ref<EditOnReading[]>([])
      const editKunReadings = ref<EditKunReading[]>([
        { id: 1, okurigana: '', reading: 'first', readingLevel: '小' },
        { id: 2, okurigana: '', reading: 'second', readingLevel: '小' }
      ])
      const nextTempId = ref(-1)

      const { removeKunReading } = useKanjiDetailReadingsDialogHandlers(
        editOnReadings,
        editKunReadings,
        nextTempId
      )

      removeKunReading(0)

      expect(editKunReadings.value).toHaveLength(1)
      expect(editKunReadings.value[0]?.reading).toBe('second')
    })
  })
})
