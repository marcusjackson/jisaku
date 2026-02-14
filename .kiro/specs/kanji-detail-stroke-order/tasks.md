# Implementation Plan

## Overview

Implementation tasks for the kanji-detail-stroke-order feature. Tasks are ordered for incremental delivery: base components first, then shared components, then module-specific components, and finally integration.

---

## Tasks

### Base Components

- [x] 1. Create BaseFileInput component for file uploads with preview
- [x] 1.1 (P) Implement core file input functionality
  - Create drop zone with drag-and-drop support
  - Convert uploaded files to Uint8Array for storage
  - Generate preview from uploaded data using blob URLs
  - Track and revoke blob URLs on data change and unmount
  - _Requirements: 3.1, 3.4, 5.1, 5.2, 5.3_

- [x] 1.2 (P) Add validation and accessibility features
  - Implement size validation with warning and hard limits (500KB warning, 2MB max)
  - Display error states for file too large or invalid type
  - Add accept filter prop for file type restrictions
  - Ensure keyboard accessibility (focusable, activatable via Enter/Space)
  - Add proper label association for screen readers
  - _Requirements: 3.2, 3.3, 6.5_

- [x] 1.3 Add unit tests for BaseFileInput
  - Test file upload and preview generation
  - Test drag-and-drop functionality
  - Test size validation warnings and errors
  - Test accept filter enforcement
  - Test keyboard interaction
  - _Requirements: 7.6_

---

### Shared Components

- [x] 2. Create ImageLightbox component for fullscreen image viewing
- [x] 2.1 (P) Implement lightbox overlay with accessibility
  - Create fullscreen overlay using Reka UI Dialog primitives
  - Display image centered with natural dimensions
  - Implement close on backdrop click and close button
  - Handle Escape key to close
  - Trap focus within dialog while open
  - _Requirements: 2.4, 2.7, 6.2, 6.3, 6.4_

- [x] 2.2 (P) Add touch and mouse zoom/pan support
  - Enable native touch zoom via CSS touch-action (pinch-zoom, pan-x, pan-y)
  - Allow scrolling/panning within the lightbox container
  - Preserve GIF animation playback
  - Ensure consistent behavior on mobile and desktop
  - _Requirements: 2.5, 2.6, 2.8, 2.9_

- [x] 2.3 Add unit tests for ImageLightbox
  - Test open/close state transitions
  - Test keyboard handling (Escape closes)
  - Test backdrop click closes
  - Test focus trap behavior
  - _Requirements: 7.6_

---

### Module Composables

- [x] 3. Create blob URL lifecycle management composable
- [x] 3.1 Implement useBlobUrl composable
  - Accept reactive data source (Ref or getter function)
  - Create blob URL from Uint8Array data
  - Detect MIME type from magic bytes (PNG, JPEG, GIF)
  - Watch for data changes and revoke previous URL before creating new
  - Revoke URL on component unmount
  - Return reactive URL ref
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 3.2\* Add unit tests for useBlobUrl
  - Test URL creation from various image types
  - Test MIME detection accuracy
  - Test cleanup on data change
  - Test cleanup on unmount
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

---

- [x] 4. Create stroke image save handlers composable
- [x] 4.1 Implement useKanjiDetailStrokeHandlers
  - Accept kanji ref as parameter
  - Create handler for saving stroke diagram via updateField
  - Create handler for saving stroke animation via updateField
  - Show success toast on save
  - Show error toast on failure
  - Update kanji ref with returned entity
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4.2\* Add unit tests for useKanjiDetailStrokeHandlers
  - Test diagram save calls repository correctly
  - Test animation save calls repository correctly
  - Test null value clears image
  - Test toast notifications on success/error
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

---

### Module UI Components

- [x] 5. Create stroke order display component with thumbnail and lightbox
- [x] 5.1 Implement KanjiStrokeOrderDisplay component
  - Display stroke diagram and animation as constrained thumbnails (max 200x200)
  - Scale images proportionally while maintaining aspect ratio
  - Use figure/figcaption structure with labels ("Stroke Diagram", "Animation")
  - Show magnify icon overlay as click affordance
  - Handle empty state with appropriate message
  - Use useBlobUrl for image URL management
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [x] 5.2 Integrate lightbox for enlarged viewing
  - Make thumbnail clickable (button wrapper for accessibility)
  - Open ImageLightbox on click/tap
  - Pass blob URL and alt text to lightbox
  - Support keyboard activation (Enter/Space)
  - _Requirements: 2.4, 6.1, 6.2_

- [x] 5.3\* Add unit tests for KanjiStrokeOrderDisplay
  - Test thumbnail rendering with images
  - Test empty state rendering
  - Test lightbox trigger interaction
  - Test proper alt text on images
  - _Requirements: 7.1, 7.3_

---

