import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'

import { AvatarGroup, type AvatarGroupItem } from '@/components/avatar-group'
import sofiaPhoto from '@/handbook/assets/people/sofia-herrera.jpg'

import { ApprovalRequest } from '.'
import { APPROVAL_REQUEST_DECISIONS } from './approval-request.const'

/** When the agent asked: run #128, a few minutes in. */
const ASKED_AT = new Date('2026-11-10T14:32:00')

/** The leadership team, who'll get the summary. */
const RECIPIENTS: AvatarGroupItem[] = [
  { name: 'Sofía Herrera', src: sofiaPhoto },
  { name: 'Daniel Okafor' },
  { name: 'Mei Lin' },
  { name: 'Lucas Moreau' },
  { name: 'Amara Diallo' },
  { name: 'Jonas Berg' },
]

/** The email the agent drafted, long enough to fold. */
function email() {
  return (
    <>
      <p>Hi all,</p>
      <p>Three of our five main competitors changed their pricing for teams of 10 to 50 seats this quarter:</p>
      <ul className="list-disc pl-6">
        <li>Fieldnote raised its seat price from $12 to $14 a month.</li>
        <li>Brightloop now takes 20% off annual plans, up from 15%.</li>
        <li>Kitewise added a Team plan at $10 a seat, up to 50 seats.</li>
      </ul>
      <p>
        Tandem hasn't changed. Orbit's pricing page timed out, so its numbers are from last quarter's report. The full
        comparison is in reports/pricing-q3.md.
      </p>
    </>
  )
}

/** The request's parts, with a preview of the given content. */
function request(preview = email()) {
  return (
    <>
      <ApprovalRequest.Title>Send “Competitor pricing, Q3: what changed” to the leadership team?</ApprovalRequest.Title>
      <ApprovalRequest.Detail label="To">
        <AvatarGroup avatars={RECIPIENTS} max={4} size="s" />
        <span className="text-ink-muted">Leadership team · 6 people</span>
      </ApprovalRequest.Detail>
      <ApprovalRequest.Preview>{preview}</ApprovalRequest.Preview>
      <ApprovalRequest.Next>Sends from alejandro@norte.com. You'll have 5 seconds to undo it.</ApprovalRequest.Next>
    </>
  )
}

const meta = {
  title: 'AI/Agents/Approval request',
  component: ApprovalRequest,
  argTypes: {
    agent: { control: 'object' },
    time: { control: false },
    defaultDecision: { control: 'inline-radio', options: APPROVAL_REQUEST_DECISIONS },
    undoDuration: { control: { type: 'range', min: 2000, max: 10_000 } },
    labels: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: {
    agent: { name: 'Research agent' },
    time: ASKED_AT,
    onApprove: fn(),
    onReject: fn(),
    children: null,
  },
  parameters: {
    docs: {
      description: {
        component:
          'An agent asking before it acts: who asks, what for, a preview of it and what happens next, with Reject and Approve. An answer can be undone for a moment, through Undo action, before `onApprove` or `onReject` runs. Built on Card, Avatar, Badge and Button.',
      },
    },
  },
  render: (args) => (
    <div className="sb-box-l">
      <ApprovalRequest {...args}>{request()}</ApprovalRequest>
    </div>
  ),
} satisfies Meta<typeof ApprovalRequest>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ canvas, step }) => {
    await step('The request is an article named by its question, which is a heading', async () => {
      const heading = canvas.getByRole('heading', { level: 3 })
      await expect(heading).toHaveTextContent(/^Send “Competitor pricing, Q3: what changed” to the leadership team\?$/)
      await expect(canvas.getByRole('article')).toHaveAccessibleName(heading.textContent ?? '')
    })

    await step("Who asks, when, and that it's waiting", async () => {
      await expect(canvas.getByText('Research agent')).toBeVisible()
      await expect(canvas.getByRole('article').querySelector('time')).toHaveAttribute(
        'datetime',
        ASKED_AT.toISOString(),
      )
      await expect(canvas.getByText('Needs approval')).toBeVisible()
      // The agent's avatar isn't heard: its name is written beside it.
      await expect(canvas.queryByRole('img', { name: 'Research agent' })).toBeNull()
    })

    await step('The recipients are one group, and the ones past the cap are named', async () => {
      await expect(canvas.getByRole('group', { name: '6 people' })).toBeInTheDocument()
      await expect(
        canvas.getByRole('button', { name: '3 more: Lucas Moreau, Amara Diallo, and Jonas Berg' }),
      ).toBeInTheDocument()
    })

    await step('Both answers are buttons', async () => {
      await expect(canvas.getByRole('button', { name: 'Reject' })).toBeEnabled()
      await expect(canvas.getByRole('button', { name: 'Approve' })).toBeEnabled()
    })
  },
}

