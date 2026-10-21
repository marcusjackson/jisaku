/**
 * VocabListFilterJlptLevel Tests
 */

import { render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import VocabListFilterJlptLevel from './VocabListFilterJlptLevel.vue';

describe('VocabListFilterJlptLevel', () => {
  it('exposes the chips as a group named JLPT Level', () => {
    render(VocabListFilterJlptLevel, { props: { modelValue: [] } });

    expect(screen.getByRole('group', { name: 'JLPT Level' })).toBeInTheDocument();
  });

  it('renders all JLPT level buttons', () => {
    render(VocabListFilterJlptLevel, {
      props: { modelValue: [] },
    });

    expect(screen.getByRole('button', { name: 'N5' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'N4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'N3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'N2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'N1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '非JLPT' })).toBeInTheDocument();
  });

  it('marks selected levels as pressed', () => {
    render(VocabListFilterJlptLevel, {
      props: { modelValue: ['N5', 'N3'] },
    });

    expect(screen.getByRole('button', { name: 'N5' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'N3' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'N4' })).toHaveAttribute('aria-pressed', 'false');
  });
});
