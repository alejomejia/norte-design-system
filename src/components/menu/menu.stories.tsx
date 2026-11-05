import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Avatar } from '@/components/avatar'
import { Button } from '@/components/button'
import { IconButton } from '@/components/icon-button'
import { Tooltip } from '@/components/tooltip'

import { Menu } from '.'

const onDuplicate = fn()

/** The run's ⋯ menu: what can be done with run #128. */
function RunActions(props: { onDuplicate?: () => void }) {
  return (
    <>
      <Menu.Item icon="share" shortcut={['⌘', 'S']}>
        Share
      </Menu.Item>
      <Menu.Item icon="link" shortcut={['⌘', 'L']}>
        Copy link
      </Menu.Item>
      <Menu.Item icon="copy" onClick={props.onDuplicate}>
        Duplicate run
      </Menu.Item>
      <Menu.Submenu icon="download" label="Export as">
        <Menu.Item>Markdown</Menu.Item>
        <Menu.Item>PDF</Menu.Item>
        <Menu.Item>CSV (results only)</Menu.Item>
      </Menu.Submenu>
      <Menu.Separator />
      <Menu.Item icon="delete" tone="danger">
        Delete run
      </Menu.Item>
    </>
  )
}

const meta = {
  title: 'Components/Overlays/Menu',
  component: Menu,
  tags: ['beta'],
  argTypes: {
    children: { table: { disable: true } },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "A list of actions that opens from a trigger, Norte's `Button` or `IconButton` through `render`. Items take an icon, a shortcut (shown, not wired) and a `danger` tone; groups take a heading; checkbox and radio items toggle settings and keep the menu open, with their check or dot in the icon column; submenus open beside their row; link items navigate. Every label lines up in one column once any row has an icon. The popup grows out of its trigger, and its highlight glides from row to row, like Select's. Built on Base UI's Menu: arrows, typeahead, Escape and focus come with it.",
      },
    },
  },
  render: (args) => (
    <Menu {...args}>
      <Menu.Trigger render={<IconButton icon="more" label="Run actions" />} />
      <Menu.Popup align="end">
        <RunActions onDuplicate={onDuplicate} />
      </Menu.Popup>
    </Menu>
  ),
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole('button', { name: 'Run actions' })

    await step('The trigger opens a menu of items', async () => {
      await userEvent.click(trigger)
      await waitFor(() => expect(page.getByRole('menu')).toBeVisible())
      await expect(page.getByRole('menuitem', { name: /Delete run/ })).toBeInTheDocument()
    })

    await step('Escape closes it and gives focus back to the trigger', async () => {
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(page.queryByRole('menu')).not.toBeInTheDocument())
      await expect(trigger).toHaveFocus()
    })
  },
}

/** The keyboard does it all: Enter opens, the arrows move, Enter picks, and the menu closes. */
export const Keyboard: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    onDuplicate.mockClear()

    await step('Enter on the trigger opens it with the first item highlighted', async () => {
      canvas.getByRole('button', { name: 'Run actions' }).focus()
      await userEvent.keyboard('{Enter}')
      await waitFor(() => expect(page.getByRole('menuitem', { name: /Share/ })).toHaveFocus())
    })

    await step('The arrows move, and Enter picks', async () => {
      await userEvent.keyboard('{ArrowDown}{ArrowDown}')
      await expect(page.getByRole('menuitem', { name: 'Duplicate run' })).toHaveFocus()
      await userEvent.keyboard('{Enter}')
      await expect(onDuplicate).toHaveBeenCalledOnce()
      await waitFor(() => expect(page.queryByRole('menu')).not.toBeInTheDocument())
    })
  },
}

/** Settings in a menu: a checkbox item toggles, a radio group picks one. Both keep the menu open. */
export const CheckboxAndRadioItems: Story = {
  name: 'Checkbox and radio items',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Menu {...args}>
      <Menu.Trigger render={<Button variant="secondary">View</Button>} />
      <Menu.Popup>
        <Menu.Group label="Show">
          <Menu.CheckboxItem defaultChecked>Reasoning</Menu.CheckboxItem>
          <Menu.CheckboxItem>Tool call details</Menu.CheckboxItem>
        </Menu.Group>
        <Menu.Separator />
        <Menu.RadioGroup label="Density" defaultValue="comfortable">
          <Menu.RadioItem value="comfortable">Comfortable</Menu.RadioItem>
          <Menu.RadioItem value="compact">Compact</Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Popup>
    </Menu>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'View' }))

    await step('Groups are named by their heading', async () => {
      await expect(await page.findByRole('group', { name: 'Show' })).toBeInTheDocument()
    })

    await step('A checkbox item toggles, and the menu stays open', async () => {
      const details = page.getByRole('menuitemcheckbox', { name: 'Tool call details' })
      await expect(details).toHaveAttribute('aria-checked', 'false')
      await userEvent.click(details)
      await expect(details).toHaveAttribute('aria-checked', 'true')
      await waitFor(() => expect(page.getByRole('menu')).toBeVisible())
    })

    await step('A radio item picks one of its group', async () => {
      const compact = page.getByRole('menuitemradio', { name: 'Compact' })
      await userEvent.click(compact)
      await expect(compact).toHaveAttribute('aria-checked', 'true')
      await expect(page.getByRole('menuitemradio', { name: 'Comfortable' })).toHaveAttribute('aria-checked', 'false')
    })
  },
}

