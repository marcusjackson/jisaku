import { createRouter, createWebHistory } from 'vue-router'

import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/kanji'
  },
  {
    path: '/kanji',
    name: 'kanji-list',
    component: () => import('@/pages/KanjiListPage.vue'),
    meta: { title: 'Kanji List' }
  },
  {
    path: '/kanji/new',
    name: 'kanji-new',
    component: () => import('@/pages/KanjiNewPage.vue'),
    meta: { title: 'New Kanji' }
  },
  {
    path: '/kanji/:id',
    name: 'kanji-detail',
    component: () => import('@/pages/KanjiDetailPage.vue'),
    meta: { title: 'Kanji Detail' }
  },
  {
    path: '/components',
    name: 'component-list',
    component: () => import('@/pages/ComponentListPage.vue'),
    meta: { title: 'Components' }
  },
  {
    path: '/components/new',
    name: 'component-new',
    component: () => import('@/pages/ComponentNewPage.vue'),
    meta: { title: 'New Component' }
  },
  {
    path: '/components/:id',
    name: 'component-detail',
    component: () => import('@/pages/ComponentDetailPage.vue'),
    meta: { title: 'Component Detail' }
  },
  {
    path: '/vocabulary',
    name: 'vocabulary-list',
    component: () => import('@/pages/VocabularyListPage.vue'),
    meta: { title: 'Vocabulary List' }
  },
  {
    path: '/vocabulary/:id',
    name: 'vocabulary-detail',
    component: () => import('@/pages/VocabularyDetailPage.vue'),
    meta: { title: 'Vocabulary Detail' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/pages/SettingsPage.vue'),
    meta: { title: 'Settings' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { title: 'Not Found' }
  }
]

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
