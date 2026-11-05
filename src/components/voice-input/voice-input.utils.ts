import { VOICE_INPUT_MIN_LEVEL } from './voice-input.const'

/** A level between the minimum and 1, from a raw level between 0 and 1. */
function clampLevel(level: number) {
  return VOICE_INPUT_MIN_LEVEL + (1 - VOICE_INPUT_MIN_LEVEL) * Math.min(1, Math.max(0, level))
}

/**
 * A bar's level from the microphone: the average loudness of its share of the frequencies (an analyser's
 * `getByteFrequencyData`), the low half of the spectrum spread across the bars, where voices are.
 */
export function bandLevel(data: Uint8Array, bar: number, bars: number): number {
  const voiceBins = Math.max(bars, Math.floor(data.length / 2))
  const size = Math.max(1, Math.floor(voiceBins / bars))
  let sum = 0
  for (let index = bar * size; index < (bar + 1) * size; index++) sum += data[index] ?? 0
  return clampLevel(sum / size / 255)
}

/**
 * A bar's level when there's no microphone to read, as in the docs: two slow waves per bar, out of step with its
 * neighbors, so the bars move like a voice without one.
 */
export function syntheticLevel(seconds: number, bar: number): number {
  const wave = Math.sin(seconds * (3.1 + bar * 0.7) + bar * 1.9) * 0.5 + Math.sin(seconds * 1.3 + bar * 2.6) * 0.5
  return clampLevel(0.45 + wave * 0.4)
}
