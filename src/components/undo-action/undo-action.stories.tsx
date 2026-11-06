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
          "A finished action that can still be taken back, for a moment, before it commits. Kinder than a confirmation dialog for actions that are easy to reverse. Idea from React Bits' Fuse Button.",
      },
    },
  },
} satisfies Meta<typeof UndoAction>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/**
 * In context: approving an agent's step. Undo fades the row away and brings the choice back; waiting makes it final, and
 * the row settles into plain text.
 */
export const ApprovingAStep: Story = {
  name: 'Approving a step',
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [decision, setDecision] = useState<'approved' | 'final'>()

    if (decision)
      return (
        <div className="sb-stack">
          <UndoAction onUndo={() => setDecision(undefined)} onCommit={() => setDecision('final')}>
            Approved
          </UndoAction>
          {decision === 'final' && (
            <p className="text-body-s text-ink-muted transition-opacity duration-(--duration-slow) ease-enter starting:opacity-0">
              The agent is sending the emails.
            </p>
          )}
        </div>
      )
    return (
      <div className="sb-row transition-opacity duration-(--duration-base) ease-enter starting:opacity-0">
        <Button onClick={() => setDecision('approved')}>Approve</Button>
        <Button variant="secondary">Reject</Button>
      </div>
    )
  },
}

/** Wait out the countdown: the bar drains, then the box and the button fade away around the outcome, which stays. */
export const Commits: Story = {
  args: { duration: 5000 },
  play: async ({ args, canvas, step }) => {
    await step('When the time runs out, it commits', async () => {
      await waitFor(() => expect(args.onCommit).toHaveBeenCalledOnce(), { timeout: 7000 })
      // The button keeps its place, so nothing moves, but it's inert: no one can press it, and screen readers skip it.
      await expect(canvas.getByRole('button', { name: 'Undo' })).toHaveAttribute('inert')
      await expect(canvas.getByRole('status')).toHaveTextContent('Approved')
    })
  },
}

/** Undo before the time runs out: the row fades away, then `onUndo` is called. */
export const Undoing: Story = {
  play: async ({ args, canvas, step }) => {
    await step('Undo takes it back once the row has left', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(args.onUndo).toHaveBeenCalledOnce())
      await expect(canvas.queryByRole('status')).not.toBeInTheDocument()
      await expect(args.onCommit).not.toHaveBeenCalled()
    })
  },
}
