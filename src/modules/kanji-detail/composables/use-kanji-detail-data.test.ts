import { nextTick, reactive } from 'vue';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useKanjiDetailData } from './use-kanji-detail-data';
import { useKanjiRepos } from './use-kanji-repos';

const mocks = vi.hoisted(() => ({
  route: { params: { id: '1' } },
  kanjiGetById: vi.fn(),
  componentGetById: vi.fn(),
  componentGetAll: vi.fn(),
  occurrenceGetByParentId: vi.fn(),
  positionGetById: vi.fn(),
  formGetById: vi.fn(),
  vocabGetByKanjiIdWithVocabulary: vi.fn(),
  onReadingGetByParentId: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRoute: () => mocks.route,
}));

vi.mock('@/api/classification', () => ({
  useClassificationTypeRepository: () => ({ getAll: vi.fn(() => []) }),
  useKanjiClassificationRepository: () => ({
    getByKanjiIdWithType: vi.fn(() => []),
  }),
}));

vi.mock('@/api/component', () => ({
  useComponentRepository: () => ({
    getById: mocks.componentGetById,
    getAll: mocks.componentGetAll,
  }),
  useComponentOccurrenceRepository: () => ({
    getByParentId: mocks.occurrenceGetByParentId,
  }),
  useComponentFormRepository: () => ({
    getById: mocks.formGetById,
    getAll: vi.fn(() => []),
  }),
}));

vi.mock('@/api/position', () => ({
  usePositionTypeRepository: () => ({
    getAll: vi.fn(() => []),
    getById: mocks.positionGetById,
  }),
}));

vi.mock('@/api/vocabulary', () => ({
  useVocabKanjiRepository: () => ({
    getByKanjiIdWithVocabulary: mocks.vocabGetByKanjiIdWithVocabulary,
  }),
}));

vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({ getById: mocks.kanjiGetById }),
  useOnReadingRepository: () => ({ getByParentId: mocks.onReadingGetByParentId }),
  useKunReadingRepository: () => ({ getByParentId: vi.fn(() => []) }),
  useKanjiMeaningRepository: () => ({ getByParentId: vi.fn(() => []) }),
  useReadingGroupRepository: () => ({ getByParentId: vi.fn(() => []) }),
  useGroupMemberRepository: () => ({ getByKanjiId: vi.fn(() => []) }),
}));

function mockKanji(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    character: '日',
    radicalId: null,
    strokeCount: 4,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('useKanjiDetailData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.route = reactive({ params: { id: '1' } });
    mocks.kanjiGetById.mockImplementation((id: number) => mockKanji({ id }));
    mocks.componentGetById.mockReturnValue(null);
    mocks.componentGetAll.mockReturnValue([]);
    mocks.occurrenceGetByParentId.mockReturnValue([]);
    mocks.positionGetById.mockReturnValue(null);
    mocks.formGetById.mockReturnValue(null);
    mocks.vocabGetByKanjiIdWithVocabulary.mockReturnValue([]);
    mocks.onReadingGetByParentId.mockReturnValue([]);
  });

  it('exposes the state refs the page reads', () => {
    const data = useKanjiDetailData();

    expect(Object.keys(data).sort()).toEqual(
      [
        'allComponents',
        'classificationTypes',
        'classifications',
        'componentOccurrences',
        'groupMembers',
        'isLoading',
        'kanji',
        'kanjiId',
        'kunReadings',
        'loadError',
        'meanings',
        'onReadings',
        'radical',
        'readingGroups',
        'vocabulary',
      ].sort()
    );
  });

  it('exposes one repository per entity via useKanjiRepos', () => {
    const repos = useKanjiRepos();

    expect(Object.keys(repos)).toHaveLength(13);
    expect(typeof repos.vocabKanjiRepo.getByKanjiIdWithVocabulary).toBe('function');
  });

  it('loads the kanji and its vocabulary without an error', () => {
    mocks.vocabGetByKanjiIdWithVocabulary.mockReturnValue([{ id: 9 }]);

    const data = useKanjiDetailData();

    expect(data.kanji.value?.character).toBe('日');
    expect(data.vocabulary.value).toEqual([{ id: 9 }]);
    expect(data.loadError.value).toBeNull();
    expect(data.isLoading.value).toBe(false);
  });

  it('reports a not-found error when the kanji does not exist', () => {
    mocks.kanjiGetById.mockReturnValue(null);

    const data = useKanjiDetailData();

    expect(data.kanji.value).toBeNull();
    expect(data.loadError.value).toBe('Kanji with ID 1 not found');
    expect(data.isLoading.value).toBe(false);
  });

  it('reports the error message when a repository throws', () => {
    mocks.onReadingGetByParentId.mockImplementation(() => {
      throw new Error('db closed');
    });

    const data = useKanjiDetailData();

    expect(data.loadError.value).toBe('db closed');
    expect(data.isLoading.value).toBe(false);
  });

  it('reloads when the route id changes', async () => {
    const data = useKanjiDetailData();
    expect(data.kanji.value?.id).toBe(1);

    mocks.route.params.id = '2';
    await nextTick();

    expect(data.kanjiId.value).toBe(2);
    expect(data.kanji.value?.id).toBe(2);
  });

  it('loads the radical and the details of each component occurrence', () => {
    mocks.kanjiGetById.mockReturnValue(mockKanji({ radicalId: 5 }));
    mocks.componentGetById.mockImplementation((id: number) => ({
      id,
      character: id === 5 ? '日' : '木',
      shortMeaning: id === 5 ? 'sun' : 'tree',
    }));
    mocks.occurrenceGetByParentId.mockReturnValue([
      { id: 1, kanjiId: 1, componentId: 6, positionTypeId: 2, componentFormId: null },
    ]);
    mocks.positionGetById.mockReturnValue({ id: 2, positionName: 'Left' });

    const data = useKanjiDetailData();

    expect(data.radical.value?.character).toBe('日');
    expect(data.componentOccurrences.value).toHaveLength(1);
    expect(data.componentOccurrences.value[0]).toMatchObject({
      component: { id: 6, character: '木', shortMeaning: 'tree' },
      position: { id: 2 },
      form: null,
    });
  });
});
