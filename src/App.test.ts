/**
 * Tests for the root App component
 */

import { ref } from 'vue';

import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App.vue';

const initialize = vi.fn();
const initError = ref<Error | null>(null);
const isInitialized = ref(false);

vi.mock('@/shared/composables/use-database', () => ({
  useDatabase: () => ({ initError, initialize, isInitialized }),
}));

const RouterViewStub = { name: 'RouterView', template: '<div class="route-view" />' };

function mountApp() {
  return mount(App, { global: { stubs: { RouterView: RouterViewStub } } });
}

describe('App', () => {
  beforeEach(() => {
    initialize.mockReset();
    initialize.mockResolvedValue(undefined);
    initError.value = null;
    isInitialized.value = false;
  });

  it('should show the loading state until the database is ready', () => {
    const wrapper = mountApp();

    expect(wrapper.find('.app-loading').exists()).toBe(true);
    expect(wrapper.find('.route-view').exists()).toBe(false);
  });

  it('should start database initialization on mount', () => {
    mountApp();

    expect(initialize).toHaveBeenCalledTimes(1);
  });

  it('should show the database error and no route when initialization fails', () => {
    initError.value = new Error('disk full');
    const wrapper = mountApp();

    expect(wrapper.find('.app-error').text()).toContain('Database Error');
    expect(wrapper.find('.app-error').text()).toContain('disk full');
    expect(wrapper.find('.route-view').exists()).toBe(false);
  });

  it('should render the routed view once the database is ready', () => {
    isInitialized.value = true;
    const wrapper = mountApp();

    expect(wrapper.find('.route-view').exists()).toBe(true);
    expect(wrapper.find('.app-loading').exists()).toBe(false);
  });
});
