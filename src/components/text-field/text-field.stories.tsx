import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'

import { TextField } from '.'

const meta = {
  title: 'Elements/Form controls/Text field',
  component: TextField,
  tags: ['beta'],
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    labels: { table: { disable: true } },
  },
  args: {
    label: 'Invite by email',
    description: "They'll get a link to run #128.",
    placeholder: 'name@norte.com',
    type: 'email',
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
          'A single line of text with its label, a description and an error. Optionally an icon at the start and a clear button at the end. The label, the description and the error are tied to the input for screen readers, and the checks the browser runs (`required`, `type="email"`) show their message when they fail. An invalid field turns red and its error rises into place.',
      },
    },
  },
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

/** Type in it, or set an error in the controls: the border turns red and the message rises in under the hint. */
export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** `s` for toolbars and filters, `m` in forms: the same heights as a button. */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => (
    <div className="sb-stack sb-stack--stretch">
      <TextField {...args} size="s" />
      <TextField {...args} size="m" />
    </div>
  ),
}

/** A filter: a search icon at the start, a clear button at the end once there's text, and no label above it. */
export const Filter: Story = {
  args: {
    label: undefined,
    description: undefined,
    type: 'search',
    'aria-label': 'Filter competitors',
    placeholder: 'Filter competitors',
    icon: 'search',
    clearable: true,
    size: 's',
    defaultValue: 'Orbit',
  },
}

/** What's wrong and how to fix it, under the hint. The field is invalid until the app clears the error. */
export const WithAnError: Story = {
  name: 'With an error',
  args: { defaultValue: 'alejandro@norte', error: 'Enter a full email address, like alejandro@norte.com.' },
}

/** A field that can't be edited right now. */
export const Disabled: Story = {
  args: {
    label: 'Agent name',
    description: 'Shown in the sidebar and on every run.',
    type: 'text',
    defaultValue: 'Research agent',
    disabled: true,
  },
}

/** The label names the input, and the hint describes it, for screen readers too. */
export const Labelling: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ canvas, step }) => {
    await step('The input is named by its label and described by its hint', async () => {
      const input = canvas.getByRole('textbox', { name: 'Invite by email' })
      await expect(input).toHaveAccessibleDescription("They'll get a link to run #128.")
    })

    await step('Clicking the label focuses the input', async () => {
      await userEvent.click(canvas.getByText('Invite by email'))
      await expect(canvas.getByRole('textbox')).toHaveFocus()
    })
  },
}

/** Typing reports each change. */
export const Typing: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ args, canvas, step }) => {
    await step('Each keystroke reports the text so far', async () => {
      await userEvent.type(canvas.getByRole('textbox'), 'alejandro@norte.com')
      await expect(args.onValueChange).toHaveBeenLastCalledWith('alejandro@norte.com')
    })
  },
}

/** The browser's own check: leave an incomplete email and its message shows, tied to the input. */
export const BrowserValidation: Story = {
  name: 'Browser validation',
  args: { description: undefined, required: true, validationMode: 'onBlur' },
  parameters: { controls: { disable: true } },
  play: async ({ canvas, step }) => {
    const input = canvas.getByRole('textbox', { name: 'Invite by email' })

    await step('Leaving an incomplete email marks the field invalid and describes why', async () => {
      await userEvent.type(input, 'alejandro@')
      await userEvent.tab()
      await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))
      await expect(input).toHaveAccessibleDescription(/\S/)
    })

    await step('Fixing it clears the error', async () => {
      await userEvent.type(input, 'norte.com')
      await userEvent.tab()
      await waitFor(() => expect(input).not.toHaveAttribute('aria-invalid'))
    })
  },
}

/** The app's error marks the field invalid and joins the hint in its description. */
export const ErrorMessage: Story = {
  name: 'Error message',
  args: { defaultValue: 'alejandro@norte', error: 'Enter a full email address, like alejandro@norte.com.' },
  parameters: { controls: { disable: true } },
  play: async ({ canvas, step }) => {
    await step('The input is invalid and described by the hint and the error', async () => {
      const input = canvas.getByRole('textbox', { name: 'Invite by email' })
      await expect(input).toHaveAttribute('aria-invalid', 'true')
      await expect(input).toHaveAccessibleDescription(
        "They'll get a link to run #128. Enter a full email address, like alejandro@norte.com.",
      )
    })
  },
}

/** The clear button empties the field and hands focus back to it, by pointer or keyboard. */
export const Clearing: Story = {
  args: { ...Filter.args, defaultValue: undefined },
  parameters: { controls: { disable: true } },
  play: async ({ args, canvas, step }) => {
    const input = canvas.getByRole('searchbox', { name: 'Filter competitors' })

    await step('Empty, there is no clear button', async () => {
      await expect(canvas.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument()
    })

    await step('Typing brings it; clicking it empties the field and focuses it', async () => {
      await userEvent.type(input, 'Orbit')
      await userEvent.click(await canvas.findByRole('button', { name: 'Clear' }))
      await expect(input).toHaveValue('')
      await expect(input).toHaveFocus()
      await expect(args.onValueChange).toHaveBeenLastCalledWith('')
    })

    await step('Tab reaches it after the text; Enter clears and returns focus', async () => {
      await userEvent.type(input, 'Tandem')
      await userEvent.tab()
      await expect(canvas.getByRole('button', { name: 'Clear' })).toHaveFocus()
      await userEvent.keyboard('{Enter}')
      await expect(input).toHaveValue('')
      await expect(input).toHaveFocus()
    })
  },
}
