import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor } from 'storybook/test'

import { Button } from '@/components/button'

import { UndoAction } from '.'
import { UNDO_ACTION_AFTER_COMMIT, UNDO_ACTION_TONES } from './undo-action.const'

const meta = {
  title: 'Components/Feedback/Undo action',
  component: UndoAction,
  tags: ['beta'],
  argTypes: {
    children: { control: 'text' },
    duration: { control: { type: 'range', min: 2000, max: 10_000 } },
    afterCommit: { control: 'inline-radio', options: UNDO_ACTION_AFTER_COMMIT },
    tone: { control: 'inline-radio', options: UNDO_ACTION_TONES },
    icon: { control: 'text' },
  },
  args: { children: 'Approved', onUndo: fn(), onCommit: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'A finished action that can still be taken back, for a moment, before it commits. Kinder than a confirmation dialog for actions that are easy to reverse. Once committed, it settles into plain text where it was, or, with `afterCommit="leave"`, fades and closes its height when something else already shows the outcome. Idea from React Bits\' Fuse Button.',
      },
    },
  },
  render: (args) => (
    <div className="sb-box-m">
      <UndoAction {...args} />
    </div>
  ),
} satisfies Meta<typeof UndoAction>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/**
 * In context: approving an agent's step. Undo fades the row away and brings the choice back; waiting makes it final, and
 * the row settles into a receipt, its outcome where it was, now saying who and when.
 */
export const ApprovingAStep: Story = {
  name: 'Approving a step',
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [decision, setDecision] = useState<'approved' | 'final'>()

    if (decision)
      return (
        <div className="sb-box-m sb-stack">
          <UndoAction onUndo={() => setDecision(undefined)} onCommit={() => setDecision('final')}>
            {decision === 'final' ? 'Approved by you · 2:35 PM' : 'Approved'}
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

/** Something declined rather than done: a cross, in a neutral tone. */
export const Declined: Story = {
  args: { children: 'Rejected', icon: 'close', tone: 'neutral' },
}

/**
 * The default, `settle`: wait out the countdown, and the bar drains, then the box and the button fade away around the
 * outcome, which stays where it was. For a row that's the only record of what happened.
 */
export const Settles: Story = {
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

/**
 * `leave`: once committed, the row fades, then closes its height, and what's under it moves up. For when something
 * else already shows the outcome, like an approval request's badge.
 */
export const Leaves: Story = {
  args: { duration: 3000, afterCommit: 'leave' },
  render: (args) => (
    <div className="sb-box-m sb-stack">
      <UndoAction {...args} />
      <p className="text-body-s text-ink-muted">The agent sends the summary to the leadership team.</p>
    </div>
  ),
  play: async ({ args, canvas, step }) => {
    await step('When the time runs out, it commits, then the row is gone', async () => {
      await waitFor(() => expect(args.onCommit).toHaveBeenCalledOnce(), { timeout: 5000 })
      await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument())
      await expect(canvas.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument()
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
