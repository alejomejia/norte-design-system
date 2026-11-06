import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { IconButton } from '@/components/icon-button'
import { Tooltip } from '@/components/tooltip'

import { CommandMenu, type CommandMenuGroup, type CommandMenuItem } from '.'

/** What Sofía opened last: the run that's waiting on her, and its brief. */
const RECENT: CommandMenuItem[] = [
  { value: 'run-128', label: 'Run #128', icon: 'run', description: 'Research agent · 4m ago' },
  { value: 'brief', label: 'briefs/q3-pricing.md', icon: 'file', description: 'Brief' },
]

/** Where to go in Norte, what to do with run #128, and the files it read and wrote. */
const GROUPS: CommandMenuGroup[] = [
  {
    label: 'Go to',
    items: [
      { value: 'home', label: 'Home', icon: 'home' },
      { value: 'agents', label: 'Agents', icon: 'agent' },
      { value: 'runs', label: 'Runs', icon: 'run' },
      { value: 'approvals', label: 'Approvals', icon: 'approve', description: '3 waiting' },
      { value: 'settings', label: 'Settings', icon: 'settings', keywords: ['preferences', 'workspace'] },
    ],
  },
  {
    label: 'Run #128',
    items: [
      { value: 'share', label: 'Share run', icon: 'share', shortcut: ['⌘', '⇧', 'S'], keywords: ['invite', 'people'] },
      { value: 'copy-link', label: 'Copy link', icon: 'link', shortcut: ['⌘', 'L'] },
      { value: 'retry', label: 'Retry run', icon: 'retry', description: 'Waiting for your approval', disabled: true },
      { value: 'delete', label: 'Delete run', icon: 'delete', tone: 'danger' },
    ],
  },
  {
    label: 'Files',
    items: [
      { value: 'brief', label: 'briefs/q3-pricing.md', icon: 'file', description: 'Brief' },
      { value: 'report', label: 'reports/pricing-q3.md', icon: 'file', description: 'Summary draft' },
    ],
  },
  {
    label: 'Agents',
    items: [
      { value: 'research-agent', label: 'Research agent', icon: 'agent', description: 'Growth' },
      { value: 'new-agent', label: 'New agent', icon: 'plus', keywords: ['create'] },
    ],
  },
]

const onSelect = fn()

const meta = {
  title: 'Components/Navigation/Command menu',
  component: CommandMenu,
  tags: ['beta'],
  argTypes: {
    groups: { control: false },
    recent: { control: false },
    labels: { control: false },
    children: { table: { disable: true } },
  },
  args: { groups: GROUPS, recent: RECENT, onSelect, onOpenChange: fn() },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "⌘K: a search over everything someone can go to or do, from anywhere on the page. Typing ranks the commands that match (the label first, then extra `keywords`); Escape clears the search, then closes. Built on Base UI's Dialog and Autocomplete.",
      },
    },
  },
  render: (args) => (
    <CommandMenu {...args}>
      <CommandMenu.Trigger />
    </CommandMenu>
  ),
} satisfies Meta<typeof CommandMenu>

export default meta
type Story = StoryObj<typeof meta>

/** The menu's search field: the dialog renders in a portal, outside the story's canvas. */
function search(canvasElement: HTMLElement) {
  return within(canvasElement.ownerDocument.body).getByRole('combobox', { name: 'Command menu' })
}

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole('button', { name: /^Search…/ })
    onSelect.mockClear()

    await step('The trigger shows the shortcut and opens a dialog with the search focused', async () => {
      await expect(trigger).toHaveAttribute('aria-keyshortcuts')
      await userEvent.click(trigger)
      await waitFor(() => expect(page.getByRole('dialog', { name: 'Command menu' })).toBeVisible())
      await waitFor(() => expect(search(canvasElement)).toHaveFocus())
    })

    await step('With nothing typed, recent items come first, and ↓ highlights the first', async () => {
      const [first] = within(page.getByRole('listbox')).getAllByRole('option')
      await expect(first?.closest('[role="group"]')).toHaveAccessibleName('Recent')
      await expect(first).toHaveAccessibleName(/Run #128/)
      await expect(first).not.toHaveAttribute('data-highlighted')
      await userEvent.keyboard('{ArrowDown}')
      await expect(first).toHaveAttribute('data-highlighted')
    })

    await step('Typing keeps only what matches, best first, and drops Recent', async () => {
      await userEvent.type(search(canvasElement), 'pric')
      await waitFor(() => expect(page.queryByRole('group', { name: 'Recent' })).not.toBeInTheDocument())
      await expect(page.getAllByRole('option').map((option) => option.textContent)).toEqual([
        'briefs/q3-pricing.mdBrief',
        'reports/pricing-q3.mdSummary draft',
      ])
    })

    await step('Enter chooses the highlighted command, closes, and gives focus back', async () => {
      await userEvent.keyboard('{ArrowDown}{Enter}')
      await expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'report' }))
      await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument())
      await expect(trigger).toHaveFocus()
    })

    await step('It opens again with the search empty', async () => {
      await userEvent.click(trigger)
      await waitFor(() => expect(search(canvasElement)).toHaveValue(''))
    })

    await step('Leaving the rows for a group title fades the highlight where it is, not up to the top', async () => {
      const highlight = page.getByRole('listbox').parentElement?.lastElementChild as HTMLElement
      const row = page.getByRole('option', { name: 'Settings' })
      await userEvent.hover(row)
      // A pointer that really moves and then leaves: Base UI ignores simulated moves (they report no movement).
      row.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse', movementY: 1 }))
      await waitFor(() => expect(getComputedStyle(highlight).opacity).toBe('1'))
      const top = highlight.getBoundingClientRect().top
      const title = page.getByText('Run #128', { selector: '[role="presentation"], div' })
      row.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse', relatedTarget: title }))
      await waitFor(() => expect(getComputedStyle(highlight).opacity).toBe('0'))
      // Within a pixel: the panel may still be settling from its entrance scale.
      await expect(highlight.getBoundingClientRect().top).toBeCloseTo(top, 0)
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument())
    })
  },
}

