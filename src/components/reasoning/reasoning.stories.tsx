import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'

import { Button } from '@/components/button'

import { Reasoning } from '.'
import { REASONING_STATUSES } from './reasoning.const'

const STEPS = [
  'Reading the brief: three senior roles, remote within Spain',
  'Searching job boards for design engineer openings',
  'Comparing salary bands across the twelve best matches',
  'Drafting a shortlist with the reasons for each',
]

const meta = {
  title: 'AI/Agents/Reasoning',
  component: Reasoning,
  tags: ['beta'],
  argTypes: {
    status: { control: 'inline-radio', options: REASONING_STATUSES },
    steps: { table: { disable: true } },
    startedAt: { table: { disable: true } },
    endedAt: { table: { disable: true } },
    labels: { table: { disable: true } },
  },
  args: { status: 'thinking', steps: STEPS.slice(0, 3), startedAt: 0 },
  // Every story starts thinking when it renders, so the clock starts from zero.
  render: function Render(args) {
    const [startedAt] = useState(() => Date.now())
    return <Reasoning {...args} startedAt={startedAt} />
  },
  parameters: {
    docs: {
      description: {
        component:
          "How an agent reasoned its way to an answer. While it thinks, the header shimmers with a live clock and the steps appear as they come; when it's done, it becomes one line with the time it took, and the steps fold away a click from coming back. Idea from React Bits' Thought Line.",
      },
    },
  },
} satisfies Meta<typeof Reasoning>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** While it thinks: a light crosses "Thinking", the clock runs, and the newest step stands out. */
export const Thinking: Story = {}

/** Done: one line with the time it took. Its steps are a click away. */
export const Done: Story = {
  args: { status: 'done', steps: STEPS },
  render: (args) => <Reasoning {...args} startedAt={0} endedAt={14_200} />,
  play: async ({ canvas, step }) => {
    const header = canvas.getByRole('button', { name: /Thought for 14s/ })

    await step('It starts folded', async () => {
      await expect(header).toHaveAttribute('aria-expanded', 'false')
    })
    await step('A click shows the steps', async () => {
      await userEvent.click(header)
      await waitFor(() => expect(canvas.getByText(STEPS[0] ?? '')).toBeVisible())
    })
  },
}

/** As it happens: steps arrive one by one, then the header folds them into one line. Replay to watch it again. */
export const Live: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [run, setRun] = useState(0)
    return (
      <div className="sb-stack">
        <LiveReasoning key={run} />
        <Button variant="secondary" size="s" onClick={() => setRun(run + 1)}>
          Replay
        </Button>
      </div>
    )
  },
}

/** How long each pretend step takes, in ms. */
const STEP_DURATION = 1400

function LiveReasoning() {
  const [startedAt] = useState(() => Date.now())
  const [count, setCount] = useState(1)

  useEffect(() => {
    const timers = STEPS.map((_, index) => window.setTimeout(() => setCount(index + 2), STEP_DURATION * (index + 1)))
    return () => timers.forEach(window.clearTimeout)
  }, [])

  return (
    <Reasoning
      status={count > STEPS.length ? 'done' : 'thinking'}
      steps={STEPS.slice(0, count)}
      startedAt={startedAt}
    />
  )
}
