import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'

import { Button } from '@/components/button'
import { ICON_NAMES } from '@/components/icon/icon.const'
import { Link } from '@/components/link'
import { Logo } from '@/components/logo'
import { Tabs } from '@/components/tabs'

import { EmptyState } from '.'
import { EMPTY_STATE_SIZES, EMPTY_STATE_VARIANTS } from './empty-state.const'

const LOGS_TITLE = 'No logs yet'
const LOGS_DESCRIPTION = 'Run #128 is waiting for your approval. Its steps show up here once it picks up again.'

/** The empty state around an element: the box that holds everything. */
function rootOf(element: Element) {
  const root = element.closest('[class*="isolate"]')
  if (!root) throw new Error('Expected an empty state')
  return root
}

/** The topographic map behind an empty state. */
function mapOf(element: Element) {
  const map = rootOf(element).querySelector<SVGElement>('svg[preserveAspectRatio]')
  if (!map) throw new Error('Expected a map')
  return map
}

/** The two actions of the Logs tab, at a size. */
function logsActions(size: 's' | 'm' = 's') {
  return (
    <>
      <Button size={size}>Review the approval</Button>
      <Button variant="secondary" size={size}>
        View the plan
      </Button>
    </>
  )
}

const meta = {
  title: 'Components/Feedback/Empty state',
  component: EmptyState,
  tags: ['beta'],
  argTypes: {
    size: { control: 'inline-radio', options: EMPTY_STATE_SIZES },
    variant: { control: 'inline-radio', options: EMPTY_STATE_VARIANTS },
    icon: { control: 'select', options: ICON_NAMES },
    title: { control: 'text' },
    description: { control: 'text' },
    image: { table: { disable: true } },
    actions: { table: { disable: true } },
    titleRender: { table: { disable: true } },
  },
  args: { icon: 'terminal', title: LOGS_TITLE, description: LOGS_DESCRIPTION, actions: logsActions() },
  parameters: {
    docs: {
      description: {
        component:
          "What a space shows while there's nothing in it yet: what's missing, why, and what to do about it, usually a primary action and a quieter one. As a card, it sits on a faint topographic map, the one on Norte's cover, so the empty space reads as a place rather than something broken.",
      },
    },
  },
  render: (args) => (
    <div className="sb-box-l">
      <EmptyState {...args} />
    </div>
  ),
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ canvas, step }) => {
    const heading = canvas.getByRole('heading', { level: 3, name: LOGS_TITLE })
    const primary = canvas.getByRole('button', { name: 'Review the approval' })
    const secondary = canvas.getByRole('button', { name: 'View the plan' })

    await step('A heading, its description and two actions, one primary', async () => {
      await expect(canvas.getByText(LOGS_DESCRIPTION)).toBeInTheDocument()
      await expect(getComputedStyle(primary).backgroundColor).not.toBe(getComputedStyle(secondary).backgroundColor)
    })

    await step('The map and the tile say nothing to a screen reader', async () => {
      await expect(mapOf(heading).getAttribute('aria-hidden')).toBe('true')
      await expect(rootOf(heading).querySelector('span[aria-hidden="true"]')).toContainElement(
        rootOf(heading).querySelector('span svg'),
      )
    })

    await step('The map fades in, its lines faint', async () => {
      const map = mapOf(heading)
      await waitFor(() => expect(getComputedStyle(map).opacity).toBe('1'), { timeout: 2000 })
      const [line, indexLine] = [...map.querySelectorAll('path')].map((path) => getComputedStyle(path).stroke)
      await expect(line).toMatch(/[\s/]0\.03\)$/)
      await expect(indexLine).toMatch(/[\s/]0\.05\)$/)
    })

    await step('Tab reaches the primary action first, and its ring draws', async () => {
      ;(document.activeElement as HTMLElement | null)?.blur()
      await userEvent.tab()
      await expect(primary).toHaveFocus()
      await expect(getComputedStyle(primary).outlineStyle).toBe('solid')
      await userEvent.tab()
      await expect(secondary).toHaveFocus()
    })
  },
}

/** `s` inside a panel or a tab, `m` filling a page, its heading at the page's level with `titleRender`. */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['size', 'title', 'description', 'icon'] } },
  render: (args) => (
    <div className="sb-stack sb-stack--stretch sb-box-l">
      <EmptyState {...args} />
      <EmptyState
        {...args}
        size="m"
        icon="run"
        title="No runs yet"
        titleRender={(props) => <h2 {...props} />}
        description="The Research agent hasn't run yet. Give it a brief, and every run it makes shows up here."
        actions={
          <>
            <Button>Start a run</Button>
            <Button variant="secondary">See an example</Button>
          </>
        }
      />
    </div>
  ),
  play: async ({ canvas, step }) => {
    const medium = canvas.getByRole('heading', { level: 2, name: 'No runs yet' })

    await step('`m` has a bigger tile', async () => {
      const [small, large] = [canvas.getByRole('heading', { name: LOGS_TITLE }), medium].map(
        (heading) => rootOf(heading).querySelector('span[aria-hidden="true"]')?.getBoundingClientRect().width ?? 0,
      )
      await expect(large).toBeGreaterThan(small ?? 0)
    })

    await step('Its icon still sits 16px above the title', async () => {
      const tile = rootOf(medium).querySelector('span[aria-hidden="true"]')?.getBoundingClientRect()
      await expect(Math.round(medium.getBoundingClientRect().top - (tile?.bottom ?? 0))).toBe(16)
    })
  },
}

