/**
 * Tests for use-vocab-detail-kanji-create-handler
 */

import { ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createKanjiCreateHandler } from './use-vocab-detail-kanji-create-handler'

import type { Kanji, useKanjiRepository } from '@/api/kanji'
import type { useVocabKanjiRepository } from '@/api/vocabulary'
import type { useToast } from '@/shared/composables'
import type { QuickCreateKanjiData } from '@/shared/validation'

const newKanji: Kanji = {
  id: 55,
  character: '火',
  strokeCount: null,
  shortMeaning: 'fire',
  searchKeywords: null,
  radicalId: null,
  jlptLevel: null,
  joyoLevel: null,
  kanjiKenteiLevel: null,
  strokeDiagramImage: null,
  strokeGifImage: null,
  notesEtymology: null,
  notesSemantic: null,
  notesEducationMnemonics: null,
  notesPersonal: null,
  identifier: null,
  radicalStrokeCount: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

function makeDeps() {
  const kanjiCreate = vi.fn().mockReturnValue(newKanji)
  const kanjiGetAll = vi.fn().mockReturnValue([newKanji])
  const vocabKanjiCreate = vi.fn()
  const reloadBreakdown = vi.fn()
  const toastSuccess = vi.fn()
  const toastError = vi.fn()
  const toast = {
    success: toastSuccess,
    error: toastError
  } as unknown as ReturnType<typeof useToast>
  const allKanji = ref<Kanji[]>([])

  return {
    deps: {
      vocabId: ref(10),
      reloadBreakdown,
      allKanji,
      vocabKanjiRepo: {
        create: vocabKanjiCreate
      } as unknown as ReturnType<typeof useVocabKanjiRepository>,
      kanjiRepo: {
        create: kanjiCreate,
        getAll: kanjiGetAll
      } as unknown as ReturnType<typeof useKanjiRepository>,
      toast
    },
    mocks: {
      kanjiCreate,
      kanjiGetAll,
      vocabKanjiCreate,
      reloadBreakdown,
      allKanji,
      toastSuccess,
      toastError
    }
  }
}

const quickCreateData: QuickCreateKanjiData = {
  character: '火',
  shortMeaning: 'fire'
}

describe('createKanjiCreateHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates kanji, links to vocab, reloads, and updates allKanji on success', () => {
    const { deps, mocks } = makeDeps()
    const handler = createKanjiCreateHandler(deps)

    handler(quickCreateData)

    expect(mocks.kanjiCreate).toHaveBeenCalledWith({
      character: '火',
      shortMeaning: 'fire'
    })
    expect(mocks.vocabKanjiCreate).toHaveBeenCalledWith({
      vocabId: 10,
      kanjiId: 55
    })
    expect(mocks.reloadBreakdown).toHaveBeenCalledTimes(1)
    expect(mocks.allKanji.value).toEqual([newKanji])
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Kanji created and linked')
  })

  it('handles null shortMeaning by passing null to kanjiRepo.create', () => {
    const { deps, mocks } = makeDeps()
    const handler = createKanjiCreateHandler(deps)

    handler({ character: '水', shortMeaning: undefined })

    expect(mocks.kanjiCreate).toHaveBeenCalledWith({
      character: '水',
      shortMeaning: null
    })
  })

  it('shows error toast and does not reload on failure', () => {
    const { deps, mocks } = makeDeps()
    mocks.kanjiCreate.mockImplementation(() => {
      throw new Error('Create failed')
    })
    const handler = createKanjiCreateHandler(deps)

    handler(quickCreateData)

    expect(mocks.toastError).toHaveBeenCalledWith('Create failed')
    expect(mocks.reloadBreakdown).not.toHaveBeenCalled()
    expect(mocks.toastSuccess).not.toHaveBeenCalled()
  })

  it('shows error toast with message from thrown Error', () => {
    const { deps, mocks } = makeDeps()
    mocks.kanjiCreate.mockImplementation(() => {
      throw new Error('Custom error')
    })
    const handler = createKanjiCreateHandler(deps)

    handler(quickCreateData)

    expect(mocks.toastError).toHaveBeenCalledWith('Custom error')
  })
})
