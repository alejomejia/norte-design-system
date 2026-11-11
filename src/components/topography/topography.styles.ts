import { tv } from '@/lib/utils'

import { type TOPOGRAPHY_TONES } from './topography.const'

/**
 * A layer that fills its nearest positioned parent, behind that parent's content (`-z-10`, so the parent needs
 * `isolate`), and never takes a click. The dark tone sits on a blue glow from the top right, which also stays where
 * WebGL isn't there; the light tone is the lines alone, on nothing. The canvas fades in on its first frame instead of
 * flashing in over the glow. The glow's blue is a primitive on purpose, like the logo's: it's the brand, not a role.
 */
export const topographyStyles = tv({
  slots: {
    root: 'pointer-events-none absolute inset-0 -z-10',
    canvas: 'size-full opacity-0 transition-opacity duration-(--duration-slower) data-ready:opacity-100',
  },
  variants: {
    tone: {
      dark: { root: 'bg-[radial-gradient(60%_90%_at_90%_0%,oklch(0.546_0.245_262/30%),transparent)]' },
      light: {},
    } satisfies Record<(typeof TOPOGRAPHY_TONES)[number], object>,
  },
  defaultVariants: { tone: 'dark' },
})
