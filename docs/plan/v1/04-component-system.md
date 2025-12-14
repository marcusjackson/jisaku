# V1 Component System

Component page as the hub for occurrence analysis, forms, and groupings.

---

## Core Principle

**Component page owns occurrence analysis.** When analyzing "how does 日 behave across kanji?", that analysis happens on the 日 component page—not scattered across 50+ kanji pages.

| Page           | Can Do                              | Cannot Do                |
| -------------- | ----------------------------------- | ------------------------ |
| Kanji page     | View/add/remove component links     | Edit occurrence metadata |
| Component page | Full occurrence analysis + patterns | N/A                      |

---

## Component-Specific Sections

Beyond basic info and description, component pages have:

| Section          | Purpose                                     | Collapsible |
| ---------------- | ------------------------------------------- | ----------- |
| Forms            | Visual variants (氵 vs 水)                  | No          |
| Appears in Kanji | Occurrence list with position/radical/notes | Yes         |
| Groupings        | User-defined pattern analysis groups        | Yes         |

---

## Basic Information Section

Component Basic Information is split into two subsections:

### General Attributes (Always Displayed)

- Stroke count
- Source kanji (if component is derived from a specific kanji)

### Radical Attributes (Conditional Display)

Only shown when `can_be_radical=true`:

- Can be radical (checkbox/toggle)
- Kangxi number (e.g., 72)
- Kangxi meaning (e.g., "sun, day")
- Radical name (e.g., ひ, hi)

### Display

```
Basic Information                           [Edit]
─────────────────────────────────────────────────
General Attributes:
  Stroke Count: 4
  Source Kanji: 日 →

Radical Attributes:
  Can be Radical: Yes 🔶
  Kangxi Number: 72
  Kangxi Meaning: sun, day
  Radical Name: ひ (hi)
```

**When `can_be_radical=false`:**

```
Basic Information                           [Edit]
─────────────────────────────────────────────────
General Attributes:
  Stroke Count: 4
  Source Kanji: 日 →
  Can be Radical: No
```

### Edit Mode

```
Basic Information                 [Save] [Cancel]
─────────────────────────────────────────────────
Stroke Count: [4__]
Source Kanji: [Search or select_____▼]

☑ Can be Radical

Radical Attributes:
  Kangxi Number: [72__]
  Kangxi Meaning: [sun, day________]
  Radical Name: [ひ__] (reading)
```

**Behavior:** Radical attribute fields appear/disappear based on checkbox state.

---

## Description Section

General semantic meaning of the component across contexts.

```
Description                                 [Edit]
─────────────────────────────────────────────────
Represents the sun or day. Used in kanji
related to light, time, and brightness.
```

**Edit:** Inline with BaseInlineTextarea (not collapsible, but can be multi-line).

---

## Forms System

Forms represent visual variants of the same semantic component. Example: 水 (water) has forms 水, 氵 (sanzui), 氺 (shitamizu).

### Data Model

**component_forms**

| Field          | Type    | Notes                                     |
| -------------- | ------- | ----------------------------------------- |
| id             | INTEGER | Primary key                               |
| component_id   | INTEGER | Foreign key to components (parent)        |
| form_character | TEXT    | Unicode character of variant form         |
| form_name      | TEXT    | Name of form (e.g., "sanzui", "standard") |
| stroke_count   | INTEGER | Strokes in this variant                   |
| usage_notes    | TEXT    | When/where this form is used              |
| display_order  | INTEGER | Order for display                         |

### Display

```
Forms                                    [+ Add]
─────────────────────────────────────────────────
Standard form:
  水  (standard, 4 strokes)

Variants:
  氵  (sanzui, 3 strokes)
  Used on left side of kanji

  氺  (shitamizu, 4 strokes)
  Used at bottom of kanji
```

### Edit Mode (Dialog)

```
┌─────────────────────────────────────────────┐
│ Add Form Variant                            │
├─────────────────────────────────────────────┤
│ Character: [氵__]                           │
│ Form Name: [sanzui________]                 │
│ Stroke Count: [3__]                         │
│ Usage Notes:                                │
│ [Used on left side of kanji, represents     │
│  water in compounds like 海, 泳, 流____]    │
│                                             │
│                  [Cancel] [Add]             │
└─────────────────────────────────────────────┘
```

**Validation:**

- Form character required (must be single Unicode character)
- Form name required
- Stroke count required (positive integer)
- Form character must be unique for this component

---

## Occurrences System

Appears in Kanji section lists all kanji that use this component. This is the **ownership page** for occurrence analysis.

### Data Model

**component_kanji** (already exists)

