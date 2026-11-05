import { describe, expect, it } from 'vitest'

import { VOICE_INPUT_MIN_LEVEL } from './voice-input.const'
import { bandLevel, formatRecordingTime, syntheticLevel } from './voice-input.utils'

describe('bandLevel', () => {
  it('reads silence as the minimum and full volume as 1', () => {
    expect(bandLevel(new Uint8Array(32), 0, 5)).toBe(VOICE_INPUT_MIN_LEVEL)
    expect(bandLevel(new Uint8Array(32).fill(255), 4, 5)).toBe(1)
  })

  it('gives each bar its own band', () => {
    const data = new Uint8Array(32)
    data.fill(255, 0, 3)
    expect(bandLevel(data, 0, 5)).toBeGreaterThan(bandLevel(data, 4, 5))
  })
})

describe('syntheticLevel', () => {
  it('stays between the minimum and 1', () => {
    for (let time = 0; time < 10; time += 0.37) {
      for (let bar = 0; bar < 5; bar++) {
        const level = syntheticLevel(time, bar)
        expect(level).toBeGreaterThanOrEqual(VOICE_INPUT_MIN_LEVEL)
        expect(level).toBeLessThanOrEqual(1)
      }
    }
  })
})

describe('formatRecordingTime', () => {
  it('reads as a clock of whole seconds', () => {
    expect(formatRecordingTime(0)).toBe('0:00')
    expect(formatRecordingTime(4_900)).toBe('0:04')
    expect(formatRecordingTime(65_000)).toBe('1:05')
    expect(formatRecordingTime(750_000)).toBe('12:30')
  })

  it('never goes below zero', () => {
    expect(formatRecordingTime(-500)).toBe('0:00')
  })
})
