import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { AvatarGroup, type AvatarGroupItem } from '@/components/avatar-group'
import { Button } from '@/components/button'
import { IconButton } from '@/components/icon-button'
import { Menu } from '@/components/menu'
import { TextField } from '@/components/text-field'
import sofiaPhoto from '@/handbook/assets/people/sofia-herrera.jpg'

import { AlertDialog, Dialog } from '.'
import { DIALOG_SIZES } from './dialog.const'

/** Growth's leadership team: who can already see run #128. */
const PEOPLE: AvatarGroupItem[] = [
  { name: 'Sofía Herrera', src: sofiaPhoto },
  { name: 'Daniel Okafor' },
  { name: 'Mei Lin' },
  { name: 'Lucas Moreau' },
  { name: 'Amara Diallo' },
  { name: 'Jonas Berg' },
]

/** What changed at each competitor, as the run's summary tells it: enough text to make the body scroll. */
const CHANGES = [
  [
    'Fieldnote',
    'Raised its Team plan from $12 to $14 per seat a month and dropped the 10-seat minimum. The annual discount stays at 20%, so a team of 25 now pays $3,360 a year, up $600.',
  ],
  [
    'Brightloop',
    'Kept its prices but moved single sign-on from Business down to Team. For teams of 10 to 50 seats it is now the cheapest plan with SSO, at $16 per seat a month.',
  ],
  [
    'Tandem',
    'Replaced per-seat pricing with three bands: up to 15, up to 30 and up to 50 seats, at $180, $330 and $520 a month. Teams near the top of a band pay less than before; teams just over a line pay more.',
  ],
  [
    'Orbit',
    'Its pricing page timed out twice, so these numbers come from the archived version of August 28: $15 per seat a month, 15% off annually. Worth checking by hand before the summary goes out.',
  ],
  [
    'Kitewise',
    'Added a 25% annual discount, up from 10%, and a free tier for up to 3 seats. Its monthly price is unchanged at $13 per seat, which makes it the cheapest option paid yearly.',
  ],
] as const

const onDelete = fn()

const meta = {
  title: 'Components/Overlays/Dialog',
  component: Dialog,
  tags: ['beta'],
  argTypes: {
    children: { table: { disable: true } },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "A window over a dimmed page for a task that needs full attention, opened by Norte's `Button` or `IconButton` through `render`. A soft gray header with a title (the dialog's name for screen readers) and a description, a body, a footer with its actions, and an ✕ in the corner. A dialog with nothing else in its body, like a confirmation, puts the description there instead, so the body isn't left empty; `Dialog.Close` also turns any button into a close, like a footer's Cancel. Three sizes, narrowing on small screens, where the footer's buttons stack. When the content runs long, only the body scrolls. It rises into place and leaves faster, with a fade. `AlertDialog` takes the same parts for questions about what can't be undone: no ✕, and a click outside doesn't close it. Built on Base UI's Dialog and Alert Dialog, which trap focus, lock the page's scroll and give focus back.",
      },
    },
  },
  render: (args) => (
    <Dialog {...args}>
      <Dialog.Trigger render={<Button variant="secondary">Share</Button>} />
      <Dialog.Popup>
        <Dialog.Header>
          <Dialog.Title>Share run #128</Dialog.Title>
          <Dialog.Description>People with access can see its results, logs and summary.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Body className="flex flex-col gap-4">
          <TextField label="Invite by email" type="email" placeholder="name@norte.com" />
          <div className="flex items-center justify-between gap-3">
            <span className="text-ink-muted">6 people in Growth have access</span>
            <AvatarGroup avatars={PEOPLE} max={4} size="s" />
          </div>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close render={<Button variant="secondary">Cancel</Button>} />
          <Dialog.Close render={<Button>Send invite</Button>} />
        </Dialog.Footer>
        <Dialog.Close />
      </Dialog.Popup>
    </Dialog>
  ),
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole('button', { name: 'Share' })

    await step('The trigger opens a dialog named by its title and described by its description', async () => {
      await userEvent.click(trigger)
      const dialog = await page.findByRole('dialog', { name: 'Share run #128' })
      await expect(dialog).toHaveAccessibleDescription('People with access can see its results, logs and summary.')
    })

    await step('Focus starts on the content, the email field, not on the ✕', async () => {
      await waitFor(() => expect(page.getByRole('textbox', { name: 'Invite by email' })).toHaveFocus())
    })

    await step('Tab stays inside: from the ✕, the last stop, it wraps back to the email field', async () => {
      page.getByRole('button', { name: 'Close' }).focus()
      await userEvent.tab()
      // Tab lands on Base UI's focus guard first, which hands focus on a moment later.
      await waitFor(() => expect(page.getByRole('textbox', { name: 'Invite by email' })).toHaveFocus())
    })

    await step('A tooltip inside it shows above it: the "+3" names the rest', async () => {
      await userEvent.hover(page.getByRole('button', { name: /^3 more:/ }))
      const tooltip = await page.findByText('Lucas Moreau, Amara Diallo, and Jonas Berg')
      // On top means it's what the pointer would hit at its center, not the dialog behind it.
      await waitFor(() => {
        const { x, y, width, height } = tooltip.getBoundingClientRect()
        const hit = canvasElement.ownerDocument.elementFromPoint(x + width / 2, y + height / 2)
        expect(tooltip.contains(hit)).toBe(true)
      })
      await userEvent.unhover(page.getByRole('button', { name: /^3 more:/ }))
    })

    await step('Cancel closes it and gives focus back to the trigger', async () => {
      await userEvent.click(page.getByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument())
      await expect(trigger).toHaveFocus()
    })
  },
}

