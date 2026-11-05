import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Select } from '.'

const MODELS = [
  { value: 'fast', label: 'Fast: quick answers, lower cost' },
  { value: 'balanced', label: 'Balanced: the default for most agents' },
  { value: 'deep', label: 'Deep: long reasoning, slower' },
  { value: 'vision', label: 'Vision: reads screenshots and PDFs' },
]

const meta = {
  title: 'Elements/Form controls/Select',
  component: Select,
  tags: ['beta'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    items: { table: { disable: true } },
  },
  args: { label: 'Model', placeholder: 'Pick a model', items: MODELS, onValueChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "Picks one option from a short list. The list grows out of the trigger, and its highlight glides from row to row as the pointer or the arrow keys move. Idea from React Bits' Glide Select.",
      },
    },
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

/** Open it and move through the rows, with the pointer or the arrow keys: the highlight glides between them. */
export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** With a value already picked. */
export const WithAValue: Story = { name: 'With a value', args: { defaultValue: 'balanced' } }

/** An option that can't be picked right now stays in the list, dimmed. */
export const DisabledOption: Story = {
  name: 'Disabled option',
  args: { items: MODELS.map((model) => ({ ...model, disabled: model.value === 'vision' })) },
}

/** Without a label above it, it needs an `aria-label`: in a toolbar, the context says what it picks. */
export const WithoutALabel: Story = { name: 'Without a label', args: { label: undefined, 'aria-label': 'Model' } }

/** In a toolbar: borderless, as wide as its value. */
export const Ghost: Story = {
  args: { variant: 'ghost', label: undefined, 'aria-label': 'Model', defaultValue: 'balanced' },
}

/** The keyboard picks too: open, arrow down, Enter. */
export const Keyboard: Story = {
  play: async ({ args, canvas, canvasElement, step }) => {
    const trigger = canvas.getByRole('combobox', { name: 'Model' })

    await step('Enter opens it, the arrows move, Enter picks', async () => {
      trigger.focus()
      await userEvent.keyboard('{Enter}')
      const page = within(canvasElement.ownerDocument.body)
      await waitFor(() => expect(page.getByRole('listbox')).toBeVisible())
      await userEvent.keyboard('{ArrowDown}{Enter}')
      await waitFor(() => expect(args.onValueChange).toHaveBeenCalled())
    })
  },
}
