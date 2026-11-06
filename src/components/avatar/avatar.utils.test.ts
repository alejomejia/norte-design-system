import { describe, expect, it } from 'vitest'

import { avatarSeed } from './avatar.utils'

describe('avatarSeed', () => {
  it('gives the same name the same seed', () => {
    expect(avatarSeed('Research agent')).toBe(avatarSeed('Research agent'))
  })

  it('gives different names different seeds', () => {
    expect(avatarSeed('Research agent')).not.toBe(avatarSeed('Code agent'))
  })

  it('stays between 0 and 100', () => {
    for (const name of ['', 'Research agent', 'Agente de investigación', '🤖']) {
      expect(avatarSeed(name)).toBeGreaterThanOrEqual(0)
      expect(avatarSeed(name)).toBeLessThan(100)
    }
  })
})
