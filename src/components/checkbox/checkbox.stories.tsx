import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn } from 'storybook/test'

import { Checkbox } from '.'

const meta = {
  title: 'Elements/Form controls/Checkbox',
  component: Checkbox,
  argTypes: {
    children: { control: 'text' },
    render: { table: { disable: true } },
    style: { table: { disable: true } },
  },
  args: { children: 'Web search', onCheckedChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'Picks an option, or several, that a form saves later. For a setting that applies right away, use a switch.',
      },
    },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** Picked. */
export const Checked: Story = { args: { defaultChecked: true } }

/** Can't be changed. Prefer explaining why. */
export const Disabled: Story = {
  parameters: { controls: { exclude: ['disabled', 'defaultChecked'] } },
  render: (args) => (
    <div className="sb-stack">
      <Checkbox {...args} disabled />
      <Checkbox {...args} disabled defaultChecked />
    </div>
  ),
}

const TOOLS = ['Web search', 'Code interpreter', 'File reader']

/**
 * A box that checks a group: mixed (`indeterminate`) while only some are checked. Its click checks them all, or clears
 * them when they all are.
 */
export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [tools, setTools] = useState<string[]>(['Web search'])
    const all = tools.length === TOOLS.length

    return (
      <div className="sb-stack">
        <Checkbox
          checked={all}
          indeterminate={tools.length > 0 && !all}
          onCheckedChange={() => setTools(all ? [] : TOOLS)}
        >
          All tools
        </Checkbox>
        {TOOLS.map((tool) => (
          <Checkbox
            key={tool}
            checked={tools.includes(tool)}
            onCheckedChange={(checked) => setTools(checked ? [...tools, tool] : tools.filter((name) => name !== tool))}
          >
            {tool}
          </Checkbox>
        ))}
      </div>
    )
  },
  play: async ({ canvas, step, userEvent }) => {
    const all = canvas.getByRole('checkbox', { name: 'All tools' })

    await step('Some checked: the group box is mixed', async () => {
      await expect(all).toHaveAttribute('aria-checked', 'mixed')
    })
    await step('Its click checks them all', async () => {
      await userEvent.click(all)
      for (const tool of TOOLS) await expect(canvas.getByRole('checkbox', { name: tool })).toBeChecked()
    })
  },
}

/** A click on the box or its label checks it. */
export const Checking: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ args, canvas, step, userEvent }) => {
    const box = canvas.getByRole('checkbox', { name: 'Web search' })

    await step('A click on the label checks it', async () => {
      await userEvent.click(canvas.getByText('Web search'))
      await expect(box).toBeChecked()
      await expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.anything())
    })
  },
}
