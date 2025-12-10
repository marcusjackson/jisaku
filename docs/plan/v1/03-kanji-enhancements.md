# V1 Kanji Enhancements

Readings, meanings, and classifications—all fully managed on the kanji page.

---

## Kanji Page Sections

| Section         | Collapsible? | Edit Mode | Notes                                   |
| --------------- | ------------ | --------- | --------------------------------------- |
| Basic Info      | No           | Inline    | Strokes, JLPT, Joyo, Kentei             |
| Short Meaning   | No           | Inline    | Single field (already done)             |
| Readings        | No           | Inline    | On/kun lists, short                     |
| Meanings        | No           | Inline+   | List short, analysis collapsible        |
| Classifications | No           | Dialog    | Select types, add notes                 |
| Components      | No           | Dialog    | Basic linking (see 02-component-system) |
| Vocabulary      | No           | Dialog    | Basic linking (see 04-vocabulary)       |
| Notes           | Yes          | Inline    | Etymology, semantic, personal           |

---

## Readings System

### Data Model (Existing)

**on_readings**: kanji_id, reading (katakana), is_primary, is_common, notes, display_order

**kun_readings**: kanji_id, reading (hiragana), okurigana, is_primary, is_common, notes, display_order

### Display

```
Readings                                    [Edit]
─────────────────────────────────────────────────
On-yomi:
  メイ ★  common          ← primary marked
  ミョウ   common
  ミン     rare

Kun-yomi:
  あ.かり ★               ← dot marks okurigana start
  あ.かるい
  あき.らか
```

### Edit Mode

Inline editing with add/remove:

```
Readings                          [Save] [Cancel]
─────────────────────────────────────────────────
On-yomi:                               [+ Add]
┌─────────────────────────────────────────────┐
│ [メイ______] ☑Primary ☑Common         [✕] │
│ Notes: [Most common reading_____]           │
├─────────────────────────────────────────────┤
│ [ミョウ____] ☐Primary ☑Common         [✕] │
│ Notes: [Used in 明日 (みょうにち)]          │
└─────────────────────────────────────────────┘

Kun-yomi:                              [+ Add]
┌─────────────────────────────────────────────┐
│ Reading: [あか____] Okurigana: [り__]       │
│ ☑Primary ☑Common                      [✕] │
└─────────────────────────────────────────────┘
```

### Validation

- On-yomi: Katakana only
- Kun-yomi: Hiragana only
- Okurigana: Hiragana only
- Warning if no primary reading marked

---

## Meanings System

### Data Model (Existing)

**kanji_meanings**: kanji_id, meaning_text, language ('ja'/'en'), on_reading_id, kun_reading_id, display_order, notes

**kanji_meaning_related_kanji**: meaning_id, related_kanji_id, relationship_type ('similar'/'opposite')

### Design (Kanjipedia Style)

- Japanese meanings first, ordered by frequency
- Meanings can be tied to specific readings
- Similar (類) and opposite (対) kanji references
- Notes for usage examples

### Display

List itself is NOT collapsible. Individual meaning notes/analysis CAN be collapsed if lengthy.

```
Meanings                                    [Edit]
─────────────────────────────────────────────────
1. あかるい。光がある。
   Example: 明るい部屋
   類: 亮、晃、昭  対: 暗

2. あきらか。はっきりしている。
   Related reading: メイ

3. 夜があけること。よあけ。
   Example: 明ける

4. 次の。あくる。
   Example: 明日
```

### Edit Mode

Reorder by drag, edit via inline expansion or dialog:

```
Meanings                          [Save] [Cancel]
─────────────────────────────────────────────────
Drag to reorder (most common first)    [+ Add]

┌─────────────────────────────────────────────┐
│ ≡ 1.                                        │
│ Meaning: [あかるい。光がある。____]         │
│ Language: [日本語 ▼]                        │
│ Reading: [—なし— ▼]                         │
│ Related: 類: [亮][晃][昭][+] 対: [暗][+]   │
│ Notes: [Example: 明るい部屋___]             │
│                                    [✕]      │
└─────────────────────────────────────────────┘
```

### Related Kanji Selector

Search existing kanji by character or meaning, or quick-create new.

---

## Classifications System

### Data Model (Existing)

**classification_types** (prepopulated):

- pictograph (象形文字)
- ideograph (指事文字)
- compound_ideograph (会意文字)
- phono_semantic (形声文字)

**kanji_classifications**: kanji_id, classification_type_id, is_primary, notes

### Display

Badge in Basic Info section:

```
明  8画  N4  小2  9級  [形声文字]
bright, clear
```

Tooltip/popover on badge click:

```
┌─────────────────────────────────┐
│ 形声文字 (Phono-semantic)       │
│ Combines meaning + sound        │
│ components.                     │
│                                 │
│ Notes: 日 provides meaning,     │
│ 月 provides sound (originally). │
└─────────────────────────────────┘
```

### Edit Mode (Dialog)

```
┌─────────────────────────────────────────────┐
│ Edit Classification                         │
├─────────────────────────────────────────────┤
│ ☐ 象形文字 (Pictograph)                     │
│ ☐ 指事文字 (Ideograph)                      │
│ ☐ 会意文字 (Compound ideograph)             │
│ ☑ 形声文字 (Phono-semantic) ★ Primary       │
│                                             │
│ Notes:                                      │
│ [日 provides meaning, 月 sound____]         │
│                                             │
│                  [Cancel] [Save]            │
└─────────────────────────────────────────────┘
```

Multi-select allowed (rare, but some kanji have disputed classifications).

---

## Notes Sections

**Collapsible** - can contain lengthy analysis.

Three note types:

1. **Etymology notes**: Character origin, historical development
2. **Semantic notes**: Meaning patterns, mnemonics
3. **Personal notes**: User's own observations

Each is a separate collapsible section with BaseInlineTextarea for editing.
