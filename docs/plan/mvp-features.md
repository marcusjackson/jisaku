# MVP Features

This document defines the feature specifications and acceptance criteria for the MVP release.

---

## Overview

The MVP focuses on **core kanji curation functionality**:

- Create and manage kanji entries
- Link components to kanji
- Search and filter the collection
- Export/import for data portability
- Offline-first PWA

**Explicitly excluded from MVP:**

- Readings (on'yomi, kun'yomi)
- Meanings/keywords
- Tagging system
- Story/etymology fields
- Advanced search queries
- Full-text search in notes

---

## Feature Specifications

### F1: Kanji List Page

**Route:** `/`

**Description:** Home page displaying all kanji entries with search and filter capabilities.

**Acceptance Criteria:**

- [x] Display all kanji in a responsive grid/table
- [x] Show kanji character prominently
- [x] Show stroke count for each entry
- [x] Show JLPT/Joyo level badges if set
- [x] Click kanji to navigate to detail page
- [x] "Add Kanji" button navigates to new kanji form
- [x] Empty state when no kanji exist

**Filter/Search:**

- [x] Filter by stroke count (range)
- [x] Filter by JLPT level (multi-select)
- [x] Filter by Joyo level (multi-select)
- [x] Filter by component (select from existing)
- [x] Filter by radical (select from existing)
- [x] Search by exact character match
- [x] Clear all filters button
- [x] Filters persist in URL query params

**Loading/Error States:**

- [x] Loading spinner on initial load
- [x] Error message if database fails to load
- [x] Empty state: "No kanji yet. Add your first one!"
- [x] No results state: "No kanji match your filters"

---

### F2: Kanji Detail Page

**Route:** `/kanji/:id`

**Description:** View full details of a single kanji entry.

**Acceptance Criteria:**

- [x] Display kanji character (large, prominent)
- [x] Display stroke count
- [x] Display radical (with link to radical info)
- [x] Display JLPT level badge
- [x] Display Joyo level badge
- [x] Display stroke diagram image (if set)
- [x] Display stroke GIF animation (if set)
- [x] Display linked components list
- [x] Display custom notes with three categories (etymology, cultural context, personal notes)
- [x] "Edit" button navigates to edit form
- [x] "Delete" button with confirmation dialog
- [x] Back button/link to list page

**Component Display:**

- [x] List all linked components
- [x] Each component shows character and short description
- [x] Click component to navigate to component detail

**Error States:**

- [x] 404 state if kanji ID not found
- [x] Error toast if delete fails

---

### F3: Kanji Create Page

**Route:** `/kanji/new`

**Description:** Form to create a new kanji entry.

**Acceptance Criteria:**

- [x] Character input (required, single character)
- [x] Stroke count input (required, positive integer 1-64)
- [x] Radical selector (optional, from existing radicals)
- [x] JLPT level selector (optional, N5-N1)
- [x] Joyo level selector (optional, elementary1-secondary)
- [x] Stroke diagram image upload (optional)
- [x] Stroke GIF upload (optional)
- [x] Components selector (optional, multi-select from existing)
- [x] Custom notes (optional, three categories: etymology, cultural context, personal notes)
- [x] Save button
- [x] Cancel button (with unsaved changes warning)
- [x] On save success: navigate to detail page, show success toast
- [x] On save error: show error toast, stay on form

**Validation:**

- [x] Character: required, single character, unique
- [x] Stroke count: required, integer between 1-64
- [x] Inline validation errors displayed below fields
- [x] Form cannot submit with validation errors

---

### F4: Kanji Edit Page

**Route:** `/kanji/:id/edit`

**Description:** Form to edit an existing kanji entry.

**Acceptance Criteria:**

- [x] Pre-fill form with existing kanji data
- [x] Same fields as create form (including custom notes categories)
- [x] Same validation as create form
- [x] Save button
- [x] Cancel button (with unsaved changes warning if changes made)
- [x] On save success: navigate to detail page, show success toast
- [x] On save error: show error toast, stay on form

---

### F5: Kanji Delete

**Trigger:** Delete button on detail page or list page

**Acceptance Criteria:**

- [x] Confirmation dialog: "Delete this kanji? This cannot be undone."
- [x] Confirm button deletes kanji
- [x] Cancel button closes dialog
- [x] On delete success: navigate to list, show success toast
- [x] On delete error: show error toast
- [x] Deleting kanji removes it from kanji_components junction table

---

### F6: Component List Page

**Route:** `/components`

**Description:** View and manage all components.

**Acceptance Criteria:**

- [x] Display all components in list/grid
- [x] Show component character
- [x] Show short description
- [x] Show source kanji (if linked)
- [x] Click to view component detail
- [x] "Add Component" button
- [x] Empty state when no components

---

### F7: Component Detail Page

**Route:** `/components/:id`

**Description:** View and edit a single component.

**Acceptance Criteria:**

