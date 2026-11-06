import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'

import { Select } from '@/components/select'
import { Switch } from '@/components/switch'
import { TextField } from '@/components/text-field'
import { Textarea } from '@/components/textarea'

import { Accordion } from '.'
import { ACCORDION_HEADING_LEVELS, ACCORDION_VARIANTS } from './accordion.const'

const MODELS = [
  { value: 'fast', label: 'Fast: quick answers, lower cost' },
  { value: 'balanced', label: 'Balanced: the default for most agents' },
  { value: 'deep', label: 'Deep: long reasoning, slower' },
]

/**
 * Run #128's sections, in short. A function the stories call, not a component, so the code panel shows the markup.
 */
function runSections() {
  return (
    <>
      <Accordion.Item value="agent">
        <Accordion.Trigger>Agent</Accordion.Trigger>
        <Accordion.Panel>Research agent, asked by Sofía Herrera, Head of Growth.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="tools">
        <Accordion.Trigger>Tools</Accordion.Trigger>
        <Accordion.Panel>web_search, read_file, fetch_url, write_summary and send_email.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="model">
        <Accordion.Trigger>Model</Accordion.Trigger>
        <Accordion.Panel>Balanced: the default for most agents.</Accordion.Panel>
      </Accordion.Item>
    </>
  )
}

/** A trigger's label color, read as it's drawn. */
function labelColor(trigger: HTMLElement) {
  return getComputedStyle(trigger.querySelector('span > span') as HTMLElement).color
}

const meta = {
  title: 'Components/Content/Accordion',
  component: Accordion,
  tags: ['beta'],
  argTypes: {
    variant: { control: 'inline-radio', options: ACCORDION_VARIANTS },
    headingLevel: { control: 'inline-radio', options: ACCORDION_HEADING_LEVELS },
    children: { table: { disable: true } },
    value: { table: { disable: true } },
    render: { table: { disable: true } },
    style: { table: { disable: true } },
    defaultValue: { control: 'check', options: ['agent', 'tools', 'model'] },
  },
  args: { defaultValue: ['agent'], onValueChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "Sections that open and close under their headings: one at a time, or several with `multiple`. Each trigger takes an icon and a description. `line` draws hairlines between sections, flush with a panel's edges; `outline` puts them on one bordered surface. A panel grows open, its content fading in, and the chevron turns down. Closed panels stay in the page (`hiddenUntilFound`), so the browser's find opens the section that holds a match, and fields inside keep what was typed. Built on Base UI's Accordion: each trigger is a button in a heading (`headingLevel`), with `aria-expanded`, and each panel is a region named by its trigger.",
      },
    },
  },
  render: (args) => (
    <div className="sb-box-m">
      <Accordion {...args}>{runSections()}</Accordion>
    </div>
  ),
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ args, canvas, step }) => {
    const agent = canvas.getByRole('button', { name: 'Agent' })
    const tools = canvas.getByRole('button', { name: 'Tools' })

    await step('Each trigger is a button in a heading, and the open one shows its region, named by it', async () => {
      await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(3)
      await expect(canvas.getByRole('heading', { name: 'Agent' })).toContainElement(agent)
      await expect(agent).toHaveAttribute('aria-expanded', 'true')
      await expect(tools).toHaveAttribute('aria-expanded', 'false')
      const region = canvas.getByRole('region', { name: 'Agent' })
      await expect(agent).toHaveAttribute('aria-controls', region.id)
      await expect(region).toHaveTextContent('Sofía Herrera')
    })

    await step('The open section is in full ink, a closed one quieter', async () => {
      await expect(labelColor(tools)).not.toBe(labelColor(agent))
    })

    await step('A click opens another section and closes the first: one at a time', async () => {
      await userEvent.click(tools)
      await expect(tools).toHaveAttribute('aria-expanded', 'true')
      await expect(agent).toHaveAttribute('aria-expanded', 'false')
      await expect(args.onValueChange).toHaveBeenLastCalledWith(['tools'], expect.anything())
      await expect(canvas.getByRole('region', { name: 'Tools' })).toHaveTextContent('fetch_url')
    })

    await step('The panel grows to exactly its content, with no snap at the end', async () => {
      const model = canvas.getByRole('button', { name: 'Model' })
      await userEvent.click(model)
      const region = canvas.getByRole('region', { name: 'Model' })
      // The height Base UI measured and grows the panel to, then hands back to `auto` once it's there.
      const measured = region.style.getPropertyValue('--accordion-panel-height')
      await expect(measured).toMatch(/px$/)
      await waitFor(() => expect(region.style.getPropertyValue('--accordion-panel-height')).toBe('auto'))
      await expect(region.getBoundingClientRect().height).toBeCloseTo(Number.parseFloat(measured), 0)
      await userEvent.click(tools)
    })

    await step('A second click closes it', async () => {
      await userEvent.click(tools)
      await expect(tools).toHaveAttribute('aria-expanded', 'false')
      await expect(args.onValueChange).toHaveBeenLastCalledWith([], expect.anything())
    })
  },
}

