/**
 * Tests for inTransaction
 */

import { describe, expect, it } from 'vitest';

import { inTransaction } from './transaction';

function makeRun() {
  const statements: string[] = [];
  return { statements, run: (sql: string) => void statements.push(sql) };
}

describe('inTransaction', () => {
  it('commits and returns the result', () => {
    const { run, statements } = makeRun();
    expect(inTransaction(run, () => 7)).toBe(7);
    expect(statements).toEqual(['BEGIN TRANSACTION', 'COMMIT']);
  });

  it('rolls back and rethrows', () => {
    const { run, statements } = makeRun();
    expect(() =>
      inTransaction(run, () => {
        throw new Error('boom');
      })
    ).toThrow('boom');
    expect(statements).toEqual(['BEGIN TRANSACTION', 'ROLLBACK']);
  });

  it('rethrows the original error when ROLLBACK itself throws', () => {
    const run = (sql: string) => {
      if (sql === 'ROLLBACK') throw new Error('no transaction is active');
    };
    expect(() =>
      inTransaction(run, () => {
        throw new Error('original');
      })
    ).toThrow('original');
  });

  it('rejects an async callback and rolls back', () => {
    const { run, statements } = makeRun();
    expect(() => inTransaction(run, () => Promise.resolve(1))).toThrow('synchronous');
    expect(statements).toEqual(['BEGIN TRANSACTION', 'ROLLBACK']);
  });

  it('joins an open transaction: one BEGIN and one COMMIT', () => {
    const { run, statements } = makeRun();
    inTransaction(run, () => {
      inTransaction(run, () => undefined);
    });
    expect(statements).toEqual(['BEGIN TRANSACTION', 'COMMIT']);
  });

  it('rolls the whole transaction back when a joined call throws', () => {
    const { run, statements } = makeRun();
    expect(() =>
      inTransaction(run, () =>
        inTransaction(run, () => {
          throw new Error('inner');
        })
      )
    ).toThrow('inner');
    expect(statements).toEqual(['BEGIN TRANSACTION', 'ROLLBACK']);
  });

  it('starts a fresh transaction after a failed one', () => {
    const { run, statements } = makeRun();
    expect(() =>
      inTransaction(run, () => {
        throw new Error('x');
      })
    ).toThrow();
    inTransaction(run, () => undefined);
    expect(statements).toEqual(['BEGIN TRANSACTION', 'ROLLBACK', 'BEGIN TRANSACTION', 'COMMIT']);
  });
});