| Field            | Type    | Notes                                |
| ---------------- | ------- | ------------------------------------ |
| id               | INTEGER | Primary key                          |
| component_id     | INTEGER | Foreign key to components            |
| kanji_id         | INTEGER | Foreign key to kanjis                |
| position_type_id | INTEGER | Foreign key to position_types        |
| is_radical       | BOOLEAN | Is this component the radical?       |
| analysis_notes   | TEXT    | Role/function in this specific kanji |
| display_order    | INTEGER | Order for display                    |

**position_types** (prepopulated)

| ID  | Name    | Japanese | Description      |
| --- | ------- | -------- | ---------------- |
| 1   | hen     | 偏       | Left side        |
| 2   | tsukuri | 旁       | Right side       |
| 3   | kanmuri | 冠       | Top (crown)      |
| 4   | ashi    | 脚       | Bottom (legs)    |
| 5   | tare    | 垂       | Top-left hanging |
| 6   | nyou    | 繞       | Left-bottom wrap |
| 7   | kamae   | 構       | Enclosure        |

### Display

```
Appears in Kanji (47)                [+ Add] [▼ Collapse]
─────────────────────────────────────────────────
Filters: [Position ▼] [☐ Radical only] [Search...]

┌─────────────────────────────────────────────┐
│ 明  8画  明るい                       [→][✕]│
│ Position: [偏 (hen)      ▼]                 │
│ ☑ Is Radical                                │
│ Notes: [Provides meaning element____]       │
├─────────────────────────────────────────────┤
│ 晴  12画  晴れ                        [→][✕]│
│ Position: [偏 (hen)      ▼]                 │
│ ☑ Is Radical                                │
│ Notes: [_________________________]          │
├─────────────────────────────────────────────┤
│ 時  10画  時間                        [→][✕]│
│ Position: [偏 (hen)      ▼]                 │
│ ☑ Is Radical                                │
│ Notes: [Time measured by sun_____]          │
└─────────────────────────────────────────────┘

[Load more... (44 remaining)]
```

**Collapsible:** Yes (can list 50+ kanji).

**Bottom collapse button:** When expanded, show collapse button at bottom of list.

### Inline Editing

Each occurrence card is directly editable:

- **Position dropdown**: Save on change
- **Is Radical checkbox**: Toggle immediately (optimistic update)
- **Notes textarea**: Save on blur (debounced 500ms)

**No separate edit mode needed.** Fields are always editable inline.

### Filtering

```typescript
interface OccurrenceFilters {
  positionTypeId: number | null // Filter by position
  isRadicalOnly: boolean // Show only where is_radical=true
  search: string // Search kanji character or short_meaning
}
```

**Implementation:** Filters applied client-side after loading all occurrences (or server-side if count is very high).

### Adding Kanji

1. Click "+ Add"
2. SharedEntitySearch dialog opens
3. Search kanji by character or short_meaning
4. Select existing → occurrence created with defaults:
   - position_type_id: NULL
   - is_radical: false
   - analysis_notes: NULL
5. "Create New" → quick-create kanji → navigate to kanji page

**Defaults explanation:** User will fill in position and notes after linking. Most components are not radicals by default.

### Removing Kanji

1. Click [✕] on occurrence card
2. Confirmation dialog:
   > Remove 明 from this component?
   > Position and analysis notes will be lost.
3. Confirm → occurrence deleted

---

## Groupings System

User-defined groups for pattern analysis. Allows studying how components function in different contexts.

### Data Model

**component_groupings**

| Field        | Type    | Notes                                   |
| ------------ | ------- | --------------------------------------- |
| id           | INTEGER | Primary key                             |
| component_id | INTEGER | Foreign key to components               |
| name         | TEXT    | User-defined name (e.g., "Water words") |
| description  | TEXT    | Purpose/pattern being studied           |
| created_at   | TEXT    | Timestamp                               |

**component_grouping_kanji**

| Field       | Type    | Notes                              |
| ----------- | ------- | ---------------------------------- |
| id          | INTEGER | Primary key                        |
| grouping_id | INTEGER | Foreign key to component_groupings |
| kanji_id    | INTEGER | Foreign key to kanjis              |
| notes       | TEXT    | Why this kanji is in this group    |

### Use Cases

- **Semantic grouping:** "Water words" (海, 泳, 流, 湖, etc.)
- **Position grouping:** "日 on left side" vs "日 on right side"
- **Frequency grouping:** "Common kanji with 日" vs "Rare kanji with 日"
- **Learning grouping:** "N5 kanji with 人" for study focus

### Display

