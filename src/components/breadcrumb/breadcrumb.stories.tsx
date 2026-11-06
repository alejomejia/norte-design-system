import { type Meta, type StoryObj } from '@storybook/react-vite'
import { type ComponentProps, type MouseEvent } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Icon } from '@/components/icon'

import { Breadcrumb } from '.'
import { BREADCRUMB_TRUNCATE } from './breadcrumb.const'

const navigate = fn()

/**
 * A stand-in for a router's link (Next.js, React Router, TanStack Router): it navigates without reloading the page,
 * here by reporting where it would go.
 */
function RouterLink({ href, onClick, ...props }: ComponentProps<'a'> & { href: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    event.preventDefault()
    navigate(href)
  }

  return <a {...props} href={href} onClick={handleClick} />
}

/** Run #128's path. A function the stories call, not a component, so the code panel shows the markup. */
function runPath() {
  return (
    <>
      <Breadcrumb.Item href="#agents">Agents</Breadcrumb.Item>
      <Breadcrumb.Item href="#research-agent">Research agent</Breadcrumb.Item>
      <Breadcrumb.Item>Run #128</Breadcrumb.Item>
    </>
  )
}

/** The same run, from the top of the workspace down. */
function longPath() {
  return (
    <>
      <Breadcrumb.Item href="#lumen">Lumen</Breadcrumb.Item>
      <Breadcrumb.Item href="#growth">Growth</Breadcrumb.Item>
      <Breadcrumb.Item href="#agents">Agents</Breadcrumb.Item>
      <Breadcrumb.Item href="#research-agent">Research agent</Breadcrumb.Item>
      <Breadcrumb.Item>Run #128</Breadcrumb.Item>
    </>
  )
}

const meta = {
  title: 'Components/Navigation/Breadcrumb',
  component: Breadcrumb,
  tags: ['beta'],
  argTypes: {
    maxItems: { control: { type: 'range', min: 2, max: 8 } },
    itemsBefore: { control: { type: 'range', min: 1, max: 3 } },
    itemsAfter: { control: { type: 'range', min: 1, max: 3 } },
    separator: { control: 'text' },
    truncate: { control: 'inline-radio', options: BREADCRUMB_TRUNCATE },
    maxLabelLength: { control: { type: 'range', min: 8, max: 40 } },
    children: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Where the page sits in the app, each step a link back up and the current page as plain text. A long path folds its middle into a menu, and labels that don't fit truncate, with their full name in a tooltip. Pass your router's link through `render`.",
      },
    },
  },
  args: { children: runPath() },
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ canvas, step }) => {
    const nav = canvas.getByRole('navigation', { name: 'Breadcrumb' })

    await step('a nav around an ordered list, one item per step', async () => {
      const list = within(nav).getByRole('list')
      await expect(list.tagName).toBe('OL')
      await expect(within(list).getAllByRole('listitem')).toHaveLength(3)
    })

    await step('ancestors are links, the current page is plain text marked as such', async () => {
      await expect(canvas.getByRole('link', { name: 'Agents' })).toHaveAttribute('href', '#agents')
      await expect(canvas.getByRole('link', { name: 'Research agent' })).toHaveAttribute('href', '#research-agent')
      await expect(canvas.queryByRole('link', { name: 'Run #128' })).not.toBeInTheDocument()
      await expect(canvas.getByText('Run #128')).toHaveAttribute('aria-current', 'page')
    })

    await step('separators sit between items, hidden from screen readers', async () => {
      const separators = nav.querySelectorAll('[aria-hidden="true"]')
      await expect(separators).toHaveLength(2)
      for (const separator of separators) await expect(separator).toHaveTextContent('/')
    })

    await step('the current page reads stronger than its ancestors', async () => {
      const current = getComputedStyle(canvas.getByText('Run #128'))
      const ancestor = getComputedStyle(canvas.getByRole('link', { name: 'Agents' }))
      await expect(current.color).not.toBe(ancestor.color)
      await expect(Number(current.fontWeight)).toBeGreaterThan(Number(ancestor.fontWeight))
    })

    await step('Tab reaches each link and draws its focus ring', async () => {
      await userEvent.tab()
      const agents = canvas.getByRole('link', { name: 'Agents' })
      await expect(agents).toHaveFocus()
      await expect(getComputedStyle(agents).outlineStyle).toBe('solid')
      await userEvent.tab()
      await expect(canvas.getByRole('link', { name: 'Research agent' })).toHaveFocus()
    })
  },
}

