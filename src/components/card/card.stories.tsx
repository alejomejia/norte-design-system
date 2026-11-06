import { type Meta, type StoryObj } from '@storybook/react-vite'
import { type ComponentProps, type MouseEvent } from 'react'
import { expect, fn, userEvent } from 'storybook/test'

import { Avatar } from '@/components/avatar'
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'

import { Card } from '.'
import { CARD_PADDINGS, CARD_VARIANTS } from './card.const'

const navigate = fn()

/** A stand-in for a router's link: it navigates without reloading the page, here by reporting where it would go. */
function RouterLink({ href, onClick, ...props }: ComponentProps<'a'> & { href: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    event.preventDefault()
    navigate(href)
  }

  return <a {...props} href={href} onClick={handleClick} />
}

/** The center of an element, in the viewport. */
function centerOf(element: Element) {
  const box = element.getBoundingClientRect()
  return [box.left + box.width / 2, box.top + box.height / 2] as const
}

const meta = {
  title: 'Components/Content/Card',
  component: Card,
  tags: ['beta'],
  argTypes: {
    variant: { control: 'inline-radio', options: CARD_VARIANTS },
    padding: { control: 'inline-radio', options: CARD_PADDINGS },
    render: { table: { disable: true } },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A surface that groups related content, with optional header, body and footer parts. A card that opens a page puts a `Card.Link` in its title, so the whole card is clickable while its actions stay their own. Never a clickable `div`.',
      },
    },
  },
  render: (args) => (
    <Card {...args} className="max-w-md">
      <Card.Header>
        <Card.Title>Run #128</Card.Title>
        <Card.Description>Research agent · asked by Sofía Herrera</Card.Description>
        <Card.Action>
          <Badge tone="warning" dot>
            Waiting
          </Badge>
        </Card.Action>
      </Card.Header>
      <Card.Body>
        Compare our five main competitors' pricing for teams of 10 to 50 seats, and email a summary of what changed to
        the leadership team.
      </Card.Body>
      <Card.Footer>
        <Button variant="secondary">View logs</Button>
        <Button>Open run</Button>
      </Card.Footer>
    </Card>
  ),
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ canvas, step }) => {
    await step('Its title is a heading', async () => {
      await expect(canvas.getByRole('heading', { level: 3, name: 'Run #128' })).toBeInTheDocument()
    })
  },
}

/** `outline` on the page, `muted` inside a panel, where a border would be one line too many. */
export const Variants: Story = {
  parameters: { controls: { exclude: ['variant'] } },
  render: (args) => (
    <div className="sb-row items-stretch">
      {CARD_VARIANTS.map((variant) => (
        <Card key={variant} {...args} variant={variant} className="sb-box-m">
          <Card.Header>
            <Card.Title>Tokens</Card.Title>
            <Card.Description>{variant}</Card.Description>
          </Card.Header>
          <Card.Body className="text-heading-m font-semibold">38.2k</Card.Body>
        </Card>
      ))}
    </div>
  ),
}

/** 12, 16 and 24px, inside and between the parts: small for dense grids, large for a card on its own. */
export const Paddings: Story = {
  parameters: { controls: { exclude: ['padding'] } },
  render: (args) => (
    <div className="sb-row items-start">
      {CARD_PADDINGS.map((padding) => (
        <Card key={padding} {...args} padding={padding} className="sb-box-m">
          <Card.Header>
            <Card.Title>Padding {padding}</Card.Title>
            <Card.Description>Research agent · 4m 12s</Card.Description>
          </Card.Header>
          <Card.Body>Compared seat prices and annual discounts across five competitors.</Card.Body>
        </Card>
      ))}
    </div>
  ),
}

