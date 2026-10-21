import { describe, expect, it } from 'vitest';

import { JLPT_OPTIONS, JOYO_OPTIONS, KENTEI_OPTIONS, NONE, readingLevels } from './constants';

const values = (options: { value: string }[]) => options.map((o) => o.value);

describe('kanji-detail utils/constants', () => {
  it('uses a sentinel value for "None"', () => {
    expect(NONE).toBe('__none__');
  });

  it('lists None then N5 to N1 for JLPT', () => {
    expect(values(JLPT_OPTIONS)).toEqual([NONE, 'N5', 'N4', 'N3', 'N2', 'N1']);
  });

  it('lists None, 小1 to 小6 and 中学 for Joyo', () => {
    expect(JOYO_OPTIONS.map((o) => o.label)).toEqual([
      'None',
      '小1',
      '小2',
      '小3',
      '小4',
      '小5',
      '小6',
      '中学',
    ]);
    expect(values(JOYO_OPTIONS)).toEqual([
      NONE,
      'elementary1',
      'elementary2',
      'elementary3',
      'elementary4',
      'elementary5',
      'elementary6',
      'secondary',
    ]);
  });

  it('lists None then 10級 to 1級, with 準2級 and 準1級, for Kentei', () => {
    expect(KENTEI_OPTIONS.map((o) => o.label)).toEqual([
      'None',
      '10級',
      '9級',
      '8級',
      '7級',
      '6級',
      '5級',
      '4級',
      '3級',
      '準2級',
      '2級',
      '準1級',
      '1級',
    ]);
    expect(values(KENTEI_OPTIONS)).toEqual([
      NONE,
      '10',
      '9',
      '8',
      '7',
      '6',
      '5',
      '4',
      '3',
      'pre2',
      '2',
      'pre1',
      '1',
    ]);
  });

  it('orders reading levels 小, 中, 高, 外', () => {
    expect(readingLevels).toEqual(['小', '中', '高', '外']);
  });
});