/** ⌘K (Ctrl K off Apple devices) opens it, the arrows move, and Escape clears the search, then closes. */
export const Keyboard: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)

    await step('⌘K opens it', async () => {
      await userEvent.keyboard('{Meta>}k{/Meta}')
      await waitFor(() => expect(page.getByRole('dialog', { name: 'Command menu' })).toBeVisible())
      await waitFor(() => expect(search(canvasElement)).toHaveFocus())
    })

    await step('The arrows reach a disabled command, so screen readers hear it, but Enter does nothing', async () => {
      onSelect.mockClear()
      await userEvent.type(search(canvasElement), 'retry')
      const retry = page.getByRole('option', { name: /Retry run/ })
      await expect(retry).toHaveAttribute('aria-disabled', 'true')
      await waitFor(() => expect(retry).toHaveAttribute('data-highlighted'))
      await userEvent.keyboard('{Enter}')
      await expect(onSelect).not.toHaveBeenCalled()
      await expect(page.getByRole('dialog')).toBeVisible()
    })

    await step('The arrows move the highlight', async () => {
      await userEvent.clear(search(canvasElement))
      await userEvent.type(search(canvasElement), 'run')
      const [first, second] = page.getAllByRole('option')
      await waitFor(() => expect(first).toHaveAttribute('data-highlighted'))
      await userEvent.keyboard('{ArrowDown}')
      await expect(second).toHaveAttribute('data-highlighted')
      await expect(first).not.toHaveAttribute('data-highlighted')
    })

    await step('A danger command is red', async () => {
      const color = getComputedStyle(page.getByRole('option', { name: /Delete run/ })).color
      await expect(color).not.toBe(getComputedStyle(page.getByRole('option', { name: /Share run/ })).color)
    })

    await step('Escape clears the search first, and keeps the menu open', async () => {
      await userEvent.keyboard('{Escape}')
      await expect(search(canvasElement)).toHaveValue('')
      await expect(page.getByRole('dialog')).toBeVisible()
    })

    await step('A second Escape closes it', async () => {
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument())
    })
  },
}

/** When nothing matches, it says so with what was typed, and screen readers hear it. */
export const EmptyResult: Story = {
  name: 'Empty result',
  parameters: { controls: { disable: true } },
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)

    await step('A search with no match shows the empty state, in a region announced politely', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /^Search…/ }))
      await userEvent.type(search(canvasElement), 'invoices')
      const title = await page.findByText('No results for “invoices”')
      await expect(title.closest('[aria-live]')).toHaveAttribute('aria-live', 'polite')
      await expect(page.queryByRole('option')).not.toBeInTheDocument()
    })

    await step('The clear button empties it, and everything comes back', async () => {
      await userEvent.click(page.getByRole('button', { name: 'Clear search' }))
      await expect(search(canvasElement)).toHaveValue('')
      await expect(page.getByRole('option', { name: /Run #128/ })).toBeInTheDocument()
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument())
    })
  },
}

/** Any button can open it through `render`, like an icon button in a toolbar, with a tooltip that names it. */
export const CustomTrigger: Story = {
  name: 'Custom trigger',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <CommandMenu {...args}>
      <Tooltip content="Search">
        <CommandMenu.Trigger render={<IconButton icon="search" label="Search" />} />
      </Tooltip>
    </CommandMenu>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole('button', { name: 'Search' })

    await step('It still says its shortcut, and opens the menu', async () => {
      await expect(trigger).toHaveAttribute('aria-keyshortcuts')
      await userEvent.click(trigger)
      await waitFor(() => expect(page.getByRole('dialog', { name: 'Command menu' })).toBeVisible())
    })

    await step('Escape closes it and gives focus back to the icon button', async () => {
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument())
      await expect(trigger).toHaveFocus()
    })
  },
}
