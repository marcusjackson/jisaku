/**
 * Database migration infrastructure tests.
 *
 * Verifies that running all migrations against an empty SQLite database
 * produces the expected schema — ensuring the migration runner stays in sync
 * with the schema used by repositories and test helpers.
 */

import initSqlJs from 'sql.js'
import { describe, expect, it } from 'vitest'

import { runMigrations } from './migrations'

async function createMigratedDb() {
  const SQL = await initSqlJs()
  const db = new SQL.Database()
  db.run('PRAGMA foreign_keys = ON')
  runMigrations(db)
  return db
}

describe('Database migrations', () => {
  it('applies all migrations without throwing', async () => {
    await expect(createMigratedDb()).resolves.toBeDefined()
  })

  it('creates all expected top-level tables', async () => {
    const db = await createMigratedDb()

    const result = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    )
    const tables = (result[0]?.values ?? []).map((r) => r[0] as string)

    // Core entity tables that all repositories depend on
    const expected = [
      'classification_types',
      'component_forms',
      'component_groupings',
      'component_grouping_members',
      'component_occurrences',
      'components',
      'kanji_classifications',
      'kanji_meanings',
      'kanjis',
      'kun_readings',
      'on_readings',
      'position_types',
      'vocabulary',
      'vocab_kanji'
    ]

    for (const table of expected) {
      expect(tables).toContain(table)
    }
  })

  it('sets a non-zero user_version after migrations', async () => {
    const db = await createMigratedDb()

    const result = db.exec('PRAGMA user_version')
    const version = result[0]?.values[0]?.[0] as number

    expect(version).toBeGreaterThan(0)
  })

  it('enables foreign_keys pragma', async () => {
    const db = await createMigratedDb()

    const result = db.exec('PRAGMA foreign_keys')
    const foreignKeysEnabled = result[0]?.values[0]?.[0]

    expect(foreignKeysEnabled).toBe(1)
  })

  it('can apply migrations idempotently (running twice does not throw)', async () => {
    const db = await createMigratedDb()

    // Running migrations again on an already-migrated DB should be a no-op
    expect(() => {
      runMigrations(db)
    }).not.toThrow()
  })
})
