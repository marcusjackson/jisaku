/**
 * useDatabaseExport
 *
 * Composable for database export, import, and clear operations.
 * Used in settings page for data management.
 */

import { ref } from 'vue'

import { useDatabase } from '@/shared/composables/use-database'
import { useToast } from '@/shared/composables/use-toast'

import type { Database } from 'sql.js'
import type { Ref } from 'vue'

/**
 * Generate a timestamped filename for database export
 */
function generateExportFilename(): string {
  const now = new Date()
  const year = String(now.getFullYear())
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `kanji-dictionary-${year}-${month}-${day}-${hours}-${minutes}.db`
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
    const { default: initSqlJs } = await import('sql.js')
    const SQL = await initSqlJs({
      locateFile: (file: string) => `${import.meta.env.BASE_URL}${file}`
    })

    const testDb = new SQL.Database(data)

    const result = testDb.exec(
      "SELECT name FROM sqlite_master WHERE type='table'"
    )

    testDb.close()

    const tables = result[0]?.values.map((row) => row[0]) ?? []
    return tables.includes('kanjis')
  } catch {
    return false
  }
}

export interface UseDatabaseExport {
  isExporting: Ref<boolean>
  isImporting: Ref<boolean>
  isClearing: Ref<boolean>
  exportDatabase: () => void
  importDatabase: (file: File) => Promise<boolean>
  validateDatabaseFile: (file: File) => Promise<boolean>
  clearDatabase: () => Promise<void>
}

const isExporting = ref(false)
const isImporting = ref(false)
const isClearing = ref(false)

export function useDatabaseExport(): UseDatabaseExport {
  const { database, persist, replaceDatabase, run } = useDatabase()
  const toast = useToast()

  function exportDatabase(): void {
    performExport(database, toast)
  }

  async function validateDatabaseFile(file: File): Promise<boolean> {
    return await performValidate(file)
  }

  async function importDatabase(file: File): Promise<boolean> {
    return await performImport(file, toast, replaceDatabase)
  }

  async function clearDatabase(): Promise<void> {
    await performClear(database, toast, run, persist)
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

function performExport(
  database: Ref<Database | null>,
  toast: ReturnType<typeof useToast>
): void {
  if (!database.value) {
    toast.error('Database not initialized')
    return
  }

  try {
    isExporting.value = true
    const data = database.value.export()
    const buffer = new ArrayBuffer(data.length)
    const view = new Uint8Array(buffer)
    view.set(data)
    const blob = new Blob([buffer], { type: 'application/x-sqlite3' })
    const filename = generateExportFilename()
    downloadBlob(blob, filename)
    toast.success('Database exported successfully')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Export failed'
    toast.error(message)
  } finally {
    isExporting.value = false
  }
}

async function performValidate(file: File): Promise<boolean> {
  try {
    const validExtensions = ['.db', '.sqlite', '.sqlite3']
    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    )
    if (!hasValidExtension) return false

    const buffer = await readFileAsArrayBuffer(file)
    const data = new Uint8Array(buffer)
    return await validateSqliteData(data)
  } catch {
    return false
  }
}

async function performImport(
  file: File,
  toast: ReturnType<typeof useToast>,
  replaceDatabase: (data: Uint8Array) => Promise<void>
): Promise<boolean> {
  try {
    isImporting.value = true
    const buffer = await readFileAsArrayBuffer(file)
    const data = new Uint8Array(buffer)
    const isValid = await validateSqliteData(data)
    if (!isValid) {
      toast.error('Invalid database file')
      return false
    }
    await replaceDatabase(data)
    toast.success('Database imported successfully')
    return true
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed'
    toast.error(message)
    return false
  } finally {
    isImporting.value = false
  }
}

async function performClear(
  database: Ref<Database | null>,
  toast: ReturnType<typeof useToast>,
  run: (sql: string) => void,
  persist: () => Promise<void>
): Promise<void> {
  if (!database.value) {
    toast.error('Database not initialized')
    return
  }

  try {
    isClearing.value = true
    run('DELETE FROM component_grouping_members')
    run('DELETE FROM component_groupings')
    run('DELETE FROM component_occurrences')
    run('DELETE FROM component_forms')
    run('DELETE FROM kanji_classifications')
    run('DELETE FROM kanji_meanings')
    run('DELETE FROM on_readings')
    run('DELETE FROM kun_readings')
    run('DELETE FROM vocab_kanji')
    run('DELETE FROM vocabulary')
    run('DELETE FROM kanjis')
    run('DELETE FROM components')
    await persist()
    toast.success('All data cleared successfully')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Clear failed'
    toast.error(message)
  } finally {
    isClearing.value = false
  }
}