/** Escape, a click outside and the ✕ all close it. */
export const Dismissing: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole('button', { name: 'Share' })

    await step('Escape closes it', async () => {
      await userEvent.click(trigger)
      await page.findByRole('dialog')
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument())
      await expect(trigger).toHaveFocus()
    })

    await step('A click outside closes it', async () => {
      await userEvent.click(trigger)
      const dialog = await page.findByRole('dialog')
      await userEvent.pointer({
        keys: '[MouseLeft]',
        target: dialog.parentElement as HTMLElement,
        coords: { x: 4, y: 4 },
      })
      await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument())
    })

    await step('The ✕ closes it', async () => {
      await userEvent.click(trigger)
      await page.findByRole('dialog')
      await userEvent.click(page.getByRole('button', { name: 'Close' }))
      await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument())
    })
  },
}

/**
 * 400, 512 and 640px: `s` for a confirmation, `m` for a short form, `l` for more. On a small screen it narrows to fit.
 * With nothing else to say, the description moves from the header to the body, so the body isn't left empty.
 */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="sb-row">
      {DIALOG_SIZES.map((size) => (
        <Dialog key={size} {...args}>
          <Dialog.Trigger render={<Button variant="secondary">Size {size}</Button>} />
          <Dialog.Popup size={size}>
            <Dialog.Header>
              <Dialog.Title>Size {size}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Dialog.Description>
                Seat prices are per month, billed annually, for teams of 10 to 50.
              </Dialog.Description>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close render={<Button variant="secondary">Close</Button>} />
            </Dialog.Footer>
          </Dialog.Popup>
        </Dialog>
      ))}
    </div>
  ),
}

/** When the content is taller than the screen, only the body scrolls: the title and the actions stay in view. */
export const LongContent: Story = {
  name: 'Long content',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Dialog {...args}>
      <Dialog.Trigger render={<Button variant="secondary">Preview summary</Button>} />
      <Dialog.Popup size="l">
        <Dialog.Header>
          <Dialog.Title>Competitor pricing, Q3: what changed</Dialog.Title>
          <Dialog.Description>The summary run #128 will email to the leadership team.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Body className="flex flex-col gap-4 text-body">
          <p>
            Three of our five main competitors changed their pricing for teams of 10 to 50 seats this quarter, and one
            changed how it counts seats altogether.
          </p>
          {CHANGES.map(([name, change]) => (
            <section key={name} className="flex flex-col gap-1">
              <h3 className="font-semibold">{name}</h3>
              <p>{change}</p>
            </section>
          ))}
          <p>Sources: each pricing page and its archived version from last quarter, 5 in all, 1 of which failed.</p>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close render={<Button variant="secondary">Cancel</Button>} />
          <Dialog.Close render={<Button>Send to 6 people</Button>} />
        </Dialog.Footer>
        <Dialog.Close />
      </Dialog.Popup>
    </Dialog>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Preview summary' }))
    const dialog = await page.findByRole('dialog', { name: 'Competitor pricing, Q3: what changed' })

    await step('The dialog fits the screen, and its actions stay in view', async () => {
      await waitFor(() => expect(dialog.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight))
      await waitFor(() => expect(page.getByRole('button', { name: 'Send to 6 people' })).toBeVisible())
    })

    await step('While the body scrolls, the keyboard can reach it, to scroll it with the arrows', async () => {
      const body = dialog.querySelector<HTMLElement>('section')?.parentElement as HTMLElement
      await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)
      await waitFor(() => expect(body).toHaveAttribute('tabindex', '0'))
    })

    await step('Reached by keyboard, the body draws its focus ring', async () => {
      const body = dialog.querySelector<HTMLElement>('section')?.parentElement as HTMLElement
      body.focus({ focusVisible: true })
      await expect(body).toHaveFocus()
      // The ring really draws: `outline-none` beside `focus-visible:outline-2` would leave its style at `none`.
      await expect(getComputedStyle(body).outlineStyle).toBe('solid')
    })
  },
}

