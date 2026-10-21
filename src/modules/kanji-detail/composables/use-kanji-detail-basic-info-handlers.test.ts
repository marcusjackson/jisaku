/**
 * Tests for use-kanji-detail-basic-info-handlers composable.
 *
 * @module modules/kanji-detail
 */

import { ref } from 'vue';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { inTransaction } from '@/db/transaction';

import { useKanjiDetailBasicInfoHandlers } from './use-kanji-detail-basic-info-handlers';

import type { BasicInfoSaveData } from '../kanji-detail-types';
import type { KanjiClassification } from '@/api/classification/classification-types';
import type { Component as RadicalComponent } from '@/api/component/component-types';
import type { Kanji } from '@/api/kanji/kanji-types';

const statements: string[] = [];

vi.mock('@/shared/composables/use-database', () => ({
  useDatabase: () => ({
    transaction: <T>(fn: () => T): T => inTransaction((sql) => statements.push(sql), fn),
  }),
}));

function mockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    id: 1,
    character: '水',
    strokeCount: 4,
    shortMeaning: null,
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
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function mockComponent(overrides: Partial<RadicalComponent> = {}): RadicalComponent {
  return {
    id: 1,
    character: '氵',
    strokeCount: null,
    shortMeaning: null,
    searchKeywords: null,
    sourceKanjiId: null,
    description: null,
    canBeRadical: true,
    kangxiNumber: null,
    kangxiMeaning: 'water',
    radicalNameJapanese: null,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function createMockRepos() {
  return {
    kanjiRepository: {
      update: vi.fn(),
      getById: vi.fn((id: number) => mockKanji({ id })),
    },
    componentRepository: {
      create: vi.fn(() => ({ id: 99, character: '新' })),
      getById: vi.fn(() => mockComponent()),
      getAll: vi.fn(() => [mockComponent()]),
      update: vi.fn(),
    },
    classificationRepository: {
      create: vi.fn(() => ({ id: 50 })),
      remove: vi.fn(),
      reorder: vi.fn(),
      getByKanjiIdWithType: vi.fn(() => []),
    },
  };
}

function createMockState() {
  return {
    kanji: ref<Kanji | null>(mockKanji()),
    radical: ref<RadicalComponent | null>(null),
    allComponents: ref<RadicalComponent[]>([mockComponent()]),
    classifications: ref<KanjiClassification[]>([]),
  };
}

describe('useKanjiDetailBasicInfoHandlers', () => {
  let repos: ReturnType<typeof createMockRepos>;
  let state: ReturnType<typeof createMockState>;

  beforeEach(() => {
    statements.length = 0;
    repos = createMockRepos();
    state = createMockState();
  });

  describe('handleSave', () => {
    it('updates kanji fields when save is called', () => {
      const { handleSave } = useKanjiDetailBasicInfoHandlers(
        state,
        repos as unknown as Parameters<typeof useKanjiDetailBasicInfoHandlers>[1]
      );

      const saveData: BasicInfoSaveData = {
        strokeCount: 10,
        jlptLevel: 'N3',
        joyoLevel: 'elementary3',
        kanjiKenteiLevel: '5',
        radicalId: null,
        classifications: [],
      };

      handleSave(saveData);

      expect(repos.kanjiRepository.update).toHaveBeenCalledWith(1, {
        strokeCount: 10,
        jlptLevel: 'N3',
        joyoLevel: 'elementary3',
        kanjiKenteiLevel: '5',
        radicalId: null,
      });
    });

    it('does nothing if kanji is null', () => {
      state.kanji.value = null;
      const { handleSave } = useKanjiDetailBasicInfoHandlers(
        state,
        repos as unknown as Parameters<typeof useKanjiDetailBasicInfoHandlers>[1]
      );

      handleSave({
        strokeCount: 5,
        jlptLevel: null,
        joyoLevel: null,
        kanjiKenteiLevel: null,
        radicalId: null,
        classifications: [],
      });

      expect(repos.kanjiRepository.update).not.toHaveBeenCalled();
    });

    it('removes classifications that are no longer present', () => {
      state.classifications.value = [
        { id: 1, kanjiId: 1, classificationTypeId: 100, displayOrder: 0 },
      ];

      const { handleSave } = useKanjiDetailBasicInfoHandlers(
        state,
        repos as unknown as Parameters<typeof useKanjiDetailBasicInfoHandlers>[1]
      );

      handleSave({
        strokeCount: 4,
        jlptLevel: null,
        joyoLevel: null,
        kanjiKenteiLevel: null,
        radicalId: null,
        classifications: [],
      });

      expect(repos.classificationRepository.remove).toHaveBeenCalledWith(1);
    });

    it('creates new classifications', () => {
      const { handleSave } = useKanjiDetailBasicInfoHandlers(
        state,
        repos as unknown as Parameters<typeof useKanjiDetailBasicInfoHandlers>[1]
      );

      handleSave({
        strokeCount: 4,
        jlptLevel: null,
        joyoLevel: null,
        kanjiKenteiLevel: null,
        radicalId: null,
        classifications: [{ id: undefined, classificationTypeId: 100, displayOrder: 0 }],
      });

      expect(repos.classificationRepository.create).toHaveBeenCalledWith({
        kanjiId: 1,
        classificationTypeId: 100,
        displayOrder: 0,
      });
    });

    it('reorders existing classifications', () => {
      state.classifications.value = [
        { id: 1, kanjiId: 1, classificationTypeId: 100, displayOrder: 0 },
        { id: 2, kanjiId: 1, classificationTypeId: 101, displayOrder: 1 },
      ];

      const { handleSave } = useKanjiDetailBasicInfoHandlers(
        state,
        repos as unknown as Parameters<typeof useKanjiDetailBasicInfoHandlers>[1]
      );

      handleSave({
        strokeCount: 4,
        jlptLevel: null,
        joyoLevel: null,
        kanjiKenteiLevel: null,
        radicalId: null,
        classifications: [
          { id: 2, classificationTypeId: 101, displayOrder: 0 },
          { id: 1, classificationTypeId: 100, displayOrder: 1 },
        ],
      });

      expect(repos.classificationRepository.reorder).toHaveBeenCalledWith([2, 1]);
    });

    it('replaces a saved row whose type changed, keeping its position', () => {
      state.classifications.value = [
        { id: 1, kanjiId: 1, classificationTypeId: 100, displayOrder: 0 },
        { id: 2, kanjiId: 1, classificationTypeId: 101, displayOrder: 1 },
        { id: 3, kanjiId: 1, classificationTypeId: 102, displayOrder: 2 },
      ];

      const { handleSave } = useKanjiDetailBasicInfoHandlers(
        state,
        repos as unknown as Parameters<typeof useKanjiDetailBasicInfoHandlers>[1]
      );

      handleSave({
        strokeCount: 4,
        jlptLevel: null,
        joyoLevel: null,
        kanjiKenteiLevel: null,
        radicalId: null,
        classifications: [
          { id: 1, classificationTypeId: 100, displayOrder: 0 },
          { id: 2, classificationTypeId: 105, displayOrder: 1 },
          { id: 3, classificationTypeId: 102, displayOrder: 2 },
        ],
      });

      expect(repos.classificationRepository.remove).toHaveBeenCalledWith(2);
      expect(repos.classificationRepository.remove).toHaveBeenCalledTimes(1);
      expect(repos.classificationRepository.create).toHaveBeenCalledWith({
        kanjiId: 1,
        classificationTypeId: 105,
        displayOrder: 1,
      });
      expect(repos.classificationRepository.reorder).toHaveBeenCalledWith([1, 50, 3]);
    });

    it('updates radical reference when radicalId is provided', () => {
      const { handleSave } = useKanjiDetailBasicInfoHandlers(
        state,
        repos as unknown as Parameters<typeof useKanjiDetailBasicInfoHandlers>[1]
      );

      handleSave({
        strokeCount: 4,
        jlptLevel: null,
        joyoLevel: null,
        kanjiKenteiLevel: null,
        radicalId: 5,
        classifications: [],
      });

      expect(repos.componentRepository.getById).toHaveBeenCalledWith(5);
      expect(repos.kanjiRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ radicalId: 5 })
      );
    });

    it('marks component as radical if not already', () => {
      repos.componentRepository.getById = vi.fn(() => mockComponent({ canBeRadical: false }));

      const { handleSave } = useKanjiDetailBasicInfoHandlers(
        state,
        repos as unknown as Parameters<typeof useKanjiDetailBasicInfoHandlers>[1]
      );

      handleSave({
        strokeCount: 4,
        jlptLevel: null,
        joyoLevel: null,
        kanjiKenteiLevel: null,
        radicalId: 5,
        classifications: [],
      });

      expect(repos.componentRepository.update).toHaveBeenCalledWith(5, {
        canBeRadical: true,
      });
    });

    it('refreshes state after save', () => {
      const updatedKanji = mockKanji({ strokeCount: 99 });
      repos.kanjiRepository.getById = vi.fn(() => updatedKanji);

      const { handleSave } = useKanjiDetailBasicInfoHandlers(
        state,
        repos as unknown as Parameters<typeof useKanjiDetailBasicInfoHandlers>[1]
      );

      handleSave({
        strokeCount: 99,
        jlptLevel: null,
        joyoLevel: null,
        kanjiKenteiLevel: null,
        radicalId: null,
        classifications: [],
      });

      expect(state.kanji.value).toEqual(updatedKanji);
    });

    it('commits every write in one transaction', () => {
      const { handleSave } = useKanjiDetailBasicInfoHandlers(
        state,
        repos as unknown as Parameters<typeof useKanjiDetailBasicInfoHandlers>[1]
      );

      handleSave({
        strokeCount: 4,
        jlptLevel: null,
        joyoLevel: null,
        kanjiKenteiLevel: null,
        radicalId: null,
        classifications: [],
      });

      expect(statements).toEqual(['BEGIN TRANSACTION', 'COMMIT']);
    });

    it('rolls back and leaves state untouched when a later write fails', () => {
      repos.classificationRepository.create.mockImplementation(() => {
        throw new Error('constraint');
      });
      const { handleSave } = useKanjiDetailBasicInfoHandlers(
        state,
        repos as unknown as Parameters<typeof useKanjiDetailBasicInfoHandlers>[1]
      );

      expect(() => {
        handleSave({
          strokeCount: 4,
          jlptLevel: null,
          joyoLevel: null,
          kanjiKenteiLevel: null,
          radicalId: null,
          newRadicalCharacter: '新',
          classifications: [{ id: undefined, classificationTypeId: 3, displayOrder: 0 }],
        });
      }).toThrow('constraint');

      expect(statements).toEqual(['BEGIN TRANSACTION', 'ROLLBACK']);
      expect(repos.componentRepository.getAll).not.toHaveBeenCalled();
      expect(repos.kanjiRepository.getById).not.toHaveBeenCalled();
    });
  });
});
