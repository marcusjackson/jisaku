/**
 * App Error Handler
 *
 * Global Vue error handler, kept out of main.ts so it can be tested.
 */

import { useToast } from '@/shared/composables/use-toast';

/**
 * Surfaces a toast for an unhandled error from Vue's component lifecycle,
 * so unexpected failures are not swallowed silently.
 */
export function handleAppError(): void {
  const { error } = useToast();
  error('An unexpected error occurred. Please reload the page.');
}
