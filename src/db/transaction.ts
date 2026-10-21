/**
 * The one BEGIN / COMMIT / ROLLBACK implementation.
 *
 * `run` is `useDatabase().run`, so persist scheduling is unchanged. A call
 * made while another is open joins it: only the outermost call issues
 * BEGIN / COMMIT / ROLLBACK, so any failure rolls back the whole outer
 * transaction. There are no savepoints, so an inner step cannot be undone
 * alone, and a caller that catches an inner error keeps the outer open.
 */
let depth = 0;

export function inTransaction<T>(run: (sql: string) => void, fn: () => T): T {
  if (depth > 0) return fn();
  run('BEGIN TRANSACTION');
  depth++;
  try {
    const result = fn();
    // An async callback would be committed before it finishes; fail loudly instead
    if (typeof (result as { then?: unknown } | null)?.then === 'function') {
      throw new TypeError('inTransaction callback must be synchronous');
    }
    run('COMMIT');
    return result;
  } catch (err) {
    try {
      run('ROLLBACK');
    } catch {
      // A failed rollback must not hide the error that caused it
    }
    throw err;
  } finally {
    depth--;
  }
}
