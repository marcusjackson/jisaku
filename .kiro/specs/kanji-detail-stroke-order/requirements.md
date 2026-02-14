# Requirements Document

## Introduction

This specification covers the refactoring of the kanji detail stroke order/diagram section from legacy to the new architecture. The stroke order section displays static stroke order diagrams and animated GIFs that help users understand how to write kanji characters. A major UX improvement is included: images of any dimension (horizontally or vertically long) must display properly without disrupting the page layout, with a click-to-enlarge pattern for viewing full details on both mobile and desktop.

**Scope:**

- Replicate all existing legacy functionality for stroke diagram and animation display/editing
- Use SharedSection component pattern consistent with other refactored sections
- Constrained thumbnail display with click-to-enlarge lightbox for any image size
- Responsive behavior for both mobile and desktop viewports
- Ensure proper API layer coverage and test coverage
- Place between Semantic Notes and Other Notes sections

## Requirements

### Requirement 1: Stroke Order Section Display

**Objective:** As a user, I want to view stroke order diagrams and animations for a kanji, so that I can understand how to write the character correctly.

#### Acceptance Criteria

1. When the kanji detail page loads with stroke images, the Stroke Order Section shall display available stroke diagram and/or animation images in thumbnail format.
2. When the kanji has no stroke images, the Stroke Order Section shall display an empty state message indicating no images are available.
3. The Stroke Order Section shall display a "Stroke Diagram" label for static diagrams and "Animation" label for GIF images.
4. The Stroke Order Section shall use the SharedSection component with consistent styling.
5. The Stroke Order Section shall be positioned between the Semantic Notes section and the Notes Group section.

### Requirement 2: Responsive Image Display and Viewing

**Objective:** As a user on any device, I want stroke order images to display properly regardless of their dimensions, so that the section layout remains consistent and I can view full details when needed.

#### Acceptance Criteria

1. The Stroke Order Section shall constrain thumbnail dimensions to prevent any single image from dominating the section layout (max height and max width limits).
2. When an image exceeds the thumbnail constraints, the Stroke Order Section shall scale it proportionally while maintaining aspect ratio.
3. When an image thumbnail is displayed, the Stroke Order Section shall show a visual affordance (magnify icon or tap hint) indicating the image can be enlarged.
4. When user clicks/taps on a stroke image thumbnail, the Stroke Order Section shall open a lightbox/dialog displaying the full-size image.
5. While the lightbox is open, the Stroke Order Section shall allow pinch-to-zoom on touch devices and scroll-wheel zoom on desktop.
6. While the lightbox is open, the Stroke Order Section shall allow panning/scrolling to view different parts of large images.
7. When user clicks/taps outside the lightbox or presses a close button, the Stroke Order Section shall close the lightbox and return to normal view.
8. The lightbox shall support both static images (PNG/JPEG) and animated GIFs while preserving animation playback.
9. The thumbnail and lightbox behavior shall work consistently on both mobile and desktop viewports.

### Requirement 3: Stroke Image Upload and Edit

**Objective:** As a user, I want to upload and manage stroke order images, so that I can add visual learning aids to my kanji entries.

#### Acceptance Criteria

1. When user enters edit mode, the Stroke Order Section shall display file input controls for both stroke diagram and stroke animation.
2. The file input for stroke diagram shall accept image files (PNG, JPEG, GIF, WebP).
3. The file input for stroke animation shall accept GIF files specifically.
4. When user uploads a new image file, the Stroke Order Section shall display a preview of the selected image.
5. When user removes an existing image, the Stroke Order Section shall clear the image and show empty state.
6. When user saves changes, the Stroke Order Section shall persist the image data to the database.
7. When user cancels editing, the Stroke Order Section shall discard changes and restore original state.

### Requirement 4: API Layer for Stroke Images

**Objective:** As a developer, I want reliable API methods for stroke image CRUD operations, so that the section can persist data correctly.

#### Acceptance Criteria

1. The Kanji Repository shall provide a method to update stroke diagram image by kanji ID.
2. The Kanji Repository shall provide a method to update stroke animation (GIF) image by kanji ID.
3. The Kanji Repository shall support passing `null` to clear/remove stroke images.
4. When an image update is performed, the Kanji Repository shall update the `updated_at` timestamp.
5. The Kanji entity type shall include `strokeDiagramImage` and `strokeGifImage` fields as `Uint8Array | null`.

### Requirement 5: Blob URL Memory Management

**Objective:** As a user, I want the app to handle memory efficiently, so that image display doesn't cause memory leaks.

#### Acceptance Criteria

1. When creating blob URLs for display, the Stroke Order Section shall track all created URLs.
2. When props change with new image data, the Stroke Order Section shall revoke previous blob URLs before creating new ones.
3. When the component is unmounted, the Stroke Order Section shall revoke all active blob URLs.
4. When detecting image MIME type, the Stroke Order Section shall check magic bytes for PNG, JPEG, and GIF formats.

### Requirement 6: Accessibility

**Objective:** As a user with accessibility needs, I want the stroke order section to be fully accessible, so that I can use it with assistive technologies.

#### Acceptance Criteria

1. The stroke order images shall have descriptive alt text ("Stroke order diagram" and "Stroke order animation").
2. The enlarge/lightbox trigger shall be keyboard accessible (focusable and activatable via Enter/Space).
3. When the lightbox is open, the Lightbox component shall trap focus within the dialog.
4. When the lightbox is open, pressing Escape shall close the lightbox.
5. The file upload inputs shall have proper labels for screen readers.

### Requirement 7: Test Coverage

**Objective:** As a developer, I want comprehensive test coverage, so that the refactored section works reliably.

#### Acceptance Criteria

1. The Stroke Order Section component shall have unit tests covering view mode rendering.
2. The Stroke Order Section component shall have unit tests covering edit mode functionality.
3. The Stroke Order Section component shall have unit tests covering empty state.
4. The E2E test suite shall include tests for viewing stroke images.
5. The E2E test suite shall include tests for uploading/removing stroke images.
6. If image lightbox component is created, it shall have unit tests covering open/close behavior.
