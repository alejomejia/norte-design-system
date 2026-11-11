import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { expect } from 'storybook/test'

import { Button } from '@/components/button'

import { RunStatus, type RunStatusValue } from '.'
import { RUN_STATUSES } from './run-status.const'

const meta = {
  title: 'AI/Agents/Run status',
  component: RunStatus,
  argTypes: {
    status: { control: 'inline-radio', options: RUN_STATUSES },
    label: { control: 'text' },
    detail: { control: 'text' },
    startedAt: { table: { disable: true } },
    endedAt: { table: { disable: true } },
    statusLabels: { table: { disable: true } },
  },
  args: { status: 'working', label: 'Research agent', detail: 'Visiting pricing pages', startedAt: 0 },
  // Every story starts its run when it renders, so the stopwatch starts from zero.
  render: function Render(args) {
    const [startedAt] = useState(() => Date.now())
    return (
      <div className="sb-box-l">
        <RunStatus {...args} startedAt={startedAt} />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        component:
          "What an agent is doing, in one row: its name, its current step and a stopwatch. Screen readers hear the step and the status change, never the stopwatch. Idea from React Bits' Lattice Loader.",
      },
    },
  },
} satisfies Meta<typeof RunStatus>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** Each status: the lattice ripples only while working, and holds still in the status's color otherwise. */
export const Statuses: Story = {
  parameters: { controls: { exclude: ['status', 'detail'] } },
  render: function Render(args) {
    const [startedAt] = useState(() => Date.now())
    const details: Record<RunStatusValue, string> = {
      working: 'Visiting pricing pages',
      waiting: 'Wants to send 3 emails',
      done: 'Summary ready',
      failed: 'A pricing page timed out',
    }
    return (
      <div className="sb-stack sb-stack--stretch sb-box-l">
        {RUN_STATUSES.map((status) => (
          <RunStatus key={status} {...args} status={status} detail={details[status]} startedAt={startedAt} />
        ))}
      </div>
    )
  },
}

/** Screen readers hear the status and the step, not the stopwatch. */
export const Announced: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ canvas, step }) => {
    await step('It is a live region with the status in words', async () => {
      await expect(canvas.getByRole('status')).toHaveTextContent('Research agentWorking:Visiting pricing pages')
    })
  },
}

/** A run from start to end: it works, stops for an approval, carries on and finishes. Replay to watch it again. */
export const Live: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [run, setRun] = useState(0)
    return (
      <div className="sb-stack sb-box-l">
        <LiveRun key={run} />
        <Button variant="secondary" size="s" onClick={() => setRun(run + 1)}>
          Replay
        </Button>
      </div>
    )
  },
}

const PHASES: { at: number; status: RunStatusValue; detail: string }[] = [
  { at: 0, status: 'working', detail: 'Reading the brief' },
  { at: 1500, status: 'working', detail: 'Visiting pricing pages' },
  { at: 3500, status: 'waiting', detail: 'Wants to send 3 emails' },
  { at: 5500, status: 'working', detail: 'Sending emails' },
  { at: 7000, status: 'done', detail: 'Summary ready' },
]

function LiveRun() {
  const [startedAt] = useState(() => Date.now())
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = PHASES.slice(1).map(({ at }, index) => window.setTimeout(() => setPhase(index + 1), at))
    return () => timers.forEach(window.clearTimeout)
  }, [])

  const current = PHASES[phase]
  return (
    <RunStatus
      status={current?.status ?? 'working'}
      label="Research agent"
      detail={current?.detail}
      startedAt={startedAt}
    />
  )
}