/** `outline` is a card on the map, `dashed` a space that fills up, `plain` sits on a surface that already frames it. */
export const Variants: Story = {
  parameters: { controls: { exclude: ['variant', 'title', 'description', 'icon'] } },
  render: (args) => (
    <div className="sb-stack sb-stack--stretch sb-box-l">
      <EmptyState {...args} />
      <EmptyState
        {...args}
        variant="dashed"
        icon="folder"
        title="No files yet"
        description="Add the briefs and reports the Research agent can read, like briefs/q3-pricing.md."
        actions={
          <>
            <Button size="s">Add files</Button>
            <Button variant="secondary" size="s">
              Use a template
            </Button>
          </>
        }
      />
      <div className="sb-panel">
        <EmptyState
          {...args}
          variant="plain"
          icon="search"
          title="No competitors match “Acme”"
          description="The run compared Fieldnote, Brightloop, Tandem, Orbit and Kitewise. Try one of them, or add Acme."
          actions={
            <>
              <Button size="s">Clear the filter</Button>
              <Button variant="secondary" size="s">
                Add Acme
              </Button>
            </>
          }
        />
      </div>
    </div>
  ),
  play: async ({ canvas, step }) => {
    const [outline, dashed, plain] = [LOGS_TITLE, 'No files yet', 'No competitors match “Acme”'].map((name) =>
      canvas.getByRole('heading', { name }),
    ) as [HTMLElement, HTMLElement, HTMLElement]

    await step('A solid border, a dashed one, and none', async () => {
      await expect(getComputedStyle(rootOf(outline)).borderStyle).toBe('solid')
      await expect(getComputedStyle(rootOf(dashed)).borderStyle).toBe('dashed')
      await expect(getComputedStyle(rootOf(plain)).borderTopWidth).toBe('0px')
    })

    await step('Only the card has the map', async () => {
      await expect(mapOf(outline)).toBeInTheDocument()
      for (const heading of [dashed, plain]) {
        await expect(rootOf(heading).querySelector('svg[preserveAspectRatio]')).toBeNull()
      }
    })

    await step('The icon sits 16px above the title at every size', async () => {
      for (const heading of [outline, dashed, plain]) {
        const tile = rootOf(heading).querySelector('span[aria-hidden="true"]')?.getBoundingClientRect()
        await expect(Math.round(heading.getBoundingClientRect().top - (tile?.bottom ?? 0))).toBe(16)
      }
    })
  },
}

/** A link as the action, for a space that fills up on its own. */
export const WithLink: Story = {
  name: 'With link',
  args: {
    icon: 'permission',
    title: 'Nothing to approve',
    description: 'When an agent asks before it acts, like sending an email, the request waits here for you.',
    actions: <Link href="https://norte.com/docs/approvals">How approvals work</Link>,
  },
}

/** An image of your own in place of the icon's tile. */
export const WithImage: Story = {
  name: 'With image',
  args: {
    size: 'm',
    image: <Logo variant="mark" size="l" />,
    title: 'Welcome to Norte',
    description: 'Agents you add to the workspace show up here, ready to take a brief.',
    actions: (
      <>
        <Button>Add an agent</Button>
        <Button variant="secondary">Browse templates</Button>
      </>
    ),
  },
  play: async ({ canvas, step }) => {
    await step('It has no tile', async () => {
      const root = rootOf(canvas.getByRole('heading', { name: 'Welcome to Norte' }))
      await expect(root.querySelector('span[aria-hidden="true"]')).toBeNull()
    })
  },
}

/** As it appears, the map fades in while the content rises, the actions just after. Press the button to replay it. */
export const Appearing: Story = {
  parameters: { controls: { disable: true } },
  render: function Render(args) {
    const [run, setRun] = useState(0)
    return (
      <div className="sb-stack items-center">
        <div className="sb-box-l">
          <EmptyState key={run} {...args} />
        </div>
        <Button variant="ghost" onClick={() => setRun((count) => count + 1)}>
          Replay
        </Button>
      </div>
    )
  },
  play: async ({ canvas, step }) => {
    await step('The map starts hidden and fades in', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Replay' }))
      const map = mapOf(canvas.getByRole('heading', { name: LOGS_TITLE }))
      await expect(Number.parseFloat(getComputedStyle(map).opacity)).toBeLessThan(1)
      await waitFor(() => expect(getComputedStyle(map).opacity).toBe('1'), { timeout: 2000 })
    })
  },
}

/** Where it shows up first: the Logs tab of run #128, while the run waits for an approval. */
export const InContext: Story = {
  name: 'In context',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-panel">
      <Tabs defaultValue="logs">
        <Tabs.List aria-label="Run #128">
          <Tabs.Tab value="results" count={5}>
            Results
          </Tabs.Tab>
          <Tabs.Tab value="details">Details</Tabs.Tab>
          <Tabs.Tab value="logs">Logs</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="results">Seat prices for Fieldnote, Brightloop, Tandem, Orbit and Kitewise.</Tabs.Panel>
        <Tabs.Panel value="details">4m 12s, 38.2k tokens, $0.84 and 23 tool calls.</Tabs.Panel>
        <Tabs.Panel value="logs">
          <EmptyState
            variant="dashed"
            icon="terminal"
            title={LOGS_TITLE}
            description={LOGS_DESCRIPTION}
            actions={logsActions()}
          />
        </Tabs.Panel>
      </Tabs>
    </div>
  ),
}
