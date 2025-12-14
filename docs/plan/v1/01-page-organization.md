# V1 Entity Page Organization

Unified page structure for Kanji, Component, and Vocabulary detail pages. All three entities follow consistent patterns.

---

## Universal Patterns

All entity pages share these structural elements:

1. **Back button** at top (above header)
2. **Header** with character/word, short_meaning, search_keywords indicator
3. **Sections** in information hierarchy order
4. **Edit/Delete actions** at bottom (Edit: secondary, Delete: ghost with spacing)
5. **Back button** at bottom (below actions)

**Editing Pattern:**

- Header fields (character, short_meaning, search_keywords) edited via header Edit button → opens form
- Section fields edited inline or via section-specific dialogs

**Collapsible Pattern:**

- Reserved for sections that can become lengthy (occurrence lists, notes, breakdowns, diagrams)
- Basic info, readings, and short lists are NOT collapsible
- Bottom collapse button when expanded (prevents scroll-back-up UX)

---

## Kanji Page Structure

### Section Order

```
┌─────────────────────────────────────────────┐
│ [← Back to Kanji List]                      │
├─────────────────────────────────────────────┤
│ HEADER                                      │
│ 明                              [Edit]      │
│ 明るい                                      │
│ 🔍 (search_keywords indicator)              │
├─────────────────────────────────────────────┤
│ Basic Information                        ▸  │
│ Readings                                 ▸  │
│ Meanings                                 ▸  │
│ Components                               ▸  │
│ Vocabulary                               ▸  │
│ Stroke Order                             ▾  │
│ Etymology Notes                          ▾  │
│ Semantic Analysis                        ▾  │
│ Education & Mnemonics                    ▾  │
│ Personal Notes                           ▾  │
├─────────────────────────────────────────────┤
│ [Edit] [Delete]                             │
│ [← Back to Kanji List]                      │
└─────────────────────────────────────────────┘

▸ = not collapsible    ▾ = collapsible
```

### Section Specifications

| Section               | Collapsible | Edit Mode | Contains                                                  |
| --------------------- | ----------- | --------- | --------------------------------------------------------- |
| Header                | No          | Linked    | Character, short_meaning, search_keywords, Edit button    |
| Basic Information     | No          | Inline    | Stroke count, JLPT, Joyo, Kentei, classification, radical |
| Readings              | No          | Inline    | On-yomi and kun-yomi lists with primary/common flags      |
| Meanings              | No          | Inline+   | Ordered meanings, related kanji, notes per meaning        |
| Components            | No          | Dialog    | Linked components (basic info only)                       |
| Vocabulary            | No          | Dialog    | Vocab using this kanji (basic info only)                  |
| Stroke Order          | Yes         | Inline    | Static diagram + animated GIF                             |
| Etymology Notes       | Yes         | Inline    | Historical origins, character development                 |
| Semantic Analysis     | Yes         | Inline    | Modern usage patterns, compound meanings                  |
| Education & Mnemonics | Yes         | Inline    | Japanese education methods, native mnemonics              |
| Personal Notes        | Yes         | Inline    | User's own observations and research                      |

### Key Behaviors

**Radical Linking:** Setting a radical via Basic Information section automatically creates a component occurrence with `is_radical=true`. This provides a shortcut while maintaining the component-occurrence model.

**Classification Display:** Classification badge (e.g., "形声文字") appears in Basic Information section, not in header. On list cards, classification badge is shown; JLPT/Joyo are hidden in favor of classification. Kentei remains visible.

**Component Linking:** Components section shows basic info (character, strokes, short_meaning, position, is_radical). Full occurrence analysis happens on the component page. See `04-component-system.md`.

**Vocabulary Linking:** Vocabulary section shows words using this kanji with readings. Full kanji breakdown analysis happens on the vocab page. See `05-vocabulary-system.md`.

---

## Component Page Structure

### Section Order

