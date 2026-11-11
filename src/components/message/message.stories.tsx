import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/components/button'
import { Reasoning } from '@/components/reasoning'
import { StreamingText } from '@/components/streaming-text'
import { ToolCall } from '@/components/tool-call'

import { Message } from '.'
import { MESSAGE_STATUSES, MESSAGE_THINKING_EFFECTS } from './message.const'

const ASK =
  "Compare our five main competitors' pricing for teams of 10 to 50 seats, and email a summary of what changed to the leadership team."

const SUMMARY =
  "Fieldnote, Brightloop and Kitewise raised their seat prices this quarter, and Tandem cut its annual discount from 20% to 15%. Orbit's pricing page timed out, so its row uses last quarter's archived version."

const SOFIA = { name: 'Sofía Herrera' }
const AGENT = { name: 'Research agent', kind: 'agent' } as const

/** When run #128 was asked, and when the agent answered. */
const ASKED_AT = new Date(2026, 10, 6, 10, 42)
const ANSWERED_AT = new Date(2026, 10, 6, 10, 46)

const retry = fn()

/** The agent's summary, with its actions. A function the stories call, not a component, so the code shows the markup. */
function summaryParts() {
  return (
    <>
      <Message.Content>{SUMMARY}</Message.Content>
      <Message.Actions>
        <Message.Copy text={SUMMARY} />
        <Message.Action icon="retry" label="Retry" onClick={retry} />
      </Message.Actions>
    </>
  )
}

const meta = {
  title: 'AI/Conversation/Message',
  component: Message,
  argTypes: {
    author: { control: 'object' },
    time: { control: false },
    status: { control: 'inline-radio', options: MESSAGE_STATUSES },
    thinkingEffect: { control: 'inline-radio', options: MESSAGE_THINKING_EFFECTS },
    thinkingSince: { control: false },
    children: { table: { disable: true } },
  },
  args: { author: AGENT, time: ANSWERED_AT, children: null },
  parameters: {
    docs: {
      description: {
        component:
          "One turn of a conversation: who wrote it, when, what it says, and actions like copy and retry. The content is a slot, so an agent's message can hold its plan, tool calls and cards. While an agent thinks and writes, its avatar moves and its actions wait, and until there's content the header says what it's doing.",
      },
    },
  },
  render: (args) => (
    <div className="sb-box-l">
      <Message {...args}>{summaryParts()}</Message>
    </div>
  ),
} satisfies Meta<typeof Message>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ canvas, step }) => {
    const message = canvas.getByRole('article')
    const copy = canvas.getByRole('button', { name: 'Copy' })
    const actions = copy.parentElement as HTMLElement

    await step('The message is an article named by its author and time', async () => {
      await expect(message).toHaveAccessibleName(/^Research agent\s?10:46\sAM$/)
      await expect(message.querySelector('time')).toHaveAttribute('datetime', ANSWERED_AT.toISOString())
    })

    await step("The avatar isn't heard: the name is written beside it", async () => {
      await expect(canvas.queryByRole('img')).toBeNull()
    })

    await step('The actions rest hidden', async () => {
      await expect(getComputedStyle(actions).opacity).toBe('0')
    })

    await step('Tab reaches the copy action, shows the actions and draws a focus ring', async () => {
      await userEvent.tab()
      await expect(copy).toHaveFocus()
      await expect(getComputedStyle(copy).outlineStyle).toBe('solid')
      await waitFor(() => expect(getComputedStyle(actions).opacity).toBe('1'))
    })

    await step('Copy puts the text on the clipboard, says "Copied" and announces it', async () => {
      const writeText = spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
      await userEvent.keyboard('{Enter}')
      await expect(writeText).toHaveBeenCalledWith(SUMMARY)
      await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Copied'))
      await waitFor(() =>
        expect(within(document.body).getByText('Copied', { selector: ':not([role="status"])' })).toBeVisible(),
      )
      writeText.mockRestore()
    })

    await step('Retry calls its handler', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Retry' }))
      await expect(retry).toHaveBeenCalledOnce()
    })

    // Back at rest: nothing focused, so the actions hide again.
    ;(document.activeElement as HTMLElement | null)?.blur()
    retry.mockClear()
  },
}

