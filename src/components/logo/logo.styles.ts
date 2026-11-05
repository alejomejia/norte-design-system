import { tv } from '@/lib/utils'

import { type LOGO_SIZES, type LOGO_TONES, type LOGO_VARIANTS } from './logo.const'

/**
 * Norte's logo: the needle, then the wordmark, sized by its type token (the wordmark is `0.7388em` tall, its cap height
 * plus the round letters' dip, so it lines up with the needle at every size). The needle's blues are primitives on
 * purpose: a logo's colors are the brand itself, not a role that could be remapped. On a dark background (`inverse`, or
 * the dark tile) the needle takes a step lighter. `animated` swings the needle around its notch until it settles on
 * north, once; never under reduced motion.
 */
export const logoStyles = tv({
  slots: {
    root: 'inline-flex shrink-0 items-center gap-1 align-middle',
    mark: 'shrink-0 overflow-visible',
    needle: 'origin-[50%_62.5%] transform-view',
    shade: '',
    light: '',
    wordmark: 'h-[0.7388em] w-auto shrink-0',
  },
  variants: {
    variant: {
      full: {},
      mark: {},
      tile: { root: 'inline-grid place-items-center' },
    } satisfies Record<(typeof LOGO_VARIANTS)[number], object>,
    size: {
      s: { root: 'text-body-s', mark: 'size-4' },
      m: { root: 'text-heading-s', mark: 'size-6' },
      l: { root: 'text-heading-m', mark: 'size-8' },
    } satisfies Record<(typeof LOGO_SIZES)[number], object>,
    tone: {
      default: { shade: 'fill-blue-800', light: 'fill-blue-600', wordmark: 'fill-ink' },
      inverse: { shade: 'fill-blue-700', light: 'fill-blue-500', wordmark: 'fill-on-inverse' },
    } satisfies Record<(typeof LOGO_TONES)[number], object>,
    animated: {
      true: { needle: 'animate-swing motion-reduce:animate-none' },
    },
  },
  compoundVariants: [
    // A tile stands out from its background: dark on a light page, light on a dark one, with the needle to match.
    { variant: 'tile', tone: 'default', class: { root: 'bg-inverse', shade: 'fill-blue-700', light: 'fill-blue-500' } },
    { variant: 'tile', tone: 'inverse', class: { root: 'bg-surface', shade: 'fill-blue-800', light: 'fill-blue-600' } },
    { variant: 'tile', size: 's', class: { root: 'size-6 rounded-s' } },
    { variant: 'tile', size: 'm', class: { root: 'size-8 rounded-m' } },
    { variant: 'tile', size: 'l', class: { root: 'size-10 rounded-l' } },
  ],
  defaultVariants: { variant: 'full', size: 'm', tone: 'default', animated: false },
})