/** A long path folds its middle into a "…" button that opens the hidden steps in a menu. */
export const Collapsed: Story = {
  parameters: { controls: { include: ['maxItems', 'itemsBefore', 'itemsAfter', 'moreLabel'] } },
  args: { children: longPath() },
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    const more = canvas.getByRole('button', { name: 'Show hidden pages' })

    await step('the middle is folded into one item', async () => {
      await expect(canvas.getAllByRole('listitem')).toHaveLength(4)
      await expect(canvas.getByRole('link', { name: 'Lumen' })).toBeInTheDocument()
      await expect(canvas.queryByRole('link', { name: 'Growth' })).not.toBeInTheDocument()
      await expect(canvas.queryByRole('link', { name: 'Agents' })).not.toBeInTheDocument()
      await expect(canvas.getByRole('link', { name: 'Research agent' })).toBeInTheDocument()
      await expect(more).toHaveAttribute('aria-haspopup', 'menu')
    })

    await step('a click opens the hidden pages as links', async () => {
      await userEvent.click(more)
      const growth = await page.findByRole('menuitem', { name: 'Growth' })
      await expect(growth).toHaveAttribute('href', '#growth')
      await expect(page.getByRole('menuitem', { name: 'Agents' })).toHaveAttribute('href', '#agents')
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(page.queryByRole('menu')).not.toBeInTheDocument())
    })

    await step('the keyboard opens it too, focus landing on the first page', async () => {
      more.focus()
      await userEvent.keyboard('{Enter}')
      await waitFor(() => expect(page.getByRole('menuitem', { name: 'Growth' })).toHaveFocus())
      await userEvent.keyboard('{ArrowDown}')
      await expect(page.getByRole('menuitem', { name: 'Agents' })).toHaveFocus()
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(more).toHaveFocus())
    })
  },
}

/** In an app with a router, each item takes the router's link through `render`, in the row and in the menu alike. */
export const WithARouterLink: Story = {
  name: 'With a router link',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Breadcrumb {...args}>
      <Breadcrumb.Item render={<RouterLink href="/" />}>Lumen</Breadcrumb.Item>
      <Breadcrumb.Item render={<RouterLink href="/growth" />}>Growth</Breadcrumb.Item>
      <Breadcrumb.Item render={<RouterLink href="/agents" />}>Agents</Breadcrumb.Item>
      <Breadcrumb.Item render={<RouterLink href="/agents/research" />}>Research agent</Breadcrumb.Item>
      <Breadcrumb.Item>Run #128</Breadcrumb.Item>
    </Breadcrumb>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    navigate.mockClear()

    await step('a link in the row navigates through the router', async () => {
      await userEvent.click(canvas.getByRole('link', { name: 'Research agent' }))
      await expect(navigate).toHaveBeenLastCalledWith('/agents/research')
    })

    await step('so does a link in the menu', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Show hidden pages' }))
      await userEvent.click(await page.findByRole('menuitem', { name: 'Agents' }))
      await expect(navigate).toHaveBeenLastCalledWith('/agents')
    })
  },
}

/**
 * When the row runs out of room, short labels stay whole and long ones truncate, the current page last. A truncated
 * label shows its full name in a tooltip.
 */
