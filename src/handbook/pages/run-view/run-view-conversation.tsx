'use client'

import { Fragment, type Ref, useRef, useState } from 'react'

import { Alert } from '@/components/alert'
import { ApprovalRequest } from '@/components/approval-request'
import { AvatarGroup } from '@/components/avatar-group'
import { Citation } from '@/components/citation'
import { Message } from '@/components/message'
import { Plan, type PlanStep } from '@/components/plan'
import { PromptInput } from '@/components/prompt-input'
import { Reasoning } from '@/components/reasoning'
import { RunStatus } from '@/components/run-status'
import { SourceList } from '@/components/source-list'
import { StreamingText } from '@/components/streaming-text'
import { Suggestions } from '@/components/suggestions'
import { ToolCall } from '@/components/tool-call'
import sofiaPhoto from '@/handbook/assets/people/sofia-herrera.jpg'

import {
  RUN_VIEW_ASKED_AT,
  RUN_VIEW_CALLS,
  RUN_VIEW_COPY,
  RUN_VIEW_ELAPSED_AT_OPEN,
  RUN_VIEW_EMAIL,
  RUN_VIEW_ME,
  RUN_VIEW_MODELS,
  RUN_VIEW_PLAN,
  RUN_VIEW_PLAN_DONE,
  RUN_VIEW_REASONING,
  RUN_VIEW_RECIPIENTS,
  RUN_VIEW_REQUESTED_AT,
  RUN_VIEW_SOURCES,
  RUN_VIEW_SUGGESTIONS,
  RUN_VIEW_SUMMARY,
  RUN_VIEW_TOOL_CALLS,
} from './run-view.const'
import { useFollowUps, useOpening, useStickToBottom } from './run-view.hooks'
import { runViewConversationStyles, runViewStyles } from './run-view.styles'
import { type RunViewPhase } from './run-view.types'

const page = runViewStyles()
const styles = runViewConversationStyles()

/** The sources a citation can point to: the ones read, numbered in order. */
const CITED = RUN_VIEW_SOURCES.filter((source) => source.status !== 'failed')

/** The summary as Copy puts it on the clipboard: plain text, without the citation markers. */
const SUMMARY_TEXT = RUN_VIEW_SUMMARY.replace(/ \[\d+\]/g, '').replaceAll('**', '')

/** The run's state for its bar, by phase. */
const RUN_STATUS = { writing: 'working', waiting: 'waiting', approved: 'done', rejected: 'done' } as const

/** The agent's answer as the page opens, by stage: not there before it starts thinking about Sofía's ask. */
const ANSWER_STATUS = {
  quiet: null,
  asked: null,
  thinking: 'thinking',
  working: 'streaming',
  streaming: 'streaming',
  done: 'done',
} as const

/** The leadership team, as the approval's avatars: Sofía with her photo. */
const RECIPIENTS = RUN_VIEW_RECIPIENTS.map((name) => ({
  name,
  src: name === RUN_VIEW_ME.name ? sofiaPhoto : undefined,
}))

/** How many plan steps are done in each phase: the summary is the fourth, the email the fifth. */
const DONE_STEPS = { writing: RUN_VIEW_PLAN_DONE, waiting: 4, approved: 5, rejected: 4 } as const

/**
 * The plan, by phase: the step after the done ones is active, unless the email was turned down. While the run is
 * still opening, only `ticked` steps are done: the agent ticks them off one by one, whatever phase the page starts in.
 */
function planSteps(phase: RunViewPhase, ticked: number): PlanStep[] {
  const done = Math.min(DONE_STEPS[phase], ticked)
  return RUN_VIEW_PLAN.map((label, index) => ({
    label,
    status: index < done ? 'done' : index === done && phase !== 'rejected' ? 'active' : 'pending',
  }))
}

/** A citation marker in an answer, as a `Citation` that previews its source. */
function citation(index: number) {
  const source = CITED[index - 1]
  return source ? <Citation index={index} {...source} /> : `[${index}]`
}

