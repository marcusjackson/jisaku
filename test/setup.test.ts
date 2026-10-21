/**
 * Verifies the global mocks installed by test/setup.ts
 */
import { describe, expect, it } from 'vitest';

describe('vitest setup', () => {
  it('has testing-library matchers', () => {
    const element = document.createElement('div');
    element.textContent = 'Hello';
    document.body.appendChild(element);

    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Hello');

    element.remove();
  });

  it('mocks matchMedia as non-matching', () => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    expect(query.matches).toBe(false);
    expect(query.media).toBe('(prefers-color-scheme: dark)');
  });

  it('mocks ResizeObserver', () => {
    const observer = new ResizeObserver(() => undefined);
    expect(() => {
      observer.observe(document.body);
      observer.disconnect();
    }).not.toThrow();
  });

  it('mocks URL.createObjectURL with unique blob URLs', () => {
    const first = URL.createObjectURL(new Blob(['a']));
    const second = URL.createObjectURL(new Blob(['b']));
    expect(first).toMatch(/^blob:mock-url-\d+$/);
    expect(second).not.toBe(first);
    expect(() => {
      URL.revokeObjectURL(first);
    }).not.toThrow();
  });
});