```
Groupings                            [+ Create] [▼ Collapse]
─────────────────────────────────────────────────
┌─────────────────────────────────────────────┐
│ Water in Motion (5 kanji)            [Edit] │
│ Kanji where 水 represents active water      │
│ 泳 流 洗 注 漕                              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Water Bodies (3 kanji)               [Edit] │
│ Static bodies of water                      │
│ 海 湖 池                                    │
└─────────────────────────────────────────────┘
```

**Collapsible:** Yes (can have many groupings).

### Edit Mode (Dialog)

```
┌─────────────────────────────────────────────┐
│ Edit Grouping: Water in Motion             │
├─────────────────────────────────────────────┤
│ Name: [Water in Motion_____________]        │
│ Description:                                │
│ [Kanji where 水 represents active water,    │
│  verbs and processes involving water___]    │
│                                             │
│ Kanji in this group:                   [+]  │
│ ┌───────────────────────────────────────┐  │
│ │ 泳  8画  泳ぐ                   [✕]   │  │
│ │ Notes: Swimming, movement in water    │  │
│ ├───────────────────────────────────────┤  │
│ │ 流  10画  流れる                [✕]   │  │
│ │ Notes: Flow, continuous movement      │  │
│ └───────────────────────────────────────┘  │
│                                             │
│                  [Delete] [Cancel] [Save]   │
└─────────────────────────────────────────────┘
```

**Features:**

- Name and description fields
- List of kanji with notes per kanji
- Add kanji via search
- Remove kanji from grouping (not from database)
- Delete entire grouping (with confirmation)

---

## Kanji Page: Components Section

On the kanji page, the Components section shows **basic info only**. Full analysis happens on the component page.

### Display (View Mode)

```
Components                                 [Edit]
─────────────────────────────────────────────────
┌─────────────────────────────────────────────┐
│ 日  4画  太陽、日                      [→] │
│ 偏 (hen) • 🔶 Radical                       │
├─────────────────────────────────────────────┤
│ 月  4画  月                            [→] │
│ 旁 (tsukuri)                                │
└─────────────────────────────────────────────┘

ⓘ To edit position or analysis, click → to go to component page.
```

### Edit Mode

```
Components                      [Save] [Cancel]
─────────────────────────────────────────────────
┌─────────────────────────────────────────────┐
│ 日  4画  太陽、日                      [✕] │
│ 偏 (hen) • 🔶 Radical                       │
├─────────────────────────────────────────────┤
│ 月  4画  月                            [✕] │
│ 旁 (tsukuri)                                │
└─────────────────────────────────────────────┘
[+ Add Component]
```

**Key behaviors:**

- **View mode:** No remove option (safety)
- **Edit mode:** Remove button (with confirmation)
- **No inline editing** of position/is_radical/notes (owned by component page)
- **Navigate to component:** View button → navigate to component detail page

### Adding Component (Kanji Page)

1. Click "+ Add Component"
2. SharedEntitySearch dialog
3. Search existing or create new
4. Link created with defaults (position: NULL, is_radical: false)
5. User navigates to component page to fill in position/analysis

---

## Integration with Kanji Radical

When a radical is set on a kanji via Basic Information section:

1. Radical dropdown shows components where `can_be_radical=true`
2. On selection, component occurrence is created with `is_radical=true`
3. Component appears in Components section with 🔶 indicator

**Reverse:** Removing radical from Basic Information removes the component occurrence entirely (not just the is_radical flag).

**Alternative flow:** User can manually add a component via Components section and check "Is Radical" on the component page. Both approaches are valid.

---

## Quick Reference: Component Section Order

1. Header (character, short_meaning, search_keywords)
2. Basic Information (strokes, source kanji, kangxi, radical attributes)
3. Description (semantic meaning)
4. **Forms** (visual variants)
5. **Appears in Kanji** (occurrence list, collapsible)
6. **Groupings** (user-defined groups, collapsible)

Sections 4-6 are new in V1 (bolded above).

---

## Implementation Notes

### Occurrence Editing Performance

With 50+ occurrences, debounced auto-save is critical:

```typescript
// Save notes after 500ms of no typing
const debouncedSave = useDebounceFn(
  async (occurrenceId: number, notes: string) => {
    await updateOccurrence(occurrenceId, { analysis_notes: notes })
  },
  500
)
```

**Position and is_radical** save immediately (simpler updates, less frequent).

### Pagination Consideration

If a component appears in 100+ kanji, implement "Load More" button instead of loading all at once.

**Threshold:** Load first 50, then paginate.

### Grouping UI Patterns

Groupings are an advanced feature. Consider:

- Collapsed by default
- Help text explaining use cases
- Example groupings in seed data
- Tutorial/guide in docs

Users may not immediately understand the value—show examples of pattern analysis.
