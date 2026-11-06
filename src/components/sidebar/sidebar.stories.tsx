import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Avatar } from '@/components/avatar'
import { Logo } from '@/components/logo'
import { Menu } from '@/components/menu'

import { Sidebar } from '.'

/** The workspace switcher, in the header. A function the stories call, not a component, so the code shows the markup. */
function workspace() {
  return (
    <Sidebar.Header>
      <Menu>
        <Menu.Trigger
          render={
            <Sidebar.Button
              media={<Logo variant="tile" tone="inverse" size="s" className="ring-1 ring-line ring-inset" />}
              trailingIcon="chevron-down"
            >
              Norte
            </Sidebar.Button>
          }
        />
        <Menu.Popup>
          <Menu.Item icon="settings">Workspace settings</Menu.Item>
          <Menu.Item icon="team">Invite people</Menu.Item>
          <Menu.Separator />
          <Menu.Item icon="plus">New workspace</Menu.Item>
        </Menu.Popup>
      </Menu>
    </Sidebar.Header>
  )
}

/** The pages, with Runs open, as on Run #128. */
function pages() {
  return (
    <Sidebar.Nav>
      <Sidebar.Section>
        <Sidebar.Item icon="home" href="#home">
          Home
        </Sidebar.Item>
        <Sidebar.Item icon="agent" href="#agents">
          Agents
        </Sidebar.Item>
        <Sidebar.Item icon="run" href="#runs" current>
          Runs
        </Sidebar.Item>
        <Sidebar.Item icon="permission" href="#approvals" count={3} countLabel="3 waiting" countTone="accent">
          Approvals
        </Sidebar.Item>
      </Sidebar.Section>
      <Sidebar.Section label="Growth">
        <Sidebar.Item icon="ai" href="#research-agent">
          Research agent
        </Sidebar.Item>
        <Sidebar.Item icon="folder" href="#briefs">
          Briefs
        </Sidebar.Item>
        <Sidebar.Item icon="file" href="#reports" count={12}>
          Reports
        </Sidebar.Item>
      </Sidebar.Section>
      <Sidebar.Section>
        <Sidebar.Item icon="settings" href="#settings">
          Settings
        </Sidebar.Item>
      </Sidebar.Section>
    </Sidebar.Nav>
  )
}

/** The user menu and the collapse button, in the footer. */
function account() {
  return (
    <Sidebar.Footer>
      <Menu>
        <Menu.Trigger
          render={
            <Sidebar.Button
              media={
                <Avatar name="Alejandro Mejía" src="https://avatars.githubusercontent.com/u/10382723?v=4" size="s" />
              }
            >
              Alejandro Mejía
            </Sidebar.Button>
          }
        />
        <Menu.Popup side="top">
          <Menu.Item icon="user">Profile</Menu.Item>
          <Menu.Item icon="settings">Preferences</Menu.Item>
          <Menu.Separator />
          <Menu.Item icon="arrow-right">Sign out</Menu.Item>
        </Menu.Popup>
      </Menu>
      <Sidebar.Toggle />
    </Sidebar.Footer>
  )
}

/** Approvals' name, its count after a comma (testing-library adds a space before it: the hidden text is a block). */
const APPROVALS = /^Approvals\s?, 3 waiting$/

/** The horizontal center of an element on screen. */
function center(element: Element) {
  const { left, width } = element.getBoundingClientRect()
  return left + width / 2
}

/** The current background color of an element, as it's drawn. */
function fill(element: HTMLElement) {
  return getComputedStyle(element).backgroundColor
}

