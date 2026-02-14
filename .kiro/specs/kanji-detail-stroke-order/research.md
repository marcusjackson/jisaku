# Research & Design Decisions

---

## Summary

- **Feature**: `kanji-detail-stroke-order`
- **Discovery Scope**: Extension (adding new section to existing kanji-detail module)
- **Key Findings**:
  - API layer already supports `strokeDiagramImage` and `strokeGifImage` via `updateField`
  - SharedSection and existing notes section patterns provide consistent templates
  - Need new BaseFileInput component (migrated from legacy) and new ImageLightbox component

## Research Log

### Existing API Support for Stroke Images

- **Context**: Verify if API layer needs additions for stroke image CRUD
- **Sources Consulted**:
  - [kanji-types.ts](../../../src/api/kanji/kanji-types.ts)
  - [kanji-repository.ts](../../../src/api/kanji/kanji-repository.ts)
  - [kanji-repository-internals.ts](../../../src/api/kanji/kanji-repository-internals.ts)
- **Findings**:
  - `Kanji` interface includes `strokeDiagramImage: Uint8Array | null` and `strokeGifImage: Uint8Array | null`
  - `KANJI_FIELD_COLUMNS` maps both fields to database columns (`stroke_diagram_image`, `stroke_gif_image`)
  - `updateField` method is generic and works with any field including stroke images
  - Database schema has `stroke_diagram_image BLOB` and `stroke_gif_image BLOB`
- **Implications**: No API changes needed; existing `updateField` method handles stroke images

### Section Pattern Analysis

- **Context**: Understand how other sections are structured for consistency
- **Sources Consulted**:
  - [KanjiSectionSemanticNotes.vue](../../../src/modules/kanji-detail/components/KanjiSectionSemanticNotes.vue)
  - [use-kanji-detail-notes-handlers.ts](../../../src/modules/kanji-detail/composables/use-kanji-detail-notes-handlers.ts)
  - [SharedSection.vue](../../../src/shared/components/SharedSection.vue)
- **Findings**:
  - Notes sections use SharedSection with `collapsible` and `default-open` based on content
  - Handler composables use `kanjiRepo.updateField()` for saves
  - Toast notifications on success/error
  - Section emits save events, root component wires handlers
- **Implications**: Follow same pattern for stroke order section

### File Input Component

- **Context**: Need file input for image uploads
- **Sources Consulted**: [legacy/BaseFileInput.vue](../../../src/legacy/base/components/BaseFileInput.vue)
- **Findings**:
  - Legacy component handles: drag-and-drop, preview generation, size limits, Uint8Array conversion
  - Uses `v-model` with `Uint8Array | null`
  - Tracks blob URLs for preview and revokes on unmount
  - Supports accept filter, warning/max size limits
- **Implications**: Need to migrate BaseFileInput to new base/ folder with same functionality

### Image Lightbox/Viewer Patterns

- **Context**: Research best practices for mobile-friendly image viewing
- **Sources Consulted**: Reka UI documentation, common lightbox patterns
- **Findings**:
  - Reka UI DialogRoot provides accessibility (focus trap, escape to close, aria)
  - CSS `touch-action: pinch-zoom` enables native mobile zoom
  - CSS `object-fit: contain` with `max-width/height: 100%` scales any dimension
  - Magnify icon (🔍) or "Tap to enlarge" text provides click affordance
  - Full-viewport overlay with centered image is standard pattern
- **Implications**: Build ImageLightbox as a shared component using Reka Dialog with zoom/pan support

### Mobile Zoom Implementation

- **Context**: Determine best approach for zoom/pan on mobile
- **Sources Consulted**: Browser native capabilities, CSS touch-action
- **Findings**:
  - Native CSS approach: `touch-action: pinch-zoom pan-x pan-y` enables browser zoom
  - JavaScript approach: Track touch events for custom zoom (more complex, better control)
  - Hybrid: Use `overflow: auto` container with large image inside allows natural scroll/pan
  - Browser native zoom in lightbox is simplest and most familiar UX
- **Implications**: Use native browser zoom/pan via CSS touch-action for simplicity

## Architecture Pattern Evaluation

| Option                | Description                                  | Strengths                      | Risks / Limitations                | Notes                      |
| --------------------- | -------------------------------------------- | ------------------------------ | ---------------------------------- | -------------------------- |
| Inline edit mode      | Toggle between view/edit like other sections | Consistent with notes sections | Images require file input handling | Selected: familiar pattern |
| Modal edit            | Open dialog for editing images               | Clean separation               | Extra navigation step              | Not selected: overkill     |
| Always-visible inputs | Show file inputs next to images              | Quick access                   | Cluttered view mode                | Not selected: noisy UI     |

## Design Decisions

### Decision: Use Native Browser Zoom for Lightbox

- **Context**: Need mobile-friendly zoom/pan for large images
- **Alternatives Considered**:
  1. Custom JavaScript touch handling — full control but complex
  2. Third-party library (panzoom, etc.) — dependency overhead
  3. Native CSS touch-action — browser handles zoom/pan
- **Selected Approach**: Native CSS touch-action with overflow container
- **Rationale**: Simplest implementation, familiar UX, no dependencies
- **Trade-offs**: Less precise control but adequate for image viewing
- **Follow-up**: Test on actual devices during implementation

### Decision: Shared ImageLightbox Component

- **Context**: Lightbox could be useful elsewhere (component images, future features)
- **Alternatives Considered**:
  1. Module-specific component — simpler initial scope
  2. Shared component — reusable across app
- **Selected Approach**: Create in `shared/components/` for reuse
- **Rationale**: Pattern may apply to component detail images in future
- **Trade-offs**: Slightly more design consideration upfront

### Decision: Migrate BaseFileInput from Legacy

- **Context**: Need file upload component for new UI
- **Alternatives Considered**:
  1. Inline file handling in section — duplicates legacy code
  2. Migrate legacy component — full feature parity
- **Selected Approach**: Migrate BaseFileInput to base/components with same API
- **Rationale**: Mature implementation with drag-drop, preview, size limits
- **Trade-offs**: Initial migration effort

## Risks & Mitigations

- **Blob URL memory leaks** — Use consistent pattern: track URLs, revoke on prop change and unmount
- **Large file performance** — Implement size limits (warning at 500KB, max 2MB) like legacy
- **Image MIME detection** — Use magic bytes for accurate type detection (PNG, JPEG, GIF)
- **Mobile zoom not working** — Test on real devices; fallback to scroll-only if touch-action fails

## References

- [Reka UI Dialog](https://reka-ui.com/components/dialog) — Accessible dialog primitives
- [CSS touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) — Browser zoom/pan control
- [Legacy KanjiDetailStrokeOrder.vue](../../../src/legacy/modules/kanji/components/KanjiDetailStrokeOrder.vue) — Reference implementation
