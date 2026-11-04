import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'

import { Switch } from '.'

const meta = {
  title: 'Elements/Form controls/Switch',
  component: Switch,
  tags: ['beta'],
  argTypes: {
    children: { control: 'text' },
    // Base UI's escape hatches, and the props a form sets.
    render: { table: { disable: true } },
    style: { table: { disable: true } },
  },
  args: { children: 'Approve tool calls automatically', onCheckedChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "Turns a setting on or off, right away. For a choice a form saves later, use a checkbox. The thumb springs across, and stretches toward where it's going while pressed.",
      },
    },
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** On: the track fills with the accent. */
export const Checked: Story = { args: { defaultChecked: true } }

/** Can't be changed, on or off. Prefer explaining why. */
export const Disabled: Story = {
  parameters: { controls: { exclude: ['disabled', 'defaultChecked'] } },
  render: (args) => (
    <div className="sb-stack">
      <Switch {...args} disabled />
      <Switch {...args} disabled defaultChecked />
    </div>
  ),
}

/** Without a label next to it, a switch needs an `aria-label`: in a table row, the row says what it controls. */
export const WithoutALabel: Story = {
  name: 'Without a label',
  args: { children: undefined, 'aria-label': 'Research agent' },
}

/** A click or the space bar toggles it, and it says so to screen readers. */
export const Toggling: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ args, canvas, step, userEvent }) => {
    const control = canvas.getByRole('switch', { name: 'Approve tool calls automatically' })

    await step('A click on the label turns it on', async () => {
      await userEvent.click(canvas.getByText('Approve tool calls automatically'))
      await expect(control).toBeChecked()
      await expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.anything())
    })
    await step('The space bar turns it off', async () => {
      control.focus()
      await userEvent.keyboard(' ')
      await expect(control).not.toBeChecked()
    })
  },
}
