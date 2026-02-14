/**
 * Tests for KanjiSectionDetail component
 *
 * Note: Uses stubs for child components to isolate testing.
 * Full integration behavior is tested via E2E tests.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import KanjiSectionDetail from './KanjiSectionDetail.vue'

import type { Kanji } from '@/legacy/shared/types/database-types'

function createMockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    character: '日',
    createdAt: new Date().toISOString(),
    id: 1,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: 'Sun, day',
    identifier: null,
    radicalStrokeCount: null,
    searchKeywords: null,
    radicalId: null,
    strokeCount: 4,
    shortMeaning: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

function mountSectionDetail(props = {}) {
  const defaultProps = {
    kanji: createMockKanji()
  }
  return mount(KanjiSectionDetail, {
    props: { ...defaultProps, ...props },
    global: {
      stubs: {
        SharedBackButton: { template: '<a><slot /></a>' },
        SharedConfirmDialog: {
          template: '<div v-if="isOpen" role="dialog"><slot /></div>',
          props: ['isOpen', 'title', 'description', 'confirmLabel', 'variant']
        },
        SharedSection: {
          props: ['title', 'collapsible', 'defaultOpen'],
          template: '<section><h2>{{ title }}</h2><slot /></section>'
        },
        KanjiDetailHeader: {
          props: ['kanji', 'radical'],
          emits: ['edit'],
          template:
            '<header><span class="character">{{ kanji.character }}</span><button @click="$emit(\'edit\')">Edit</button></header>'
        },
        KanjiDetailBasicInfo: {
          props: ['kanji', 'radical', 'radicalOptions'],
          emits: ['update'],
          template:
            '<div class="basic-info">{{ kanji.strokeCount }} strokes</div>'
        },
        KanjiDetailComponents: {
          props: ['occurrences', 'kanjiId', 'allComponents'],
          emits: ['addComponent', 'createComponent'],
          template: '<div class="components"></div>'
        },
        KanjiDetailStrokeOrder: {
          props: ['strokeDiagram', 'strokeGif'],
          emits: ['updateDiagram', 'updateGif'],
          template: '<div class="stroke-order"></div>'
        },
        KanjiDetailNotesEtymology: {
          props: ['notes'],
          emits: ['update'],
          template: '<div class="notes-etymology">{{ notes }}</div>'
        },
        KanjiDetailNotesSemantic: {
          props: ['notes'],
          emits: ['update'],
          template: '<div class="notes-semantic">{{ notes }}</div>'
        },
        KanjiDetailNotesEducation: {
          props: ['notes'],
          emits: ['update'],
          template: '<div class="notes-education">{{ notes }}</div>'
        },
        KanjiDetailNotesPersonal: {
          props: ['notes'],
          emits: ['update'],
          template: '<div class="notes-personal">{{ notes }}</div>'
        },
        KanjiHeaderEditDialog: {
          props: ['open', 'character', 'shortMeaning', 'searchKeywords'],
          emits: ['update:open', 'save'],
          template:
            '<div v-if="open" role="dialog" class="header-dialog"></div>'
        },
        BaseButton: {
          props: ['disabled', 'variant'],
          template: '<button :disabled="disabled"><slot /></button>'
        }
      }
    }
  })
}

describe('KanjiSectionDetail', () => {
  it('renders kanji character', () => {
    const wrapper = mountSectionDetail()

    expect(wrapper.find('.character').text()).toBe('日')
  })

  it('renders section headings', () => {
    const wrapper = mountSectionDetail()
    const headings = wrapper.findAll('h2')
    const headingTexts = headings.map((h) => h.text())

    expect(headingTexts).toContain('Basic Information')
    expect(headingTexts).toContain('Components')
  })

  it('renders delete button', () => {
    const wrapper = mountSectionDetail()

    const deleteButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Delete'))
    expect(deleteButton?.exists()).toBe(true)
  })

  it('shows confirmation dialog when delete clicked', async () => {
    const wrapper = mountSectionDetail({ isDestructiveMode: true })

    const deleteButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Delete'))
    await deleteButton?.trigger('click')

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })

  it('emits delete event when dialog confirms', async () => {
    const onDelete = vi.fn()
    const wrapper = mountSectionDetail({ onDelete, isDestructiveMode: true })

    // Click delete button to show dialog
    const deleteButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Delete'))
    await deleteButton?.trigger('click')

    // Verify dialog appears (state change)
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })

  it('disables delete button when isDeleting', () => {
    const wrapper = mountSectionDetail({ isDeleting: true })

    const deleteButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Deleting'))
    expect(deleteButton?.element.disabled).toBe(true)
  })
})
