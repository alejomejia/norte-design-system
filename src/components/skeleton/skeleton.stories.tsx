import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'

import { Button } from '@/components/button'

import { Skeleton, type SkeletonProps } from '.'
import { SKELETON_CIRCLE_SIZES, SKELETON_TEXT_SIZES } from './skeleton.const'

/**
 * A result of the run while it loads: who found it, a few lines about it, and a chart. A function the stories call, not
 * a component, so the code panel shows the Skeleton markup rather than this helper's name.
 */
function resultPlaceholder(props: Omit<SkeletonProps, 'children'>) {
  return (
    <Skeleton {...props} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton.Circle />
        <div className="flex flex-1 flex-col">
          <Skeleton.Text className="w-1/3" />
          <Skeleton.Text size="caption" className="w-1/4" />
        </div>
      </div>
      <Skeleton.Text lines={3} />
      <Skeleton.Box className="h-32" />
    </Skeleton>
  )
}

/** The class of each type size, to set real text next to its placeholder. */
const TEXT_CLASSES = {
  caption: 'text-caption',
  'body-s': 'text-body-s',
  body: 'text-body',
  'heading-s': 'text-heading-s',
  'heading-m': 'text-heading-m',
} as const satisfies Record<(typeof SKELETON_TEXT_SIZES)[number], string>

const meta = {
  title: 'Elements/Indicators/Skeleton',
  component: Skeleton,
  tags: ['beta'],
  argTypes: {
    label: { control: 'text' },
    children: { table: { disable: true } },
  },
  args: { children: null },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "Placeholder shapes for content that's still loading, laid out like what they stand for, so nothing jumps when it arrives. Screen readers hear its label once; inside something that already says it's busy, make it `decorative`.",
      },
    },
  },
  render: (args) => <div className="sb-panel">{resultPlaceholder(args)}</div>,
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** Its three shapes: lines of text, a block (an image, a chart) and a circle (an avatar). */
export const Shapes: Story = {
  parameters: { controls: { exclude: ['immediate'] } },
  render: (args) => (
    <div className="sb-panel">
      <Skeleton {...args} className="flex items-center gap-6">
        <Skeleton.Text lines={2} className="flex-1" />
        <Skeleton.Box className="h-16 w-24" />
        <Skeleton.Circle size="l" />
      </Skeleton>
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('Screen readers hear the skeleton once, and none of its shapes', async () => {
      const skeleton = canvas.getByRole('progressbar', { name: 'Loading' })
      for (const shape of skeleton.children) await expect(shape).toHaveAttribute('aria-hidden', 'true')
    })
  },
}

/**
 * A line for each type size, next to the text it stands for: as tall as its line height, so nothing moves when the
 * text arrives.
 */
export const TextSizes: Story = {
  name: 'Text sizes',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-stack sb-stack--stretch sb-box-l">
      {SKELETON_TEXT_SIZES.map((size) => (
        <div key={size} className="grid grid-cols-2 items-start gap-6">
          <Skeleton label={`Loading ${size} text`}>
            <Skeleton.Text size={size} />
          </Skeleton>
          <p data-size={size} className={TEXT_CLASSES[size]}>
            Fieldnote
          </p>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('Each line is as tall as the text it stands for', async () => {
      for (const size of SKELETON_TEXT_SIZES) {
        const skeleton = canvas.getByRole('progressbar', { name: `Loading ${size} text` })
        const text = canvas.getByText('Fieldnote', { selector: `[data-size="${size}"]` })
        await expect(skeleton.getBoundingClientRect().height).toBe(text.getBoundingClientRect().height)
      }
    })
  },
}

/** A paragraph: every line full width but the last, which ends short. */
export const Paragraph: Story = {
  parameters: { controls: { exclude: ['immediate'] } },
  render: (args) => (
    <div className="sb-panel">
      <Skeleton {...args}>
        <Skeleton.Text lines={4} size="body" />
      </Skeleton>
    </div>
  ),
}

/** Avatar's sizes, so a circle can stand in for one. */
export const CircleSizes: Story = {
  name: 'Circle sizes',
  parameters: { controls: { disable: true } },
  render: () => (
    <Skeleton className="sb-row">
      {SKELETON_CIRCLE_SIZES.map((size) => (
        <Skeleton.Circle key={size} size={size} />
      ))}
    </Skeleton>
  ),
}

/** Screen readers hear "Loading", or what you name: say what's loading when you can. */
export const WithALabel: Story = {
  name: 'With a label',
  args: { label: 'Loading results' },
  play: async ({ canvas, step }) => {
    await step('It is announced by its label', async () => {
      await expect(canvas.getByRole('progressbar', { name: 'Loading results' })).toBeInTheDocument()
    })
  },
}

/** When what's around it already says it's busy, like a table with `aria-busy`, screen readers skip it. */
export const Decorative: Story = {
  args: { decorative: true },
  play: async ({ canvas, step }) => {
    await step('Screen readers skip it', async () => {
      await expect(canvas.queryByRole('progressbar')).not.toBeInTheDocument()
    })
  },
}

/**
 * It waits a moment before fading in, so a quick load never flashes it; its space is held all along. `immediate` shows
 * it at once. Press the button to show it again.
 */
export const Appearing: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [run, setRun] = useState(0)
    return (
      <div className="sb-stack sb-stack--stretch">
        <Button variant="secondary" onClick={() => setRun((count) => count + 1)} className="self-start">
          Show again
        </Button>
        <div className="sb-row items-start">
          {/* The key remounts them on each press, so they appear again. */}
          <div key={`waiting-${run}`} className="sb-panel sb-box-m">
            {resultPlaceholder({ label: 'Loading after a moment' })}
          </div>
          <div key={`immediate-${run}`} className="sb-panel sb-box-m">
            {resultPlaceholder({ label: 'Loading at once', immediate: true })}
          </div>
        </div>
      </div>
    )
  },
  play: async ({ canvas, step }) => {
    await step('It fades in after a moment, unless it is immediate', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Show again' }))
      const waiting = canvas.getByRole('progressbar', { name: 'Loading after a moment' })
      await expect(Number(getComputedStyle(waiting).opacity)).toBeLessThan(1)
      await expect(getComputedStyle(canvas.getByRole('progressbar', { name: 'Loading at once' })).opacity).toBe('1')
      await waitFor(() => expect(getComputedStyle(waiting).opacity).toBe('1'))
    })
  },
}

/** Where it shows up: the Results tab's table while it loads, and the run's stats. */
export const InContext: Story = {
  name: 'In context',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-stack sb-stack--stretch sb-box-l">
      <div className="sb-panel">
        <Skeleton label="Loading stats" className="grid grid-cols-4 gap-4">
          {['duration', 'tokens', 'cost', 'tool-calls'].map((stat) => (
            <div key={stat} className="flex flex-col gap-1">
              <Skeleton.Text size="caption" className="w-2/3" />
              <Skeleton.Text size="heading-m" className="w-3/4" />
            </div>
          ))}
        </Skeleton>
      </div>
      <div className="sb-panel">
        <Skeleton label="Loading results" className="flex flex-col divide-y divide-line">
          {['fieldnote', 'brightloop', 'tandem', 'orbit', 'kitewise'].map((row) => (
            <div key={row} className="flex items-center gap-4 py-3">
              <Skeleton.Box className="size-4 rounded-s" />
              <Skeleton.Text className="w-1/3" />
              <Skeleton.Text className="ml-auto w-16" />
              <Skeleton.Text className="w-12" />
            </div>
          ))}
        </Skeleton>
      </div>
    </div>
  ),
}
