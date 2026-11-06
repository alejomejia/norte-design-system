import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { mergeRefs } from './refs'

describe('mergeRefs', () => {
  it('sets object refs and calls callback refs with the node', () => {
    const objectRef = createRef<string>()
    const callbackRef = vi.fn()
    mergeRefs(objectRef, callbackRef, undefined)('input')
    expect(objectRef.current).toBe('input')
    expect(callbackRef).toHaveBeenCalledWith('input')
  })

  it('clears object refs and calls callback refs with null on detach', () => {
    const objectRef = createRef<string>()
    const callbackRef = vi.fn()
    const detach = mergeRefs(objectRef, callbackRef)('input')
    if (typeof detach === 'function') detach()
    expect(objectRef.current).toBeNull()
    expect(callbackRef).toHaveBeenLastCalledWith(null)
  })

  it('runs the cleanup a callback ref returns instead of calling it with null', () => {
    const cleanup = vi.fn()
    const callbackRef = vi.fn(() => cleanup)
    const detach = mergeRefs(callbackRef)('input')
    if (typeof detach === 'function') detach()
    expect(cleanup).toHaveBeenCalledOnce()
    expect(callbackRef).toHaveBeenCalledOnce()
  })
})
