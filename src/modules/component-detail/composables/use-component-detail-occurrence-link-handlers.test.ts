/**
 * Tests for use-component-detail-occurrence-link-handlers
 */

import { ref } from 'vue';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useComponentDetailOccurrenceLinkHandlers } from './use-component-detail-occurrence-link-handlers';

import type { useComponentOccurrenceRepository } from '@/api/component';
import type { Kanji } from '@/api/kanji';
import type { QuickCreateKanjiData } from '@/shared/validation';

type OccurrenceRepo = ReturnType<typeof useComponentOccurrenceRepository>;

const mockOccurrenceCreate = vi.fn();
const mockKanjiCreate = vi.fn();
const mockKanjiGetAll = vi.fn();
const mockKanjiGetByCharacter = vi.fn();
const mockSuccess = vi.fn();
const mockError = vi.fn();
const mockTransaction = vi.fn(<T>(fn: () => T): T => fn());

vi.mock('@/api/component', () => ({
  useComponentOccurrenceRepository: () => ({
    create: mockOccurrenceCreate,
  }),
}));

vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({
    create: mockKanjiCreate,
    getAll: mockKanjiGetAll,
    getByCharacter: mockKanjiGetByCharacter,
  }),
}));

vi.mock('@/shared/composables', () => ({
  useDatabase: () => ({ transaction: mockTransaction }),
  useToast: () => ({ success: mockSuccess, error: mockError }),
}));

const newKanji: Kanji = {
  id: 99,
  character: '木',
  strokeCount: null,
  shortMeaning: 'tree',
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
  updatedAt: '2024-01-01',
};

function makeRepo(): OccurrenceRepo {
  return { create: mockOccurrenceCreate } as unknown as OccurrenceRepo;
}

function makeQuickCreate(): QuickCreateKanjiData {
  return { character: '木', shortMeaning: 'tree', searchKeywords: 'wood' };
}

describe('useComponentDetailOccurrenceLinkHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockKanjiCreate.mockReturnValue(newKanji);
    mockKanjiGetAll.mockReturnValue([newKanji]);
    mockKanjiGetByCharacter.mockReturnValue(null);
    mockTransaction.mockImplementation((fn) => fn());
  });

  describe('handleOccurrenceAdd', () => {
    it('links existing kanji when componentId is set', () => {
      const componentId = ref<number | null>(5);
      const kanjiOptions = ref<Kanji[]>([]);
      const reloadOccurrences = vi.fn();

      const { handleOccurrenceAdd } = useComponentDetailOccurrenceLinkHandlers({
        componentId,
        kanjiOptions,
        reloadOccurrences,
        occurrenceRepo: makeRepo(),
      });

      handleOccurrenceAdd(42);

      expect(mockOccurrenceCreate).toHaveBeenCalledWith({
        kanjiId: 42,
        componentId: 5,
      });
      expect(reloadOccurrences).toHaveBeenCalledTimes(1);
      expect(mockSuccess).toHaveBeenCalledWith('Kanji linked');
    });

    it('does nothing when componentId is null', () => {
      const componentId = ref<number | null>(null);
      const reloadOccurrences = vi.fn();

      const { handleOccurrenceAdd } = useComponentDetailOccurrenceLinkHandlers({
        componentId,
        kanjiOptions: ref([]),
        reloadOccurrences,
        occurrenceRepo: makeRepo(),
      });

      handleOccurrenceAdd(42);

      expect(mockOccurrenceCreate).not.toHaveBeenCalled();
      expect(reloadOccurrences).not.toHaveBeenCalled();
    });

    it('shows error toast on repo failure', () => {
      const componentId = ref<number | null>(5);
      const reloadOccurrences = vi.fn();
      mockOccurrenceCreate.mockImplementation(() => {
        throw new Error('Link failed');
      });

      const { handleOccurrenceAdd } = useComponentDetailOccurrenceLinkHandlers({
        componentId,
        kanjiOptions: ref([]),
        reloadOccurrences,
        occurrenceRepo: makeRepo(),
      });

      handleOccurrenceAdd(42);

      expect(mockError).toHaveBeenCalledWith('Link failed');
      expect(reloadOccurrences).not.toHaveBeenCalled();
    });
  });

  describe('handleOccurrenceCreate', () => {
    it('runs inside one transaction and reports a failed link', () => {
      mockOccurrenceCreate.mockImplementation(() => {
        throw new Error('Link failed');
      });
      const reloadOccurrences = vi.fn();

      const { handleOccurrenceCreate } = useComponentDetailOccurrenceLinkHandlers({
        componentId: ref<number | null>(5),
        kanjiOptions: ref<Kanji[]>([]),
        reloadOccurrences,
        occurrenceRepo: makeRepo(),
      });

      handleOccurrenceCreate(makeQuickCreate());

      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(mockError).toHaveBeenCalledWith('Link failed');
      expect(reloadOccurrences).not.toHaveBeenCalled();
    });

    it('creates kanji, links it, reloads, and updates kanjiOptions', () => {
      const componentId = ref<number | null>(5);
      const kanjiOptions = ref<Kanji[]>([]);
      const reloadOccurrences = vi.fn();

      const { handleOccurrenceCreate } = useComponentDetailOccurrenceLinkHandlers({
        componentId,
        kanjiOptions,
        reloadOccurrences,
        occurrenceRepo: makeRepo(),
      });

      const data: QuickCreateKanjiData = makeQuickCreate();
      handleOccurrenceCreate(data);

      expect(mockKanjiCreate).toHaveBeenCalledWith({
        character: '木',
        shortMeaning: 'tree',
        searchKeywords: 'wood',
      });
      expect(mockOccurrenceCreate).toHaveBeenCalledWith({
        kanjiId: 99,
        componentId: 5,
      });
      expect(reloadOccurrences).toHaveBeenCalledTimes(1);
      expect(kanjiOptions.value).toEqual([newKanji]);
      expect(mockSuccess).toHaveBeenCalledWith('Kanji created and linked');
    });

    it('trims the character before checking and creating', () => {
      const { handleOccurrenceCreate } = useComponentDetailOccurrenceLinkHandlers({
        componentId: ref<number | null>(5),
        kanjiOptions: ref<Kanji[]>([]),
        reloadOccurrences: vi.fn(),
        occurrenceRepo: makeRepo(),
      });

      const created = handleOccurrenceCreate({ ...makeQuickCreate(), character: ' 木 ' });

      expect(created).toBe(true);
      expect(mockKanjiGetByCharacter).toHaveBeenCalledWith('木');
      expect(mockKanjiCreate).toHaveBeenCalledWith(expect.objectContaining({ character: '木' }));
    });

    it('refuses a kanji that already exists, with a toast and no writes', () => {
      mockKanjiGetByCharacter.mockReturnValue(newKanji);
      const reloadOccurrences = vi.fn();
      const { handleOccurrenceCreate } = useComponentDetailOccurrenceLinkHandlers({
        componentId: ref<number | null>(5),
        kanjiOptions: ref<Kanji[]>([]),
        reloadOccurrences,
        occurrenceRepo: makeRepo(),
      });

      const created = handleOccurrenceCreate(makeQuickCreate());

      expect(created).toBe(false);
      expect(mockError).toHaveBeenCalledWith('This kanji is already registered');
      expect(mockKanjiCreate).not.toHaveBeenCalled();
      expect(mockOccurrenceCreate).not.toHaveBeenCalled();
      expect(reloadOccurrences).not.toHaveBeenCalled();
    });

    it('stores blank short meaning and keywords as null', () => {
      const { handleOccurrenceCreate } = useComponentDetailOccurrenceLinkHandlers({
        componentId: ref<number | null>(5),
        kanjiOptions: ref<Kanji[]>([]),
        reloadOccurrences: vi.fn(),
        occurrenceRepo: makeRepo(),
      });

      handleOccurrenceCreate({
        character: '木',
        shortMeaning: '',
        searchKeywords: '',
      });

      expect(mockKanjiCreate).toHaveBeenCalledWith({
        character: '木',
        shortMeaning: null,
        searchKeywords: null,
      });
    });

    it('does nothing when componentId is null', () => {
      const componentId = ref<number | null>(null);
      const reloadOccurrences = vi.fn();

      const { handleOccurrenceCreate } = useComponentDetailOccurrenceLinkHandlers({
        componentId,
        kanjiOptions: ref([]),
        reloadOccurrences,
        occurrenceRepo: makeRepo(),
      });

      handleOccurrenceCreate(makeQuickCreate());

      expect(mockKanjiCreate).not.toHaveBeenCalled();
    });

    it('shows error toast on failure', () => {
      const componentId = ref<number | null>(5);
      const reloadOccurrences = vi.fn();
      mockKanjiCreate.mockImplementation(() => {
        throw new Error('Create failed');
      });

      const { handleOccurrenceCreate } = useComponentDetailOccurrenceLinkHandlers({
        componentId,
        kanjiOptions: ref([]),
        reloadOccurrences,
        occurrenceRepo: makeRepo(),
      });

      handleOccurrenceCreate(makeQuickCreate());

      expect(mockError).toHaveBeenCalledWith('Create failed');
      expect(reloadOccurrences).not.toHaveBeenCalled();
    });
  });
});
