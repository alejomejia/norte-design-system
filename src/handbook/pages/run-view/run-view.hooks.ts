'use client'

import { type RefObject, useEffect, useEffectEvent, useRef, useState } from 'react'

import { useReducedMotion } from '@/lib/hooks'

import { RUN_VIEW_COPY, RUN_VIEW_REPLIES, RUN_VIEW_SUMMARY, RUN_VIEW_TIMING } from './run-view.const'
import { type RunViewOpening, type RunViewTurn } from './run-view.types'

/** How close to the bottom, in px, still counts as reading the latest: the thread keeps following from there. */
const STICK_SLACK = 32

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
 * The page's opening, replayed so it reads as a conversation: after a moment of empty thread, Sofía's ask arrives, the
 * agent thinks, then writes its summary a word at a time (the last seconds of run #128). `onDone` runs once the summary
 * is whole. Under reduced motion it's all there from the start.
 */
export function useOpening(onDone: () => void) {
  const reduced = useReducedMotion()
  const words = RUN_VIEW_SUMMARY.split(' ')
  const [stage, setStage] = useState<RunViewOpening>('quiet')
  const [count, setCount] = useState(0)
  const written = reduced || (stage === 'streaming' && count >= words.length)
  const current = written ? 'done' : stage
  const done = useEffectEvent(onDone)

  useAfter(current === 'quiet', RUN_VIEW_TIMING.open, () => setStage('asked'))
  useAfter(current === 'asked', RUN_VIEW_TIMING.reply, () => setStage('thinking'))
  useAfter(current === 'thinking', RUN_VIEW_TIMING.think, () => setStage('streaming'))

  useEffect(() => {
    if (current !== 'streaming') return
    const timer = window.setInterval(() => setCount((latest) => latest + 1), RUN_VIEW_TIMING.word)
    return () => window.clearInterval(timer)
  }, [current])

  useEffect(() => {
    if (current === 'done') done()
  }, [current])

  return { stage: current, text: written ? RUN_VIEW_SUMMARY : words.slice(0, count).join(' ') }
}

/** The turns with the latest one changed by `change`. */
function withLatest(turns: RunViewTurn[], change: (turn: RunViewTurn) => RunViewTurn) {
  const latest = turns.at(-1)
  return latest ? [...turns.slice(0, -1), change(latest)] : turns
}

/** How many words a reply has. */
function wordCount(text: string) {
  return text.split(' ').length
}

/**
 * Follow-ups after the run: `ask` adds Sofía's prompt and the agent's answer, which thinks for a moment and then writes
 * itself a word at a time (whole at once under reduced motion). `stop` ends the answer where it is. `busy` while the
 * agent answers.
 */
export function useFollowUps() {
  const reduced = useReducedMotion()
  const [turns, setTurns] = useState<RunViewTurn[]>([])
  const nextId = useRef(0)
  const latest = turns.at(-1)
  const status = latest?.status

  function ask(prompt: string) {
    const reply = RUN_VIEW_REPLIES[prompt] ?? RUN_VIEW_REPLIES.fallback
    const id = nextId.current++
    setTurns((current) => [...current, { id, prompt, reply, words: 0, status: 'thinking', askedAt: new Date() }])
  }

  function stop() {
    setTurns((current) =>
      withLatest(current, (turn) =>
        turn.status === 'thinking'
          ? { ...turn, reply: RUN_VIEW_COPY.stopped, words: wordCount(RUN_VIEW_COPY.stopped), status: 'done' }
          : { ...turn, reply: turn.reply.split(' ').slice(0, turn.words).join(' '), status: 'done' },
      ),
    )
  }

  useEffect(() => {
    if (status !== 'thinking') return
    const timer = window.setTimeout(() => {
      setTurns((current) =>
        withLatest(current, (turn) =>
          reduced ? { ...turn, words: wordCount(turn.reply), status: 'done' } : { ...turn, status: 'streaming' },
        ),
      )
    }, RUN_VIEW_TIMING.think)
    return () => window.clearTimeout(timer)
  }, [status, reduced])

  useEffect(() => {
    if (status !== 'streaming') return
    const timer = window.setInterval(() => {
      setTurns((current) =>
        withLatest(current, (turn) => {
          const words = turn.words + 1
          return { ...turn, words, status: words >= wordCount(turn.reply) ? 'done' : 'streaming' }
        }),
      )
    }, RUN_VIEW_TIMING.word)
    return () => window.clearInterval(timer)
  }, [status])

  return { turns, ask, stop, busy: status === 'thinking' || status === 'streaming' }
}

/**
 * Keeps a scrolling thread at its latest, like a chat: it opens at the bottom, and while the reader is there, whatever
 * grows at the end (words, a new message) stays in view. Scrolling up to read lets it be until they come back down.
 * Only `pane` scrolls, never the page around it, so a docs page holding the story doesn't jump. Client-only.
 */
export function useStickToBottom(pane: RefObject<HTMLElement | null>, content: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const scroller = pane.current
    const inner = content.current
    if (!scroller || !inner) return
    let pinned = true
    scroller.scrollTop = scroller.scrollHeight

    function measure() {
      if (!scroller) return
      pinned = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < STICK_SLACK
    }
    const observer = new ResizeObserver(() => {
      if (pinned) scroller.scrollTop = scroller.scrollHeight
    })
    observer.observe(inner)
    scroller.addEventListener('scroll', measure, { passive: true })
    return () => {
      observer.disconnect()
      scroller.removeEventListener('scroll', measure)
    }
  }, [pane, content])
}
