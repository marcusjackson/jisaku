/**
 * SharedPositionBadge Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import SharedPositionBadge from './SharedPositionBadge.vue'

import type { PositionType } from '@/api/position/position-types'

describe('SharedPositionBadge', () => {
  const createMockPosition = (
    overrides: Partial<PositionType> = {}
  ): PositionType => ({
    description: 'Full description',
    displayOrder: 0,
    id: 1,
    nameEnglish: 'Left side',
    nameJapanese: 'ε΄',
    positionName: 'hen',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
    ...overrides
  })

  it('renders without crashing', () => {
    const position = createMockPosition()
    render(SharedPositionBadge, {
      props: { position }
    })

    expect(screen.getByText('ε΄')).toBeInTheDocument()
  })

  it('displays Japanese name when available', () => {
    const position = createMockPosition({
      nameEnglish: 'Left side',
      nameJapanese: 'ε΄'
    })
    render(SharedPositionBadge, {
      props: { position }
    })

    expect(screen.getByText('ε΄')).toBeInTheDocument()
  })

  it('displays English name when Japanese name is null', () => {
    const position = createMockPosition({
      nameEnglish: 'Left side',
      nameJapanese: null
    })
    render(SharedPositionBadge, {
      props: { position }
    })

    expect(screen.getByText('Left side')).toBeInTheDocument()
  })

  it('displays position name when both Japanese and English names are null', () => {
    const position = createMockPosition({
      nameEnglish: null,
      nameJapanese: null,
      positionName: 'hen'
    })
    render(SharedPositionBadge, {
      props: { position }
    })

    expect(screen.getByText('hen')).toBeInTheDocument()
  })

  it('shows description in aria-label (accessible on touch devices)', () => {
    const position = createMockPosition({
      description: 'Full description text'
    })
    render(SharedPositionBadge, {
      props: { position }
    })

    const badge = screen.getByText('ε΄')
    expect(badge).toHaveAttribute('aria-label', 'Full description text')
  })

  it('shows position name in aria-label when description is null', () => {
    const position = createMockPosition({
      description: null,
      positionName: 'hen'
    })
    render(SharedPositionBadge, {
      props: { position }
    })

    const badge = screen.getByText('ε΄')
    expect(badge).toHaveAttribute('aria-label', 'hen')
  })
})