/** A person's words, on a quiet tint that hugs them. */
export const Person: Story = {
  args: { author: SOFIA, time: ASKED_AT },
  render: (args) => (
    <div className="sb-box-l">
      <Message {...args}>
        <Message.Content>{ASK}</Message.Content>
      </Message>
    </div>
  ),
}

/** An agent's work in the content slot: its tool calls, then its answer. */
export const WithToolCalls: Story = {
  name: 'With tool calls',
  render: (args) => (
    <div className="sb-box-l">
      <Message {...args}>
        <Message.Content>
          <ToolCall name="read_file" detail="briefs/q3-pricing.md" status="success" startedAt={0} endedAt={1200} />
          <ToolCall
            name="fetch_url"
            detail="https://orbit.example.com/pricing"
            status="error"
            startedAt={0}
            endedAt={12_300}
          />
          <p>{SUMMARY}</p>
        </Message.Content>
        <Message.Actions>
          <Message.Copy text={SUMMARY} />
          <Message.Action icon="retry" label="Retry" onClick={retry} />
        </Message.Actions>
      </Message>
    </div>
  ),
}

/** Before it writes: the avatar moves, and "Thinking" breathes where the time will be, with a clock in tenths. */
export const Thinking: Story = {
  args: { status: 'thinking' },
  render: (args) => (
    <div className="sb-box-l">
      <Message {...args} />
    </div>
  ),
  play: async ({ canvas, step }) => {
    const message = canvas.getByRole('article')

    await step('It says "Thinking" in place of the time, and has nothing to act on yet', async () => {
      await expect(message).toHaveAccessibleName(/^Research agent\s?Thinking$/)
      await expect(message.querySelector('time')).toBeNull()
      await expect(canvas.queryAllByRole('button')).toHaveLength(0)
    })

    await step('"Thinking" breathes', async () => {
      await expect(getComputedStyle(canvas.getByText('Thinking')).animationName).toBe('breathe')
    })

    await step('A clock in tenths counts up beside it, silent for screen readers', async () => {
      const clock = canvas.getByText(/^\d+\.\ds$/)
      await expect(clock).toHaveAttribute('aria-hidden', 'true')
      const first = clock.textContent
      await waitFor(() => expect(clock.textContent).not.toBe(first))
    })
  },
}

/** Thinking with Reasoning's shimmer, a light crossing the word, and no clock. */
export const ThinkingShimmer: Story = {
  name: 'Thinking, shimmer',
  args: { status: 'thinking', thinkingEffect: 'shimmer', thinkingTimer: false },
  render: (args) => (
    <div className="sb-box-l">
      <Message {...args} />
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('The word shimmers, and no clock shows', async () => {
      await expect(getComputedStyle(canvas.getByText('Thinking')).animationName).toBe('shimmer')
      await expect(canvas.queryByText(/^\d+\.\ds$/)).toBeNull()
    })
  },
}

/** Thinking with its reasoning showing: the reasoning says "Thinking", so the header stays quiet. */
export const ThinkingWithReasoning: Story = {
  name: 'Thinking, with reasoning',
  args: { status: 'thinking' },
  render: (args) => (
    <div className="sb-box-l">
      <Message {...args}>
        <Message.Content>
          <Reasoning
            status="thinking"
            steps={[
              "Reading the brief and last quarter's report",
              'Visiting each pricing page and its archived version',
            ]}
            startedAt={Date.now()}
          />
        </Message.Content>
      </Message>
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('Only the reasoning says "Thinking"', async () => {
      await expect(canvas.getAllByText(/^Thinking/)).toHaveLength(1)
      await expect(canvas.getByRole('article')).toHaveAccessibleName('Research agent')
    })
  },
}

