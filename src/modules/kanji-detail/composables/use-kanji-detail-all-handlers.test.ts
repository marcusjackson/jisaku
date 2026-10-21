/**
 * Tests for useKanjiDetailAllHandlers composable
 *
 * @vitest-environment jsdom
 */
import { ref } from 'vue';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useKanjiDetailAllHandlers } from './use-kanji-detail-all-handlers';
import { useKanjiDetailNotesHandlers } from './use-kanji-detail-notes-handlers';
import { useKanjiDetailSaveHandlers } from './use-kanji-detail-save-handlers';

import type { Kanji } from '@/api/kanji';

// Mock the notes and save handlers
vi.mock('./use-kanji-detail-notes-handlers', () => ({
  useKanjiDetailNotesHandlers: vi.fn(() => ({
    handleSemanticNotesSave: vi.fn(),
    handleEtymologyNotesSave: vi.fn(),
    handleEducationNotesSave: vi.fn(),
    handlePersonalNotesSave: vi.fn(),
    handleStrokeDiagramSave: vi.fn(),
    handleStrokeAnimationSave: vi.fn(),
  })),
}));

vi.mock('./use-kanji-detail-save-handlers', () => ({
  useKanjiDetailSaveHandlers: vi.fn(() => ({
    handleBasicInfoSave: vi.fn(),
    handleMeaningsSave: vi.fn(),
    handleReadingsSave: vi.fn(),
  })),
}));

describe('useKanjiDetailAllHandlers', () => {
  const mockKanji: Kanji = {
    id: 1,
    character: '日',
    strokeCount: 4,
    shortMeaning: null,
    searchKeywords: null,
    radicalId: null,
    jlptLevel: 'N5',
    joyoLevel: null,
    kanjiKenteiLevel: null,
    identifier: null,
    radicalStrokeCount: null,
    notesSemantic: null,
    notesEtymology: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('wires its arguments into the save and notes handlers and returns their handlers', () => {
    const kanjiRef = ref<Kanji | null>(mockKanji);
    const saveBasicInfo = vi.fn();
    const handleSaveReadings = vi.fn();
    const handleSaveMeanings = vi.fn();

    const handlers = useKanjiDetailAllHandlers(
      kanjiRef,
      saveBasicInfo,
      handleSaveReadings,
      handleSaveMeanings
    );

    expect(useKanjiDetailSaveHandlers).toHaveBeenCalledWith(
      saveBasicInfo,
      handleSaveReadings,
      handleSaveMeanings
    );
    expect(useKanjiDetailNotesHandlers).toHaveBeenCalledWith(kanjiRef);
    const save = vi.mocked(useKanjiDetailSaveHandlers).mock.results[0]?.value as object;
    const notes = vi.mocked(useKanjiDetailNotesHandlers).mock.results[0]?.value as object;
    expect(handlers).toEqual({ ...save, ...notes });
    expect(Object.keys(handlers)).toHaveLength(9);
  });
});
