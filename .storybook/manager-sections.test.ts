import { describe, expect, it } from 'vitest'

import { readFolded } from './manager-sections'

/** A storage holding one value, or throwing like a blocked one. */
function storage(value: string | null | Error) {
  return {
    getItem() {
      if (value instanceof Error) throw value
      return value
    },
  }
}

describe('readFolded', () => {
  it('reads the folded sections', () => {
    expect(readFolded(storage('["foundations","helpers"]'))).toEqual(new Set(['foundations', 'helpers']))
  })

  it('starts with every section open', () => {
    expect(readFolded(storage(null))).toEqual(new Set())
  })

  it('ignores a value it can not read', () => {
    for (const value of ['not json', '{"foundations":true}', '[1, "helpers"]']) {
      expect(readFolded(storage(value)), value).toEqual(value.startsWith('[1') ? new Set(['helpers']) : new Set())
    }
  })

  it('treats blocked storage as nothing folded', () => {
    expect(readFolded(storage(new Error('SecurityError')))).toEqual(new Set())
  })
})
