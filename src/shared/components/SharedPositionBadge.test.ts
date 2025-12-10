/**
 * SharedPositionBadge Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import SharedPositionBadge from './SharedPositionBadge.vue'

import type { PositionType } from '@/shared/types/database-types'

describe('SharedPositionBadge', () => {
  const createMockPosition = (
    overrides: Partial<PositionType> = {}
  ): PositionType => ({
    createdAt: '2025-01-01T00:00:00Z',
    description: 'Full description',
    descriptionShort: 'Short desc',
    displayOrder: 0,
    id: 1,
    nameEnglish: 'Left side',
    nameJapanese: 'ε΄',
    positionName: 'hen',
    updatedAt: '2025-01-01T00:00:00Z',
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

  it('shows short description in tooltip', () => {
    const position = createMockPosition({
      descriptionShort: 'Short tooltip text'
    })
    render(SharedPositionBadge, {
      props: { position }
    })

    const badge = screen.getByText('ε΄')
    expect(badge).toHaveAttribute('title', 'Short tooltip text')
  })

  it('shows full description in tooltip when short description is null', () => {
    const position = createMockPosition({
      description: 'Full description text',
      descriptionShort: null
    })
    render(SharedPositionBadge, {
      props: { position }
    })

    const badge = screen.getByText('ε΄')
    expect(badge).toHaveAttribute('title', 'Full description text')
  })

  it('shows position name in tooltip when both descriptions are null', () => {
    const position = createMockPosition({
      description: null,
      descriptionShort: null,
      positionName: 'hen'
    })
    render(SharedPositionBadge, {
      props: { position }
    })

    const badge = screen.getByText('ε΄')
    expect(badge).toHaveAttribute('title', 'hen')
  })
})