/** The keyboard: Tab moves from trigger to trigger, Enter or Space opens and closes. */
export const Keyboard: Story = {
  parameters: { controls: { disable: true } },
  args: { defaultValue: [] },
  play: async ({ canvas, step }) => {
    const agent = canvas.getByRole('button', { name: 'Agent' })
    const tools = canvas.getByRole('button', { name: 'Tools' })

    await step('Tab reaches the first trigger, Enter opens it', async () => {
      await userEvent.tab()
      await expect(agent).toHaveFocus()
      // The ring really draws: `outline-none` beside `focus-visible:outline-2` would leave its style at `none`.
      await expect(getComputedStyle(agent).outlineStyle).toBe('solid')
      await userEvent.keyboard('{Enter}')
      await expect(agent).toHaveAttribute('aria-expanded', 'true')
    })

    await step('Tab moves on to the next trigger, Space opens it', async () => {
      await userEvent.tab()
      await expect(tools).toHaveFocus()
      await userEvent.keyboard(' ')
      await expect(tools).toHaveAttribute('aria-expanded', 'true')
      await expect(agent).toHaveAttribute('aria-expanded', 'false')
    })
  },
}

/** One bordered surface, with the hairlines between its sections: on a page, where nothing frames it. */
export const Outline: Story = { args: { variant: 'outline' } }

/** With `multiple`, opening a section leaves the others as they are. */
export const Multiple: Story = {
  args: { multiple: true, defaultValue: ['agent', 'tools'] },
  play: async ({ canvas, step }) => {
    await step('Several sections stay open together', async () => {
      await expect(canvas.getByRole('button', { name: 'Agent' })).toHaveAttribute('aria-expanded', 'true')
      await userEvent.click(canvas.getByRole('button', { name: 'Model' }))
      await expect(canvas.getAllByRole('region')).toHaveLength(3)
      await expect(canvas.getByRole('button', { name: 'Tools' })).toHaveAttribute('aria-expanded', 'true')
    })
  },
}

/** An icon before each label and a line under it that says what the section holds. */
export const WithIconsAndDescriptions: Story = {
  name: 'With icons and descriptions',
  render: (args) => (
    <div className="sb-box-m">
      <Accordion {...args}>
        <Accordion.Item value="agent">
          <Accordion.Trigger icon="agent" description="Name and instructions">
            Agent
          </Accordion.Trigger>
          <Accordion.Panel>Research agent, asked by Sofía Herrera, Head of Growth.</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="tools">
          <Accordion.Trigger icon="tool" description="5 tools, 1 needs approval">
            Tools
          </Accordion.Trigger>
          <Accordion.Panel>web_search, read_file, fetch_url, write_summary and send_email.</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="model">
          <Accordion.Trigger icon="ai" description="Balanced">
            Model
          </Accordion.Trigger>
          <Accordion.Panel>Balanced: the default for most agents.</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('The description is part of the trigger’s name', async () => {
      await expect(canvas.getByRole('button', { name: 'Tools 5 tools, 1 needs approval' })).toBeInTheDocument()
    })
  },
}