- [x] 6. Create stroke order edit mode component
- [x] 6.1 Implement KanjiStrokeOrderEditMode component
  - Create two file inputs (diagram accepts image/\*, animation accepts image/gif)
  - Track local edit state separate from props
  - Show preview of selected files
  - Provide save and cancel action buttons
  - Reset to original values on cancel
  - Emit save event with both values
  - Emit cancel event
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 6.2\* Add unit tests for KanjiStrokeOrderEditMode
  - Test file input display
  - Test save emits correct values
  - Test cancel resets state
  - Test remove clears image
  - _Requirements: 7.2_

---

### Section Component

- [x] 7. Create stroke order section component
- [x] 7.1 Implement KanjiSectionStrokeOrder component
  - Wrap in SharedSection with "Stroke Order" title
  - Enable collapsible behavior
  - Default open if images exist, collapsed if empty
  - Toggle between view mode (Display) and edit mode (EditMode)
  - Show Edit button in section actions slot
  - _Requirements: 1.4, 1.5_

- [x] 7.2 Wire up edit mode save/cancel flow
  - On edit button click, switch to edit mode
  - On cancel, switch back to view mode
  - On save, emit save events for diagram and animation to parent
  - Switch back to view mode after save
  - _Requirements: 3.6, 3.7_

- [x] 7.3\* Add unit tests for KanjiSectionStrokeOrder
  - Test view/edit mode toggle
  - Test correct events emitted on save
  - Test cancel returns to view mode
  - Test default collapsed state based on content
  - _Requirements: 7.1, 7.2, 7.3_

---

### Root Integration

- [x] 8. Integrate stroke order section into kanji detail root
- [x] 8.1 Add stroke handlers to KanjiDetailRoot
  - Import and call useKanjiDetailStrokeHandlers
  - Pass kanji ref to composable
  - Destructure diagram and animation save handlers
  - _Requirements: 4.1, 4.2_

- [x] 8.2 Add stroke order section to template
  - Import KanjiSectionStrokeOrder component
  - Position between KanjiSectionSemanticNotes and KanjiSectionNotesGroup
  - Pass strokeDiagramImage and strokeGifImage from kanji
  - Wire save:diagram and save:animation events to handlers
  - _Requirements: 1.5_

- [x] 8.3 Verify API layer field support
  - Confirm updateField works with strokeDiagramImage field
  - Confirm updateField works with strokeGifImage field
  - Test null value clears images
  - Verify updated_at timestamp updates on save
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

---

### E2E Testing

- [x] 9. Add E2E tests for stroke order functionality
- [x] 9.1 Test viewing stroke images
  - Navigate to kanji detail page with existing stroke images
  - Verify thumbnail images display
  - Click image and verify lightbox opens
  - Close lightbox and verify return to normal view
  - _Requirements: 7.4_

- [x] 9.2 Test uploading and removing stroke images
  - Navigate to kanji detail page
  - Enter edit mode in stroke order section
  - Upload a stroke diagram image
  - Upload a stroke animation GIF
  - Save changes and verify persistence
  - Reload page and verify images still display
  - Remove images and verify empty state
  - _Requirements: 7.5_

---

## Requirements Coverage

| Requirement | Tasks         |
| ----------- | ------------- |
| 1.1         | 5.1           |
| 1.2         | 5.1           |
| 1.3         | 5.1           |
| 1.4         | 7.1           |
| 1.5         | 7.1, 8.2      |
| 2.1         | 5.1           |
| 2.2         | 5.1           |
| 2.3         | 5.1           |
| 2.4         | 2.1, 5.2      |
| 2.5         | 2.2           |
| 2.6         | 2.2           |
| 2.7         | 2.1           |
| 2.8         | 2.2           |
| 2.9         | 2.2           |
| 3.1         | 1.1, 6.1      |
| 3.2         | 1.2, 6.1      |
| 3.3         | 1.2, 6.1      |
| 3.4         | 1.1, 6.1      |
| 3.5         | 6.1           |
| 3.6         | 7.2, 6.1      |
| 3.7         | 7.2, 6.1      |
| 4.1         | 4.1, 8.1, 8.3 |
| 4.2         | 4.1, 8.1, 8.3 |
| 4.3         | 4.1, 8.3      |
| 4.4         | 4.1, 8.3      |
| 4.5         | 8.3           |
| 5.1         | 3.1, 1.1      |
| 5.2         | 3.1, 1.1      |
| 5.3         | 3.1, 1.1      |
| 5.4         | 3.1           |
| 6.1         | 5.2           |
| 6.2         | 2.1, 5.2      |
| 6.3         | 2.1           |
| 6.4         | 2.1           |
| 6.5         | 1.2           |
| 7.1         | 5.3, 7.3      |
| 7.2         | 6.2, 7.3      |
| 7.3         | 5.3, 7.3      |
| 7.4         | 9.1           |
| 7.5         | 9.2           |
| 7.6         | 1.3, 2.3      |
