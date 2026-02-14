/**
 * Component Repository
 *
 * Data access layer for component entities.
 * Components are building blocks of kanji (radicals, sub-components).
 *
 * @module api/component
 */

import { ComponentMutations } from './component-mutations'
import { ComponentQueries } from './component-queries'

import type { FieldUpdatable, Repository, UpdatableField } from '../types'
import type {
  Component,
  ComponentFilters,
  CreateComponentInput,
  UpdateComponentInput
} from './component-types'

// ============================================================================
// Repository Implementation
// ============================================================================

class ComponentRepositoryImpl
  implements
    Repository<Component, CreateComponentInput, UpdateComponentInput>,
    FieldUpdatable<Component>
{
  private readonly queries: ComponentQueries
  private readonly mutations: ComponentMutations

  constructor() {
    this.queries = new ComponentQueries()
    this.mutations = new ComponentMutations(this.queries)
  }

  // ==========================================================================
  // Read Operations (delegated to queries)
  // ==========================================================================

  getById(id: number): Component | null {
    return this.queries.getById(id)
  }

  getAll(): Component[] {
    return this.queries.getAll()
  }

  getByCharacter(character: string): Component | null {
    return this.queries.getByCharacter(character)
  }

  getByIds(ids: number[]): Component[] {
    return this.queries.getByIds(ids)
  }

  getRadicals(): Component[] {
    return this.queries.getRadicals()
  }

  getByKangxiNumber(kangxiNumber: number): Component | null {
    return this.queries.getByKangxiNumber(kangxiNumber)
  }

  search(filters?: ComponentFilters): Component[] {
    return this.queries.search(filters)
  }

  getFormsCount(): Map<number, number> {
    return this.queries.getFormsCount()
  }

  getGroupingsCount(): Map<number, number> {
    return this.queries.getGroupingsCount()
  }

  // ==========================================================================
  // Write Operations (delegated to mutations)
  // ==========================================================================

  create(input: CreateComponentInput): Component {
    return this.mutations.create(input)
  }

  update(id: number, input: UpdateComponentInput): Component {
    return this.mutations.update(id, input)
  }

  updateField<K extends UpdatableField<Component>>(
    id: number,
    field: K,
    value: Component[K]
  ): Component {
    return this.mutations.updateField(id, field, value)
  }

  remove(id: number): void {
    this.mutations.remove(id)
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function useComponentRepository(): ComponentRepositoryImpl {
  return new ComponentRepositoryImpl()
}

export type {
  Component,
  ComponentFilters,
  CreateComponentInput,
  UpdateComponentInput
}
