/**
 * SettingsRoot tests: type lists remount after an import or a seed
 */

import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SettingsRoot from './SettingsRoot.vue';

const mounted = vi.hoisted(() => ({ position: 0, classification: 0 }));
const mockImport = vi.hoisted(() => vi.fn());
const mockSeed = vi.hoisted(() => vi.fn());

vi.mock('@/shared/composables/use-database-export', async () => {
  const { ref } = await import('vue');
  return {
    useDatabaseExport: () => ({
      clearDatabase: vi.fn(),
      exportDatabase: vi.fn(),
      importDatabase: mockImport,
      isClearing: ref(false),
      isExporting: ref(false),
      isImporting: ref(false),
    }),
  };
});

vi.mock('@/shared/composables/use-seed-data', async () => {
  const { ref } = await import('vue');
  return {
    useSeedData: () => ({
      clear: vi.fn(),
      isClearing: ref(false),
      isSeeding: ref(false),
      seed: mockSeed,
    }),
  };
});

vi.mock('./SettingsSectionAppearance.vue', () => ({
  default: { template: '<div />' },
}));

vi.mock('./SettingsSectionPositionTypes.vue', () => ({
  default: {
    template: '<div />',
    mounted: () => {
      mounted.position++;
    },
  },
}));

vi.mock('./SettingsSectionClassificationTypes.vue', () => ({
  default: {
    template: '<div />',
    mounted: () => {
      mounted.classification++;
    },
  },
}));

vi.mock('./SettingsSectionDatabase.vue', () => ({
  default: {
    emits: ['import-database'],
    template: '<button data-testid="import" @click="$emit(\'import-database\', {})" />',
  },
}));

vi.mock('./SettingsSectionDevTools.vue', () => ({
  default: {
    emits: ['seed-data'],
    template: '<button data-testid="seed" @click="$emit(\'seed-data\')" />',
  },
}));

describe('SettingsRoot type lists', () => {
  beforeEach(() => {
    mounted.position = 0;
    mounted.classification = 0;
    mockImport.mockReset();
    mockSeed.mockReset();
  });

  it('remounts both lists after a successful import', async () => {
    mockImport.mockResolvedValue(true);
    const wrapper = mount(SettingsRoot);

    await wrapper.find('[data-testid="import"]').trigger('click');
    await vi.waitFor(() => {
      expect(mounted.position).toBe(2);
    });

    expect(mounted.classification).toBe(2);
  });

  it('leaves the lists alone when the import fails', async () => {
    mockImport.mockResolvedValue(false);
    const wrapper = mount(SettingsRoot);

    await wrapper.find('[data-testid="import"]').trigger('click');
    await vi.waitFor(() => {
      expect(mockImport).toHaveBeenCalled();
    });

    expect(mounted.position).toBe(1);
    expect(mounted.classification).toBe(1);
  });

  it('remounts both lists after seeding', async () => {
    mockSeed.mockResolvedValue(undefined);
    const wrapper = mount(SettingsRoot);

    await wrapper.find('[data-testid="seed"]').trigger('click');
    await vi.waitFor(() => {
      expect(mounted.position).toBe(2);
    });

    expect(mounted.classification).toBe(2);
  });
});
