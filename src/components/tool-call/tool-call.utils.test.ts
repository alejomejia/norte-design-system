import { describe, expect, it } from 'vitest'

import { TOOL_CALL_PROGRESS_LIMIT } from './tool-call.const'
import { runningProgress } from './tool-call.utils'

describe('runningProgress', () => {
  it('starts empty and grows', () => {
    expect(runningProgress(0)).toBe(0)
    expect(runningProgress(2000)).toBeGreaterThan(runningProgress(1000))
  })

  it('keeps four decimals, so a server and a browser print the same value', () => {
    for (const ms of [137, 1200, 4321, 59_999]) {
      expect(String(runningProgress(ms)).split('.')[1]?.length ?? 0, String(ms)).toBeLessThanOrEqual(4)
    }
  })

  it('never reaches the end', () => {
    expect(runningProgress(10 * 60_000)).toBeLessThanOrEqual(TOOL_CALL_PROGRESS_LIMIT)
  })
})
