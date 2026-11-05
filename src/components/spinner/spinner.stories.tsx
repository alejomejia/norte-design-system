import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'

import { Button } from '@/components/button'

import { Spinner } from '.'
import { SPINNER_SIZES } from './spinner.const'

const meta = {
  title: 'Elements/Indicators/Spinner',
  component: Spinner,
  tags: ['beta'],
  argTypes: {
    size: { control: 'inline-radio', options: SPINNER_SIZES },
    label: { control: 'text' },
  },
  // The stories show `l`, so the arc's motion reads.
  args: { size: 'l' },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "Something is loading and nobody knows for how long: an arc that turns around a faint ring, growing and shrinking as it goes, in the color of its text. Screen readers hear its label. Inside something that already says it's busy, like a busy button, it's `decorative`. It draws itself in as it appears. Under reduced motion it keeps turning, slowly.",
      },
    },
  },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** Icon's sizes, so it can take an icon's place. The stroke stays 2px at every size. */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => (
    <div className="sb-row">
      {SPINNER_SIZES.map((size) => (
        <Spinner key={size} {...args} size={size} />
      ))}
    </div>
  ),
}

/** Screen readers hear "Loading", or what you name: say what's loading when you can. */
export const WithALabel: Story = {
  name: 'With a label',
  args: { label: 'Loading results' },
  play: async ({ canvas, step }) => {
    await step('It is announced by its label', async () => {
      await expect(canvas.getByRole('progressbar', { name: 'Loading results' })).toBeInTheDocument()
    })
  },
}

/** When what's around it already says it's busy, it's only a picture: screen readers skip it. */
export const Decorative: Story = {
  args: { decorative: true },
  play: async ({ canvas, step }) => {
    await step('Screen readers skip it', async () => {
      await expect(canvas.queryByRole('progressbar')).not.toBeInTheDocument()
    })
  },
}

/** It draws itself in as it appears: the ring traces around, and the arc grows out of it. Press the button to replay it. */
export const DrawingIn: Story = {
  name: 'Drawing in',
  parameters: { controls: { disable: true } },
  render: function Render(args) {
    const [run, setRun] = useState(0)
    return (
      <div className="sb-stack items-center">
        <Spinner key={run} {...args} />
        <Button variant="secondary" onClick={() => setRun((count) => count + 1)}>
          Replay
        </Button>
      </div>
    )
  },
  play: async ({ canvas, step }) => {
    await step('Its ring draws itself in', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Replay' }))
      const track = canvas.getByRole('progressbar').querySelector('circle')
      await expect(Number.parseFloat(getComputedStyle(track as Element).strokeDashoffset)).toBeGreaterThan(0)
      await waitFor(() => expect(getComputedStyle(track as Element).strokeDashoffset).toBe('0px'), { timeout: 2000 })
    })
  },
}

/** Where it shows up: in a busy button, and on its own while a panel's content loads, in the muted text color. */
export const InContext: Story = {
  name: 'In context',
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="sb-stack">
      <div className="sb-row">
        <Button loading>Run agent</Button>
        <Button variant="secondary" loading>
          Export
        </Button>
      </div>
      <div className="sb-panel grid h-40 place-items-center text-ink-muted">
        <Spinner size="m" label="Loading results" />
      </div>
    </div>
  ),
}
