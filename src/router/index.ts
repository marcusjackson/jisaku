import { createRouter, createWebHistory } from 'vue-router'

import { LEGACY_ROUTES, ROUTES } from './routes'

import type { RouteRecordRaw } from 'vue-router'

/**
 * New UI routes - empty until we start building new pages
 * Default path (/) redirects to refactored kanji list
 */
const newRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: ROUTES.KANJI_LIST
  },
  {
    path: ROUTES.KANJI_LIST,
    name: 'kanji-list',
    component: () => import('@/pages/KanjiListPage.vue'),
    meta: { title: 'Kanji List' }
  },
  {
    path: ROUTES.KANJI_DETAIL,
    name: 'kanji-detail',
    component: () => import('@/pages/KanjiDetailPage.vue'),
    meta: { title: 'Kanji Detail' }
  },
  {
    path: ROUTES.COMPONENT_LIST,
    name: 'component-list',
    component: () => import('@/pages/ComponentListPage.vue'),
    meta: { title: 'Component List' }
  },
  {
    path: ROUTES.COMPONENT_DETAIL,
    name: 'component-detail',
    component: () => import('@/pages/ComponentDetailPage.vue'),
    meta: { title: 'Component Detail' }
  },
  {
    path: ROUTES.VOCABULARY_LIST,
    name: 'vocabulary-list',
    component: () => import('@/pages/VocabularyListPage.vue'),
    meta: { title: 'Vocabulary List' }
  },
  {
    path: ROUTES.VOCABULARY_DETAIL,
    name: 'vocabulary-detail',
    component: () => import('@/pages/VocabularyDetailPage.vue'),
    meta: { title: 'Vocabulary Detail' }
  },
  {
    path: ROUTES.SETTINGS,
    name: 'settings',
    component: () => import('@/pages/SettingsPage.vue'),
    meta: { title: 'Settings' }
  }
]

/**
 * Legacy UI routes - prefixed with /legacy
 * All existing functionality accessible here during transition
 * Uses LegacyApp as layout wrapper to include header, toast, etc.
 */
const legacyRoutes: RouteRecordRaw[] = [
  {
    path: '/legacy',
    component: () => import('@/legacy/LegacyApp.vue'),
    children: [
      {
        path: '',
        redirect: LEGACY_ROUTES.KANJI_LIST
      },
      {
        path: 'kanji',
        name: 'legacy-kanji-list',
        component: () => import('@/legacy/pages/KanjiListPage.vue'),
        meta: { title: 'Kanji List' }
      },
      {
        path: 'kanji/new',
        name: 'legacy-kanji-new',
        component: () => import('@/legacy/pages/KanjiNewPage.vue'),
        meta: { title: 'New Kanji' }
      },
      {
        path: 'kanji/:id',
        name: 'legacy-kanji-detail',
        component: () => import('@/legacy/pages/KanjiDetailPage.vue'),
        meta: { title: 'Kanji Detail' }
      },
      {
        path: 'components',
        name: 'legacy-component-list',
        component: () => import('@/legacy/pages/ComponentListPage.vue'),
        meta: { title: 'Components' }
      },
      {
        path: 'components/new',
        name: 'legacy-component-new',
        component: () => import('@/legacy/pages/ComponentNewPage.vue'),
        meta: { title: 'New Component' }
      },
      {
        path: 'components/:id',
        name: 'legacy-component-detail',
        component: () => import('@/legacy/pages/ComponentDetailPage.vue'),
        meta: { title: 'Component Detail' }
      },
      {
        path: 'vocabulary',
        name: 'legacy-vocabulary-list',
        component: () => import('@/legacy/pages/VocabularyListPage.vue'),
        meta: { title: 'Vocabulary List' }
      },
      {
        path: 'vocabulary/:id',
        name: 'legacy-vocabulary-detail',
        component: () => import('@/legacy/pages/VocabularyDetailPage.vue'),
        meta: { title: 'Vocabulary Detail' }
      },
      {
        path: 'settings',
        name: 'legacy-settings',
        component: () => import('@/legacy/pages/SettingsPage.vue'),
        meta: { title: 'Settings' }
      }
    ]
  }
]

/**
 * Catch-all for not found pages
 */
const fallbackRoutes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/legacy/pages/NotFoundPage.vue'),
    meta: { title: 'Not Found' }
  }
]

const routes = [...newRoutes, ...legacyRoutes, ...fallbackRoutes]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// Update document title on navigation
router.afterEach((to) => {
  const baseTitle = 'Jisaku'
  const pageTitle = to.meta['title'] as string | undefined
  document.title = pageTitle ? `${pageTitle} | ${baseTitle}` : baseTitle
})

export default router