/**
 * Asks before what can't be undone, and waits: a click outside doesn't close it, and Cancel takes focus first. Its
 * header holds the question, and its body what the answer means: the description, which has no other content to sit
 * with.
 */
export const Alert: Story = {
  name: 'Alert dialog',
  parameters: { controls: { disable: true } },
  render: () => (
    <AlertDialog>
      <AlertDialog.Trigger render={<Button variant="danger">Delete run</Button>} />
      <AlertDialog.Popup>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete run #128?</AlertDialog.Title>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <AlertDialog.Description>
            Its results, logs and summary go with it. This can't be undone.
          </AlertDialog.Description>
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <AlertDialog.Close render={<Button variant="secondary">Cancel</Button>} />
          <AlertDialog.Close render={<Button variant="danger">Delete run</Button>} onClick={onDelete} />
        </AlertDialog.Footer>
      </AlertDialog.Popup>
    </AlertDialog>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole('button', { name: 'Delete run' })

    await step('It opens as an alert dialog, with focus on Cancel, the safe answer', async () => {
      await userEvent.click(trigger)
      const dialog = await page.findByRole('alertdialog', { name: 'Delete run #128?' })
      await expect(dialog).toHaveAccessibleDescription(
        "Its results, logs and summary go with it. This can't be undone.",
      )
      await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus())
    })

    await step('A click outside leaves it open', async () => {
      const dialog = page.getByRole('alertdialog')
      await userEvent.pointer({
        keys: '[MouseLeft]',
        target: dialog.parentElement as HTMLElement,
        coords: { x: 4, y: 4 },
      })
      await expect(page.getByRole('alertdialog')).toBeInTheDocument()
    })

    await step('Cancel closes it without deleting, and focus goes back to the trigger', async () => {
      await userEvent.click(page.getByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(page.queryByRole('alertdialog')).not.toBeInTheDocument())
      await expect(onDelete).not.toHaveBeenCalled()
      await expect(trigger).toHaveFocus()
    })

    await step('Delete run answers it', async () => {
      await userEvent.click(trigger)
      const dialog = await page.findByRole('alertdialog')
      await userEvent.click(within(dialog).getByRole('button', { name: 'Delete run' }))
      await expect(onDelete).toHaveBeenCalledOnce()
      await waitFor(() => expect(page.queryByRole('alertdialog')).not.toBeInTheDocument())
    })
  },
}

/**
 * Where it shows up: the run's ⋯ menu, whose Delete asks first. The menu closes as the dialog opens, so the dialog is
 * opened by state rather than by a trigger.
 */
export const InContext: Story = {
  name: 'In context',
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [confirming, setConfirming] = useState(false)

    return (
      <>
        <Menu>
          <Menu.Trigger render={<IconButton icon="more" label="Run actions" />} />
          <Menu.Popup align="end">
            <Menu.Item icon="share">Share</Menu.Item>
            <Menu.Item icon="copy">Duplicate run</Menu.Item>
            <Menu.Separator />
            <Menu.Item icon="delete" tone="danger" onClick={() => setConfirming(true)}>
              Delete run
            </Menu.Item>
          </Menu.Popup>
        </Menu>
        <AlertDialog open={confirming} onOpenChange={setConfirming}>
          <AlertDialog.Popup>
            <AlertDialog.Header>
              <AlertDialog.Title>Delete run #128?</AlertDialog.Title>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <AlertDialog.Description>
                Its results, logs and summary go with it. This can't be undone.
              </AlertDialog.Description>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <AlertDialog.Close render={<Button variant="secondary">Cancel</Button>} />
              <AlertDialog.Close render={<Button variant="danger">Delete run</Button>} />
            </AlertDialog.Footer>
          </AlertDialog.Popup>
        </AlertDialog>
      </>
    )
  },
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole('button', { name: 'Run actions' })

    await step("The menu's Delete run opens the alert dialog", async () => {
      await userEvent.click(trigger)
      await userEvent.click(await page.findByRole('menuitem', { name: /Delete run/ }))
      await expect(await page.findByRole('alertdialog', { name: 'Delete run #128?' })).toBeInTheDocument()
    })

    await step('Cancel closes it, and focus goes back to the menu trigger', async () => {
      await userEvent.click(page.getByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(page.queryByRole('alertdialog')).not.toBeInTheDocument())
      await waitFor(() => expect(trigger).toHaveFocus())
    })
  },
}
