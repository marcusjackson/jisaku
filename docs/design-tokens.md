# Design Tokens

This document defines the design tokens (CSS custom properties) used throughout the application.

---

## Overview

All visual styling uses CSS variables for consistency and easy theming. **Hardcoded values are prohibited** — Stylelint enforces CSS variable usage.

Design tokens are defined in `src/styles/tokens.css` and imported globally.

---

## Color Palette

### Semantic Colors

```css
:root {
  /* Background */
  --color-background: #fafafa;
  --color-surface: #ffffff;
  --color-surface-elevated: #ffffff;

  /* Text */
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-text-inverse: #ffffff;

  /* Primary (accent) */
  --color-primary: #4f7d8c;
  --color-primary-hover: #3d6573;
  --color-primary-active: #2d4d58;

  /* Semantic */
  --color-success: #10b981;
  --color-success-bg: #ecfdf5;
  --color-warning: #f59e0b;
  --color-warning-bg: #fffbeb;
  --color-error: #ef4444;
  --color-error-bg: #fef2f2;
  --color-info: #3b82f6;
  --color-info-bg: #eff6ff;

  /* Borders */
  --color-border: #e5e7eb;
  --color-border-focus: var(--color-primary);

  /* Focus ring */
  --color-focus-ring: rgba(79, 125, 140, 0.4);
}
```

### Dark Mode (Future)

```css
/* Future: dark mode override */
[data-theme='dark'] {
  --color-background: #111827;
  --color-surface: #1f2937;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #9ca3af;
  --color-border: #374151;
}
```

---

## Typography

### Font Families

```css
:root {
  /* UI text */
  --font-family-sans:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;

  /* Kanji display - prioritize good CJK rendering */
  --font-family-kanji:
    'Hiragino Kaku Gothic Pro', 'Yu Gothic', 'Meiryo', 'Noto Sans JP',
    sans-serif;

  /* Monospace (for code, if needed) */
  --font-family-mono:
    ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, 'Cascadia Mono',
    'Segoe UI Mono', 'Roboto Mono', monospace;
}
```

### Font Sizes

```css
:root {
  --font-size-xs: 0.75rem; /* 12px */
  --font-size-sm: 0.875rem; /* 14px */
  --font-size-base: 1rem; /* 16px */
  --font-size-lg: 1.125rem; /* 18px */
  --font-size-xl: 1.25rem; /* 20px */
  --font-size-2xl: 1.5rem; /* 24px */
  --font-size-3xl: 1.875rem; /* 30px */
  --font-size-4xl: 2.25rem; /* 36px */
  --font-size-5xl: 3rem; /* 48px */
  --font-size-6xl: 4rem; /* 64px - large kanji display */
}
```

### Font Weights

```css
:root {
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### Line Heights

```css
:root {
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

---

## Spacing

Based on 4px unit grid:

```css
:root {
  --spacing-0: 0;
  --spacing-1: 0.25rem; /* 4px */
  --spacing-2: 0.5rem; /* 8px */
  --spacing-3: 0.75rem; /* 12px */
  --spacing-4: 1rem; /* 16px */
  --spacing-5: 1.25rem; /* 20px */
  --spacing-6: 1.5rem; /* 24px */
  --spacing-8: 2rem; /* 32px */
  --spacing-10: 2.5rem; /* 40px */
  --spacing-12: 3rem; /* 48px */
  --spacing-16: 4rem; /* 64px */
  --spacing-20: 5rem; /* 80px */
}
```

### Semantic Spacing Aliases

```css
:root {
  --spacing-xs: var(--spacing-1);
  --spacing-sm: var(--spacing-2);
  --spacing-md: var(--spacing-4);
  --spacing-lg: var(--spacing-6);
  --spacing-xl: var(--spacing-8);
  --spacing-2xl: var(--spacing-12);
}
```

---

## Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.25rem; /* 4px */
  --radius-md: 0.5rem; /* 8px */
  --radius-lg: 0.75rem; /* 12px */
  --radius-xl: 1rem; /* 16px */
  --radius-full: 9999px; /* Pill shape */
}
```

---

## Shadows

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md:
    0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg:
    0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl:
    0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}
```

---

## Transitions