export type RunViewConversationProps = {
  phase: RunViewPhase
  /** The summary is whole: the run asks to send it. */
  onWritten: () => void
  onApprove: () => void
  onReject: () => void
  prompt: string
  onPromptChange: (prompt: string) => void
  promptRef: Ref<HTMLTextAreaElement>
  model: string
  onModelChange: (model: string) => void
  /** Puts a suggestion in the prompt, and focuses it there. */
  onSuggest: (prompt: string) => void
}

/**
 * The conversation column: the run's bar, then the thread (Sofía's ask, the agent's answer as it finishes its summary,
 * the approval it then waits on, and any follow-ups) and the prompt under it. As the page opens, the ask and the answer
 * arrive in turn, so the thread reads as it happened. The thread follows its latest words.
 */
export function RunViewConversation({
  phase,
  onWritten,
  onApprove,
  onReject,
  prompt,
  onPromptChange,
  promptRef,
  model,
  onModelChange,
  onSuggest,
}: RunViewConversationProps) {
  const paneRef = useRef<HTMLDivElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  useStickToBottom(paneRef, threadRef)
  const opening = useOpening(onWritten)
  const answer = ANSWER_STATUS[opening.stage]
  const { turns, ask, stop, busy } = useFollowUps()
  const [startedAt] = useState(() => Date.now() - RUN_VIEW_ELAPSED_AT_OPEN)
  const [timedOutShown, setTimedOutShown] = useState(true)
  const [recording, setRecording] = useState(false)

  function send(text: string) {
    ask(text)
    onPromptChange('')
  }

  return (
    <main className={page.main()}>
      <div className={page.runBar()}>
        <div className={page.runBarInner()}>
          <RunStatus
            status={RUN_STATUS[phase]}
            label={RUN_VIEW_COPY.agentName}
            detail={RUN_VIEW_COPY.runDetail[phase]}
            startedAt={startedAt}
            className={page.runStatus()}
          />
        </div>
      </div>
      <div ref={paneRef} className={page.scroller()}>
        <div ref={threadRef} className={styles.thread()}>
          {opening.stage !== 'quiet' && (
            <Message author={{ name: RUN_VIEW_ME.name, src: sofiaPhoto }} time={RUN_VIEW_ASKED_AT} appear>
              <Message.Content>{RUN_VIEW_COPY.ask}</Message.Content>
            </Message>
          )}
          {answer && (
            <Message
              author={{ name: RUN_VIEW_COPY.agentName, kind: 'agent' }}
              time={RUN_VIEW_ASKED_AT}
              status={answer}
              appear
            >
              {answer !== 'thinking' && (
                <Message.Content className={styles.answer()}>
                  <Plan steps={planSteps(phase, opening.stage === 'done' ? DONE_STEPS[phase] : opening.ticked)} />
                  {opening.reasoning && (
                    <Reasoning
                      status="done"
                      steps={[...RUN_VIEW_REASONING.steps]}
                      startedAt={0}
                      endedAt={RUN_VIEW_REASONING.duration}
                    />
                  )}
                  {opening.calls > 0 && (
                    <div className={styles.calls()}>
                      {RUN_VIEW_TOOL_CALLS.slice(0, opening.calls).map((call) => (
                        <ToolCall
                          key={call.detail}
                          name={call.name}
                          detail={call.detail}
                          status={call.status}
                          startedAt={0}
                          endedAt={call.duration}
                        />
                      ))}
                      {opening.calls === RUN_VIEW_TOOL_CALLS.length && (
                        <span className={styles.more()}>
                          {RUN_VIEW_COPY.moreCalls(RUN_VIEW_CALLS - RUN_VIEW_TOOL_CALLS.length)}
                        </span>
                      )}
                    </div>
                  )}
                  {opening.alert && timedOutShown && (
                    <Alert
                      tone="warning"
                      title={RUN_VIEW_COPY.failedTitle}
                      dismissible
                      onDismiss={() => setTimedOutShown(false)}
                    >
                      {RUN_VIEW_COPY.failedBody}
                    </Alert>
                  )}
                  {(answer === 'streaming' && opening.stage === 'streaming') || answer === 'done' ? (
                    <StreamingText text={opening.text} streaming={answer === 'streaming'} renderCitation={citation} />
                  ) : null}
                  {answer === 'done' && <SourceList sources={RUN_VIEW_SOURCES} />}
                </Message.Content>
              )}
              {answer === 'done' && (
                <Message.Actions>
                  <Message.Copy text={SUMMARY_TEXT} />
                </Message.Actions>
              )}
            </Message>
          )}
          {phase !== 'writing' && (
            <ApprovalRequest
              agent={{ name: RUN_VIEW_COPY.agentName }}
              time={RUN_VIEW_REQUESTED_AT}
              appear
              onApprove={onApprove}
              onReject={onReject}
            >
              {/* Under the page's h1: the conversation has no heading of its own above it. */}
              <ApprovalRequest.Title render={(props) => <h2 {...props} />}>
                {RUN_VIEW_COPY.approvalTitle}
              </ApprovalRequest.Title>
              <ApprovalRequest.Detail label={RUN_VIEW_COPY.approvalTo}>
                <AvatarGroup avatars={RECIPIENTS} max={4} size="s" />
                <span className={styles.recipients()}>{RUN_VIEW_COPY.approvalPeople}</span>
              </ApprovalRequest.Detail>
              <ApprovalRequest.Preview>
                <div className={styles.email()}>
                  <p>{RUN_VIEW_EMAIL.greeting}</p>
                  <p>{RUN_VIEW_EMAIL.lead}</p>
                  <ul className={styles.emailList()}>
                    {RUN_VIEW_EMAIL.changes.map((change) => (
                      <li key={change}>{change}</li>
                    ))}
                  </ul>
                  <p>{RUN_VIEW_EMAIL.rest}</p>
                  <p>{RUN_VIEW_EMAIL.signature}</p>
                </div>
              </ApprovalRequest.Preview>
              <ApprovalRequest.Next>{RUN_VIEW_COPY.approvalNext}</ApprovalRequest.Next>
            </ApprovalRequest>
          )}
          {turns.map((turn) => (
            <Fragment key={turn.id}>
              <Message author={{ name: RUN_VIEW_ME.name, src: sofiaPhoto }} time={turn.askedAt} appear>
                <Message.Content>{turn.prompt}</Message.Content>
              </Message>
              <Message
                author={{ name: RUN_VIEW_COPY.agentName, kind: 'agent' }}
                time={turn.askedAt}
                status={turn.status}
                appear
              >
                {turn.status !== 'thinking' && (
                  <Message.Content>
                    <StreamingText
                      text={turn.reply.split(' ').slice(0, turn.words).join(' ')}
                      streaming={turn.status === 'streaming'}
                      renderCitation={citation}
                    />
                  </Message.Content>
                )}
              </Message>
            </Fragment>
          ))}
        </div>
      </div>
      <div className={page.composer()}>
        <Suggestions label={RUN_VIEW_COPY.suggestions} onSelect={onSuggest} disabled={busy}>
          {RUN_VIEW_SUGGESTIONS.map((suggestion) => (
            <Suggestions.Item key={suggestion.label} value={suggestion.prompt}>
              {suggestion.label}
            </Suggestions.Item>
          ))}
        </Suggestions>
        <PromptInput
          ref={promptRef}
          value={prompt}
          onValueChange={onPromptChange}
          onSubmit={send}
          running={busy}
          onStop={stop}
          models={RUN_VIEW_MODELS}
          model={model}
          onModelChange={onModelChange}
          recording={recording}
          onRecordingChange={setRecording}
        />
      </div>
    </main>
  )
}
