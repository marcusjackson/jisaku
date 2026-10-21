import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Mock } from 'vitest';

interface FakeStore {
  put: Mock;
  get: Mock;
}

function createFakeIndexedDB() {
  const store: FakeStore = {
    put: vi.fn(() => ({})),
    get: vi.fn(() => ({})),
  };
  const lastTx: { current: Record<string, unknown> } = { current: {} };
  const transaction = vi.fn(() => {
    lastTx.current = { objectStore: () => store, error: null };
    return lastTx.current;
  });
  const connection = {
    transaction,
    close: vi.fn(),
    objectStoreNames: { contains: () => true },
    onclose: null as (() => void) | null,
    onversionchange: null as (() => void) | null,
  };
  const open = vi.fn(() => {
    const request: Record<string, unknown> = { result: connection };
    // Success fires on a later tick, like the real thing
    setTimeout(() => {
      (request['onsuccess'] as () => void)();
    }, 0);
    return request;
  });
  return { store, transaction, connection, open, lastTx };
}

describe('saveToIndexedDBSync', () => {
  let fake: ReturnType<typeof createFakeIndexedDB>;

  beforeEach(() => {
    vi.resetModules();
    fake = createFakeIndexedDB();
    vi.stubGlobal('indexedDB', fake);
  });

  it('starts its write before returning once a connection is open', async () => {
    const { loadFromIndexedDB, saveToIndexedDBSync } = await import('./indexeddb');
    // Opening happens at load time, as at app start
    const loading = loadFromIndexedDB();
    await vi.waitFor(() => {
      expect(fake.transaction).toHaveBeenCalled();
    });
    fake.transaction.mockClear();
    fake.store.put.mockClear();
    void loading;

    const data = new Uint8Array([1, 2, 3]);
    saveToIndexedDBSync(data);

    expect(fake.transaction).toHaveBeenCalledWith('database', 'readwrite');
    expect(fake.store.put).toHaveBeenCalledWith(data, 'db');
    expect(fake.open).toHaveBeenCalledTimes(1);
  });

  it('reopens and still writes when the connection was closed', async () => {
    const { saveToIndexedDB, saveToIndexedDBSync } = await import('./indexeddb');
    const first = saveToIndexedDB(new Uint8Array([0]));
    await vi.waitFor(() => {
      expect(fake.store.put).toHaveBeenCalled();
    });
    void first;

    // Browser closes the connection: the cache is dropped
    fake.connection.onclose?.();
    fake.store.put.mockClear();

    const data = new Uint8Array([9]);
    saveToIndexedDBSync(data);
    await vi.waitFor(() => {
      expect(fake.store.put).toHaveBeenCalledWith(data, 'db');
    });
    expect(fake.open).toHaveBeenCalledTimes(2);
  });

  it('reopens when a stale connection throws on transaction', async () => {
    const { saveToIndexedDB, saveToIndexedDBSync } = await import('./indexeddb');
    void saveToIndexedDB(new Uint8Array([0]));
    await vi.waitFor(() => {
      expect(fake.store.put).toHaveBeenCalled();
    });

    fake.transaction.mockImplementationOnce(() => {
      throw new DOMException('closed', 'InvalidStateError');
    });
    fake.store.put.mockClear();
    const data = new Uint8Array([7]);
    saveToIndexedDBSync(data);
    await vi.waitFor(() => {
      expect(fake.store.put).toHaveBeenCalledWith(data, 'db');
    });
  });

  it('closes and forgets the connection on versionchange', async () => {
    const { loadFromIndexedDB } = await import('./indexeddb');
    void loadFromIndexedDB();
    await vi.waitFor(() => {
      expect(fake.transaction).toHaveBeenCalled();
    });

    fake.connection.onversionchange?.();

    expect(fake.connection.close).toHaveBeenCalled();
  });
});

describe('saveToIndexedDB', () => {
  let fake: ReturnType<typeof createFakeIndexedDB>;

  beforeEach(() => {
    vi.resetModules();
    fake = createFakeIndexedDB();
    vi.stubGlobal('indexedDB', fake);
  });

  it('resolves only when the transaction completes', async () => {
    const { saveToIndexedDB } = await import('./indexeddb');
    let settled = false;
    const saving = saveToIndexedDB(new Uint8Array([1])).then(() => {
      settled = true;
    });
    await vi.waitFor(() => {
      expect(fake.store.put).toHaveBeenCalled();
    });
    await Promise.resolve();
    expect(settled).toBe(false);

    (fake.lastTx.current['oncomplete'] as () => void)();
    await saving;
    expect(settled).toBe(true);
  });

  it('rejects when the transaction aborts', async () => {
    const { saveToIndexedDB } = await import('./indexeddb');
    const saving = saveToIndexedDB(new Uint8Array([1]));
    await vi.waitFor(() => {
      expect(fake.store.put).toHaveBeenCalled();
    });

    fake.lastTx.current['error'] = { message: 'QuotaExceededError' };
    (fake.lastTx.current['onabort'] as () => void)();
    await expect(saving).rejects.toThrow('QuotaExceededError');
  });
});

describe('debounced persist error reporting', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('indexedDB', createFakeIndexedDB());
  });

  it('reports a throwing export through onPersistError', async () => {
    vi.doMock('./export-database', () => ({
      exportDatabase: () => {
        throw new Error('export failed');
      },
    }));
    const { schedulePersist, setDatabaseRef, setOnPersistError } = await import('./indexeddb');
    const onError = vi.fn();
    setOnPersistError(onError);
    setDatabaseRef({} as never);
    vi.useFakeTimers();
    schedulePersist();
    await vi.advanceTimersByTimeAsync(200);
    vi.useRealTimers();

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'export failed' }));
    vi.doUnmock('./export-database');
  });
});
