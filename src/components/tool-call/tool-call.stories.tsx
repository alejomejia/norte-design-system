import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { expect } from 'storybook/test'

import { Button } from '@/components/button'
import { ICON_NAMES } from '@/components/icon/icon.const'

import { ToolCall, type ToolCallStatus } from '.'
import { TOOL_CALL_STATUSES } from './tool-call.const'

const meta = {
  title: 'AI/Agents/Tool call',
  component: ToolCall,
  tags: ['beta'],
  argTypes: {
    status: { control: 'inline-radio', options: TOOL_CALL_STATUSES },
    icon: { control: 'select', options: ICON_NAMES },
    detail: { control: 'text' },
    // Set by each story when it renders: a timestamp makes no sense as a control.
    startedAt: { table: { disable: true } },
    endedAt: { table: { disable: true } },
  },
  args: { name: 'web_search', detail: 'competitor pricing for team plans', status: 'running', startedAt: 0 },
  // Every story starts its call when it renders, so the timer and the fill start from zero.
  render: function Render(args) {
    const [startedAt] = useState(() => Date.now())
    return <ToolCall {...args} startedAt={startedAt} />
  },
  parameters: {
    docs: {
      description: {
        component:
          "One tool call of an agent: the tool, what it was called with, how long it took and how it ended. Idea from React Bits' Call Chip.",
      },
    },
  },
} satisfies Meta<typeof ToolCall>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** While it works: the timer counts, and the fill creeps across, slower and slower. */
export const Running: Story = {
  play: async ({ canvas, step }) => {
    await step('Screen readers hear the tool and that it is running', async () => {
      await expect(canvas.getByText(', running')).toBeInTheDocument()
    })
  },
}

/** Finished: the fill completes in green and the icon turns into a check. */
export const Success: Story = {
  args: { status: 'success', name: 'read_file', detail: 'briefs/q3-pricing.md' },
  render: (args) => <ToolCall {...args} startedAt={0} endedAt={1840} />,
}

/** Failed: red, a cross, and one small nudge to catch the eye. */
export const Failure: Story = {
  args: { status: 'error', name: 'fetch_url', detail: 'https://pricing.example.com/teams' },
  render: (args) => <ToolCall {...args} startedAt={0} endedAt={12_300} />,
}

/** The calls of one run, as they happen: they start in order and finish on their own. Replay to watch it again. */
export const InARun: Story = {
  name: 'In a run',
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [run, setRun] = useState(0)
    return (
      <div className="sb-stack">
        <Run key={run} />
        <Button variant="secondary" size="s" onClick={() => setRun(run + 1)}>
          Replay
        </Button>
      </div>
    )
  },
}

/** A pretend run: each call starts after the one before it and ends after its own time, the third one in a failure. */
const CALLS: { name: string; detail: string; startAt: number; endAt: number; outcome: ToolCallStatus }[] = [
  { name: 'web_search', detail: 'competitor pricing for team plans', startAt: 0, endAt: 2400, outcome: 'success' },
  { name: 'read_file', detail: 'briefs/q3-pricing.md', startAt: 600, endAt: 1800, outcome: 'success' },
  { name: 'fetch_url', detail: 'https://pricing.example.com/teams', startAt: 1200, endAt: 4200, outcome: 'error' },
  { name: 'write_summary', detail: 'reports/pricing-q3.md', startAt: 2600, endAt: 6400, outcome: 'success' },
]

function Run() {
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(startedAt)

  useEffect(() => {
    const timers = CALLS.flatMap(({ startAt, endAt }) => [startAt, endAt]).map((at) =>
      window.setTimeout(() => setNow(Date.now()), at),
    )
    return () => timers.forEach(window.clearTimeout)
  }, [])

  return (
    <div className="sb-stack">
      {CALLS.filter(({ startAt }) => now - startedAt >= startAt).map(({ name, detail, startAt, endAt, outcome }) => (
        <ToolCall
          key={name}
          name={name}
          detail={detail}
          status={now - startedAt >= endAt ? outcome : 'running'}
          startedAt={startedAt + startAt}
        />
      ))}
    </div>
  )
}
