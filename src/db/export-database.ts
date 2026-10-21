/**
 * The only sanctioned way to serialise a database.
 *
 * sql.js's `export()` closes and reopens the connection, which resets
 * `PRAGMA foreign_keys` to off. Every export therefore goes through here, and
 * ESLint forbids a raw `.export()` elsewhere in `src/`.
 */

import type { Database } from 'sql.js';

/**
 * Export the database and re-enable foreign key enforcement on the
 * connection the export reopened.
 */
export function exportDatabase(db: Database): Uint8Array {
  const data = db.export();
  db.run('PRAGMA foreign_keys = ON');
  return data;
}
