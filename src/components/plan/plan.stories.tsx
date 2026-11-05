import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { expect } from 'storybook/test'

import { Button } from '@/components/button'

import { Plan, type PlanStep } from '.'

const LABELS = [
  "Read the brief and last quarter's pricing report",
  'Visit the pricing pages of the five main competitors, and their archived versions from the last quarter',
  'Compare seat prices and annual discounts for teams of 10 to 50',
  'Draft a summary of what changed for the leadership team',
]

/** The plan with the first `done` steps finished and the next one in progress. */
function stepsAt(done: number): PlanStep[] {
  return LABELS.map((label, index) => ({
    label,
    status: index < done ? 'done' : index === done ? 'active' : 'pending',
  }))
}

const meta = {
  title: 'AI/Agents/Plan',
  component: Plan,
  tags: ['beta'],
  argTypes: {
    steps: { table: { disable: true } },
    statusLabels: { table: { disable: true } },
  },
  args: { steps: stepsAt(2) },
  render: (args) => (
    <div className="sb-box-l">
      <Plan {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        component:
          "The plan an agent follows, as a checklist it ticks off: each finished step fills its box, draws its check and is struck through, and the one in progress glows. A record, not a form. Idea from React Bits' Spring Check, made calmer.",
      },
    },
  },
} satisfies Meta<typeof Plan>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** Every step done. */
export const Done: Story = { args: { steps: stepsAt(LABELS.length) } }

/** Screen readers hear each step's status first, and the step in progress is the current one. */
export const Announced: Story = {
  play: async ({ canvas, step }) => {
    await step('The step in progress is marked as the current step', async () => {
      await expect(canvas.getAllByRole('listitem')[2]).toHaveAttribute('aria-current', 'step')
    })
    await step('Each step says its status', async () => {
      await expect(canvas.getAllByRole('listitem')[0]).toHaveTextContent(/^Done: /)
    })
  },
}

/** The agent works through it: each step is ticked off as it finishes. Replay to watch it again. */
export const Live: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [run, setRun] = useState(0)
    return (
      <div className="sb-stack sb-box-l">
        <LivePlan key={run} />
        <Button variant="secondary" size="s" onClick={() => setRun(run + 1)}>
          Replay
        </Button>
      </div>
    )
  },
}

/** How long each pretend step takes, in ms. */
const STEP_DURATION = 1600

function LivePlan() {
  const [done, setDone] = useState(0)

  useEffect(() => {
    const timers = LABELS.map((_, index) => window.setTimeout(() => setDone(index + 1), STEP_DURATION * (index + 1)))
    return () => timers.forEach(window.clearTimeout)
  }, [])

  return <Plan steps={stepsAt(done)} />
}
