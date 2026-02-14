import { describe, expect, it } from 'vitest'

import { APP_VERSION } from './constants'

describe('Settings Constants', () => {
  it('should export APP_VERSION as a string', () => {
    expect(typeof APP_VERSION).toBe('string')
    expect(APP_VERSION).toBeTruthy()
  })
})
