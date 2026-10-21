import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as IndexedDBModule from './indexeddb';
import type * as LifecycleModule from './lifecycle';
import type { Database } from 'sql.js';

vi.mock('./export-database', () => ({
  exportDatabase: vi.fn(() => new Uint8Array([1])),
}));

interface Pending {
  resolve: () => void;
  abort: () => void;
}

/** IndexedDB fake whose put requests succeed only when the test says so */
function createFakeIndexedDB() {
  const puts: Pending[] = [];
  const store = {
    put: vi.fn(() => {
      const request: Record<string, unknown> = {};
      puts.push({
        resolve: () => {
          (lastTx['oncomplete'] as () => void)();
        },
        abort: () => {
          lastTx['error'] = { message: 'QuotaExceededError' };
          (lastTx['onabort'] as () => void)();
        },
      });
      return request;
    }),
  };
  let lastTx: Record<string, unknown> = {};
  const connection = {
    transaction: vi.fn(() => {
      lastTx = { objectStore: () => store, error: null };
      return lastTx;
    }),
    objectStoreNames: { contains: () => true },
    onclose: null,
    onversionchange: null,
  };
  const open = vi.fn(() => {
    const request: Record<string, unknown> = { result: connection };
    setTimeout(() => {
      (request['onsuccess'] as () => void)();
    }, 0);
    return request;
  });
  return { puts, store, open };
}

function setVisibility(state: 'hidden' | 'visible'): void {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('saving on hide only when changed', () => {
  let fake: ReturnType<typeof createFakeIndexedDB>;
  let idb: typeof IndexedDBModule;
  let lifecycle: typeof LifecycleModule;

  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    fake = createFakeIndexedDB();
    vi.stubGlobal('indexedDB', fake);
    idb = await import('./indexeddb');
    lifecycle = await import('./lifecycle');
    idb.setDatabaseRef({} as Database);
    lifecycle.attachLifecycleListeners();
  });

  afterEach(() => {
    lifecycle.detachLifecycleListeners();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  /** Let the fake connection open and the put start */
  async function settle(): Promise<void> {
    await vi.advanceTimersByTimeAsync(1);
  }

  it('does not save when a tab is hidden with no writes', async () => {
    setVisibility('hidden');
    window.dispatchEvent(new Event('pagehide'));
    window.dispatchEvent(new Event('beforeunload'));
    await settle();

    expect(fake.store.put).not.toHaveBeenCalled();
    expect(idb.hasUnsavedChanges()).toBe(false);
  });

  it('saves on hide after a write, flushing the pending debounce', async () => {
    idb.schedulePersist();
    setVisibility('hidden');
    await settle();

    expect(fake.store.put).toHaveBeenCalledTimes(1);
    fake.puts[0]?.resolve();
    await settle();
    expect(idb.hasUnsavedChanges()).toBe(false);

    // The debounce was cancelled, so no second save follows
    await vi.advanceTimersByTimeAsync(500);
    expect(fake.store.put).toHaveBeenCalledTimes(1);
  });

  it('stays dirty until the save succeeds', async () => {
    idb.schedulePersist();
    expect(idb.hasUnsavedChanges()).toBe(true);
    await vi.advanceTimersByTimeAsync(150);
    expect(fake.store.put).toHaveBeenCalledTimes(1);
    expect(idb.hasUnsavedChanges()).toBe(true);

    fake.puts[0]?.resolve();
    await settle();
    expect(idb.hasUnsavedChanges()).toBe(false);
  });

  it('stays dirty when a write lands during an in-flight save', async () => {
    idb.schedulePersist();
    await vi.advanceTimersByTimeAsync(150);
    expect(fake.store.put).toHaveBeenCalledTimes(1);

    idb.schedulePersist();
    fake.puts[0]?.resolve();
    await settle();

    expect(idb.hasUnsavedChanges()).toBe(true);
  });

  it('writes synchronously on pagehide when there are unsaved changes', async () => {
    idb.schedulePersist();
    window.dispatchEvent(new Event('pagehide'));
    await settle();

    expect(fake.store.put).toHaveBeenCalledTimes(1);
  });

  it('writes synchronously on beforeunload when there are unsaved changes', async () => {
    idb.schedulePersist();
    window.dispatchEvent(new Event('beforeunload'));
    await settle();

    expect(fake.store.put).toHaveBeenCalledTimes(1);
  });

  it('reports a failed hide save through the error callback', async () => {
    lifecycle.detachLifecycleListeners();
    const onError = vi.fn();
    lifecycle.attachLifecycleListeners(onError);

    idb.schedulePersist();
    setVisibility('hidden');
    await settle();
    fake.puts[0]?.abort();
    await settle();

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'QuotaExceededError' })
    );
    expect(idb.hasUnsavedChanges()).toBe(true);
  });
});
