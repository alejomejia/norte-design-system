'use client'

import { type RefObject, useEffect, useEffectEvent, useState } from 'react'

import { useInViewport, useReducedMotion } from '@/lib/hooks'
import { MOTION_DURATION, MOTION_EASE } from '@/lib/motion'

import { SIGN_IN_REPLAY } from './sign-in.const'

/**
 * Runs `onDone` once, `delay` ms after `active` turns on, and not if it turns off first: the page's pretend server.
 * Leaving the page cancels it.
 */
export function useAfter(active: boolean, delay: number, onDone: () => void) {
  const done = useEffectEvent(onDone)
  useEffect(() => {
    if (!active) return
    const timer = window.setTimeout(() => done(), delay)
    return () => window.clearTimeout(timer)
  }, [active, delay])
}

/**
 * Seconds left before something can happen again, like sending a new code. It counts toward a deadline, not in ticks,
 * so a tab the browser slowed down in the background still shows the right time when it comes back.
 */
export function useCountdown(seconds: number) {
  const [deadline, setDeadline] = useState(() => Date.now() + seconds * 1000)
  const [now, setNow] = useState(() => Date.now())
  const left = Math.max(0, Math.ceil((deadline - now) / 1000))

  useEffect(() => {
    if (left === 0) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [left])

  function restart() {
    const start = Date.now()
    setNow(start)
    setDeadline(start + seconds * 1000)
  }

  return { left, restart }
}

/**
 * Focuses a step's first field (or whatever carries `data-step-focus`) as it appears, when a person moved to it. A step
 * the page opens on leaves focus alone: it may be one of several stories on a docs page.
 */
export function useStepFocus(ref: RefObject<HTMLElement | null>, moved: boolean) {
  const focusFirst = useEffectEvent(() => {
    if (!moved) return
    ref.current?.querySelector<HTMLElement>('input, [data-step-focus]')?.focus({ preventScroll: true })
  })
  useEffect(() => focusFirst(), [])
}

/**
 * Makes a bottom-anchored feed glide when it grows, like a chat scrolling: whatever arrives at the bottom pushes the
 * rest up at once, so the feed starts that much lower and slides back into place. Only `transform` moves, through the
 * Web Animations API; slides that overlap add up (`composite: 'add'`), so a burst of new lines still reads as one
 * smooth scroll. Nothing moves under reduced motion. Client-only.
 */
export function useGlideOnGrow(ref: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion()

  useEffect(() => {
    const element = ref.current
    if (!element || reduced) return
    let height = element.offsetHeight
    const [x1, y1, x2, y2] = MOTION_EASE.enter
    const observer = new ResizeObserver(() => {
      const next = element.offsetHeight
      const grew = next - height
      height = next
      if (grew <= 0) return
      element.animate([{ transform: `translateY(${grew}px)` }, { transform: 'translateY(0)' }], {
        duration: MOTION_DURATION.appear * 1000,
        easing: `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`,
        composite: 'add',
      })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, reduced])
}

/**
 * Plays run #128 in the brand panel, one beat at a time, then holds the last and starts over. Paused while the panel
 * is off-screen or hidden (it's `display: none` on narrow screens), and under reduced motion it holds the last beat
 * still. `beatTimes` are when each beat played, for the timers of the run and its tool calls; `loop` counts the
 * replays, as a key that starts the panel over.
 */
export function useRunReplay(ref: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion()
  const visible = useInViewport(ref)
  const playing = visible && !reduced
  const last = SIGN_IN_REPLAY.beats.length - 1

  const [loop, setLoop] = useState(0)
  const [beat, setBeat] = useState(0)
  const [words, setWords] = useState(0)
  const [beatTimes, setBeatTimes] = useState<number[]>(() => [Date.now()])

  const next = useEffectEvent(() => {
    if (beat < last) {
      setBeat(beat + 1)
      setBeatTimes((times) => [...times, Date.now()])
      return
    }
    setLoop(loop + 1)
    setBeat(0)
    setWords(0)
    setBeatTimes([Date.now()])
  })

  // A run that hasn't started yet (the page opened in a background tab, or below the fold) starts its clock when it
  // starts playing, not when it mounted.
  const startClock = useEffectEvent(() => {
    if (beat === 0) setBeatTimes([Date.now()])
  })
  useEffect(() => {
    if (playing) startClock()
  }, [playing])

  useEffect(() => {
    if (!playing) return
    const { beats, hold } = SIGN_IN_REPLAY
    const delay = beat < last ? (beats[beat + 1] ?? 0) - (beats[beat] ?? 0) : hold
    const timer = window.setTimeout(() => next(), delay)
    return () => window.clearTimeout(timer)
  }, [playing, beat, last])

  // The summary arrives a word at a time while its beat plays.
  const total = SIGN_IN_REPLAY.summary.split(' ').length
  const streaming = playing && beat === SIGN_IN_REPLAY.streamBeat && words < total
  useEffect(() => {
    if (!streaming) return
    const timer = window.setInterval(() => setWords((count) => count + 1), SIGN_IN_REPLAY.wordEvery)
    return () => window.clearInterval(timer)
  }, [streaming])

  if (reduced) return { loop: 0, beat: last, words: total, beatTimes: [], still: true }
  return { loop, beat, words: beat > SIGN_IN_REPLAY.streamBeat ? total : words, beatTimes, still: false }
}
