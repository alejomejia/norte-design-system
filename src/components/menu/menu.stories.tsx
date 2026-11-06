import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Avatar } from '@/components/avatar'
import { Button } from '@/components/button'
import { IconButton } from '@/components/icon-button'
import { Tooltip } from '@/components/tooltip'

import { Menu } from '.'

const onDuplicate = fn()

/**
 * The run's ⋯ menu: what can be done with run #128. A function the stories call, not a component, so the code panel
 * shows the Menu markup rather than this helper's name.
 */
function runActions(props: { onDuplicate?: () => void } = {}) {
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
          "A list of actions that opens from a `Button` or `IconButton` through `render`: items with icons and shortcuts, groups, toggles, submenus and links. Built on Base UI's Menu, which brings the keyboard, typeahead and focus.",
      },
    },
  },
  render: (args) => (
    <Menu {...args}>
      <Menu.Trigger render={<IconButton icon="more" label="Run actions" />} />
      <Menu.Popup align="end">{runActions({ onDuplicate })}</Menu.Popup>
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

    await step('Leaving the rows for the separator fades the highlight where it is, not up to the top', async () => {
      const highlight = page.getByRole('menu').lastElementChild as HTMLElement
      const row = page.getByRole('menuitem', { name: 'Delete run' })
      await userEvent.hover(row)
      // A pointer that really moves and then leaves: Base UI ignores simulated moves (they report no movement), so
      // user-event's alone never clear the row.
      row.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse', movementY: 1 }))
      await waitFor(() => expect(getComputedStyle(highlight).opacity).toBe('1'))
      const top = highlight.getBoundingClientRect().top
      const separator = page.getByRole('separator')
      row.dispatchEvent(
        new PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse', relatedTarget: separator }),
      )
      await waitFor(() => expect(getComputedStyle(highlight).opacity).toBe('0'))
      await expect(highlight.getBoundingClientRect().top).toBe(top)
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
      <Menu.Popup align="end">{runActions()}</Menu.Popup>
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
        <Menu.Popup align="end">{runActions()}</Menu.Popup>
      </Menu>
    </div>
  ),
}
