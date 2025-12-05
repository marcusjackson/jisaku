# Post-MVP Task Breakdown

Organized into manageable, independent tasks that can be completed incrementally.

---

## 🔴 Critical Path (Must Do First)

### CP-1: Run Migration 003

- Run migration SQL file
- Verify data migrated correctly from `kanji_components` → `component_occurrences`
- Check all indexes created
- Verify classification_types and position_types prepopulated

**Blockers:** None
**Blocks:** Everything else

---

### CP-2: Update Database Service Layer

- Rename all `kanji_components` references to `component_occurrences`
- Update TypeScript types for new tables
- Update CRUD functions for component_occurrences
- Add position_type_id handling (instead of position enum string)
- Add classification_type_id handling (instead of classification_type enum)

**Blockers:** CP-1
**Blocks:** All UI work

---

### CP-3: Update Existing UI References

- Update component linking in kanji edit forms
- Fix any broken component display logic
- Ensure existing kanji detail/edit pages work with new schema
- Test that no TypeScript errors remain

**Blockers:** CP-2
**Blocks:** Nothing (safe to deploy after this)

---

## 📦 Phase 1: Component System Enhancement

### C-1: Component Forms - Database Layer

- Add CRUD operations for `component_forms` table
- Query helpers: get forms for component, get primary form
- TypeScript types for ComponentForm

**Blockers:** CP-2
**Blocks:** C-2

---

### C-2: Component Forms - UI

- Component detail page: forms section/tabs
- Create form dialog/page
- Edit form dialog/page
- Delete confirmation
- Mark primary form toggle

**Blockers:** C-1
**Blocks:** None

---

### C-3: Component Occurrences - Analysis Notes

- Add inline editing for `analysis_notes` on component detail page
- Add analysis notes field to component occurrence in kanji edit form
- Display analysis notes on kanji detail page (in component list)

**Blockers:** CP-3
**Blocks:** None

---

### C-4: Component Occurrences - Position Selector

- Replace position enum with position_type selector
- Fetch from `position_types` table
- Display position name on component detail page
- Show tooltip with position description

**Blockers:** CP-3
**Blocks:** None

---

### C-5: Component Occurrences - Radical Flag

- Add `is_radical` checkbox/toggle on kanji edit form
- Display radical indicator on kanji detail page
- Sync with `kanjis.radical_id` when toggling

**Blockers:** CP-3
**Blocks:** None

---

### C-6: Component Groupings - Database Layer

- Add CRUD operations for `component_groupings`
- Add CRUD operations for `component_grouping_members` (junction)
- Query helpers: get groupings for component, get occurrences in grouping

**Blockers:** CP-2
**Blocks:** C-7

---

### C-7: Component Groupings - UI

- Component detail page: groupings section
- Create grouping dialog
- Add occurrences to grouping (combobox or visual selector)
- Display grouped occurrences
- Edit grouping (name, analysis notes)
- Delete grouping confirmation
- Reorder occurrences within grouping

**Blockers:** C-6
**Blocks:** None

---

### C-8: Component List - Enhanced Filters

- Add "Can be radical" filter toggle
- Add "Never appears as radical" filter
- Add "Always appears as radical" filter
- Add sort by Kangxi number
- Add sort by Japanese radical name

**Blockers:** CP-3
**Blocks:** None

---

### C-9: Component Detail - Pagination

- Implement "Show More" pagination for occurrences
- Default show first 10-20 occurrences
- Load more button
- Optional: search within occurrences

**Blockers:** CP-3
**Blocks:** None

---

## 📝 Phase 2: Kanji Enhancements

### K-1: Kanji Notes Split - Database

- Already done in migration (notes_semantic, notes_education_mnemonics)
- Update TypeScript types
- Update database service CRUD

**Blockers:** CP-1
**Blocks:** K-2

---

### K-2: Kanji Notes Split - UI

- Rename "Cultural Context" section → "Semantic Analysis"
- Add "Education & Mnemonics" section
- Update kanji edit form with new fields
- Update kanji detail page display
- Position semantic analysis near vocab section

**Blockers:** K-1, CP-3
**Blocks:** None

---

### K-3: Kanji Sorting - Database Layer

- Add helper queries for each sort type
- Implement radical order (部首索引) query
- Implement reading order (音訓索引) query
- Implement custom identifier sort
- Add effective_radical_stroke_count computed field helper

**Blockers:** CP-2
**Blocks:** K-4

---

### K-4: Kanji Sorting - UI

- Add sort dropdown to kanji list page
- Options: Natural, Radical (部首), Reading (音訓), Custom ID, Stroke Count, JLPT, Joyo
- Save sort preference to local storage
- Update URL params with current sort

**Blockers:** K-3
**Blocks:** None

---

### K-5: Kanji Custom Identifier

- Add identifier field to kanji edit form
- Display identifier on kanji detail page
- Optional: auto-increment suggestion based on current max

**Blockers:** CP-3
**Blocks:** K-4 (for identifier sort)

---

### K-6: Kanji Radical Stroke Count

- Add radical_stroke_count field to kanji edit form
- Optional: auto-compute from component_occurrence's form stroke_count
- Display effective radical stroke count on kanji detail
- Show in tooltip: "Manual: X | Form: Y | Used: Z"

**Blockers:** CP-3
**Blocks:** K-4 (for radical sort)

---

### K-7: Kanji Kentei Level

- Add kanji_kentei_level dropdown to kanji edit form
- Options: 10級, 9級, 8級, 7級, 6級, 5級, 4級, 3級, 準2級, 2級, 準1級, 1級
- Display on kanji detail page
- Add filter on kanji list page

