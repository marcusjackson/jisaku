import { createRouter, createWebHistory } from 'vue-router'

import { ROUTES } from './routes'

import type { RouteRecordRaw } from 'vue-router'

// Extend vue-router's RouteMeta type so meta.title is properly typed
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
  }
}

/**
 * Application routes
 */
const appRoutes: RouteRecordRaw[] = [
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
 * Catch-all for not found pages
 */
const fallbackRoutes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { title: 'Not Found' }
  }
]

const routes = [...appRoutes, ...fallbackRoutes]

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
  const pageTitle = to.meta.title
  document.title = pageTitle ? `${pageTitle} | ${baseTitle}` : baseTitle
})

export default router