/** A row that opens more items beside it: on hover, or ArrowRight; ArrowLeft comes back. */
export const Submenu: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    canvas.getByRole('button', { name: 'Run actions' }).focus()
    await userEvent.keyboard('{Enter}')

    await step('ArrowRight opens the submenu on its first item', async () => {
      const exportAs = await page.findByRole('menuitem', { name: 'Export as' })
      await waitFor(() => expect(page.getByRole('menuitem', { name: /Share/ })).toHaveFocus())
      await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
      await expect(exportAs).toHaveFocus()
      await userEvent.keyboard('{ArrowRight}')
      await waitFor(() => expect(page.getByRole('menuitem', { name: 'Markdown' })).toHaveFocus())
    })

    await step('ArrowLeft closes it and comes back to its row', async () => {
      await userEvent.keyboard('{ArrowLeft}')
      await waitFor(() => expect(page.queryByRole('menuitem', { name: 'Markdown' })).not.toBeInTheDocument())
      await expect(page.getByRole('menuitem', { name: 'Export as' })).toHaveFocus()
    })
  },
}

/** An icon trigger keeps its tooltip: the tooltip names it, the menu opens on click. */
export const WithATooltip: Story = {
  name: 'With a tooltip',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Menu {...args}>
      <Tooltip content="Run actions">
        <Menu.Trigger render={<IconButton icon="more" label="Run actions" />} />
      </Tooltip>
      <Menu.Popup align="end">
        <RunActions />
      </Menu.Popup>
    </Menu>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole('button', { name: 'Run actions' })

    await step('Focus shows the tooltip', async () => {
      await userEvent.tab()
      await expect(trigger).toHaveFocus()
      await waitFor(() => expect(page.getByText('Run actions', { selector: '[data-side]' })).toBeVisible())
    })

    await step('A click opens the menu', async () => {
      await userEvent.click(trigger)
      await waitFor(() => expect(page.getByRole('menu')).toBeVisible())
    })
  },
}

/** The user menu: their avatar opens it, named by it, and its items are links to other pages, but signing out. */
export const LinkItems: Story = {
  name: 'Link items',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Menu {...args}>
      {/* The avatar names the trigger: "Alejandro Mejía". */}
      <Menu.Trigger
        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        render={
          <button type="button">
            <Avatar name="Alejandro Mejía" size="l" />
          </button>
        }
      />
      <Menu.Popup side="top">
        <Menu.Group label="alejandro@norte.com">
          <Menu.LinkItem icon="user" href="#profile">
            Profile
          </Menu.LinkItem>
          <Menu.LinkItem icon="settings" href="#settings" shortcut={['⌘', ',']}>
            Settings
          </Menu.LinkItem>
        </Menu.Group>
        <Menu.Separator />
        <Menu.Item>Sign out</Menu.Item>
      </Menu.Popup>
    </Menu>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Alejandro Mejía' }))

    await step('Link items are links to their pages', async () => {
      const settings = await page.findByRole('menuitem', { name: /Settings/ })
      await expect(settings).toHaveAttribute('href', '#settings')
    })
  },
}

/** An item that can't be used right now dims and is skipped by the pointer, but stays in the list. */
export const DisabledItems: Story = {
  name: 'Disabled items',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Menu {...args}>
      <Menu.Trigger render={<IconButton icon="more" label="Run actions" />} />
      <Menu.Popup align="end">
        <Menu.Item icon="retry" disabled>
          Retry run
        </Menu.Item>
        <Menu.Item icon="copy">Duplicate run</Menu.Item>
      </Menu.Popup>
    </Menu>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Run actions' }))

    await step('It says it is disabled', async () => {
      await expect(await page.findByRole('menuitem', { name: 'Retry run' })).toHaveAttribute('aria-disabled', 'true')
    })
  },
}

/** Where it shows up: the run's top bar, beside Share. */
export const InContext: Story = {
  name: 'In context',
  parameters: { layout: 'padded', controls: { disable: true } },
  render: (args) => (
    <div className="sb-panel flex items-center gap-2">
      <span className="mr-auto text-body-s font-medium text-ink">Run #128</span>
      <Button variant="secondary" size="s">
        Share
      </Button>
      <Menu {...args}>
        <Tooltip content="Run actions">
          <Menu.Trigger render={<IconButton icon="more" label="Run actions" size="s" />} />
        </Tooltip>
        <Menu.Popup align="end">
          <RunActions />
        </Menu.Popup>
      </Menu>
    </div>
  ),
}
