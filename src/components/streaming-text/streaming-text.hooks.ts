'use client'

import { useEffect, useEffectEvent, useState } from 'react'

import { MOTION_DURATION } from '@/lib/motion'

import { STREAMING_TEXT_CATCH_UP, STREAMING_TEXT_TICK } from './streaming-text.const'
import { parseBlocks, plainText, revealStep } from './streaming-text.utils'

/** How long the last words take to come in, in ms, the longest reveal (`ink`) included: their spans stay until then. */
const SETTLE_TIME = MOTION_DURATION.appear * 1000

/**
 * How much of a stream's text to show. While `streaming`, words come out at a steady pace even when they arrive in
 * bursts, speeding up when they fall behind; once it ends, the rest catches up. With `smooth` off (off-screen, reduced
 * motion), everything shows at once, and text loaded already done shows whole. `writing` is true until the last word is
 * out; `animating` stays true a little longer, while that word comes in.
 */
export function useSmoothText(text: string, { streaming, smooth }: { streaming: boolean; smooth: boolean }) {
  const [shown, setShown] = useState(text.length)
  // After a stream ends, its last words still come out at the stream's pace; text changed later shows at once.
  const [wasStreaming, setWasStreaming] = useState(streaming)
  const [catchingUp, setCatchingUp] = useState(false)
  if (streaming !== wasStreaming) {
    setWasStreaming(streaming)
    setCatchingUp(!streaming)
  }

  const smoothing = smooth && (streaming || catchingUp)
  const visible = smoothing ? Math.min(shown, text.length) : text.length
  const revealing = smoothing && visible < text.length
  if (!smoothing && shown !== text.length) setShown(text.length)
  if (catchingUp && !revealing) setCatchingUp(false)

  // An interval, not a timeout per render: tokens can land faster than a tick, and each would restart it.
  const reveal = useEffectEvent(() =>
    setShown(revealStep(text, visible, STREAMING_TEXT_TICK / STREAMING_TEXT_CATCH_UP)),
  )
  useEffect(() => {
    if (!revealing) return
    const timer = window.setInterval(() => reveal(), STREAMING_TEXT_TICK)
    return () => window.clearInterval(timer)
  }, [revealing])

  const writing = streaming || revealing
  const [wasWriting, setWasWriting] = useState(writing)
  const [settling, setSettling] = useState(false)
  if (writing !== wasWriting) {
    setWasWriting(writing)
    setSettling(!writing)
  }
  useEffect(() => {
    if (!settling) return
    const timer = window.setTimeout(() => setSettling(false), SETTLE_TIME)
    return () => window.clearTimeout(timer)
  }, [settling])

  return { text: text.slice(0, visible), writing, animating: writing || settling }
}

/**
 * What a screen reader hears of a stream: each paragraph or list item once, when it's complete (the next one has
 * started, or the stream ended), never word by word. Text loaded already done says nothing.
 */
export function useStreamAnnouncement(text: string, streaming: boolean): string {
  const units = parseBlocks(text, streaming).flatMap((block) =>
    block.type === 'paragraph' ? [plainText(block.text)] : block.items.map(plainText),
  )
  const complete = streaming ? Math.max(0, units.length - 1) : units.length
  const [announced, setAnnounced] = useState(complete)
  const [message, setMessage] = useState('')
  if (complete !== announced) {
    setAnnounced(complete)
    if (complete > announced) setMessage(units.slice(announced, complete).filter(Boolean).join(' '))
  }
  return message
}