/** A section that can't be opened right now stays in the list, dimmed, and a click leaves it shut. */
export const DisabledItem: Story = {
  name: 'Disabled item',
  render: (args) => (
    <div className="sb-box-m">
      <Accordion {...args}>
        <Accordion.Item value="agent">
          <Accordion.Trigger>Agent</Accordion.Trigger>
          <Accordion.Panel>Research agent, asked by Sofía Herrera, Head of Growth.</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="tools">
          <Accordion.Trigger>Tools</Accordion.Trigger>
          <Accordion.Panel>web_search, read_file, fetch_url, write_summary and send_email.</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="model" disabled>
          <Accordion.Trigger description="Fixed by your workspace">Model</Accordion.Trigger>
          <Accordion.Panel>Balanced: the default for most agents.</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('A click on the disabled trigger leaves it shut', async () => {
      const model = canvas.getByRole('button', { name: 'Model Fixed by your workspace' })
      await expect(model).toBeDisabled()
      await userEvent.click(model, { pointerEventsCheck: 0 })
      await expect(model).toHaveAttribute('aria-expanded', 'false')
      await expect(canvas.getByRole('button', { name: 'Agent' })).toHaveAttribute('aria-expanded', 'true')
    })
  },
}

/**
 * Closed panels stay in the page, hidden until found: the browser's find (⌘F) reaches their text and opens the section
 * that holds the match. Try it: search this page for "send_email".
 */
export const FindInPage: Story = {
  name: 'Find in page',
  parameters: { controls: { disable: true } },
  play: async ({ canvas, canvasElement, step }) => {
    const tools = canvas.getByRole('button', { name: 'Tools' })
    // Found by its text: a closed trigger doesn't point at its panel (`aria-controls`) until it opens.
    const panel = [...canvasElement.querySelectorAll<HTMLElement>('[hidden]')].find((element) =>
      element.textContent?.includes('send_email'),
    )

    await step('A closed panel keeps its text in the page, hidden until found', async () => {
      await expect(panel).toHaveAttribute('hidden', 'until-found')
      await expect(panel).toHaveTextContent('send_email')
    })

    await step('When the browser finds a match in it, the section opens', async () => {
      // What the browser fires on a hidden-until-found element as find reaches it.
      panel?.dispatchEvent(new Event('beforematch', { bubbles: true }))
      await waitFor(() => expect(tools).toHaveAttribute('aria-expanded', 'true'))
    })
  },
}

/** Heading levels follow the page: `2` where the sections are the page's own, `4` under a panel's `h3`. */
export const HeadingLevel: Story = {
  name: 'Heading level',
  args: { headingLevel: 2 },
  play: async ({ canvas, step }) => {
    await step('Each trigger sits in an h2', async () => {
      await expect(canvas.getAllByRole('heading', { level: 2 })).toHaveLength(3)
    })
  },
}

/**
 * Run #128's settings, in the run's side panel: the agent's name and instructions, the tools it may use, and its
 * model. Fields keep what was typed while their section is shut.
 */
export const RunSettings: Story = {
  name: 'Run settings',
  args: { multiple: true },
  parameters: { controls: { exclude: ['multiple'] } },
  render: (args) => (
    <div className="sb-box-m">
      <Accordion {...args}>
        <Accordion.Item value="agent">
          <Accordion.Trigger icon="agent" description="Name and instructions">
            Agent
          </Accordion.Trigger>
          <Accordion.Panel className="flex flex-col gap-4">
            <TextField label="Name" defaultValue="Research agent" />
            <Textarea
              label="Instructions"
              defaultValue="Compare our five main competitors' pricing for teams of 10 to 50 seats, and email a summary of what changed to the leadership team."
              maxRows={6}
            />
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="tools">
          <Accordion.Trigger icon="tool" description="5 tools, 1 needs approval">
            Tools
          </Accordion.Trigger>
          <Accordion.Panel className="flex flex-col gap-3">
            <Switch defaultChecked>Search the web</Switch>
            <Switch defaultChecked>Read files in the workspace</Switch>
            <Switch defaultChecked>Fetch pages</Switch>
            <Switch>Send email without approval</Switch>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="model">
          <Accordion.Trigger icon="ai" description="Balanced">
            Model
          </Accordion.Trigger>
          <Accordion.Panel>
            <Select label="Model" items={MODELS} defaultValue="balanced" />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('What was typed survives the section closing and opening again', async () => {
      const name = canvas.getByRole('textbox', { name: 'Name' })
      await userEvent.clear(name)
      await userEvent.type(name, 'Pricing agent')
      const agent = canvas.getByRole('button', { name: 'Agent Name and instructions' })
      await userEvent.click(agent)
      await expect(agent).toHaveAttribute('aria-expanded', 'false')
      await userEvent.click(agent)
      await expect(canvas.getByRole('textbox', { name: 'Name' })).toHaveValue('Pricing agent')
    })
  },
}