```css
:root {
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
}
```

---

## Z-Index Scale

```css
:root {
  --z-sticky: 200;
  --z-dropdown: 201;
  --z-modal-backdrop: 300;
  --z-modal: 400;
  --z-toast: 500;
  --z-tooltip: 600;
}
```

---

## Layout

```css
:root {
  /* Container widths */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;

  /* Sidebar */
  --sidebar-width: 240px;

  /* Header */
  --header-height: 64px;
}
```

---

## Focus States

```css
:root {
  --focus-ring: 0 0 0 3px var(--color-focus-ring);
}

/* Usage */
.button:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
```

---

## Component Tokens

### Buttons

```css
:root {
  /* Primary button */
  --button-primary-bg: var(--color-primary);
  --button-primary-text: var(--color-text-inverse);
  --button-primary-hover-bg: var(--color-primary-hover);

  /* Secondary button */
  --button-secondary-bg: transparent;
  --button-secondary-text: var(--color-text-primary);
  --button-secondary-border: var(--color-border);
  --button-secondary-hover-bg: var(--color-surface);

  /* Button sizes */
  --button-height-sm: 32px;
  --button-height-md: 40px;
  --button-height-lg: 48px;

  --button-padding-sm: var(--spacing-2) var(--spacing-3);
  --button-padding-md: var(--spacing-2) var(--spacing-4);
  --button-padding-lg: var(--spacing-3) var(--spacing-6);
}
```

### Inputs

```css
:root {
  --input-height: 40px;
  --input-padding: var(--spacing-2) var(--spacing-3);
  --input-border: 1px solid var(--color-border);
  --input-border-focus: 1px solid var(--color-border-focus);
  --input-border-error: 1px solid var(--color-error);
  --input-bg: var(--color-surface);
  --input-radius: var(--radius-md);
}
```

### Cards

```css
:root {
  --card-bg: var(--color-surface);
  --card-border: 1px solid var(--color-border);
  --card-radius: var(--radius-lg);
  --card-padding: var(--spacing-md);
  --card-shadow: var(--shadow-sm);
}
```

---

## Kanji-Specific Tokens

```css
:root {
  /* Large kanji character display */
  --kanji-display-size: var(--font-size-6xl);
  --kanji-card-size: var(--font-size-4xl);
  --kanji-list-size: var(--font-size-2xl);

  /* Stroke diagram */
  --stroke-diagram-width: 200px;
  --stroke-diagram-height: 200px;
}
```

---

## Usage Examples

### Component Styling

```vue
<style scoped>
.kanji-card {
  background: var(--card-bg);
  border: var(--card-border);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
  box-shadow: var(--card-shadow);
}

.kanji-character {
  font-family: var(--font-family-kanji);
  font-size: var(--kanji-card-size);
  color: var(--color-text-primary);
}

.stroke-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
</style>
```

### Responsive Spacing

```vue
<style scoped>
.page-container {
  padding: var(--spacing-md);
}

@media (min-width: 768px) {
  .page-container {
    padding: var(--spacing-lg);
  }
}

@media (min-width: 1024px) {
  .page-container {
    padding: var(--spacing-xl);
  }
}
</style>
```

---

## Stylelint Enforcement

Stylelint is configured to enforce CSS variable usage:

```javascript
// stylelint.config.js
module.exports = {
  rules: {
    // Disallow hardcoded colors
    'color-no-hex': true,
    'color-named': 'never',

    // Encourage custom property usage
    'declaration-property-value-allowed-list': {
      color: ['/^var\\(--color-/'],
      'background-color': ['/^var\\(--color-/', 'transparent'],
      'border-color': ['/^var\\(--color-/'],
      'font-size': ['/^var\\(--font-size-/'],
      'font-family': ['/^var\\(--font-family-/']
      // etc.
    }
  }
}
```

---

## Theming (Future)

To change the app's look:

1. Modify values in `tokens.css`
2. All components update automatically
3. No need to touch individual component styles

For future dark mode or theme switching, override variables:

```css
[data-theme='dark'] {
  --color-background: #111827;
  --color-surface: #1f2937;
  /* etc. */
}
```

```typescript
// Toggle theme
document.documentElement.dataset.theme = 'dark'
```
