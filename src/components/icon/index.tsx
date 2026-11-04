import { type ICON_SIZES, ICON_STROKE_WIDTH, ICONS } from './icon.const'
import { icon } from './icon.styles'

export type IconName = keyof typeof ICONS

export type IconProps = {
  /** Which icon: its name in Norte's set, from the gallery on Foundations/Icons. */
  name: IconName
  /** `s` (16px) next to interface text, `m` (24px) on its own, `l` (32px) in empty states. */
  size?: (typeof ICON_SIZES)[number]
  /**
   * What the icon means, for an icon with nothing written next to it: screen readers announce it as an image with this
   * name. Without it, the icon is decorative and hidden from them.
   */
  label?: string
  className?: string
}

/**
 * One icon of Norte's set, drawn by Lucide as an inline SVG in the color of its text, with the same stroke at every
 * size.
 *
 * @example
 * <Icon name="agent" />
 */
export function Icon({ name, size = 's', label, className }: IconProps) {
  const Svg = ICONS[name]
  return (
    <Svg
      strokeWidth={ICON_STROKE_WIDTH}
      // The size comes from a class, so Lucide's `absoluteStrokeWidth` can't know it: `vector-effect` keeps the stroke
      // in screen pixels instead.
      nonScalingStroke
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className={icon({ size, className })}
    />
  )
}
