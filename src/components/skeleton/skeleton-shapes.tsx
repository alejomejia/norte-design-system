import { type SKELETON_CIRCLE_SIZES, type SKELETON_TEXT_SIZES } from './skeleton.const'
import { skeletonStyles } from './skeleton.styles'

export type SkeletonTextProps = {
  /** How many lines it stands for. The last of several is shorter, like the end of a paragraph. */
  lines?: number
  /** The type size of the text it stands for: each line takes its line height, so nothing moves when the text arrives. */
  size?: (typeof SKELETON_TEXT_SIZES)[number]
  className?: string
}

/** Lines of text still loading. */
export function SkeletonText({ lines = 1, size = 'body-s', className }: SkeletonTextProps) {
  const styles = skeletonStyles({ textSize: size })
  return (
    <div aria-hidden="true" className={styles.text({ className })}>
      {/* The lines never reorder, so their number is their identity. */}
      {Array.from({ length: lines }, (_, line) => line).map((line) => (
        <div key={line} className={styles.line()} />
      ))}
    </div>
  )
}

export type SkeletonBoxProps = {
  /** Its size: full width and 96px tall unless you set it, like `h-40` or `aspect-video`. */
  className?: string
}

/** A block still loading: an image, a chart, a panel. */
export function SkeletonBox({ className }: SkeletonBoxProps) {
  return <div aria-hidden="true" className={skeletonStyles().box({ className })} />
}

export type SkeletonCircleProps = {
  /** Avatar's sizes, so it can stand in for one: `s` (24px), `m` (32px) or `l` (40px). */
  size?: (typeof SKELETON_CIRCLE_SIZES)[number]
  className?: string
}

/** A round thing still loading, like an avatar. */
export function SkeletonCircle({ size = 'm', className }: SkeletonCircleProps) {
  return <div aria-hidden="true" className={skeletonStyles({ size }).circle({ className })} />
}
