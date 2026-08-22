/**
 * Base Repository
 *
 * Abstract base class providing common CRUD operations.
 * All entity repositories should extend this class.
 */

import { useDatabase } from '@/shared/composables/use-database'

import type { QueryResult } from './api-types'

/**
 * Abstract base class for repositories
 *
 * Provides common helper methods for:
 * - Converting query results to entities
 * - Converting snake_case to camelCase
 * - Standard CRUD operation patterns
 *
 * @typeParam T - Entity type
 */
export abstract class BaseRepository<T> {
  /** Database table name */
  protected abstract tableName: string

  /** Map a database row to an entity */
  protected abstract mapRow(row: Record<string, unknown>): T

  /**
   * Convert a single-row query result to an entity
   */
  protected resultToEntity(result: QueryResult[]): T | null {
    if (!result[0]?.values[0]) return null
    return this.mapRow(this.rowToObject(result[0]))
  }

  /**
   * Convert a multi-row query result to an array of entities
   */
  protected resultToList(result: QueryResult[]): T[] {
    const firstResult = result[0]
    if (!firstResult) return []
    return firstResult.values.map((row) =>
      this.mapRow(
        this.rowToObject({ columns: firstResult.columns, values: [row] })
      )
    )
  }

  /**
   * Convert a query result row to an object
   */
  protected rowToObject(result: {
    columns: string[]
    values: unknown[][]
  }): Record<string, unknown> {
    const obj: Record<string, unknown> = {}
    result.columns.forEach((col, i) => {
      obj[col] = result.values[0]?.[i]
    })
    return obj
  }

  /**
   * Convert camelCase to snake_case for database columns
   */
  protected camelToSnake(str: string): string {
    return str.replaceAll(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  }

  /**
   * Convert snake_case to camelCase for entity properties
   */
  protected snakeToCamel(str: string): string {
    return str.replaceAll(/_([a-z])/g, (_, letter: string) =>
      letter.toUpperCase()
    )
  }

  /**
   * Wrap a function in a database transaction.
   *
   * Rolls back automatically on error and re-throws.
   *
   * @example
   * return this.withTransaction(() => {
   *   this.run('DELETE ...')
   *   this.run('INSERT ...')
   * })
   */
  protected withTransaction<T>(fn: () => T): T {
    const { run } = useDatabase()
    run('BEGIN TRANSACTION')
    try {
      const result = fn()
      run('COMMIT')
      return result
    } catch (err) {
      run('ROLLBACK')
      throw err
    }
  }

  /**
   * Get the current maximum `display_order` value in a table.
   *
   * Returns `-1` if the table is empty, so that the next insert
   * can use `getMaxDisplayOrder(...) + 1` to place an item last.
   *
   * @param tableName - SQL table name (hardcoded constant — not user input)
   * @param whereClause - Optional WHERE clause, e.g. `'WHERE kanji_id = ?'`
   * @param params - Positional parameters for the WHERE clause
   */
  protected getMaxDisplayOrder(
    tableName: string,
    whereClause = '',
    params: unknown[] = []
  ): number {
    const { exec } = useDatabase()
    const clause = whereClause ? ` ${whereClause}` : ''
    const sql = `SELECT MAX(display_order) as max_order FROM ${tableName}${clause}`
    const result = exec(sql, params.length > 0 ? params : undefined)
    return (result[0]?.values[0]?.[0] as number | null) ?? -1
  }
}