const meta = {
  title: 'Components/Navigation/Sidebar',
  component: Sidebar,
  tags: ['beta'],
  argTypes: {
    collapsed: { control: 'boolean' },
    children: { table: { disable: true } },
  },
  args: { onCollapsedChange: fn() },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "The workspace's navigation down the side of the page: the logo and workspace switcher, the pages in sections, and the user. It collapses to its icons, each name in a tooltip, and `useSidebar` lets what you put inside adapt. Pass your router's link through `render`.",
      },
    },
  },
  render: (args) => (
    <div className="sb-shell">
      <Sidebar {...args}>
        {workspace()}
        {pages()}
        {account()}
      </Sidebar>
      <div className="sb-shell-page" />
    </div>
  ),
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ args, canvas, canvasElement, step }) => {
    const nav = canvas.getByRole('navigation', { name: 'Workspace' })
    const runs = canvas.getByRole('link', { name: 'Runs' })
    const sidebar = nav.parentElement as HTMLElement

    await step('pages are links in named lists, the open one marked', async () => {
      await expect(within(nav).getAllByRole('link')).toHaveLength(8)
      await expect(runs).toHaveAttribute('aria-current', 'page')
      await expect(canvas.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
      await expect(canvas.getByRole('list', { name: 'Growth' })).toBeInTheDocument()
    })

    await step('a count is heard with what it means, said once', async () => {
      await expect(canvas.getByRole('link', { name: APPROVALS })).toBeInTheDocument()
      await expect(canvas.getByRole('link', { name: /^Reports\s?, 12$/ })).toBeInTheDocument()
    })

    await step('the open page is filled, the others rest clear', async () => {
      await expect(fill(runs)).not.toBe(fill(canvas.getByRole('link', { name: 'Home' })))
    })

    await step('the switcher and the user menu are buttons that open menus', async () => {
      await expect(canvas.getByRole('button', { name: 'Norte' })).toHaveAttribute('aria-haspopup', 'menu')
      await expect(canvas.getByRole('button', { name: 'Alejandro Mejía' })).toHaveAttribute('aria-haspopup', 'menu')
    })

    const home = canvas.getByRole('link', { name: 'Home' })
    const homeIcon = center(home.querySelector('svg') as SVGElement)

    await step('icons, the logo and the avatar share one column', async () => {
      const logo = canvas.getByRole('button', { name: 'Norte' }).querySelector('[aria-hidden="true"]') as HTMLElement
      const avatar = canvas
        .getByRole('button', { name: 'Alejandro Mejía' })
        .querySelector('[aria-hidden="true"]') as HTMLElement
      await expect(center(logo)).toBe(homeIcon)
      await expect(center(avatar)).toBe(homeIcon)
    })

    await step('the toggle collapses it to its icons', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Collapse sidebar' }))
      await expect(args.onCollapsedChange).toHaveBeenLastCalledWith(true)
      await expect(sidebar).toHaveAttribute('data-collapsed')
      await waitFor(() => expect(sidebar.getBoundingClientRect().width).toBe(56))
    })

    await step('the icons stayed where they were, centered in the narrow sidebar', async () => {
      await expect(center(home.querySelector('svg') as SVGElement)).toBe(homeIcon)
      const { left, width } = sidebar.getBoundingClientRect()
      await expect(homeIcon).toBe(left + width / 2)
    })

    await step('collapsed, every name is still heard', async () => {
      await expect(canvas.getByRole('link', { name: APPROVALS })).toBeInTheDocument()
      await expect(canvas.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument()
    })

    await step('and the keyboard opens it again', async () => {
      canvas.getByRole('button', { name: 'Expand sidebar' }).focus()
      await userEvent.keyboard('{Enter}')
      await expect(args.onCollapsedChange).toHaveBeenLastCalledWith(false)
      await waitFor(() => expect(sidebar.getBoundingClientRect().width).toBe(240))
    })

    await step('rows draw a focus ring from the keyboard', async () => {
      const page = within(canvasElement.ownerDocument.body)
      canvas.getByRole('button', { name: 'Norte' }).focus()
      await userEvent.tab()
      const home = canvas.getByRole('link', { name: 'Home' })
      await expect(home).toHaveFocus()
      await expect(getComputedStyle(home).outlineStyle).toBe('solid')
      // Open, the name is on screen: no tooltip repeats it.
      await new Promise((resolve) => setTimeout(resolve, 100))
      await expect(page.getAllByText('Home')).toHaveLength(1)
    })
  },
}

