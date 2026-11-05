import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'

import { Button } from '@/components/button'

import { Logo } from '.'
import { LOGO_SIZES, LOGO_TONES, LOGO_VARIANTS } from './logo.const'

const meta = {
  title: 'Elements/Media/Logo',
  component: Logo,
  tags: ['beta'],
  argTypes: {
    variant: { control: 'inline-radio', options: LOGO_VARIANTS },
    size: { control: 'inline-radio', options: LOGO_SIZES },
    tone: { control: 'inline-radio', options: LOGO_TONES },
    label: { control: 'text' },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Norte\'s logo: a needle pointing north, split down its middle with the left half a step darker, and the wordmark. Both are SVG, the wordmark outlined from Inter, so it looks the same whatever font the app loads. It comes whole, as the mark alone, or as a tile like an app\'s icon, in three sizes, for light backgrounds or dark ones. `animated` swings the needle until it settles on north, once, as it appears. Screen readers hear one image, "Norte".',
      },
    },
  },
} satisfies Meta<typeof Logo>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ canvas, step }) => {
    await step('Screen readers hear one image, named Norte', async () => {
      await expect(canvas.getByRole('img', { name: 'Norte' })).toBeInTheDocument()
    })
  },
}

/** Whole, the mark alone where space is short, and on a tile, like an app's icon. */
export const Variants: Story = {
  parameters: { controls: { exclude: ['variant'] } },
  render: (args) => (
    <div className="sb-row">
      {LOGO_VARIANTS.map((variant) => (
        <Logo key={variant} {...args} variant={variant} />
      ))}
    </div>
  ),
}

/** The needle at Icon's sizes, 16, 24 and 32px, with the wordmark set to match. */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => (
    <div className="sb-stack">
      {LOGO_SIZES.map((size) => (
        <Logo key={size} {...args} size={size} />
      ))}
    </div>
  ),
}

/** On a dark background, `inverse`: a white wordmark, and the needle a step lighter. */
export const Inverse: Story = {
  args: { tone: 'inverse' },
  parameters: { controls: { exclude: ['tone'] } },
  render: (args) => (
    <div className="sb-surface-inverse sb-row">
      {LOGO_VARIANTS.map((variant) => (
        <Logo key={variant} {...args} variant={variant} />
      ))}
    </div>
  ),
}

/** A tile stands out from what's behind it: dark on a light background, light on a dark one. */
export const Tiles: Story = {
  args: { variant: 'tile' },
  parameters: { controls: { exclude: ['variant', 'size', 'tone'] } },
  render: (args) => (
    <div className="sb-row">
      <div className="sb-row">
        {LOGO_SIZES.map((size) => (
          <Logo key={size} {...args} size={size} />
        ))}
      </div>
      <div className="sb-surface-inverse sb-row">
        {LOGO_SIZES.map((size) => (
          <Logo key={size} {...args} size={size} tone="inverse" />
        ))}
      </div>
    </div>
  ),
}

/**
 * `animated`: as it appears, the needle swings past north, back, and settles, each swing smaller, like a compass. Once,
 * and never under reduced motion. Press the button to replay it.
 */
export const Settling: Story = {
  args: { animated: true, size: 'l' },
  parameters: { controls: { exclude: ['animated'] } },
  render: function Render(args) {
    const [run, setRun] = useState(0)
    return (
      <div className="sb-stack items-center">
        <Logo key={run} {...args} />
        <Button variant="secondary" onClick={() => setRun((count) => count + 1)}>
          Replay
        </Button>
      </div>
    )
  },
  play: async ({ canvas, step }) => {
    await step('The needle swings, then settles on north', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Replay' }))
      const needle = canvas.getByRole('img', { name: 'Norte' }).querySelector('g') as SVGGElement
      await expect(needle.getAnimations()).toHaveLength(1)
      await waitFor(() => expect(needle.getAnimations()).toHaveLength(0), { timeout: 3000 })
      await expect(getComputedStyle(needle).rotate).toBe('none')
    })
  },
}

/** Where it shows up: the top of the sidebar, as a link home, and the sign-in screen. */
export const InContext: Story = {
  name: 'In context',
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="sb-row items-start">
      <div className="sb-panel sb-box-s">
        {/* The link takes its name from the logo: "Norte". */}
        <a href="#home" className="inline-flex rounded-s focus-visible:outline-2 focus-visible:outline-focus">
          <Logo />
        </a>
      </div>
      <div className="sb-panel sb-box-m">
        <div className="flex flex-col items-center gap-4">
          <Logo variant="tile" size="l" animated />
          <p className="text-heading-s font-medium text-ink">Sign in to Norte</p>
        </div>
      </div>
    </div>
  ),
}
