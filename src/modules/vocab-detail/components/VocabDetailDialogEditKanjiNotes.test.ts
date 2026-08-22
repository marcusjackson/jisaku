/**
 * Tests for VocabDetailDialogEditKanjiNotes component
 *
 * Note: Uses BaseDialog which renders via portal.
 * Tests use stubs to avoid portal issues.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import VocabDetailDialogEditKanjiNotes from './VocabDetailDialogEditKanjiNotes.vue'

import type { Kanji } from '@/api/kanji'
import type { VocabKanjiWithKanji } from '@/api/vocabulary'

function createTestKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    id: 1,
    character: '明',
    shortMeaning: 'bright',
    strokeCount: 8,
    jlptLevel: null,
    joyoLevel: null,
    kanjiKenteiLevel: null,
    searchKeywords: null,
    radicalId: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides
  }
}

function createTestVocabKanjiWithKanji(
  overrides: Partial<VocabKanjiWithKanji> = {}
): VocabKanjiWithKanji {
  return {
    id: 10,
    vocabId: 1,
    kanjiId: 1,
    analysisNotes: 'existing notes',
    displayOrder: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    kanji: createTestKanji(),
    ...overrides
  }
}

describe('VocabDetailDialogEditKanjiNotes', () => {
  function mountDialog(
    props: { vocabKanji?: VocabKanjiWithKanji | null } = {},
    modelValue = true
  ) {
    return mount(VocabDetailDialogEditKanjiNotes, {
      props: {
        open: modelValue,
        'onUpdate:open': (...args: unknown[]) => {
          void args
        },
        vocabKanji: createTestVocabKanjiWithKanji(),
        ...props
      },
      global: {
        stubs: {
          BaseDialog: {
            props: ['open', 'title', 'description'],
            template: `
              <div v-if="open" role="dialog" data-testid="dialog">
                <h2>{{ title }}</h2>
                <slot />
                <slot name="footer" />
              </div>
            `
          },
          BaseTextarea: {
            props: ['modelValue', 'label', 'placeholder', 'name', 'rows'],
            emits: ['update:modelValue'],
            template: `
              <textarea
                data-testid="notes-textarea"
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
              />
            `
          },
          BaseButton: {
            props: ['variant', 'type', 'disabled'],
            template: `<button :type="type" :data-variant="variant"><slot /></button>`
          }
        }
      }
    })
  }

  it('renders dialog with correct title', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('h2').text()).toBe('Edit Analysis Notes')
  })

  it('displays kanji character and meaning as context', () => {
    const wrapper = mountDialog()
    expect(wrapper.text()).toContain('明')
    expect(wrapper.text()).toContain('bright')
  })

  it('pre-populates textarea with existing analysisNotes', () => {
    const wrapper = mountDialog()
    const textarea = wrapper.find('[data-testid="notes-textarea"]')
    expect((textarea.element as HTMLTextAreaElement).value).toBe(
      'existing notes'
    )
  })

  it('emits submit with correct payload on form submission', async () => {
    const wrapper = mountDialog()
    const textarea = wrapper.find('[data-testid="notes-textarea"]')
    await textarea.setValue('updated notes')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')?.[0]).toEqual([
      { id: 10, notes: 'updated notes' }
    ])
  })

  it('emits null for empty textarea on submit', async () => {
    const wrapper = mountDialog()
    const textarea = wrapper.find('[data-testid="notes-textarea"]')
    await textarea.setValue('   ')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(wrapper.emitted('submit')?.[0]).toEqual([{ id: 10, notes: null }])
  })

  it('emits cancel and closes without submitting', async () => {
    const wrapper = mountDialog()
    const cancelButton = wrapper.find('[data-variant="secondary"]')
    await cancelButton.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(wrapper.emitted('submit')).toBeFalsy()
  })
})
