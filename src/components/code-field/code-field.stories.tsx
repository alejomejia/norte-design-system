import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent } from 'storybook/test'

import { CodeField } from '.'

const meta = {
  title: 'Elements/Form controls/Code field',
  component: CodeField,
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
    length: { control: { type: 'range', min: 4, max: 8 } },
    groupSize: { control: { type: 'range', min: 2, max: 4 } },
  },
  args: {
    label: 'Verification code',
    description: 'We sent it to sofia@norte.com.',
    onValueChange: fn(),
    onValueComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "A one-time code, one slot per character. Typing moves to the next slot, paste fills them all, and phones offer the code from a text message. A wrong code shakes the slots once and shows its error, like a text field. Built on Base UI's OTP Field. Idea from React Bits' Code Slots.",
      },
    },
  },
} satisfies Meta<typeof CodeField>

export default meta
type Story = StoryObj<typeof meta>

/** Type a code, or paste one: each character drops into its slot. Set an error in the controls to see a wrong code. */
export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** Four digits, in one group. */
export const Short: Story = { args: { length: 4, groupSize: 4, label: 'PIN', description: undefined } }

/** A code that didn't match: red slots, one shake, and what to do next under the hint. */
export const WithAnError: Story = {
  name: 'With an error',
  args: { defaultValue: '128400', error: "That code doesn't match. Check the latest email, or send a new one." },
}

/** Locked while something else happens, like a code being checked. */
export const Disabled: Story = { args: { defaultValue: '128406', disabled: true } }

/** In a 272px column, a 320px phone's width less the page's padding, the slots narrow to fit instead of overflowing. */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="w-68">
      <CodeField {...args} />
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('The six slots fit the column', async () => {
      const slots = canvas.getAllByRole('textbox')
      const column = slots[0]?.closest('.w-68') as HTMLElement
      const last = slots.at(-1) as HTMLElement
      await expect(last.getBoundingClientRect().right).toBeLessThanOrEqual(column.getBoundingClientRect().right)
    })
  },
}

/** Typing fills the slots in order and reports the code once it's complete. */
export const Typing: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ args, canvas, step }) => {
    await step('The slots are named by the label and described by the hint', async () => {
      const first = canvas.getAllByRole('textbox')[0] as HTMLElement
      await expect(first).toHaveAccessibleName(/^Verification code/)
      await expect(canvas.getByRole('group', { name: 'Verification code' })).toHaveAccessibleDescription(
        'We sent it to sofia@norte.com.',
      )
    })

    await step('Six digits fill the six slots and complete the code', async () => {
      await userEvent.click(canvas.getAllByRole('textbox')[0] as HTMLElement)
      await userEvent.keyboard('128406')
      await expect(args.onValueComplete).toHaveBeenCalledWith('128406', expect.anything())
    })
  },
}

/** The app's error marks every slot invalid and joins the hint in the code's description. */
export const ErrorMessage: Story = {
  name: 'Error message',
  args: { defaultValue: '128400', error: "That code doesn't match." },
  parameters: { controls: { disable: true } },
  play: async ({ canvas, step }) => {
    await step('Every slot is invalid, with a red border', async () => {
      const slots = canvas.getAllByRole('textbox')
      for (const slot of slots) await expect(slot).toHaveAttribute('aria-invalid', 'true')
      // The error's text is drawn in the danger color: the border matches it.
      const danger = getComputedStyle(canvas.getByText("That code doesn't match.")).color
      await expect(getComputedStyle(slots[0] as HTMLElement).borderTopColor).toBe(danger)
    })

    await step('The error joins the hint in the description', async () => {
      await expect(canvas.getByRole('group', { name: 'Verification code' })).toHaveAccessibleDescription(
        "We sent it to sofia@norte.com. That code doesn't match.",
      )
    })
  },
}