```
┌─────────────────────────────────────────────┐
│ [← Back to Component List]                  │
├─────────────────────────────────────────────┤
│ HEADER                                      │
│ 日                              [Edit]      │
│ 太陽、日                                    │
│ 🔍 (search_keywords indicator)              │
├─────────────────────────────────────────────┤
│ Basic Information                        ▸  │
│ Description                              ▸  │
│ Forms                                    ▸  │
│ Appears in Kanji (47)                    ▾  │
│ Groupings                                ▾  │
├─────────────────────────────────────────────┤
│ [Edit] [Delete]                             │
│ [← Back to Component List]                  │
└─────────────────────────────────────────────┘
```

### Section Specifications

| Section           | Collapsible | Edit Mode | Contains                                               |
| ----------------- | ----------- | --------- | ------------------------------------------------------ |
| Header            | No          | Linked    | Character, short_meaning, search_keywords, Edit button |
| Basic Information | No          | Inline    | Stroke count, source_kanji, kangxi info, radical info  |
| Description       | No          | Inline    | General semantic description                           |
| Forms             | No          | Dialog    | Visual variants (氵 vs 水), add/remove                 |
| Appears in Kanji  | Yes         | Inline    | Occurrence list with position, is_radical, notes       |
| Groupings         | Yes         | Dialog    | User pattern analysis groups                           |

### Key Behaviors

**Basic Information Structure:** Split into "General Attributes" (stroke count, source kanji) and "Radical Attributes" (can_be_radical, kangxi number/meaning, radical name). Radical attributes only display when `can_be_radical=true`.

**Occurrence Analysis:** Appears in Kanji section is collapsible (can list 50+ kanji). Each occurrence card is inline-editable (position, is_radical, notes). Filters available: position type, radical only, search. This is the **ownership page** for occurrence analysis.

**Forms System:** Forms section manages visual variants of the same semantic component (e.g., 水 standard vs 氵 sanzui). Add/remove via dialog. See `04-component-system.md`.

**Groupings System:** User-defined pattern analysis groups. Allows studying how components function across different contexts. See `04-component-system.md`.

---

## Vocabulary Page Structure

### Section Order

```
┌─────────────────────────────────────────────┐
│ [← Back to Vocabulary List]                 │
├─────────────────────────────────────────────┤
│ HEADER                                      │
│ 明日                            [Edit]      │
│ あした                                      │
│ 🔍 (search_keywords indicator)              │
├─────────────────────────────────────────────┤
│ Basic Information                        ▸  │
│ Meanings                                 ▸  │
│ Kanji Breakdown                          ▾  │
│ Usage Notes                              ▾  │
├─────────────────────────────────────────────┤
│ [Edit] [Delete]                             │
│ [← Back to Vocabulary List]                 │
└─────────────────────────────────────────────┘
```

### Section Specifications

| Section           | Collapsible | Edit Mode | Contains                                      |
| ----------------- | ----------- | --------- | --------------------------------------------- |
| Header            | No          | Linked    | Word, reading, search_keywords, Edit button   |
| Basic Information | No          | Inline    | Primary reading, JLPT, frequency, common flag |
| Meanings          | No          | Inline    | Full meaning text (can be multi-paragraph)    |
| Kanji Breakdown   | Yes         | Inline    | Constituent kanji with reading/role analysis  |
| Usage Notes       | Yes         | Inline    | Context, example sentences, nuance            |

### Key Behaviors

**Kanji Breakdown Analysis:** This is the **ownership page** for analyzing how kanji function in this word. Each kanji card shows: character, reading in word, reading type (on/kun or irregular), analysis notes. All inline-editable. See `05-vocabulary-system.md`.

**Auto-Detection:** When creating vocabulary, kanji are automatically detected from the word and linked (if they exist in the database).

**Meanings Not Collapsible:** Unlike kanji meanings (which are a short list of items), vocab meanings are full paragraph text. This is core content and should not be hidden, even though it can span multiple paragraphs.

