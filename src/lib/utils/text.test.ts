import { describe, expect, it } from 'vitest'

import { initials } from './text'

describe('initials', () => {
  it.each([
    ['Sofía Herrera', 'SH'],
    ['mei lin', 'ML'],
    ['Amara  Diallo ', 'AD'],
    ['Lucas Moreau Vidal', 'LV'],
    ['Jean-Luc Moreau', 'JM'],
    ['Lumen', 'L'],
    ['Ñandú', 'Ñ'],
    ['😀 Jonas', '😀J'],
    ['', ''],
    ['   ', ''],
  ])('takes %j as %j', (name, expected) => {
    expect(initials(name)).toBe(expected)
  })
})