**Blockers:** CP-3
**Blocks:** None

---

### K-8: Kanji Classifications - Database Layer

- Already updated in migration (uses classification_types table)
- Update database service CRUD
- Query helper: get classifications with type details

**Blockers:** CP-1
**Blocks:** K-9

---

### K-9: Kanji Classifications - UI

- Update classification selector to use classification_types
- Show description_short in tooltip on hover
- Add kanji-specific notes field
- Multi-select with primary flag
- Link to classification type detail page

**Blockers:** K-8, CP-3
**Blocks:** None

---

## 🔧 Phase 3: Reference Data Management

### R-1: Classification Types - CRUD

- List page for classification_types (in Settings)
- Create new classification type
- Edit classification type (description, names)
- Delete classification type (with usage check)
- Reorder classifications

**Blockers:** CP-2
**Blocks:** None

---

### R-2: Position Types - CRUD

- List page for position_types (in Settings)
- Create new position type
- Edit position type (description, names)
- Delete position type (with usage check)
- Reorder positions

**Blockers:** CP-2
**Blocks:** None

---

### R-3: Settings Page Reorganization

- Rename "Settings" to "Settings & Reference"
- Add sections: App Settings, Classifications, Positions
- Add navigation/tabs for sections
- Keep existing import/export in App Settings

**Blockers:** R-1, R-2
**Blocks:** None

---

### R-4: Reference Data Tooltips

- Show description_short on hover over classifications
- Show description_short on hover over positions
- Click tooltip to navigate to full reference entry
- Implement in kanji edit form and component edit form

**Blockers:** R-1, R-2
**Blocks:** None

---

## 🎨 Phase 4: UI Polish

### U-1: Collapsible Filters (Kanji List)

- Make filters collapsible on mobile and desktop
- Default collapsed on mobile
- "Filters" button/accordion
- Save collapsed state to local storage
- Apply/Clear buttons

**Blockers:** CP-3
**Blocks:** None

---

### U-2: Component Detail - Forms Tabs

- If component has multiple forms, show as tabs or pills
- Each tab shows occurrences for that form
- Allow viewing all forms at once (optional)

**Blockers:** C-2
**Blocks:** None

---

### U-3: Kanji Detail - Semantic Analysis Positioning

- Move semantic analysis section near vocabulary section
- Visual grouping: "Usage Analysis" section containing semantic notes + vocab list
- Ensure good layout on mobile and desktop

**Blockers:** K-2
**Blocks:** None

---

### U-4: Loading States & Skeletons

- Add loading skeletons for component occurrences pagination
- Add loading indicators for sort operations
- Smooth transitions for collapsible sections

**Blockers:** None
**Blocks:** None

---

### U-5: Mobile Navigation Polish

- Optimize bottom nav for new sections
- Ensure reference data pages work well on mobile
- Test collapsible filters thoroughly

**Blockers:** None
**Blocks:** None

---

## 🧪 Phase 5: Testing & Validation

### T-1: Migration Testing

- Export database before migration
- Run migration on test database
- Verify counts match (occurrences = old kanji_components)
- Check foreign key integrity
- Test rollback if needed

**Blockers:** None (can test in parallel)
**Blocks:** CP-1

---

### T-2: Component System E2E Tests

- Test creating component with forms
- Test adding occurrences to kanji
- Test creating groupings
- Test per-occurrence analysis notes
- Test position selection

**Blockers:** C-2, C-3, C-4, C-7
**Blocks:** None

---

### T-3: Kanji System E2E Tests

- Test kanji with split notes
- Test kanji classifications with new system
- Test sorting by each sort type
- Test custom identifier
- Test radical stroke count

**Blockers:** K-2, K-4, K-5, K-6, K-9
**Blocks:** None

---

### T-4: Reference Data E2E Tests

- Test creating custom classification type
- Test creating custom position type
- Test editing prepopulated types
- Test deletion with usage check

**Blockers:** R-1, R-2
**Blocks:** None

---

## 📊 Task Summary

**Critical Path (must complete first):** 3 tasks
**Phase 1 (Component System):** 9 tasks
**Phase 2 (Kanji Enhancements):** 9 tasks
**Phase 3 (Reference Data):** 4 tasks
**Phase 4 (UI Polish):** 5 tasks
**Phase 5 (Testing):** 4 tasks

**Total:** 34 tasks

---

## 🎯 Recommended Order

1. **Week 1:** CP-1, CP-2, CP-3, T-1 (Critical path + migration testing)
2. **Week 2:** K-1, K-2, K-7, U-1 (Quick wins: notes split, kentei level, collapsible filters)
3. **Week 3:** C-3, C-4, C-5 (Component occurrence enhancements)
4. **Week 4:** K-3, K-4, K-5, K-6 (Kanji sorting system)
5. **Week 5:** C-1, C-2, U-2 (Component forms)
6. **Week 6:** C-6, C-7 (Component groupings)
7. **Week 7:** K-8, K-9 (Classifications with new system)
8. **Week 8:** R-1, R-2, R-3, R-4 (Reference data management)
9. **Week 9:** C-8, C-9, U-3, U-4, U-5 (Polish & finishing touches)
10. **Week 10:** T-2, T-3, T-4 (E2E testing)

---

## 💡 Notes

- Tasks are designed to be independently testable
- Most tasks can be completed in 1-3 hours
- Some complex tasks (C-7, K-4) may take 4-6 hours
- Can deploy to production after any completed task (after CP-3)
- Testing tasks can run in parallel with implementation
- Reference data management (Phase 3) is low priority - can defer if needed
