/**
 * Tests for handleAppError
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('handleAppError', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should show an error toast telling the user to reload', async () => {
    const { useToast } = await import('@/shared/composables/use-toast');
    const { handleAppError } = await import('./app-error-handler');
    const { toasts } = useToast();

    handleAppError();

    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0]?.type).toBe('error');
    expect(toasts.value[0]?.message).toBe('An unexpected error occurred. Please reload the page.');
  });
});
