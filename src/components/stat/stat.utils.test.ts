import { describe, expect, it } from 'vitest'

import { statChangeTone } from './stat.utils'

describe('statChangeTone', () => {
  it('is success when the stat moved the better way', () => {
    expect(statChangeTone('down', 'down')).toBe('success')
    expect(statChangeTone('up', 'up')).toBe('success')
  })

  it('is danger when it moved the other way', () => {
    expect(statChangeTone('up', 'down')).toBe('danger')
    expect(statChangeTone('down', 'up')).toBe('danger')
  })

  it('is neutral when it stayed flat or neither way is better', () => {
    expect(statChangeTone('flat', 'down')).toBe('neutral')
    expect(statChangeTone('up', 'none')).toBe('neutral')
  })
})
