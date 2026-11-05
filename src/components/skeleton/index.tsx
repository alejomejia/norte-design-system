'use client'

import { type ReactNode, useRef } from 'react'

import { useInViewport } from '@/lib/hooks'

import { SKELETON_LABEL } from './skeleton.const'
import { skeletonStyles } from './skeleton.styles'
import { SkeletonBox, SkeletonCircle, SkeletonText } from './skeleton-shapes'

export type { SkeletonBoxProps, SkeletonCircleProps, SkeletonTextProps } from './skeleton-shapes'

export type SkeletonProps = {
  /** What screen readers hear: say what's loading when you can, like "Loading results". */
  label?: string
  /**
   * Hides it from screen readers, when what's around it already says it's busy: a table with `aria-busy`, a busy panel.
   */
  decorative?: boolean
  /** Shows it at once. By default it fades in after a short wait, so a quick load never flashes it. */
  immediate?: boolean
  /** The shapes (`Skeleton.Text`, `Skeleton.Box`, `Skeleton.Circle`), laid out like the content they stand for. */
  children: ReactNode
  /** Its layout, like `flex items-center gap-3`: it has none of its own. */
  className?: string
}

/**
 * Content that's still loading, drawn as quiet shapes in its place that breathe, so the page keeps its layout and
 * nothing jumps when it arrives. Screen readers hear its label once, not every shape.
 *
 * @example
 * <Skeleton label="Loading results" className="flex items-center gap-3">
 *   <Skeleton.Circle />
 *   <Skeleton.Text lines={2} className="flex-1" />
 * </Skeleton>
 */
function SkeletonRoot({
  label = SKELETON_LABEL,
  decorative = false,
  immediate = false,
  children,
  className,
}: SkeletonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInViewport(ref)
  return (
    <div
      ref={ref}
      {...(decorative
        ? { 'aria-hidden': true }
        : // A progressbar with no value, like Spinner: one that can't tell how far along it is.
          { role: 'progressbar', 'aria-label': label })}
      data-paused={!visible || undefined}
      className={skeletonStyles({ immediate }).root({ className })}
    >
      {children}
    </div>
  )
}

export const Skeleton = Object.assign(SkeletonRoot, {
  Text: SkeletonText,
  Box: SkeletonBox,
  Circle: SkeletonCircle,
})
