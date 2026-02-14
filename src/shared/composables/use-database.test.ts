/**
 * Tests for useDatabase composable
 *
 * These tests verify the database composable's core functionality.
 * Note: Since this composable uses IndexedDB (not available in jsdom),
 * we test the synchronous parts and mock the persistence layer.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Database } from 'sql.js'

// Mock IndexedDB since it's not available in jsdom
const mockIDBStore = new Map<string, Uint8Array>()

const mockIndexedDB = {
  open: vi.fn(() => {
    const request = {
      result: {
        objectStoreNames: { contains: () => true },
        createObjectStore: vi.fn(),
        transaction: () => ({
          objectStore: () => ({
            get: (key: string) => {
              const req = {
                result: mockIDBStore.get(key),
                onerror: null as (() => void) | null,
                onsuccess: null as (() => void) | null
              }
              setTimeout(() => req.onsuccess?.(), 0)
              return req
            },
            put: (data: Uint8Array, key: string) => {
              mockIDBStore.set(key, data)
              const req = {
                onerror: null as (() => void) | null,
                onsuccess: null as (() => void) | null
              }
              setTimeout(() => req.onsuccess?.(), 0)
              return req
            }
          })
        })
      },
      onerror: null as (() => void) | null,
      onsuccess: null as (() => void) | null,
      onupgradeneeded: null as (() => void) | null
    }
    setTimeout(() => request.onsuccess?.(), 0)
    return request
  })
}

vi.stubGlobal('indexedDB', mockIndexedDB)

// Mock the database modules
let mockDb: Database

vi.mock('@/db/init', () => ({
  initializeDatabase: vi.fn(function () {
    return Promise.resolve(mockDb)
  }),
  replaceDatabaseWithImported: vi.fn(function () {
    return Promise.resolve(mockDb)
  })
}))

vi.mock('@/db/indexeddb', () => ({
  saveToIndexedDB: vi.fn(function () {
    return Promise.resolve()
  }),
  schedulePersist: vi.fn()
}))

// Import after mocking
import { saveToIndexedDB, schedulePersist } from '@/db/indexeddb'
import { initializeDatabase, replaceDatabaseWithImported } from '@/db/init'

import { useDatabase } from './use-database'

describe('useDatabase', function () {
  beforeEach(() => {
    // Create a fresh mock database instance
    mockDb = {
      exec: vi.fn(() => []),
      run: vi.fn(),
      export: vi.fn(() => new Uint8Array([1, 2, 3])),
      close: vi.fn()
    } as unknown as Database

    vi.clearAllMocks()
    mockIDBStore.clear()
  })

  it('returns the expected interface', () => {
    const db = useDatabase()

    expect(db).toHaveProperty('database')
    expect(db).toHaveProperty('initialize')
    expect(db).toHaveProperty('exec')
    expect(db).toHaveProperty('run')
    expect(db).toHaveProperty('persist')
    expect(db).toHaveProperty('replaceDatabase')
    expect(db).toHaveProperty('isInitialized')
    expect(db).toHaveProperty('isInitializing')
    expect(db).toHaveProperty('initError')
  })

  it('provides full database functionality', async () => {
    const db = useDatabase()
    const mockResults = [{ columns: ['id'], values: [[1]] }]

    // Initialize
    await db.initialize()
    expect(initializeDatabase).toHaveBeenCalled()
    expect(db.isInitialized.value).toBe(true)

    // Execute queries
    vi.mocked(mockDb.exec).mockReturnValue(mockResults)
    const results = db.exec('SELECT * FROM kanji WHERE id = ?', [1])
    expect(mockDb.exec).toHaveBeenCalledWith(
      'SELECT * FROM kanji WHERE id = ?',
      [1]
    )
    expect(results).toBe(mockResults)

    // Execute statements
    db.run('INSERT INTO kanji (character) VALUES (?)', ['水'])
    expect(mockDb.run).toHaveBeenCalledWith(
      'INSERT INTO kanji (character) VALUES (?)',
      ['水']
    )
    expect(schedulePersist).toHaveBeenCalled()

    // Persist
    const mockExport = new Uint8Array([1, 2, 3])
    vi.mocked(mockDb.export).mockReturnValue(mockExport)
    await db.persist()
    expect(mockDb.export).toHaveBeenCalled()
    expect(saveToIndexedDB).toHaveBeenCalledWith(mockExport)
  })

  it('replaces database with new data', async () => {
    const db = useDatabase()
    const newData = new Uint8Array([4, 5, 6])

    await db.replaceDatabase(newData)

    expect(replaceDatabaseWithImported).toHaveBeenCalledWith(newData)
    expect(db.isInitialized.value).toBe(true)
  })
})
