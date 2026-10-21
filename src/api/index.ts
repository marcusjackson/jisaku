/**
 * API Layer - Public Exports
 *
 * Re-exports all public API types, error classes, base classes and the
 * repository modules.
 */

// Types and interfaces
export type {
  ChildRepository,
  FieldUpdatable,
  Orderable,
  QueryResult,
  Repository,
  UpdatableField,
} from './api-types';

// Error classes
export { CreateError, EntityNotFoundError, RepositoryError, UpdateError } from './api-types';

// Base classes and utilities
export { BaseRepository } from './base-repository';

// ============================================================================
// Module re-exports
// ============================================================================

// Domain modules
export * from './component'; // Components + forms + occurrences + groupings
export * from './kanji'; // Kanji + readings + meanings
export * from './vocabulary'; // Vocabulary + vocab-kanji links

// Reference data modules
export * from './classification'; // Classification types (kanji etymology) + junction
export * from './position'; // Position types (component placement)
