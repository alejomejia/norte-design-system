'use client'

import { useRef } from 'react'

import { Avatar } from '@/components/avatar'
import { Badge } from '@/components/badge'
import { Card } from '@/components/card'
import { Message } from '@/components/message'
import { Plan, type PlanStep } from '@/components/plan'
import { RunStatus } from '@/components/run-status'
import { Stat } from '@/components/stat'
import { StreamingText } from '@/components/streaming-text'
import { ToolCall } from '@/components/tool-call'
import sofiaPhoto from '@/handbook/assets/people/sofia-herrera.jpg'
import { Topography } from '@/handbook/blocks/topography'
import { formatCompact } from '@/lib/utils'

import { SIGN_IN_PANEL_COPY, SIGN_IN_REPLAY } from './sign-in.const'
import { useGlideOnGrow, useRunReplay } from './sign-in.hooks'
import { signInPanelStyles } from './sign-in.styles'

const styles = signInPanelStyles()

/** How long run #128 took, in ms (4m 12s): the stopwatch's reading when the panel holds still. */
const RUN_LENGTH = 252_000

/** How fast the map drifts behind the panel, against the Introduction's: slower, so it stays a backdrop. */
const MAP_SPEED = 0.4

/** When run #128 was asked. */
const ASKED_AT = new Date(2026, 10, 6, 10, 42)

/** The run's cost, in dollars and cents. */
const COST = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' })

/** Where `values` is by this beat; on the summary's beat, it climbs toward the next beat's with the summary's words. */
function valueAt(values: readonly number[], beat: number, words: number) {
  const { streamBeat, summary } = SIGN_IN_REPLAY
  const now = values[beat] ?? 0
  if (beat !== streamBeat) return now
  const next = values[beat + 1] ?? now
  return now + ((next - now) * words) / summary.split(' ').length
}

/** Tokens the way the run's stats say them: "38.2k". */
function formatTokens(value: number) {
  return formatCompact(value).toLowerCase()
}

/**
 * The brand panel beside the form on wide screens: the pitch, and a bento of run #128 built from the same components as
 * the workspace (its tokens, cost and tool calls, the run playing out, and on wide panels the approval it waits for),
 * over the Introduction's topographic map, drifting slowly north. It's a picture, not part of the page: hidden from screen readers and
 * out of the tab order, it plays only while it's on screen, and holds its last beat under reduced motion.
 */
export function SignInPanel() {
  const ref = useRef<HTMLDivElement>(null)
  const feedRef = useRef<HTMLDivElement>(null)
  const { loop, beat, words, beatTimes, still } = useRunReplay(ref)
  useGlideOnGrow(feedRef)
  const { plan, tools, streamBeat, waitBeat, summary } = SIGN_IN_REPLAY

  // When a beat played, for a live timer; with the panel still, a fixed reading in its place.
  function timeOf(index: number) {
    return still ? (SIGN_IN_REPLAY.beats[index] ?? 0) : (beatTimes[index] ?? 0)
  }

  const steps: PlanStep[] = plan.map((item) => ({
    label: item.label,
    status: beat >= item.to ? 'done' : beat >= item.from ? 'active' : 'pending',
  }))
  const waiting = beat >= waitBeat
  const tokens = valueAt(SIGN_IN_REPLAY.tokens, beat, words)
  const messageStatus = beat === 0 ? 'thinking' : waiting ? 'done' : 'streaming'

  return (
    <aside ref={ref} aria-hidden="true" inert className={styles.root()}>
      <div className={styles.surface()}>
        {/* The Introduction's map, its lines alone, as a faint texture on the wash. */}
        <Topography tone="light" speed={MAP_SPEED} className={styles.texture()} />
        <div className={styles.intro()}>
          <p className={styles.title()}>{SIGN_IN_PANEL_COPY.title}</p>
          <p className={styles.lead()}>{SIGN_IN_PANEL_COPY.lead}</p>
        </div>
        <div key={loop} className={styles.bento()}>
          <Card padding="m" className={styles.stat()}>
            <Stat label={SIGN_IN_PANEL_COPY.tokens} value={formatTokens(tokens)} />
          </Card>
          <Card padding="m" className={styles.stat()}>
            <Stat label={SIGN_IN_PANEL_COPY.cost} value={COST.format(tokens * SIGN_IN_REPLAY.costPerToken)} />
          </Card>
          <Card padding="m" className={styles.stat()}>
            <Stat label={SIGN_IN_PANEL_COPY.calls} value={Math.round(valueAt(SIGN_IN_REPLAY.calls, beat, words))} />
          </Card>
          <Card padding="m" className={styles.run()}>
            <RunStatus
              status={waiting ? 'waiting' : 'working'}
              label="Research agent"
              detail={SIGN_IN_REPLAY.details[beat]}
              startedAt={still ? 0 : timeOf(0)}
              endedAt={still ? RUN_LENGTH : undefined}
            />
            <div className={styles.feed()}>
              <div ref={feedRef} className={styles.thread()}>
                <Message author={{ name: 'Sofía Herrera', src: sofiaPhoto }} time={ASKED_AT} appear={!still}>
                  <Message.Content>{SIGN_IN_REPLAY.ask}</Message.Content>
                </Message>
                <Message
                  author={{ name: 'Research agent', kind: 'agent' }}
                  time={ASKED_AT}
                  status={messageStatus}
                  thinkingTimer={false}
                  appear={!still}
                >
                  {beat > 0 && (
                    <Message.Content className={styles.arrive()}>
                      <Plan steps={steps} />
                      <div className={styles.work()}>
                        {tools
                          .filter((tool) => beat >= tool.from)
                          .map((tool) => (
                            <ToolCall
                              key={tool.detail}
                              className={styles.arrive()}
                              name={tool.name}
                              detail={tool.detail}
                              status={beat >= tool.to ? tool.result : 'running'}
                              startedAt={timeOf(tool.from)}
                              endedAt={still ? timeOf(tool.to) : undefined}
                            />
                          ))}
                      </div>
                      {beat >= streamBeat && (
                        <StreamingText
                          className={styles.arrive()}
                          text={summary.split(' ').slice(0, words).join(' ')}
                          streaming={!still && !waiting}
                        />
                      )}
                    </Message.Content>
                  )}
                </Message>
              </div>
            </div>
          </Card>
          <Card padding="m" className={styles.approval()}>
            <div className={styles.approvalBody()}>
              <Card.Header>
                <Card.Title render={(props) => <p {...props} />}>{SIGN_IN_PANEL_COPY.approvalTitle}</Card.Title>
                <Card.Description>{SIGN_IN_PANEL_COPY.approvalWhat}</Card.Description>
              </Card.Header>
              <ul className={styles.people()}>
                {SIGN_IN_REPLAY.recipients.map((name, index) => (
                  <li key={name} className={styles.person()}>
                    <Avatar name={name} size="s" src={index === 0 ? sofiaPhoto : undefined} decorative />
                    <span className={styles.name()}>{name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Badge tone={waiting ? 'warning' : 'neutral'} dot live={waiting} className={styles.badge()}>
              {waiting ? SIGN_IN_PANEL_COPY.approvalWaiting : SIGN_IN_PANEL_COPY.approvalDrafting}
            </Badge>
          </Card>
        </div>
      </div>
    </aside>
  )
}
