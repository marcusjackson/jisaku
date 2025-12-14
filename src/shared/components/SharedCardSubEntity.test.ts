import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import SharedCardSubEntity from './SharedCardSubEntity.vue'

describe('SharedCardSubEntity', () => {
  it('renders character', () => {
    render(SharedCardSubEntity, {
      props: {
        character: '水'
      }
    })

    expect(screen.getByText('水')).toBeInTheDocument()
  })

  it('renders short meaning', () => {
    render(SharedCardSubEntity, {
      props: {
        character: '水',
        shortMeaning: 'water'
      }
    })

    expect(screen.getByText('water')).toBeInTheDocument()
  })

  it('renders without short meaning', () => {
    render(SharedCardSubEntity, {
      props: {
        character: '水',
        shortMeaning: null
      }
    })

    expect(screen.getByText('水')).toBeInTheDocument()
    expect(screen.queryByText('water')).not.toBeInTheDocument()
  })

  it('renders badges', () => {
    render(SharedCardSubEntity, {
      props: {
        character: '水',
        shortMeaning: 'water',
        badges: ['N5', '4 strokes']
      }
    })

    expect(screen.getByText('N5')).toBeInTheDocument()
    expect(screen.getByText('4 strokes')).toBeInTheDocument()
  })

  it('renders without badges', () => {
    render(SharedCardSubEntity, {
      props: {
        character: '水',
        shortMeaning: 'water',
        badges: []
      }
    })

    expect(screen.queryByText('N5')).not.toBeInTheDocument()
  })

  it('renders note', () => {
    render(SharedCardSubEntity, {
      props: {
        character: '水',
        shortMeaning: 'water',
        note: 'Used as radical'
      }
    })

    expect(screen.getByText('Used as radical')).toBeInTheDocument()
  })

  describe('action buttons', () => {
    it('shows view button when showView is true', () => {
      render(SharedCardSubEntity, {
        props: {
          character: '水',
          showView: true
        }
      })

      expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument()
    })

    it('shows remove button when showRemove is true', () => {
      render(SharedCardSubEntity, {
        props: {
          character: '水',
          showRemove: true
        }
      })

      expect(
        screen.getByRole('button', { name: /remove/i })
      ).toBeInTheDocument()
    })

    it('hides remove button in view mode', () => {
      render(SharedCardSubEntity, {
        props: {
          character: '水',
          showView: true,
          showRemove: false
        }
      })

      expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /remove/i })
      ).not.toBeInTheDocument()
    })

    it('shows both buttons when both props are true', () => {
      render(SharedCardSubEntity, {
        props: {
          character: '水',
          showView: true,
          showRemove: true
        }
      })

      expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /remove/i })
      ).toBeInTheDocument()
    })

    it('hides action buttons when both props are false', () => {
      render(SharedCardSubEntity, {
        props: {
          character: '水',
          showView: false,
          showRemove: false
        }
      })

      expect(
        screen.queryByRole('button', { name: /view/i })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /remove/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('events', () => {
    it('emits view event when view button clicked', async () => {
      const user = userEvent.setup()
      const onView = vi.fn()

      render(SharedCardSubEntity, {
        props: {
          character: '水',
          showView: true,
          onView
        }
      })

      await user.click(screen.getByRole('button', { name: /view/i }))

      expect(onView).toHaveBeenCalledTimes(1)
    })

    it('emits remove event when remove button clicked', async () => {
      const user = userEvent.setup()
      const onRemove = vi.fn()

      render(SharedCardSubEntity, {
        props: {
          character: '水',
          showRemove: true,
          onRemove
        }
      })

      await user.click(screen.getByRole('button', { name: /remove/i }))

      expect(onRemove).toHaveBeenCalledTimes(1)
    })
  })

  describe('layout', () => {
    it('renders with complex content', () => {
      render(SharedCardSubEntity, {
        props: {
          character: '日',
          shortMeaning: 'sun, day',
          badges: ['N5', 'JLPT', '4 strokes'],
          note: 'Common radical',
          showView: true,
          showRemove: true
        }
      })

      expect(screen.getByText('日')).toBeInTheDocument()
      expect(screen.getByText('sun, day')).toBeInTheDocument()
      expect(screen.getByText('N5')).toBeInTheDocument()
      expect(screen.getByText('JLPT')).toBeInTheDocument()
      expect(screen.getByText('4 strokes')).toBeInTheDocument()
      expect(screen.getByText('Common radical')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /remove/i })
      ).toBeInTheDocument()
    })
  })
})
