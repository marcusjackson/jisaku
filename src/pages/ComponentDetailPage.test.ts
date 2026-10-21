import { defineComponent, h } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ComponentDetailPage from './ComponentDetailPage.vue';

describe('ComponentDetailPage', () => {
  it('starts a fresh detail root when the route id changes', async () => {
    let created = 0;
    const RootStub = defineComponent({
      setup() {
        created += 1;
        return () => h('div', { class: 'root-stub' });
      },
    });
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/components/:id', component: ComponentDetailPage }],
    });
    await router.push('/components/1');
    await router.isReady();
    const wrapper = mount(ComponentDetailPage, {
      global: {
        plugins: [router],
        stubs: {
          ComponentDetailRoot: RootStub,
          SharedHeader: true,
          SharedToast: true,
        },
      },
    });
    expect(created).toBe(1);

    await router.push('/components/2');
    await wrapper.vm.$nextTick();

    expect(created).toBe(2);
  });
});
