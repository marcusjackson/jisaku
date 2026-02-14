/**
 * useDatabaseExport
 *
 * Composable for database export, import, and clear operations.
 * Used in settings page for data management.
 */

import { ref } from 'vue'

import { useDatabase } from '@/legacy/shared/composables/use-database'
import { useToast } from '@/legacy/shared/composables/use-toast'

// =============================================================================
// Types
// =============================================================================

export interface UseDatabaseExport {
  /** Whether an export operation is in progress */
  isExporting: Readonly<typeof isExporting>
  /** Whether an import operation is in progress */
  isImporting: Readonly<typeof isImporting>
  /** Whether a clear operation is in progress */
  isClearing: Readonly<typeof isClearing>
  /** Export the database as a downloadable file */
  exportDatabase: () => void
  /** Import a database file */
  importDatabase: (file: File) => Promise<boolean>
  /** Validate a database file without importing */
  validateDatabaseFile: (file: File) => Promise<boolean>
  /** Clear all data from the database */
  clearDatabase: () => Promise<void>
}

// =============================================================================
// State
// =============================================================================

const isExporting = ref(false)
const isImporting = ref(false)
const isClearing = ref(false)

// =============================================================================
// Helpers
// =============================================================================

/**
 * Generate a timestamped filename for database export
 */
function generateExportFilename(): string {
  const now = new Date()
  const year = String(now.getFullYear())
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `kanji-dictionary-${year}-${month}-${day}.db`
}

/**
 * Trigger a file download in the browser
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Read a file as ArrayBuffer
 */
async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'))
      }
    }
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Validate that data is a valid SQLite database with expected schema
 */
async function validateSqliteData(data: Uint8Array): Promise<boolean> {
  try {
    // Dynamic import for sql.js
    const { default: initSqlJs } = await import('sql.js')
    const SQL = await initSqlJs({
      // Use BASE_URL to ensure correct path on GitHub Pages with /jisaku/ base
      locateFile: (file: string) => `${import.meta.env.BASE_URL}${file}`
    })

    // Try to open the database
    const testDb = new SQL.Database(data)

    // Check that required tables exist
    const result = testDb.exec(
      "SELECT name FROM sqlite_master WHERE type='table'"
    )

    testDb.close()

    // We expect at least the kanjis table
    const tables = result[0]?.values.map((row) => row[0]) ?? []
    return tables.includes('kanjis')
  } catch {
    return false
  }
}

// =============================================================================
// Composable
// =============================================================================

export function useDatabaseExport(): UseDatabaseExport {
  const { database, persist, replaceDatabase, run } = useDatabase()
  const { error: showError, success: showSuccess } = useToast()

  function exportDatabase(): void {
    if (!database.value) {
      showError('Database not initialized')
      return
    }

    try {
      isExporting.value = true

      // Get database as Uint8Array
      const data = database.value.export()

      // Create blob and trigger download
      // Copy to a new ArrayBuffer to ensure compatibility with Blob
      const buffer = new ArrayBuffer(data.length)
      const view = new Uint8Array(buffer)
      view.set(data)
      const blob = new Blob([buffer], { type: 'application/x-sqlite3' })
      const filename = generateExportFilename()
      downloadBlob(blob, filename)

      showSuccess('Database exported successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed'
      showError(message)
    } finally {
      isExporting.value = false
    }
  }

  async function validateDatabaseFile(file: File): Promise<boolean> {
    try {
      // Check file extension
      const validExtensions = ['.db', '.sqlite', '.sqlite3']
      const hasValidExtension = validExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      )

      if (!hasValidExtension) {
        return false
      }

      // Read and validate content
      const buffer = await readFileAsArrayBuffer(file)
      const data = new Uint8Array(buffer)

      return await validateSqliteData(data)
    } catch {
      return false
    }
  }

  async function importDatabase(file: File): Promise<boolean> {
    try {
      isImporting.value = true

      // Read file
      const buffer = await readFileAsArrayBuffer(file)
      const data = new Uint8Array(buffer)

      // Validate
      const isValid = await validateSqliteData(data)
      if (!isValid) {
        showError('Invalid database file')
        return false
      }

      // Replace database (this also runs migrations and persists)
      await replaceDatabase(data)

      showSuccess('Database imported successfully')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import failed'
      showError(message)
      return false
    } finally {
      isImporting.value = false
    }
  }

  async function clearDatabase(): Promise<void> {
    if (!database.value) {
      showError('Database not initialized')
      return
    }

    try {
      isClearing.value = true

      // Delete all data from tables (order matters due to foreign keys)
      // First delete from junction/dependent tables
      run('DELETE FROM component_grouping_members')
      run('DELETE FROM component_groupings')
      run('DELETE FROM component_occurrences')
      run('DELETE FROM component_forms')
      run('DELETE FROM kanji_classifications')
      // Then delete from main tables
      run('DELETE FROM kanjis')
      run('DELETE FROM components')
      // Note: classification_types and position_types are reference data, keep them

      // Persist changes
      await persist()

      showSuccess('All data cleared successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Clear failed'
      showError(message)
    } finally {
      isClearing.value = false
    }
  }

  return {
    isExporting,
    isImporting,
    isClearing,
    exportDatabase,
    importDatabase,
    validateDatabaseFile,
    clearDatabase
  }
}
