'use client'

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { type ReactElement, type ReactNode } from 'react'

import { KeyboardKey } from '@/components/keyboard-key'

import { TOOLTIP_DELAY, type TOOLTIP_SIDES, TOOLTIP_WARM_WINDOW } from './tooltip.const'
import { tooltipStyles } from './tooltip.styles'

export type TooltipProps = {
  /** What the trigger does, in a few words. */
  content: ReactNode
  /** A keyboard shortcut for the same action, shown after the words: `['⌘', '↵']`. */
  shortcut?: string[]
  /** The element it describes: a single element that takes a ref, like `IconButton`. */
  children: ReactElement
  /** Where it opens, relative to the trigger. It flips when there's no room. */
  side?: (typeof TOOLTIP_SIDES)[number]
  className?: string
}

/**
 * A short label that appears when a control is hovered or focused, for what an icon alone can't say: "Copy output",
 * with its shortcut. Not for anything people must read to use the page. Inside `TooltipProvider`, tooltips warm up:
 * the first one waits a moment, and its neighbors then open at once. Built on Base UI's Tooltip. Idea from React Bits'
 * Warm Tooltip.
 *
 * @example
 * <Tooltip content="Copy output" shortcut={['⌘', 'C']}>
 *   <IconButton icon="copy" label="Copy output" />
 * </Tooltip>
 */
export function Tooltip({ content, shortcut, children, side = 'top', className }: TooltipProps) {
  const styles = tooltipStyles()
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={8}>
          <BaseTooltip.Popup className={styles.popup({ className })}>
            {content}
            {shortcut && <KeyboardKey keys={shortcut} className={styles.shortcut()} />}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  )
}

export type TooltipProviderProps = {
  children: ReactNode
  /** How long the pointer rests on a trigger before the first tooltip opens, in ms. */
  delay?: number
  /** How long tooltips stay warm after one closes, in ms: a neighbor hovered within it opens at once. */
  warmWindow?: number
}

/** Groups tooltips so they warm up together: wrap the app, or a toolbar, once. */
export function TooltipProvider({
  children,
  delay = TOOLTIP_DELAY,
  warmWindow = TOOLTIP_WARM_WINDOW,
}: TooltipProviderProps) {
  return (
    <BaseTooltip.Provider delay={delay} timeout={warmWindow}>
      {children}
    </BaseTooltip.Provider>
  )
}