/**
 * Answering, from start to end: press Reject or Approve and Undo action takes the buttons' place, while the badge still
 * says it needs approval. Undo brings the buttons back. Once the undo runs out, the row leaves and the badge takes the
 * outcome. Run its interactions to watch it.
 */
export const Approving: Story = {
  args: { undoDuration: 3000 },
  parameters: { controls: { disable: true } },
  play: async ({ args, canvas, step }) => {
    const approve = canvas.getByRole('button', { name: 'Approve' })

    await step('Reject hands over to Undo action, with a cross', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Reject' }))
      await expect(canvas.getByRole('status')).toHaveTextContent('Rejected')
      await userEvent.click(canvas.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(canvas.getByRole('button', { name: 'Reject' })).toHaveFocus())
    })

    await step('Approve hands over to Undo action; the badge waits until it is final', async () => {
      await userEvent.click(approve)
      await expect(canvas.getByRole('status')).toHaveTextContent('Approved')
      await expect(canvas.getByText('Needs approval')).toBeVisible()
      // Undo action grows in.
      await waitFor(() => expect(canvas.getByRole('button', { name: 'Undo' })).toBeVisible())
    })

    await step('The buttons leave the way: inert, so no one can press them twice', async () => {
      await expect(approve.closest('[inert]')).not.toBeNull()
      await waitFor(() => expect(getComputedStyle(approve.closest('[inert]') as HTMLElement).opacity).toBe('0'))
    })

    await step('Focus stays in the card, outside the undo row, so the countdown runs', async () => {
      await expect(document.activeElement).toBe(canvas.getByRole('status').closest('[tabindex="-1"]'))
    })

    await step('Undo brings the buttons back, with focus on Approve', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(canvas.getByRole('button', { name: 'Approve' })).toHaveFocus())
      await expect(canvas.queryByRole('status')).toBeNull()
      await expect(args.onApprove).not.toHaveBeenCalled()
    })

    await step('Once the undo runs out, it approves: the row leaves and the badge says so', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Approve' }))
      const footer = canvas.getByRole('status').closest('[tabindex="-1"]') as HTMLElement
      await waitFor(() => expect(args.onApprove).toHaveBeenCalledOnce(), { timeout: 5000 })
      await expect(args.onReject).not.toHaveBeenCalled()
      await waitFor(() => expect(canvas.queryByRole('status')).toBeNull())
      await expect(canvas.getByText('Approved')).toBeVisible()
      await expect(canvas.queryByRole('button', { name: /^(Approve|Reject|Undo)$/ })).toBeNull()
      // The footer's space closed with the row: the card ends at what happens next, like one loaded from history.
      await waitFor(() => expect(footer.getBoundingClientRect().height).toBe(0))
    })
  },
}

/**
 * Approved and final, as it stays once the undo runs out, or loads from history with `defaultDecision`: the badge says
 * so, and there's nothing left to answer.
 */
export const Approved: Story = {
  args: { defaultDecision: 'approved' },
  play: async ({ canvas, step }) => {
    await step('The badge holds the outcome, and no buttons are left', async () => {
      await expect(canvas.getByText('Approved')).toBeVisible()
      await expect(canvas.queryByText('Needs approval')).toBeNull()
      await expect(canvas.queryByRole('button', { name: /^(Approve|Reject|Undo)$/ })).toBeNull()
    })
  },
}