/** Collapsed to its icons: each name, and what a count means, appears in a tooltip on hover and focus. */
export const Collapsed: Story = {
  args: { defaultCollapsed: true },
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    const sidebar = canvas.getByRole('navigation').parentElement as HTMLElement

    await step('it starts at its icons', async () => {
      await expect(sidebar.getBoundingClientRect().width).toBe(56)
    })

    await step('a name shows on focus', async () => {
      canvas.getByRole('button', { name: 'Norte' }).focus()
      await userEvent.tab()
      await expect(canvas.getByRole('link', { name: 'Home' })).toHaveFocus()
      await waitFor(() => expect(page.getAllByText('Home')).toHaveLength(2))
    })

    await step('and a count says what it means', async () => {
      await userEvent.hover(canvas.getByRole('link', { name: APPROVALS }))
      await waitFor(() => expect(page.getByText('Approvals · 3 waiting')).toBeInTheDocument())
      await userEvent.unhover(canvas.getByRole('link', { name: APPROVALS }))
    })
  },
}

/** Held by the page with `collapsed` and `onCollapsedChange`, to remember it between visits. */
export const Controlled: Story = {
  args: { collapsed: true },
  play: async ({ args, canvas, step }) => {
    const sidebar = canvas.getByRole('navigation').parentElement as HTMLElement

    await step('the toggle asks, and the page decides', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Expand sidebar' }))
      await expect(args.onCollapsedChange).toHaveBeenLastCalledWith(false)
      await expect(sidebar).toHaveAttribute('data-collapsed')
    })
  },
}

/** More pages than fit: the pages scroll, while the header and footer stay put. */
export const LongNavigation: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="sb-shell">
      <Sidebar {...args}>
        {workspace()}
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item icon="home" href="#home">
              Home
            </Sidebar.Item>
            <Sidebar.Item icon="agent" href="#agents" current>
              Agents
            </Sidebar.Item>
            <Sidebar.Item icon="run" href="#runs">
              Runs
            </Sidebar.Item>
            <Sidebar.Item icon="permission" href="#approvals" count={3} countLabel="3 waiting" countTone="accent">
              Approvals
            </Sidebar.Item>
          </Sidebar.Section>
          <Sidebar.Section label="Agents">
            <Sidebar.Item icon="ai" href="#research-agent">
              Research agent
            </Sidebar.Item>
            <Sidebar.Item icon="ai" href="#pricing-watcher">
              Pricing watcher
            </Sidebar.Item>
            <Sidebar.Item icon="ai" href="#weekly-digest">
              Weekly digest
            </Sidebar.Item>
            <Sidebar.Item icon="ai" href="#churn-signals">
              Churn signals
            </Sidebar.Item>
          </Sidebar.Section>
          <Sidebar.Section label="Files">
            <Sidebar.Item icon="folder" href="#briefs">
              Briefs
            </Sidebar.Item>
            <Sidebar.Item icon="file" href="#reports" count={12}>
              Reports
            </Sidebar.Item>
            <Sidebar.Item icon="history" href="#archive">
              Archive
            </Sidebar.Item>
          </Sidebar.Section>
          <Sidebar.Section label="Workspace">
            <Sidebar.Item icon="team" href="#people">
              People
            </Sidebar.Item>
            <Sidebar.Item icon="tool" href="#tools">
              Tools
            </Sidebar.Item>
            <Sidebar.Item icon="settings" href="#settings">
              Settings
            </Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
        {account()}
      </Sidebar>
      <div className="sb-shell-page" />
    </div>
  ),
  play: async ({ canvas, step }) => {
    const nav = canvas.getByRole('navigation')

    await step('the pages scroll inside the sidebar', async () => {
      await expect(nav.scrollHeight).toBeGreaterThan(nav.clientHeight)
    })

    await step('the user stays in view', async () => {
      const user = canvas.getByRole('button', { name: 'Alejandro Mejía' }).getBoundingClientRect()
      const sidebar = (nav.parentElement as HTMLElement).getBoundingClientRect()
      await expect(user.bottom).toBeLessThanOrEqual(sidebar.bottom)
    })
  },
}
