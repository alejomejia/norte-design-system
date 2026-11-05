import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { subscribeToFrames } from './frame-loop'

/** A fake `requestAnimationFrame`: frames run when the test says so. */
let pending = new Map<number, FrameRequestCallback>()
let nextId = 1

function runFrame(now: number) {
  const due = pending
  pending = new Map()
  for (const callback of due.values()) callback(now)
}

beforeEach(() => {
  pending = new Map()
  nextId = 1
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const id = nextId++
    pending.set(id, callback)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('subscribeToFrames', () => {
  it('runs every subscriber on one shared frame', () => {
    const first = vi.fn()
    const second = vi.fn()
    const unsubscribeFirst = subscribeToFrames(first)
    const unsubscribeSecond = subscribeToFrames(second)
    expect(pending.size).toBe(1)

    runFrame(16)
    expect(first).toHaveBeenCalledWith(16)
    expect(second).toHaveBeenCalledWith(16)
    expect(pending.size).toBe(1)

    unsubscribeFirst()
    unsubscribeSecond()
  })

  it('keeps running while one subscriber is left', () => {
    const first = vi.fn()
    const second = vi.fn()
    const unsubscribeFirst = subscribeToFrames(first)
    const unsubscribeSecond = subscribeToFrames(second)

    unsubscribeFirst()
    runFrame(32)
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith(32)

    unsubscribeSecond()
  })

  it('stops the loop when the last subscriber leaves, and starts again with the next', () => {
    const unsubscribe = subscribeToFrames(vi.fn())
    unsubscribe()
    expect(pending.size).toBe(0)

    const callback = vi.fn()
    const unsubscribeAgain = subscribeToFrames(callback)
    expect(pending.size).toBe(1)
    runFrame(48)
    expect(callback).toHaveBeenCalledWith(48)

    unsubscribeAgain()
  })
})
