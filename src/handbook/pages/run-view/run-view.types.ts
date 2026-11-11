import { type RUN_VIEW_PHASES, type RUN_VIEW_TABS } from './run-view.const'

export type RunViewPhase = (typeof RUN_VIEW_PHASES)[number]

export type RunViewTab = (typeof RUN_VIEW_TABS)[number]

/** A follow-up after the run: what Sofía asked, and the agent's answer as far as it's written. */
export type RunViewTurn = {
  id: number
  prompt: string
  reply: string
  /** How many of the reply's words show so far. */
  words: number
  status: 'thinking' | 'streaming' | 'done'
  askedAt: Date
}
