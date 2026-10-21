/**
 * Refresh Component Occurrences
 *
 * Rebuilds a kanji's component occurrences with their component, position and form details.
 *
 * @module modules/kanji-detail
 */

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types';
import type {
  useComponentFormRepository,
  useComponentOccurrenceRepository,
  useComponentRepository,
} from '@/api/component';
import type { Kanji } from '@/api/kanji/kanji-types';
import type { usePositionTypeRepository } from '@/api/position';
import type { Ref } from 'vue';

export interface OccurrenceRefreshContext {
  state: {
    kanji: Ref<Kanji | null>;
    componentOccurrences: Ref<ComponentOccurrenceWithDetails[]>;
  };
  componentRepo: ReturnType<typeof useComponentRepository>;
  occurrenceRepo: ReturnType<typeof useComponentOccurrenceRepository>;
  positionRepo: ReturnType<typeof usePositionTypeRepository>;
  formRepo: ReturnType<typeof useComponentFormRepository>;
}

export function refreshOccurrenceDetails(ctx: OccurrenceRefreshContext): void {
  const kanjiVal = ctx.state.kanji.value;
  if (!kanjiVal) return;

  const occurrences = ctx.occurrenceRepo.getByParentId(kanjiVal.id);
  ctx.state.componentOccurrences.value = occurrences.map((occ) => {
    const component = ctx.componentRepo.getById(occ.componentId);
    const position = occ.positionTypeId ? ctx.positionRepo.getById(occ.positionTypeId) : null;
    const form = occ.componentFormId ? ctx.formRepo.getById(occ.componentFormId) : null;

    return {
      ...occ,
      component: {
        id: component?.id ?? occ.componentId,
        character: component?.character ?? '',
        shortMeaning: component?.shortMeaning ?? null,
      },
      position,
      form: form
        ? {
            id: form.id,
            formCharacter: form.formCharacter,
            formName: form.formName,
          }
        : null,
    } satisfies ComponentOccurrenceWithDetails;
  });
}
