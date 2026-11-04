import { describe, expect, it } from 'vitest'

import { TOOL_CALL_PROGRESS_LIMIT } from './tool-call.const'
import { formatElapsed, runningProgress } from './tool-call.utils'

describe('formatElapsed', () => {
  it.each([
    [400, '0.4s'],
    [9940, '9.9s'],
    [12_300, '12s'],
    [64_000, '1m 04s'],
    [-5, '0.0s'],
  ])('shows %dms as %s', (ms, text) => {
    expect(formatElapsed(ms)).toBe(text)
  })
})

describe('runningProgress', () => {
  it('starts empty and grows', () => {
    expect(runningProgress(0)).toBe(0)
    expect(runningProgress(2000)).toBeGreaterThan(runningProgress(1000))
  })

  it('never reaches the end', () => {
    expect(runningProgress(10 * 60_000)).toBeLessThanOrEqual(TOOL_CALL_PROGRESS_LIMIT)
  })
})
