import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor } from 'storybook/test'

import { Button } from '@/components/button'

import { UndoAction } from '.'

const meta = {
  title: 'Components/Feedback/Undo action',
  component: UndoAction,
  tags: ['beta'],
  argTypes: {
    children: { control: 'text' },
    duration: { control: { type: 'range', min: 2000, max: 10_000 } },
  },
  args: { children: 'Approved', onUndo: fn(), onCommit: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "A finished action that can still be taken back, for a moment: its outcome, an Undo button, and a bar that drains until it commits. Hovering or focusing it pauses the countdown. Kinder than a confirmation dialog for actions that are easy to reverse. Idea from React Bits' Fuse Button.",
      },
    },
  },
} satisfies Meta<typeof UndoAction>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** In context: approving an agent's step. Undo brings the choice back; waiting makes it final. */
export const ApprovingAStep: Story = {
  name: 'Approving a step',
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [decision, setDecision] = useState<'approved' | 'final'>()

    if (decision === 'final')
      return <p className="text-body-s text-ink-muted">Approved: the agent is sending the emails.</p>
    if (decision === 'approved')
      return (
        <UndoAction onUndo={() => setDecision(undefined)} onCommit={() => setDecision('final')}>
          Approved
        </UndoAction>
      )
    return (
      <div className="sb-row">
        <Button onClick={() => setDecision('approved')}>Approve</Button>
        <Button variant="secondary">Reject</Button>
      </div>
    )
  },
}

/** A short countdown, to watch it commit: the bar and the button leave, the outcome stays. */
export const Commits: Story = {
  args: { duration: 600 },
  play: async ({ args, canvas, step }) => {
    await step('When the time runs out, it commits', async () => {
      await waitFor(() => expect(args.onCommit).toHaveBeenCalledOnce(), { timeout: 2000 })
      await expect(canvas.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument()
      await expect(canvas.getByRole('status')).toHaveTextContent('Approved')
    })
  },
}

/** Undo before the time runs out: it's called, and the row leaves. */
export const Undoing: Story = {
  play: async ({ args, canvas, step }) => {
    await step('Undo takes it back', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Undo' }))
      await expect(args.onUndo).toHaveBeenCalledOnce()
      await expect(args.onCommit).not.toHaveBeenCalled()
    })
  },
}
