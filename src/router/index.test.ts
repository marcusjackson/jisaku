/**
 * Tests for the application router: redirect, fallback, route titles
 */

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof VueRouter>();
  return { ...actual, createWebHistory: () => actual.createMemoryHistory() };
});

// Lazy page imports are irrelevant here; stub them so navigation stays cheap
vi.mock('@/pages/KanjiListPage.vue', () => ({ default: {} }));
vi.mock('@/pages/KanjiDetailPage.vue', () => ({ default: {} }));
vi.mock('@/pages/ComponentListPage.vue', () => ({ default: {} }));
vi.mock('@/pages/ComponentDetailPage.vue', () => ({ default: {} }));
vi.mock('@/pages/VocabularyListPage.vue', () => ({ default: {} }));
vi.mock('@/pages/VocabularyDetailPage.vue', () => ({ default: {} }));
vi.mock('@/pages/SettingsPage.vue', () => ({ default: {} }));
vi.mock('@/pages/NotFoundPage.vue', () => ({ default: {} }));

import router from './index';

import type * as VueRouter from 'vue-router';

describe('router', () => {
  beforeAll(() => {
    // jsdom does not implement scrollTo, which scrollBehavior triggers
    window.scrollTo = vi.fn();
  });

  beforeEach(async () => {
    await router.push('/settings');
  });

  it('redirects / to the kanji list', async () => {
    await router.push('/');
    expect(router.currentRoute.value.name).toBe('kanji-list');
    expect(router.currentRoute.value.fullPath).toBe('/kanji');
  });

  it('resolves an unknown path to not-found', async () => {
    await router.push('/no/such/page');
    expect(router.currentRoute.value.name).toBe('not-found');
  });

  it('gives every named route a meta.title', () => {
    const named = router.getRoutes().filter((route) => route.name);
    expect(named.length).toBeGreaterThan(0);
    const untitled = named.filter((route) => !route.meta.title).map((route) => String(route.name));
    expect(untitled).toEqual([]);
  });

  it('sets document.title from meta.title after navigation', async () => {
    await router.push('/kanji');
    expect(document.title).toBe('Kanji List | Jisaku');
    await router.push('/settings');
    expect(document.title).toBe('Settings | Jisaku');
    await router.push('/no/such/page');
    expect(document.title).toBe('Not Found | Jisaku');
  });
});
