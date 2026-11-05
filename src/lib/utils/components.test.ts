import { describe, expect, it } from 'vitest'

import { nameParts } from './components'

describe('nameParts', () => {
  it('names each part after the component and returns them', () => {
    function MenuItem() {
      return null
    }
    const parts = nameParts('Menu', { Item: MenuItem })
    expect(parts.Item).toBe(MenuItem)
    expect((MenuItem as { displayName?: string }).displayName).toBe('Menu.Item')
  })
})
