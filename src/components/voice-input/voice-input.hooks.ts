'use client'

import { type RefObject, useEffect } from 'react'

import { useInViewport, useReducedMotion } from '@/lib/hooks'

import { VOICE_INPUT_MIN_LEVEL } from './voice-input.const'
import { bandLevel, syntheticLevel } from './voice-input.utils'

/**
 * Moves the level bars while recording: from the microphone's stream when there is one (a Web Audio analyser), from a
 * synthetic signal otherwise. Every frame writes each bar's `scale` straight to the element, never through React
 * state, and only while the control is on screen. Under reduced motion the bars hold a middle level.
 */
export function useLevelBars(
  rootRef: RefObject<Element | null>,
  barsRef: RefObject<(HTMLElement | null)[]>,
  { active, stream }: { active: boolean; stream?: MediaStream | null },
) {
  const visible = useInViewport(rootRef)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const bars = barsRef.current
    function draw(level: (bar: number) => number) {
      bars.forEach((bar, index) => {
        if (bar) bar.style.scale = `1 ${level(index)}`
      })
    }

    if (!active) return draw(() => VOICE_INPUT_MIN_LEVEL)
    if (reducedMotion) return draw(() => 0.6)
    if (!visible) return

    let context: AudioContext | undefined
    let source: MediaStreamAudioSourceNode | undefined
    let analyser: AnalyserNode | undefined
    let data: Uint8Array<ArrayBuffer> | undefined
    if (stream) {
      context = new AudioContext()
      source = context.createMediaStreamSource(stream)
      analyser = context.createAnalyser()
      analyser.fftSize = 64
      analyser.smoothingTimeConstant = 0.7
      source.connect(analyser)
      data = new Uint8Array(analyser.frequencyBinCount)
    }

    const start = performance.now()
    let frame = 0
    function tick(now: number) {
      if (analyser && data) {
        analyser.getByteFrequencyData(data)
        const levels = data
        draw((bar) => bandLevel(levels, bar, bars.length))
      } else {
        draw((bar) => syntheticLevel((now - start) / 1000, bar))
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      source?.disconnect()
      void context?.close()
    }
  }, [active, stream, visible, reducedMotion, barsRef])
}
