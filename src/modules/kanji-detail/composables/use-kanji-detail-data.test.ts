import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useKanjiDetailData } from './use-kanji-detail-data'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '1' } })
}))

vi.mock('@/api/classification', () => ({
  useClassificationTypeRepository: () => ({ getAll: vi.fn(() => []) }),
  useKanjiClassificationRepository: () => ({
    getByKanjiIdWithType: vi.fn(() => [])
  })
}))

vi.mock('@/api/component', () => ({
  useComponentRepository: () => ({
    getById: vi.fn(() => null),
    getAll: vi.fn(() => [])
  }),
  useComponentOccurrenceRepository: () => ({
    getByParentId: vi.fn(() => [])
  }),
  useComponentFormRepository: () => ({
    getAll: vi.fn(() => [])
  })
}))

vi.mock('@/api/position', () => ({
  usePositionTypeRepository: () => ({
    getAll: vi.fn(() => [])
  })
}))

vi.mock('@/api/vocabulary', () => ({
  useVocabKanjiRepository: () => ({
    getByKanjiId: vi.fn(() => [])
  })
}))

vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({
    getById: vi.fn(() => ({
      id: 1,
      character: '日',
      radicalId: null,
      strokeCount: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
  }),
  useOnReadingRepository: () => ({ getByParentId: vi.fn(() => []) }),
  useKunReadingRepository: () => ({ getByParentId: vi.fn(() => []) }),
  useKanjiMeaningRepository: () => ({ getByParentId: vi.fn(() => []) }),
  useReadingGroupRepository: () => ({ getByParentId: vi.fn(() => []) }),
  useGroupMemberRepository: () => ({ getByKanjiId: vi.fn(() => []) })
}))

describe('useKanjiDetailData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns state refs and repositories', () => {
    const data = useKanjiDetailData()

    expect(data.kanji).toBeDefined()
    expect(data.radical).toBeDefined()
    expect(data.allComponents).toBeDefined()
    expect(data.classifications).toBeDefined()
    expect(data.classificationTypes).toBeDefined()
    expect(data.onReadings).toBeDefined()
    expect(data.kunReadings).toBeDefined()
    expect(data.meanings).toBeDefined()
    expect(data.readingGroups).toBeDefined()
    expect(data.groupMembers).toBeDefined()
    expect(data.isLoading).toBeDefined()
    expect(data.loadError).toBeDefined()
    expect(data.kanjiId).toBeDefined()
  })

  it('returns repository instances', () => {
    const data = useKanjiDetailData()

    expect(data.kanjiRepo).toBeDefined()
    expect(data.componentRepo).toBeDefined()
    expect(data.kanjiClassificationRepo).toBeDefined()
    expect(data.onReadingRepo).toBeDefined()
    expect(data.kunReadingRepo).toBeDefined()
    expect(data.meaningRepo).toBeDefined()
    expect(data.readingGroupRepo).toBeDefined()
    expect(data.groupMemberRepo).toBeDefined()
  })

  it('loads kanji data on initialization', () => {
    const data = useKanjiDetailData()
    expect(data.kanji.value).not.toBeNull()
    expect(data.kanji.value?.character).toBe('日')
  })

  it('sets isLoading to false after loading', () => {
    const data = useKanjiDetailData()
    expect(data.isLoading.value).toBe(false)
  })
})
