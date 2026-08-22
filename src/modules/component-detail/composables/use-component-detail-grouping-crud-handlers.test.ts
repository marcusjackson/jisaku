/**
 * Tests for use-component-detail-grouping-crud-handlers
 */

import { ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createGroupingAdd,
  createGroupingRemove,
  createGroupingReorder,
  createGroupingUpdate
} from './use-component-detail-grouping-crud-handlers'

import type { GroupingFormData } from '../component-detail-types'
import type {
  GroupingRepo,
  Reloader,
  Toast
} from './use-component-detail-grouping-crud-handlers'

function makeToast(): Toast {
  return { success: vi.fn(), error: vi.fn() } as unknown as Toast
}

function makeRepo(): GroupingRepo {
  return {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    reorder: vi.fn()
  } as unknown as GroupingRepo
}

const formData: GroupingFormData = { name: 'Test Group', description: 'desc' }

describe('createGroupingAdd', () => {
  let repo: GroupingRepo
  let toast: Toast
  let reload: Reloader

  beforeEach(() => {
    repo = makeRepo()
    toast = makeToast()
    reload = vi.fn()
  })

  it('calls repo.create and reloads on success', () => {
    const componentId = ref<number | null>(1)
    const handler = createGroupingAdd(componentId, repo, reload, toast)

    handler(formData)

    expect(repo.create).toHaveBeenCalledWith({
      componentId: 1,
      name: 'Test Group',
      description: 'desc'
    })
    expect(reload).toHaveBeenCalledTimes(1)
    expect(toast.success).toHaveBeenCalledWith('Grouping added')
  })

  it('does nothing when componentId is null', () => {
    const componentId = ref<number | null>(null)
    const handler = createGroupingAdd(componentId, repo, reload, toast)

    handler(formData)

    expect(repo.create).not.toHaveBeenCalled()
  })

  it('shows error toast on repo failure', () => {
    const componentId = ref<number | null>(1)
    vi.mocked(repo.create).mockImplementation(() => {
      throw new Error('DB error')
    })
    const handler = createGroupingAdd(componentId, repo, reload, toast)

    handler(formData)

    expect(toast.error).toHaveBeenCalledWith('DB error')
    expect(reload).not.toHaveBeenCalled()
  })
})

describe('createGroupingUpdate', () => {
  let repo: GroupingRepo
  let toast: Toast
  let reload: Reloader

  beforeEach(() => {
    repo = makeRepo()
    toast = makeToast()
    reload = vi.fn()
  })

  it('calls repo.update and reloads on success', () => {
    const handler = createGroupingUpdate(repo, reload, toast)

    handler(5, formData)

    expect(repo.update).toHaveBeenCalledWith(5, {
      name: 'Test Group',
      description: 'desc'
    })
    expect(reload).toHaveBeenCalledTimes(1)
    expect(toast.success).toHaveBeenCalledWith('Grouping updated')
  })

  it('shows error toast on repo failure', () => {
    vi.mocked(repo.update).mockImplementation(() => {
      throw new Error('Update failed')
    })
    const handler = createGroupingUpdate(repo, reload, toast)

    handler(5, formData)

    expect(toast.error).toHaveBeenCalledWith('Update failed')
    expect(reload).not.toHaveBeenCalled()
  })
})

describe('createGroupingRemove', () => {
  let repo: GroupingRepo
  let toast: Toast
  let reload: Reloader

  beforeEach(() => {
    repo = makeRepo()
    toast = makeToast()
    reload = vi.fn()
  })

  it('calls repo.remove and reloads on success', () => {
    const handler = createGroupingRemove(repo, reload, toast)

    handler(3)

    expect(repo.remove).toHaveBeenCalledWith(3)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(toast.success).toHaveBeenCalledWith('Grouping deleted')
  })

  it('shows error toast on repo failure', () => {
    vi.mocked(repo.remove).mockImplementation(() => {
      throw new Error('Delete failed')
    })
    const handler = createGroupingRemove(repo, reload, toast)

    handler(3)

    expect(toast.error).toHaveBeenCalledWith('Delete failed')
  })
})

describe('createGroupingReorder', () => {
  let repo: GroupingRepo
  let toast: Toast
  let reload: Reloader

  beforeEach(() => {
    repo = makeRepo()
    toast = makeToast()
    reload = vi.fn()
  })

  it('calls repo.reorder and reloads on success', () => {
    const handler = createGroupingReorder(repo, reload, toast)

    handler([3, 1, 2])

    expect(repo.reorder).toHaveBeenCalledWith([3, 1, 2])
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('shows error toast on repo failure', () => {
    vi.mocked(repo.reorder).mockImplementation(() => {
      throw new Error('Reorder failed')
    })
    const handler = createGroupingReorder(repo, reload, toast)

    handler([1, 2])

    expect(toast.error).toHaveBeenCalledWith('Reorder failed')
  })
})