export const LongLabels: Story = {
  name: 'Long labels',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="sb-box-m">
      <Breadcrumb {...args}>
        <Breadcrumb.Item href="#agents">Agents</Breadcrumb.Item>
        <Breadcrumb.Item href="#research-agent">Research agent for competitor pricing</Breadcrumb.Item>
        <Breadcrumb.Item>Run #128: seat prices for teams of 10 to 50</Breadcrumb.Item>
      </Breadcrumb>
    </div>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    const nav = canvas.getByRole('navigation')
    const short = canvas.getByRole('link', { name: 'Agents' }).querySelector('span span') as HTMLElement
    const long = canvas
      .getByRole('link', { name: 'Research agent for competitor pricing' })
      .querySelector('span span') as HTMLElement
    const current = canvas.getByText(/^Run #128/)

    await step('the row stays inside its box', async () => {
      await expect(nav.scrollWidth).toBeLessThanOrEqual((nav.parentElement as HTMLElement).clientWidth)
    })

    await step('a short label stays whole', async () => {
      await expect(short.clientWidth).toBe(short.scrollWidth)
    })

    await step('a long one truncates, but keeps a readable part of its name', async () => {
      await expect(long.scrollWidth).toBeGreaterThan(long.clientWidth)
      // A few words, not a lone letter and an ellipsis.
      await expect(long.clientWidth).toBeGreaterThanOrEqual(64)
    })

    await step('the current page gets about twice the room of a long ancestor', async () => {
      await expect(current.scrollWidth).toBeGreaterThan(current.clientWidth)
      await expect(current.clientWidth).toBeGreaterThan(long.clientWidth * 1.5)
    })

    await step('a label that fits has no tooltip', async () => {
      await userEvent.tab()
      await expect(canvas.getByRole('link', { name: 'Agents' })).toHaveFocus()
      await new Promise((resolve) => setTimeout(resolve, 100))
      await expect(page.getAllByText('Agents')).toHaveLength(1)
    })

    await step('a truncated one shows its full name on focus', async () => {
      await userEvent.tab()
      await waitFor(() => expect(page.getAllByText('Research agent for competitor pricing')).toHaveLength(2))
      await userEvent.tab({ shift: true })
    })

    await step('and on hover, the current page too', async () => {
      await userEvent.hover(current)
      await waitFor(() => expect(page.getAllByText(/^Run #128/)).toHaveLength(2))
      await userEvent.unhover(current)
    })
  },
}

/** Only the ancestors truncate: the page you're on always reads in full, and the path above it gives way. */
export const TruncateAncestors: Story = {
  name: 'Truncate ancestors',
  parameters: { controls: { disable: true } },
  args: { truncate: 'ancestors' },
  render: (args) => (
    <div className="sb-box-m">
      <Breadcrumb {...args}>
        <Breadcrumb.Item href="#agents">Agents</Breadcrumb.Item>
        <Breadcrumb.Item href="#research-agent">Research agent for competitor pricing</Breadcrumb.Item>
        <Breadcrumb.Item>Run #128: seat prices</Breadcrumb.Item>
      </Breadcrumb>
    </div>
  ),
  play: async ({ canvas, step }) => {
    const long = canvas
      .getByRole('link', { name: 'Research agent for competitor pricing' })
      .querySelector('span span') as HTMLElement
    const current = canvas.getByText('Run #128: seat prices')

    await step('the current page stays whole, the ancestor truncates', async () => {
      await expect(current.clientWidth).toBe(current.scrollWidth)
      await expect(long.scrollWidth).toBeGreaterThan(long.clientWidth)
    })
  },
}

/** Only the current page truncates: the path above it always reads in full, and the page's long name gives way. */
export const TruncateCurrent: Story = {
  name: 'Truncate current',
  parameters: { controls: { disable: true } },
  args: { truncate: 'current' },
  render: (args) => (
    <div className="sb-box-m">
      <Breadcrumb {...args}>
        <Breadcrumb.Item href="#agents">Agents</Breadcrumb.Item>
        <Breadcrumb.Item href="#research-agent">Research agent</Breadcrumb.Item>
        <Breadcrumb.Item>Run #128: seat prices for teams of 10 to 50</Breadcrumb.Item>
      </Breadcrumb>
    </div>
  ),
  play: async ({ canvas, step }) => {
    const agent = canvas.getByRole('link', { name: 'Research agent' }).querySelector('span span') as HTMLElement
    const current = canvas.getByText(/^Run #128/)

    await step('the ancestors stay whole, the current page truncates', async () => {
      await expect(agent.clientWidth).toBe(agent.scrollWidth)
      await expect(current.scrollWidth).toBeGreaterThan(current.clientWidth)
    })
  },
}

/** Labels capped at 16 characters truncate even with room to spare, and their tooltip shows them whole. */
export const MaxLabelLength: Story = {
  name: 'Max label length',
  parameters: { controls: { include: ['maxLabelLength', 'truncate'] } },
  args: { maxLabelLength: 16 },
  render: (args) => (
    <div className="sb-box-l">
      <Breadcrumb {...args}>
        <Breadcrumb.Item href="#agents">Agents</Breadcrumb.Item>
        <Breadcrumb.Item href="#research-agent">Research agent for competitor pricing</Breadcrumb.Item>
        <Breadcrumb.Item>Run #128: seat prices for teams of 10 to 50</Breadcrumb.Item>
      </Breadcrumb>
    </div>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    const box = canvas.getByRole('navigation').parentElement as HTMLElement
    const list = canvas.getByRole('list')
    const short = canvas.getByRole('link', { name: 'Agents' }).querySelector('span span') as HTMLElement
    const longLink = canvas.getByRole('link', { name: 'Research agent for competitor pricing' })
    const long = longLink.querySelector('span span') as HTMLElement

    await step('long labels truncate with room to spare, short ones stay whole', async () => {
      await expect(long.scrollWidth).toBeGreaterThan(long.clientWidth)
      await expect(short.clientWidth).toBe(short.scrollWidth)
      const used = list.lastElementChild?.getBoundingClientRect().right ?? 0
      await expect(used - box.getBoundingClientRect().left).toBeLessThan(box.clientWidth * 0.75)
    })

    await step('a capped label still shows its full name in a tooltip', async () => {
      await userEvent.hover(longLink)
      await waitFor(() => expect(page.getAllByText('Research agent for competitor pricing')).toHaveLength(2))
      await userEvent.unhover(longLink)
    })
  },
}

/** The separator is yours to change: a chevron instead of the slash. */
export const Separator: Story = {
  parameters: { controls: { disable: true } },
  args: { separator: <Icon name="chevron-right" /> },
}
