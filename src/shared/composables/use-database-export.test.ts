/**
 * Tests for useDatabaseExport composable
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  generateExportFilename,
  useDatabaseExport
} from './use-database-export'

const mockRun = vi.fn()
const mockPersist = vi.fn().mockResolvedValue(undefined)
const mockReplaceDatabase = vi.fn().mockResolvedValue(undefined)
const mockExport = vi.fn().mockReturnValue(new Uint8Array([1, 2, 3]))
const mockDatabase = { value: { export: mockExport } }
const mockSuccess = vi.fn()
const mockError = vi.fn()

vi.mock('@/shared/composables/use-database', () => ({
  useDatabase: () => ({
    database: mockDatabase,
    persist: mockPersist,
    replaceDatabase: mockReplaceDatabase,
    run: mockRun
  })
}))

vi.mock('@/shared/composables/use-toast', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError,
    info: vi.fn(),
    warning: vi.fn(),
    toasts: { value: [] },
    addToast: vi.fn(),
    removeToast: vi.fn()
  })
}))

describe('useDatabaseExport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with correct default values', () => {
    const { isClearing, isExporting, isImporting } = useDatabaseExport()

    expect(isExporting.value).toBe(false)
    expect(isImporting.value).toBe(false)
    expect(isClearing.value).toBe(false)
  })

  it('returns all expected functions', () => {
    const result = useDatabaseExport()

    expect(result.exportDatabase).toBeDefined()
    expect(result.importDatabase).toBeDefined()
    expect(result.validateDatabaseFile).toBeDefined()
    expect(result.clearDatabase).toBeDefined()
  })
})

describe('generateExportFilename', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses kanji-dictionary prefix', () => {
    vi.setSystemTime(new Date(2026, 1, 15, 14, 30))
    expect(generateExportFilename()).toMatch(/^kanji-dictionary-/)
  })

  it('formats as kanji-dictionary-YYYY-MM-DD-HHMM.db', () => {
    vi.setSystemTime(new Date(2026, 1, 15, 14, 30))
    expect(generateExportFilename()).toBe('kanji-dictionary-2026-02-15-1430.db')
  })

  it('zero-pads month, day, hours, and minutes', () => {
    vi.setSystemTime(new Date(2026, 0, 5, 3, 7))
    expect(generateExportFilename()).toBe('kanji-dictionary-2026-01-05-0307.db')
  })

  it('has .db extension', () => {
    vi.setSystemTime(new Date(2026, 1, 15, 14, 30))
    expect(generateExportFilename()).toMatch(/\.db$/)
  })
})

describe('exportDatabase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockExport.mockReturnValue(new Uint8Array([1, 2, 3]))
    mockPersist.mockResolvedValue(undefined)
    mockReplaceDatabase.mockResolvedValue(undefined)
  })

  it('shows error toast when database not initialized', () => {
    const originalValue = mockDatabase.value
    mockDatabase.value = null as unknown as typeof originalValue

    const { exportDatabase } = useDatabaseExport()
    exportDatabase()

    expect(mockError).toHaveBeenCalledWith('Database not initialized')

    mockDatabase.value = originalValue
  })

  it('shows error toast when export throws', () => {
    mockExport.mockImplementationOnce(() => {
      throw new Error('Export error')
    })

    const { exportDatabase } = useDatabaseExport()
    exportDatabase()

    expect(mockError).toHaveBeenCalledWith('Export error')
  })

  it('resets isExporting on error', () => {
    mockExport.mockImplementationOnce(() => {
      throw new Error('Export error')
    })

    const { exportDatabase, isExporting } = useDatabaseExport()
    exportDatabase()

    expect(isExporting.value).toBe(false)
  })

  it('shows success toast on successful export', () => {
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
      remove: vi.fn()
    } as unknown as HTMLAnchorElement
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor)
    vi.spyOn(document.body, 'appendChild').mockReturnValue(mockAnchor)

    const { exportDatabase } = useDatabaseExport()
    exportDatabase()

    expect(mockSuccess).toHaveBeenCalledWith('Database exported successfully')
  })
})

describe('clearDatabase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPersist.mockResolvedValue(undefined)
  })

  it('shows error toast when database not initialized', async () => {
    const originalValue = mockDatabase.value
    mockDatabase.value = null as unknown as typeof originalValue

    const { clearDatabase } = useDatabaseExport()
    await clearDatabase()

    expect(mockError).toHaveBeenCalledWith('Database not initialized')

    mockDatabase.value = originalValue
  })

  it('runs DELETE statements for all tables', async () => {
    const { clearDatabase } = useDatabaseExport()
    await clearDatabase()

    expect(mockRun).toHaveBeenCalledWith(
      'DELETE FROM component_grouping_members'
    )
    expect(mockRun).toHaveBeenCalledWith('DELETE FROM vocabulary')
    expect(mockRun).toHaveBeenCalledWith('DELETE FROM kanjis')
    expect(mockRun).toHaveBeenCalledWith('DELETE FROM components')
  })

  it('calls persist after clearing', async () => {
    const { clearDatabase } = useDatabaseExport()
    await clearDatabase()

    expect(mockPersist).toHaveBeenCalled()
  })

  it('shows success toast after clearing', async () => {
    const { clearDatabase } = useDatabaseExport()
    await clearDatabase()

    expect(mockSuccess).toHaveBeenCalledWith('All data cleared successfully')
  })

  it('shows error toast when clear fails', async () => {
    mockRun.mockImplementationOnce(() => {
      throw new Error('DB error')
    })

    const { clearDatabase } = useDatabaseExport()
    await clearDatabase()

    expect(mockError).toHaveBeenCalledWith('DB error')
  })

  it('resets isClearing flag on error', async () => {
    mockRun.mockImplementationOnce(() => {
      throw new Error('DB error')
    })

    const { clearDatabase, isClearing } = useDatabaseExport()
    await clearDatabase()

    expect(isClearing.value).toBe(false)
  })
})
