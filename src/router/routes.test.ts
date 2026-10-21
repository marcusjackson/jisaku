/**
 * Tests for route path utilities
 */

import { describe, expect, it } from 'vitest';

import { buildRoute, ROUTES } from './routes';

describe('buildRoute', () => {
  it('builds route with single parameter', () => {
    const result = buildRoute(ROUTES.KANJI_DETAIL, { id: '123' });
    expect(result).toBe('/kanji/123');
  });

  it('builds route ignoring unused parameters', () => {
    const result = buildRoute(ROUTES.KANJI_DETAIL, { id: '123', ignored: 'x' });
    expect(result).toBe('/kanji/123');
  });

  it('builds route with number parameters', () => {
    const result = buildRoute(ROUTES.KANJI_DETAIL, { id: 123 });
    expect(result).toBe('/kanji/123');
  });

  it('returns unchanged path when no parameters', () => {
    const result = buildRoute(ROUTES.KANJI_LIST, {});
    expect(result).toBe('/kanji');
  });

  it('builds component route with parameters', () => {
    const result = buildRoute(ROUTES.COMPONENT_DETAIL, { id: 'abc' });
    expect(result).toBe('/components/abc');
  });
});