/** The words arriving through `StreamingText`, the avatar moving, and no actions until the last word; then the time and the actions. */
export const Streaming: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [run, setRun] = useState(0)
    return (
      <div className="sb-stack">
        <div className="sb-box-l">
          <PretendReply key={run} thinkFor={0} />
        </div>
        <Button variant="secondary" size="s" onClick={() => setRun(run + 1)}>
          Replay
        </Button>
      </div>
    )
  },
  play: async ({ canvas, step }) => {
    const message = canvas.getByRole('article')

    await step('While the words arrive, they speak for it: no status word, no time, no actions', async () => {
      await expect(message).toHaveAccessibleName('Research agent')
      await expect(message.querySelector('time')).toBeNull()
      await expect(canvas.queryByRole('button', { name: 'Copy' })).toBeNull()
    })

    await step(
      'Nothing around the answer is busy, so screen readers hear its paragraphs as they complete',
      async () => {
        await expect(canvas.getByRole('status').closest('[aria-busy]')).toBeNull()
      },
    )

    await step(
      'Once the last word is in, the time and the actions arrive, and the paragraph is announced',
      async () => {
        await waitFor(() => expect(message.querySelector('time')).not.toBeNull(), { timeout: 8000 })
        // The answer's status comes before the copy action's.
        await expect(canvas.getAllByRole('status')[0]).toHaveTextContent(SUMMARY)
        await expect(canvas.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
      },
    )
  },
}

/** The actions shown without a hover, for the conversation's latest message. */
export const ActionsVisible: Story = {
  name: 'Actions visible',
  args: { actionsVisible: true },
  play: async ({ canvas, step }) => {
    await step('The actions show at rest', async () => {
      const actions = canvas.getByRole('button', { name: 'Copy' }).parentElement as HTMLElement
      await expect(getComputedStyle(actions).opacity).toBe('1')
    })
  },
}

/** A conversation: Sofía's ask, then the agent's answer, the latest one with its actions shown. */
export const Conversation: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-panel sb-stack sb-stack--stretch">
      <Message author={SOFIA} time={ASKED_AT}>
        <Message.Content>{ASK}</Message.Content>
      </Message>
      <Message author={AGENT} time={ANSWERED_AT} actionsVisible>
        {summaryParts()}
      </Message>
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step("A person's words are tinted; the agent's are open", async () => {
      const [ask, answer] = [canvas.getByText(ASK), canvas.getByText(SUMMARY)]
      await expect(getComputedStyle(ask).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
      await expect(getComputedStyle(answer).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    })
  },
}

/** A conversation as it happens: Sofía asks, and the agent's answer arrives, thinks, writes and settles. */
export const Appear: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [asks, setAsks] = useState(0)
    return (
      <div className="sb-stack">
        {asks > 0 && (
          <div key={asks} className="sb-panel sb-stack sb-stack--stretch">
            <Message author={SOFIA} time={ASKED_AT} appear>
              <Message.Content>{ASK}</Message.Content>
            </Message>
            <PretendReply delay={REPLY_DELAY} />
          </div>
        )}
        <Button variant="secondary" size="s" onClick={() => setAsks(asks + 1)}>
          {asks > 0 ? 'Ask again' : 'Ask'}
        </Button>
      </div>
    )
  },
}

/** How long a pretend reply waits before it shows, thinks, and takes per word, in ms. */
const REPLY_DELAY = 600
const THINKING_TIME = 2400
const WORD_TIME = 60
const WORDS = SUMMARY.split(' ')

/**
 * The agent's answer as it would arrive: nothing for `delay`, thinking for `thinkFor`, then the summary word by word,
 * then done, with its actions. A story helper, so it stays out of the code panel's markup.
 */
function PretendReply({ delay = 0, thinkFor = THINKING_TIME }: { delay?: number; thinkFor?: number }) {
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(startedAt)
  const writing = now - startedAt - delay - thinkFor
  const words = Math.max(0, Math.floor(writing / WORD_TIME))
  const status = writing < 0 ? 'thinking' : words < WORDS.length ? 'streaming' : 'done'
  const done = status === 'done'

  useEffect(() => {
    if (done) return
    const timer = window.setInterval(() => setNow(Date.now()), WORD_TIME)
    return () => window.clearInterval(timer)
  }, [done])

  if (now - startedAt < delay) return null
  return (
    <Message author={AGENT} time={ANSWERED_AT} status={status} appear actionsVisible>
      {status !== 'thinking' && (
        <>
          <Message.Content>
            <StreamingText text={WORDS.slice(0, words).join(' ')} streaming={status === 'streaming'} />
          </Message.Content>
          <Message.Actions>
            <Message.Copy text={SUMMARY} />
            <Message.Action icon="retry" label="Retry" onClick={retry} />
          </Message.Actions>
        </>
      )}
    </Message>
  )
}
