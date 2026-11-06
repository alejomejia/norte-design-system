import { type Meta, type StoryObj } from '@storybook/react-vite'
import { type ComponentProps, type MouseEvent } from 'react'
import { expect, fn } from 'storybook/test'

import { Link } from '.'
import { LINK_VARIANTS } from './link.const'

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

const meta = {
  title: 'Elements/Actions/Link',
  component: Link,
  tags: ['beta'],
  argTypes: {
    variant: { control: 'inline-radio', options: LINK_VARIANTS },
    children: { control: 'text' },
    newTabLabel: { control: 'text' },
    render: { control: false },
  },
  args: { href: '#report', children: "Last quarter's report" },
  parameters: {
    docs: {
      description: {
        component:
          "Takes the reader to another page: `inline` inside a sentence, `standalone` on its own. Links to other sites open in a new tab and say so. In an app with a router, pass the router's link to `render`.",
      },
    },
  },
} satisfies Meta<typeof Link>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** Links inside a block of text, the way they appear in a run's summary. A long one wraps like any other phrase. */
export const InText: Story = {
  name: 'In text',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-box-l">
      <p className="text-body text-ink">
        <Link href="#brief">The brief</Link> asked for seat prices for teams of 10 to 50. Since{' '}
        <Link href="#report">last quarter's report</Link>, Fieldnote and Tandem have raised theirs, and Brightloop now
        takes 20% off a yearly plan (<Link href="https://brightloop.example/pricing">its pricing page</Link>). Orbit's
        page timed out, so its numbers come from{' '}
        <Link href="https://archive.example/orbit/pricing">the archived copy of Orbit's pricing page from June</Link>.
      </p>
    </div>
  ),
}

/** On its own: a menu item, a link in a list, after a summary. Its underline draws in from the left on hover. */
export const Standalone: Story = {
  args: { variant: 'standalone', href: '#runs', children: 'View all runs' },
}

/** Both side by side: `inline` keeps its line at rest, `standalone` waits for the hover. */
export const Variants: Story = {
  parameters: { controls: { exclude: ['variant', 'children'] } },
  render: (args) => (
    <div className="sb-row">
      {LINK_VARIANTS.map((variant) => (
        <Link key={variant} {...args} variant={variant}>
          {variant.charAt(0).toUpperCase() + variant.slice(1)}
        </Link>
      ))}
    </div>
  ),
}

/** A link to another site opens in a new tab: an arrow shows it, and screen readers hear "(opens in a new tab)". */
export const ToAnotherSite: Story = {
  name: 'To another site',
  args: { href: 'https://fieldnote.example/pricing', children: 'Fieldnote pricing' },
  play: async ({ canvas, step }) => {
    await step('Its name says it opens a new tab', async () => {
      const link = canvas.getByRole('link', { name: 'Fieldnote pricing (opens in a new tab)' })
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  },
}

/**
 * Only links to other sites open a new tab on their own. The app's pages, emails and anchors stay in this one, and
 * `newTab` forces either.
 */
export const NewTabs: Story = {
  name: 'New tabs',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-stack">
      <Link variant="standalone" href="#runs">
        View all runs
      </Link>
      <Link variant="standalone" href="mailto:sofia@norte.com">
        sofia@norte.com
      </Link>
      <Link variant="standalone" href="https://fieldnote.example/pricing" rel="external">
        Fieldnote pricing
      </Link>
      <Link variant="standalone" href="https://norte.example/runs/128" newTab={false}>
        Run #128 on norte.example
      </Link>
      <Link variant="standalone" href="#report" newTab>
        Open the report
      </Link>
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step("The app's pages and emails stay in this tab", async () => {
      await expect(canvas.getByRole('link', { name: 'View all runs' })).not.toHaveAttribute('target')
      await expect(canvas.getByRole('link', { name: 'sofia@norte.com' })).not.toHaveAttribute('target')
    })
    await step('Another site opens a new tab, keeping its own rel', async () => {
      const link = canvas.getByRole('link', { name: 'Fieldnote pricing (opens in a new tab)' })
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer external')
    })
    await step('`newTab` forces either way', async () => {
      await expect(canvas.getByRole('link', { name: 'Run #128 on norte.example' })).not.toHaveAttribute('target')
      await expect(canvas.getByRole('link', { name: 'Open the report (opens in a new tab)' })).toHaveAttribute(
        'target',
        '_blank',
      )
    })
  },
}

/**
 * Your router's link through `render`: Norte's look, the router's navigation and options. Click it: the page doesn't
 * reload.
 */
export const WithARouter: Story = {
  name: 'With a router',
  args: { href: undefined, render: <RouterLink href="/runs/127" />, children: "Last week's run" },
  parameters: { controls: { include: ['variant', 'children'] } },
  play: async ({ canvas, step, userEvent }) => {
    navigate.mockClear()
    const link = canvas.getByRole('link', { name: "Last week's run" })

    await step("It keeps the router's href and stays in this tab", async () => {
      await expect(link).toHaveAttribute('href', '/runs/127')
      await expect(link).not.toHaveAttribute('target')
    })
    await step('Clicking it navigates through the router', async () => {
      await userEvent.click(link)
      await expect(navigate).toHaveBeenCalledWith('/runs/127')
    })
  },
}

/** It's reached with Tab, like any link, and shows the focus ring. */
export const Keyboard: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ canvas, step, userEvent }) => {
    await step('Tab focuses it', async () => {
      await userEvent.tab()
      await expect(canvas.getByRole('link', { name: "Last quarter's report" })).toHaveFocus()
    })
  },
}
