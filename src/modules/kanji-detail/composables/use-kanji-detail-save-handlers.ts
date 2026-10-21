/**
 * Use Kanji Detail Save Handlers
 *
 * Wraps save operations with toast notifications
 *
 * @module modules/kanji-detail
 */

import { useToast } from '@/shared/composables/use-toast';

import type { BasicInfoSaveData, MeaningsSaveData, ReadingsSaveData } from '../kanji-detail-types';

interface UseKanjiDetailSaveHandlersReturn {
  handleBasicInfoSave: (data: BasicInfoSaveData) => boolean;
  handleReadingsSave: (data: ReadingsSaveData) => boolean;
  handleMeaningsSave: (data: MeaningsSaveData) => boolean;
}

/**
 * Wraps raw save functions with try/catch and toast notifications.
 * Each wrapper returns whether the save succeeded.
 *
 * @param saveBasicInfo - Raw save function for basic info data
 * @param handleSaveReadings - Raw save function for readings data
 * @param handleSaveMeanings - Raw save function for meanings data
 * @returns Wrapped save handlers with toast feedback
 */
export function useKanjiDetailSaveHandlers(
  saveBasicInfo: (data: BasicInfoSaveData) => void,
  handleSaveReadings: (data: ReadingsSaveData) => void,
  handleSaveMeanings: (data: MeaningsSaveData) => void
): UseKanjiDetailSaveHandlersReturn {
  const toast = useToast();

  function handleBasicInfoSave(data: BasicInfoSaveData): boolean {
    try {
      saveBasicInfo(data);
      toast.success('Basic info updated');
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
      return false;
    }
  }

  function handleReadingsSave(data: ReadingsSaveData): boolean {
    try {
      handleSaveReadings(data);
      toast.success('Readings updated');
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
      return false;
    }
  }

  function handleMeaningsSave(data: MeaningsSaveData): boolean {
    try {
      handleSaveMeanings(data);
      toast.success('Meanings updated');
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
      return false;
    }
  }

  return {
    handleBasicInfoSave,
    handleReadingsSave,
    handleMeaningsSave,
  };
}