/** Rejected and final: a neutral badge, and nothing left to answer. */
export const Rejected: Story = {
  args: { defaultDecision: 'rejected' },
  play: async ({ canvas, step }) => {
    await step('The badge holds the outcome, and no buttons are left', async () => {
      await expect(canvas.getByText('Rejected')).toBeVisible()
      await expect(canvas.queryByRole('button', { name: /^(Approve|Reject|Undo)$/ })).toBeNull()
    })
  },
}
/** A long preview folds to about four lines under a fade; "Show all" opens it to its full height. */
export const FoldedPreview: Story = {
  name: 'Folded preview',
  parameters: { controls: { disable: true } },
  play: async ({ canvas, step }) => {
    const toggle = canvas.getByRole('button', { name: 'Show all' })
    const clip = document.getElementById(toggle.getAttribute('aria-controls') ?? '') as HTMLElement
    const folded = clip.getBoundingClientRect().height

    await step('Folded, it controls the preview, which is clipped', async () => {
      await expect(toggle).toHaveAttribute('aria-expanded', 'false')
      await expect(clip.scrollHeight).toBeGreaterThan(folded)
    })

    await step('Show all opens it to the height of its content', async () => {
      await userEvent.click(toggle)
      await expect(toggle).toHaveAttribute('aria-expanded', 'true')
      await expect(toggle).toHaveAccessibleName('Show less')
      await waitFor(() => expect(clip.getBoundingClientRect().height).toBe(clip.scrollHeight))
    })

    await step('Show less folds it back', async () => {
      await userEvent.click(toggle)
      await expect(toggle).toHaveAttribute('aria-expanded', 'false')
      await waitFor(() => expect(clip.getBoundingClientRect().height).toBe(folded))
    })
  },
}

/** A preview short enough to show whole has nothing to fold, so no button. */
export const ShortPreview: Story = {
  name: 'Short preview',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="sb-box-l">
      <ApprovalRequest {...args}>
        {request(<p>Hi all, the Q3 competitor pricing summary is ready: reports/pricing-q3.md.</p>)}
      </ApprovalRequest>
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('No Show all', async () => {
      await expect(canvas.queryByRole('button', { name: 'Show all' })).toBeNull()
    })
  },
}

/** Everything works from the keyboard: Tab reaches Show all, Reject and Approve, with a focus ring, and Enter answers. */
export const Keyboard: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ canvas, step }) => {
    await step('Tab goes past the recipients to Show all, Reject and Approve', async () => {
      await userEvent.tab()
      await expect(canvas.getByRole('button', { name: /^3 more/ })).toHaveFocus()
      await userEvent.tab()
      await expect(canvas.getByRole('button', { name: 'Show all' })).toHaveFocus()
      await userEvent.tab()
      await expect(canvas.getByRole('button', { name: 'Reject' })).toHaveFocus()
      await userEvent.tab()
      const approve = canvas.getByRole('button', { name: 'Approve' })
      await expect(approve).toHaveFocus()
      await expect(getComputedStyle(approve).outlineStyle).toBe('solid')
    })

    await step('Enter approves, and the faded buttons can no longer take focus', async () => {
      const approve = canvas.getByRole('button', { name: 'Approve' })
      await userEvent.keyboard('{Enter}')
      await expect(canvas.getByRole('status')).toHaveTextContent('Approved')
      // user-event's Tab doesn't skip inert elements, as a browser does, so this checks it directly.
      approve.focus()
      await expect(approve).not.toHaveFocus()
    })

    await step('Enter on Undo takes it back, with focus on Approve again', async () => {
      canvas.getByRole('button', { name: 'Undo' }).focus()
      await userEvent.keyboard('{Enter}')
      await waitFor(() => expect(canvas.getByRole('button', { name: 'Approve' })).toHaveFocus())
    })

    ;(document.activeElement as HTMLElement | null)?.blur()
  },
}