- [x] Display component character (large)
- [x] Display stroke count
- [x] Display short description
- [x] Display Japanese name
- [x] Display full description
- [x] Display source kanji (with link)
- [x] Display list of kanji that use this component
- [x] Edit button opens edit form/dialog
- [x] Delete button with confirmation

---

### F8: Component CRUD

**Description:** Create, edit, delete components.

**Create (dialog or page):**

- [x] Character input (required)
- [x] Stroke count (required, positive integer)
- [x] Source kanji selector (optional)
- [x] Short description (optional)
- [x] Japanese name (optional)
- [x] Full description (optional)

**Edit:**

- [x] Same fields as create, pre-filled

**Delete:**

- [x] Confirmation dialog
- [x] Removes from kanji_components junction
- [x] Does not delete linked kanji

---

### F9: Settings Page

**Route:** `/settings`

**Description:** App settings and database management.

**Acceptance Criteria:**

- [x] Export database button
  - Downloads SQLite file
  - Filename includes timestamp
- [x] Import database button
  - File picker for .db file
  - Confirmation dialog: "This will replace all data. Continue?"
  - Validates file is valid SQLite
  - Runs pending migrations on import
  - Success/error toast
- [x] App version display
- [x] Clear all data button (with confirmation)

**Dev Tools (temporary):**

- [x] Seed data button (for development testing)

---

### F9a: Custom Notes System (Structured)

**Description:** Structured note-taking with three predefined categories per kanji.

**Acceptance Criteria:**

- [x] Three note categories available:
  - [x] Etymology — Historical origins and character evolution
  - [x] Cultural context — Cultural significance and usage context
  - [x] Personal notes — User's own observations and mnemonics
- [x] Each category has its own text field (optional)
- [x] All categories display on kanji detail page (if populated)
- [x] Edit form allows editing all three note categories
- [x] Empty note fields do not display on detail page
- [x] Notes persist to database correctly
- [x] Database schema supports note categories (via separate table or columns)

---

### F10: PWA Functionality

**Description:** Progressive Web App capabilities.

**Acceptance Criteria:**

- [x] Service worker caches app shell
- [x] App works fully offline after first load
- [x] Web app manifest enables install prompt
- [x] App can be installed to home screen
- [x] Opens in standalone mode (no browser chrome)
- [x] App icon displays correctly
- [x] Database persists across sessions (IndexedDB)

---

### F11: Radical Management (Minimal)

**Description:** Basic radical support for MVP.

**Acceptance Criteria:**

- [x] Radicals can be created inline when creating kanji
- [x] Radical selector shows existing radicals
- [x] Basic radical info displayed on kanji detail
- [x] No dedicated radical management page (post-MVP)

---

## UI/UX Requirements

### Navigation

- [x] Header with app name and nav links
- [x] Nav links: Home (list), Components, Settings
- [x] Current page indicated in nav

### Responsive Design

- [x] Mobile-first approach
- [x] Usable on 320px width
- [x] Grid adjusts columns based on viewport

### Loading States

- [x] No layout shift during loading
- [x] Centered spinner for page loads
- [x] Inline spinner for button actions

### Error Handling

- [x] Toast notifications for operation feedback
- [x] Inline errors for form validation
- [x] Graceful degradation for missing data

### Accessibility

- [x] All interactive elements keyboard accessible
- [x] Focus visible styles
- [x] ARIA labels on icon-only buttons
- [x] Color contrast meets WCAG AA
- [x] Form labels associated with inputs

---

## Technical Requirements

### Database

- [x] SQLite via sql.js
- [x] Initial schema migration runs on first load
- [x] Database persisted to IndexedDB
- [x] Database loads on app start

### Performance

- [ ] Initial bundle < 500KB gzipped
- [ ] Time to interactive < 3s on 3G
- [x] Smooth scrolling with 100+ kanji

### Browser Support

- [x] Chrome/Edge (latest 2 versions)
- [x] Firefox (latest 2 versions)
- [x] Safari (latest 2 versions)

---

## Definition of Done

A feature is complete when:

1. All acceptance criteria are met
2. Component tests pass
3. E2E test covers happy path
4. No TypeScript errors
5. No ESLint/Stylelint errors
6. Responsive on mobile and desktop
7. Keyboard accessible
8. Loading and error states handled
9. Code reviewed and approved

---

## Post-MVP Features

These are explicitly **not** in MVP but planned for future:

| Feature            | Priority | Notes                              |
| ------------------ | -------- | ---------------------------------- |
| Readings (on/kun)  | High     | Separate table, multiple per kanji |
| Meanings           | High     | Multiple meanings per kanji        |
| Tagging            | Medium   | Flexible categorization            |
| Story/etymology    | Medium   | Rich text notes                    |
| Advanced search    | Medium   | Complex query builder              |
| Full-text search   | Low      | Search within notes                |
| Dark mode          | Low      | Theme toggle                       |
| Keyboard shortcuts | Low      | Power user features                |