/** Every part is optional: a card can be only a header, or only a body. */
export const Parts: Story = {
  parameters: { controls: { exclude: ['padding'] } },
  render: (args) => (
    <div className="sb-row items-start">
      <Card {...args} className="sb-box-m">
        <Card.Header>
          <Card.Title>Only a header</Card.Title>
          <Card.Description>A title and a line under it.</Card.Description>
        </Card.Header>
      </Card>
      <Card {...args} className="sb-box-m">
        <Card.Body>Only a body: content with nothing around it.</Card.Body>
      </Card>
    </div>
  ),
}

/**
 * A card that opens a page: a `Card.Link` in the title, stretched over the card, while the footer's buttons still work
 * on their own.
 */
export const AsALink: Story = {
  name: 'As a link',
  render: (args) => (
    <Card {...args} id="run-127" className="max-w-md">
      <Card.Header>
        <Card.Title>
          <Card.Link render={<RouterLink href="/runs/127" />}>Run #127</Card.Link>
        </Card.Title>
        <Card.Description>Research agent · finished yesterday</Card.Description>
        <Card.Action>
          <Badge tone="success">Done</Badge>
        </Card.Action>
      </Card.Header>
      <Card.Body>Compared Q2 pricing for teams of 10 to 50 seats across five competitors.</Card.Body>
      <Card.Footer>
        <Button variant="secondary">Run again</Button>
      </Card.Footer>
    </Card>
  ),
  play: async ({ canvas, step }) => {
    const link = canvas.getByRole('link', { name: 'Run #127' })

    await step('The whole card is one link, named by its title', async () => {
      await expect(canvas.getAllByRole('link')).toHaveLength(1)
      const body = canvas.getByText(/Compared Q2 pricing/)
      await expect(document.elementFromPoint(...centerOf(body))).toBe(link)
    })

    await step('A click anywhere opens it', async () => {
      navigate.mockClear()
      await userEvent.click(link)
      await expect(navigate).toHaveBeenCalledWith('/runs/127')
    })

    await step('Its footer buttons stay clickable on their own', async () => {
      const button = canvas.getByRole('button', { name: 'Run again' })
      await expect(document.elementFromPoint(...centerOf(button))?.closest('button')).toBe(button)
    })

    await step('Tab focuses the link, and the ring goes around the card', async () => {
      ;(document.activeElement as HTMLElement | null)?.blur()
      await userEvent.tab()
      await expect(link).toHaveFocus()
      await expect(getComputedStyle(document.getElementById('run-127') as HTMLElement).outlineStyle).toBe('solid')
    })
  },
}

/** Where it shows up: the run's stats, as muted cards in a panel, and the approval request, built on a card. */
export const InContext: Story = {
  name: 'In context',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-stack sb-stack--stretch max-w-160">
      <div className="sb-panel grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Duration', '4m 12s'],
          ['Tokens', '38.2k'],
          ['Cost', '$0.84'],
          ['Tool calls', '23'],
        ].map(([label, value]) => (
          <Card key={label} variant="muted" padding="s">
            <Card.Header>
              <Card.Description className="text-caption">{label}</Card.Description>
            </Card.Header>
            <Card.Body className="text-heading-s font-semibold tabular-nums">{value}</Card.Body>
          </Card>
        ))}
      </div>
      <Card render={<article />}>
        <Card.Header>
          <div className="flex items-center gap-3">
            <Avatar kind="agent" name="Research agent" decorative />
            <div>
              <Card.Title>Research agent</Card.Title>
              <Card.Description className="text-caption">2 minutes ago</Card.Description>
            </div>
          </div>
          <Card.Action>
            <Badge tone="warning">Needs review</Badge>
          </Card.Action>
        </Card.Header>
        <Card.Body>
          Send "Competitor pricing, Q3: what changed" to the leadership team, 6 people?
          <p className="text-caption text-ink-muted">Drafted from reports/pricing-q3.md.</p>
        </Card.Body>
        <Card.Footer>
          <Button variant="secondary">Reject</Button>
          <Button>Approve</Button>
        </Card.Footer>
      </Card>
    </div>
  ),
}
