import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'

import { BUTTON_SIZES, BUTTON_VARIANTS } from '@/components/button/button.const'
import { ICON_NAMES } from '@/components/icon/icon.const'

import { IconButton } from '.'

const meta = {
  title: 'Elements/Actions/Icon button',
  component: IconButton,
  argTypes: {
    icon: { control: 'select', options: ICON_NAMES },
    variant: { control: 'inline-radio', options: BUTTON_VARIANTS },
    size: { control: 'inline-radio', options: BUTTON_SIZES },
    render: { table: { disable: true } },
    style: { table: { disable: true } },
  },
  args: { icon: 'copy', label: "Copy the run's output", onClick: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "A button with an icon and no visible label, for actions that repeat in toolbars, rows and cards. Everything `Button` does, in a square. Its `label` is required: it's what screen readers announce.",
      },
    },
  },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** Each variant with an action it fits. `ghost` by default; the others for the rare icon button that carries more weight. */
export const Variants: Story = {
  parameters: { controls: { exclude: ['variant', 'icon', 'label'] } },
  render: (args) => (
    <div className="sb-row">
      <IconButton {...args} variant="primary" icon="send" label="Send the prompt" />
      <IconButton {...args} variant="secondary" icon="settings" label="Agent settings" />
      <IconButton {...args} variant="ghost" icon="copy" label="Copy the output" />
      <IconButton {...args} variant="danger" icon="delete" label="Delete the agent" />
    </div>
  ),
}

/** A toolbar of quiet actions on a run, at `s`. Run the pointer along it: each fill fades in and trails off softly. */
export const Toolbar: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-row">
      <IconButton size="s" icon="copy" label="Copy output" />
      <IconButton size="s" icon="retry" label="Run again" />
      <IconButton size="s" icon="edit" label="Edit instructions" />
      <IconButton size="s" icon="more" label="More actions" />
    </div>
  ),
}

/** Its name is its `label`, so a screen reader says what it does, not which icon it shows. */
export const AccessibleName: Story = {
  name: 'Accessible name',
  parameters: { controls: { disable: true } },
  play: async ({ args, canvas, step, userEvent }) => {
    await step('It is found by its label', async () => {
      await userEvent.click(canvas.getByRole('button', { name: "Copy the run's output" }))
      await expect(args.onClick).toHaveBeenCalledOnce()
    })
  },
}