---

## Cross-Page Consistency

### Header Pattern

All pages:

- Large character/word display (styled prominently)
- Short meaning displayed directly below
- Search keywords as subtle indicator (🔍 icon with tooltip/popover)
- Edit button (no other actions in header)

### Basic Information Pattern

All pages:

- Always first section after header
- Core identity: Character/word, stroke count/reading
- Classification/type/level information
- Reference IDs (JLPT, Joyo, Kentei, Kangxi, Frequency)
- Never collapsible

### Navigation Pattern

All pages:

- Back button at top (above header)
- Edit and Delete actions at bottom
  - Edit: secondary button variant
  - Delete: ghost button variant with increased spacing (spacing-lg) to prevent accidental clicks
- Back button at bottom (below actions)

Back buttons preserve filter state via URL query params.

### Notes Pattern

All pages (where applicable):

- Collapsible sections for lengthy text
- Inline editing (BaseInlineTextarea)
- Bottom collapse button when expanded
- Categorized by purpose (Etymology, Semantic, Personal, Usage, etc.)

---

## Relationship Display Patterns

### Linking Section (Basic Info Only)

**When:** Kanji page showing components; Kanji page showing vocabulary

**Display:** Card with character/word, stroke count, short_meaning, key metadata (position, is_radical for components; reading for vocab)

**Actions:**

- View → Navigate to entity's detail page
- Remove → Unlink (requires confirmation)
- Add → Dialog for search/create

**Edit:** Dialog-based (search existing or create new)

**Example:** Components section on kanji page

### Analysis Section (Deep Editing)

**When:** Component page showing occurrences; Vocab page showing kanji breakdown

**Display:** Same card structure as linking section, but with inline-editable fields

**Actions:**

- View → Navigate to entity's detail page
- Remove → Unlink (requires confirmation)
- Inline field editing → Save on blur/change

**Edit:** Inline per card (position, is_radical, notes for components; reading, type, notes for vocab)

**Example:** Appears in Kanji section on component page

This asymmetry is intentional per the entity ownership model (see `00-overview.md`).

---

## Implementation Notes

### Component Hierarchy

All pages follow this pattern:

```
[Entity]SectionDetail.vue (orchestrator)
├─ SharedBackButton (top)
├─ [Entity]DetailHeader (character, short_meaning, search_keywords)
├─ SharedSection "Basic Information"
│  └─ [Entity]DetailBasicInfo
├─ SharedSection "[Section Name]"
│  └─ [Entity]Detail[SectionName]
├─ ...more sections...
├─ Actions (Edit, Delete buttons)
└─ SharedBackButton (bottom)
```

### SharedSection Usage

```vue
<!-- Non-collapsible section -->
<SharedSection title="Basic Information">
  <KanjiDetailBasicInfo />
  <template #actions>
    <BaseButton @click="edit">Edit</BaseButton>
  </template>
</SharedSection>

<!-- Collapsible section -->
<SharedSection title="Occurrences" collapsible default-open>
  <ComponentOccurrenceList />
</SharedSection>
```

### Testing Strategy

- Unit tests for each section component
- E2E tests verify:
  - Back buttons at top and bottom
  - Collapsible behavior (expand/collapse)
  - Edit modes (inline vs dialog)
  - Navigation to linked entities
- Visual verification in headed Playwright mode

---

## Quick Reference: Section Edit Modes

| Edit Mode | When to Use                     | Implementation                   |
| --------- | ------------------------------- | -------------------------------- |
| Linked    | Header fields                   | Edit button → form dialog        |
| Inline    | Short fields, text areas, lists | Direct editing in section        |
| Dialog    | Search/create, complex forms    | Button → dialog with search/form |
| Inline+   | List with per-item dialogs      | Inline list + dialog per item    |

See `02-ui-patterns.md` for detailed editing patterns.
