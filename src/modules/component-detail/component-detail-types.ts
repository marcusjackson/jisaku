/**
 * Component Detail Types
 *
 * Type definitions for the component detail module.
 *
 * @module modules/component-detail
 */

/**
 * Sentinel select value for a "None" choice. Reka UI select items cannot use
 * an empty string, so dialogs map this to null on save.
 */
export const NONE_VALUE = '__none__';

/**
 * Data emitted when headline fields are saved
 */
export interface HeadlineSaveData {
  character: string;
  shortMeaning: string | null;
  searchKeywords: string | null;
}

/**
 * Data emitted when basic info fields are saved
 */
export interface BasicInfoSaveData {
  strokeCount: number | null;
  sourceKanjiId: number | null;
  canBeRadical: boolean;
  kangxiNumber: number | null;
  kangxiMeaning: string | null;
  radicalNameJapanese: string | null;
}

/**
 * Data emitted when form dialog is submitted
 */
export interface FormSubmitData {
  formCharacter: string;
  formName: string | null;
  strokeCount: number | null;
  usageNotes: string | null;
}

/**
 * Data emitted when occurrence edit dialog is submitted
 */
export interface OccurrenceUpdateData {
  positionTypeId: number | null;
  componentFormId: number | null;
  isRadical: boolean;
  analysisNotes: string | null;
}

/**
 * Data emitted when grouping dialog is submitted (add or edit)
 */
export interface GroupingFormData {
  name: string;
  description: string | null;
}
