import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { Topography } from '.'
import { TOPOGRAPHY_TONES } from './topography.const'

const meta = {
  title: 'Elements/Media/Topography',
  component: Topography,
  argTypes: {
    tone: { control: 'inline-radio', options: TOPOGRAPHY_TONES },
    speed: { control: { type: 'range', min: 0, max: 2, step: 0.1 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A live topographic map drifting north, Norte's name drawn as terrain: a cover behind a page's title, or a texture behind a panel. It draws only while it's on screen, and holds one still map under reduced motion. It fills its nearest positioned parent, so give that parent `relative isolate`.",
      },
    },
  },
} satisfies Meta<typeof Topography>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  render: (args) => (
    <header className="relative isolate flex h-80 flex-col justify-end gap-2 overflow-hidden rounded-xl p-8">
      <Topography {...args} />
      <p className="text-caption font-medium text-on-inverse/70">Workspace</p>
      <h2 className="text-heading-l font-semibold text-on-inverse">Runs</h2>
    </header>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    await step('Screen readers skip the map and read what sits on it', async () => {
      const map = canvasElement.querySelector('canvas')
      await expect(map?.closest('[aria-hidden="true"]')).not.toBeNull()
      await expect(canvas.getByRole('heading', { name: 'Runs' })).toBeVisible()
    })
    await step('It fills its parent, behind the content', async () => {
      const layer = canvasElement.querySelector('canvas')?.parentElement
      const parent = layer?.parentElement
      await expect(layer?.getBoundingClientRect().height).toBe(parent?.getBoundingClientRect().height)
      await expect(getComputedStyle(layer as Element).zIndex).toBe('-10')
    })
  },
}

/** Its lines alone, in the accent color, at a fifth: a texture behind a panel on a light surface, like Sign in's. */
export const Light: Story = {
  args: { tone: 'light', speed: 0.4, className: 'opacity-20' },
  parameters: { controls: { exclude: ['tone'] } },
  render: (args) => (
    <section className="relative isolate flex h-80 flex-col justify-end gap-2 overflow-hidden rounded-xl bg-surface-muted p-8">
      <Topography {...args} />
      <h2 className="text-heading-m font-semibold text-ink">Every run, reviewed</h2>
      <p className="max-w-120 text-body-s text-ink-muted">
        Agents do the work, and your team signs off before it ships.
      </p>
    </section>
  ),
}
