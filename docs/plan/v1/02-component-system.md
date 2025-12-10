# V1 Component System

Component page as the hub for occurrence analysis. Kanji page shows basic linking only.

---

## Core Principle

**Component page owns occurrence analysis.** When analyzing "how does 水 behave across kanji?", that analysis happens on the 水 component page—not scattered across 50 kanji pages.

| Page           | Can Do                                   | Cannot Do                |
| -------------- | ---------------------------------------- | ------------------------ |
| Kanji page     | View/add/remove component links          | Edit occurrence metadata |
| Component page | Full occurrence analysis, inline editing | N/A                      |

---

## Kanji Page: Components Section

### Display (View Mode)

Shows linked components with basic info. **Not collapsible** (limited count per kanji).

```
▼ Components                                [Edit]
┌─────────────────────────────────────────────────┐
│ 日  sun, day                                    │
│ 偏 (hen) • 🔶 Radical                           │
│                                        [View →] │
├─────────────────────────────────────────────────┤
│ 月  moon, month                                 │
│ 旁 (tsukuri)                                    │
│                                        [View →] │
└─────────────────────────────────────────────────┘

ⓘ To edit position or analysis, click View to go to component page.
```

### Edit Mode

Enables adding/removing links. Remove requires confirmation.

```
▼ Components                          [Save] [Cancel]
┌─────────────────────────────────────────────────┐
│ 日  sun, day                              [✕]   │
│ 偏 (hen) • 🔶 Radical                           │
├─────────────────────────────────────────────────┤
│ 月  moon, month                           [✕]   │
│ 旁 (tsukuri)                                    │
└─────────────────────────────────────────────────┘
[+ Add Component]
```

### Adding Component

1. Click "+ Add Component"
2. Search by character or meaning
3. Select existing → link created with default values
4. "Create New" → quick-create dialog → navigate to component page

**Default occurrence values:**

- position_type_id: NULL (unset)
- is_radical: false
- analysis_notes: NULL

---

## Component Page: Occurrences Section

Full occurrence analysis with inline editing. **Collapsible** (can list 50+ kanji).

### Display

```
▼ Appears in Kanji (47)                    [+ Add]
Filters: [Position ▼] [Radical only ☐] [Search...]
─────────────────────────────────────────────────
┌─────────────────────────────────────────────────┐
│ 明  bright, clear                      [→] [✕] │
│ Position: [偏 (hen)      ▼]                     │
│ ☑ Is Radical                                    │
│ Notes: [Provides meaning element______]         │
├─────────────────────────────────────────────────┤
│ 晴  clear weather                      [→] [✕] │
│ Position: [偏 (hen)      ▼]                     │
│ ☑ Is Radical                                    │
│ Notes: [________________________]               │
├─────────────────────────────────────────────────┤
│ 時  time, hour                         [→] [✕] │
│ Position: [偏 (hen)      ▼]                     │
│ ☑ Is Radical                                    │
│ Notes: [Time measured by sun_________]          │
└─────────────────────────────────────────────────┘
[Load more... (44 remaining)]
                                      [▲ Collapse]
```

### Inline Editing

Each occurrence card is directly editable:

- **Position dropdown**: Save on change
- **Is Radical checkbox**: Toggle immediately
- **Notes textarea**: Save on blur (debounced)

No separate edit dialog needed.

### Filtering

For components appearing in many kanji:

```typescript
interface OccurrenceFilters {
  positionTypeId: number | null
  isRadicalOnly: boolean
  search: string // kanji character or meaning
}
```

### Adding Kanji

1. Click "+ Add"
2. Search kanji by character or meaning
3. Select existing → occurrence created with defaults
4. "Create New" → quick-create dialog → navigate to kanji page

---

## Position Types

Standard position types from database:

| ID  | Name    | Japanese | Description      |
| --- | ------- | -------- | ---------------- |
| 1   | hen     | 偏       | Left side        |
| 2   | tsukuri | 旁       | Right side       |
| 3   | kanmuri | 冠       | Top (crown)      |
| 4   | ashi    | 脚       | Bottom (legs)    |
| 5   | tare    | 垂       | Top-left hanging |
| 6   | nyou    | 繞       | Left-bottom wrap |
| 7   | kamae   | 構       | Enclosure        |

---

## Component Quick-Create

From kanji page:

```
┌─────────────────────────────────────────────┐
│ Quick Create Component                      │
├─────────────────────────────────────────────┤
│ Character: [___]                            │
│ Strokes:   [___]                            │
│ Meaning:   [_______________]                │
│ ☐ Can be radical                            │
│                                             │
│ ⓘ Add forms and analyze occurrences on     │
│   the component page.                       │
│                                             │
│                  [Cancel] [Create & View]   │
└─────────────────────────────────────────────┘
```

---

## Component Forms (Future)

Forms represent visual variants of the same semantic component.

Example: 水 (water)

- 水 (standard, 4 strokes)
- 氵 (sanzui, 3 strokes) - left-side variant
- 氺 (shitamizu) - bottom variant

UI: Forms section on component page, managed separately from occurrences.

---

## Component Groupings (Future)

Pattern analysis for studying how components function:

- Group components by semantic meaning
- Group kanji by shared component patterns
- User-defined study groups
