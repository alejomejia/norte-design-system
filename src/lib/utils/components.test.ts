import { createElement, Fragment } from 'react'
import { describe, expect, it } from 'vitest'

import { flattenChildren, nameParts } from './components'

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

describe('flattenChildren', () => {
  function Item() {
    return null
  }

  it('opens fragments, nested ones too, in order', () => {
    const children = [
      createElement(Item, { id: 'a' }),
      createElement(
        Fragment,
        null,
        createElement(Item, { id: 'b' }),
        createElement(Fragment, null, createElement(Item, { id: 'c' })),
      ),
    ]
    expect(flattenChildren(children).map((child) => (child.props as { id: string }).id)).toEqual(['a', 'b', 'c'])
  })

  it('keeps keys unique across fragments', () => {
    const children = [
      createElement(Fragment, null, createElement(Item), createElement(Item)),
      createElement(Fragment, null, createElement(Item), createElement(Item)),
    ]
    const keys = flattenChildren(children).map((child) => child.key)
    expect(new Set(keys).size).toBe(4)
  })

  it('drops text, numbers and empty children', () => {
    expect(flattenChildren(['text', 3, null, false, undefined, createElement(Item)])).toHaveLength(1)
  })
})
