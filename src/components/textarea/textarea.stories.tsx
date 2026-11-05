import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'

import { Textarea } from '.'

const INSTRUCTIONS =
  "Cite every price you report with its source. Prefer annual pricing for teams of 10 to 50 seats. If a pricing page won't load, use its archived version and say so in the summary."

const meta = {
  title: 'Elements/Form controls/Textarea',
  component: Textarea,
  tags: ['beta'],
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    minRows: { control: { type: 'range', min: 1, max: 8 } },
    maxRows: { control: { type: 'range', min: 2, max: 16 } },
    maxLength: { control: { type: 'range', min: 50, max: 2000 } },
    labels: { table: { disable: true } },
  },
  args: {
    label: 'Instructions',
    description: "What the agent should always do on this team's runs.",
    placeholder: 'Cite your sources, prefer annual prices…',
    onValueChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="sb-box-m">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Several lines of text with a label, a description and an error, the same field as Text field. It grows with its text up to `maxRows`, then scrolls, and can count characters against `maxLength`, telling screen readers only when the limit is near.',
      },
    },
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

/** Write a few lines: it grows with them, up to eight, then scrolls. */
export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** With instructions already written. */
export const WithAValue: Story = { name: 'With a value', args: { defaultValue: INSTRUCTIONS } }

/** A count at the end of the hint's row, against `maxLength`. */
export const WithACount: Story = {
  name: 'With a count',
  args: { defaultValue: INSTRUCTIONS, maxLength: 500, showCount: true },
}

/** At the limit, the count turns red and the field takes no more. */
export const AtTheLimit: Story = {
  name: 'At the limit',
  args: { defaultValue: INSTRUCTIONS, maxLength: INSTRUCTIONS.length, showCount: true },
}

/** What's wrong and how to fix it, under the hint. */
export const WithAnError: Story = {
  name: 'With an error',
  args: { defaultValue: 'Be nice.', error: 'Say what the agent should do, in a sentence or two at least.' },
}

/** A field that can't be edited right now. */
export const Disabled: Story = { args: { defaultValue: INSTRUCTIONS, disabled: true } }

/** No box, reading-size text: for a surface that draws its own, like Prompt input's card. */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    label: undefined,
    description: undefined,
    'aria-label': 'Prompt',
    placeholder: 'Ask the agent to do something…',
    minRows: 2,
  },
  render: (args) => (
    <div className="sb-panel">
      <Textarea {...args} />
    </div>
  ),
}

/** The label names it, and the hint describes it, for screen readers too. */
export const Labelling: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ canvas, step }) => {
    await step('The textarea is named by its label and described by its hint', async () => {
      const textarea = canvas.getByRole('textbox', { name: 'Instructions' })
      await expect(textarea.tagName).toBe('TEXTAREA')
      await expect(textarea).toHaveAccessibleDescription("What the agent should always do on this team's runs.")
    })
  },
}

/** It grows with each line, then stops at `maxRows` and scrolls. */
export const Growing: Story = {
  args: { minRows: 2, maxRows: 4 },
  parameters: { controls: { disable: true } },
  play: async ({ args, canvas, step }) => {
    const textarea = canvas.getByRole('textbox')
    const start = textarea.getBoundingClientRect().height

    await step('A third line makes it taller', async () => {
      await userEvent.type(textarea, 'Fieldnote{Enter}Brightloop{Enter}Tandem')
      await expect(textarea.getBoundingClientRect().height).toBeGreaterThan(start)
      await expect(args.onValueChange).toHaveBeenLastCalledWith('Fieldnote\nBrightloop\nTandem')
    })

    await step('Past four lines it stops growing and scrolls', async () => {
      await userEvent.type(textarea, '{Enter}Orbit')
      const atMax = textarea.getBoundingClientRect().height
      await userEvent.type(textarea, '{Enter}Kitewise')
      await expect(textarea.getBoundingClientRect().height).toBe(atMax)
      await expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight)
    })
  },
}

/** Screen readers hear how many characters are left only once the limit is near; at it, a refused keystroke nudges the count. */
export const CountAnnouncement: Story = {
  name: 'Count announcement',
  args: { maxLength: 30, showCount: true, description: undefined },
  parameters: { controls: { disable: true } },
  play: async ({ canvas, step }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Instructions' })
    const status = canvas.getByRole('status')

    await step('Far from the limit, nothing is announced', async () => {
      await userEvent.type(textarea, 'Cite')
      await expect(status).toHaveTextContent('')
      await expect(canvas.getByText('4 / 30')).toBeVisible()
    })

    await step('Near it, the characters left are announced', async () => {
      await userEvent.type(textarea, ' every price')
      await waitFor(() => expect(status).toHaveTextContent('14 characters left'))
    })

    await step('At it, the field takes no more', async () => {
      await userEvent.type(textarea, ' with its source, always')
      await expect(textarea).toHaveValue('Cite every price with its sour')
      await expect(status).toHaveTextContent('0 characters left')
    })

    await step('A refused keystroke nudges the count', async () => {
      await userEvent.type(textarea, 'c')
      await expect(canvas.getByText('30 / 30').getAnimations()).not.toHaveLength(0)
    })
  },
}

/** The app's error marks it invalid and joins the hint in its description. */
export const ErrorMessage: Story = {
  name: 'Error message',
  args: { ...WithAnError.args },
  parameters: { controls: { disable: true } },
  play: async ({ canvas, step }) => {
    await step('The textarea is invalid and described by the hint and the error', async () => {
      const textarea = canvas.getByRole('textbox', { name: 'Instructions' })
      await expect(textarea).toHaveAttribute('aria-invalid', 'true')
      await expect(textarea).toHaveAccessibleDescription(
        "What the agent should always do on this team's runs. Say what the agent should do, in a sentence or two at least.",
      )
    })
  },
}
