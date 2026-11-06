'use client'

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { type ReactElement, type ReactNode } from 'react'

import { KeyboardKey } from '@/components/keyboard-key'

import { type TOOLTIP_ALIGNS, TOOLTIP_DELAY, type TOOLTIP_SIDES, TOOLTIP_WARM_WINDOW } from './tooltip.const'
import { tooltipStyles } from './tooltip.styles'

export type TooltipProps = {
  /** What the trigger does, in a few words. */
  content: ReactNode
  /** A keyboard shortcut for the same action, shown after the words: `['⌘', '↵']`. */
  shortcut?: string[]
  /**
   * The element it describes: a single element that takes a ref, like `IconButton`. A disabled button needs
   * `focusableWhenDisabled`, or it gets no hover or focus and the tooltip never opens.
   */
  children: ReactElement
  /** Where it opens, relative to the trigger. It flips when there's no room. */
  side?: (typeof TOOLTIP_SIDES)[number]
  /** How it lines up with the trigger along that side: `start`, `center` or `end`. It shifts to stay on screen. */
  align?: (typeof TOOLTIP_ALIGNS)[number]
  /** How long the pointer rests on the trigger before it opens, in ms. Focus opens it at once. */
  delay?: number
  /** Keeps it closed, for when it would only repeat what's on screen: a label's full text while it isn't truncated. */
  disabled?: boolean
  className?: string
}

/**
 * A short label that appears when a control is hovered or focused, for what an icon alone can't say: "Copy output",
 * with its shortcut. Not for anything people must read to use the page. It opens once the pointer rests on its
 * trigger for a moment (`delay`). Inside `TooltipProvider`, tooltips warm up: after the first, its neighbors open at
 * once. Built on Base UI's Tooltip. Idea from React Bits'
 * Warm Tooltip.
 *
 * @example
 * <Tooltip content="Copy output" shortcut={['⌘', 'C']}>
 *   <IconButton icon="copy" label="Copy output" />
 * </Tooltip>
 */
export function Tooltip({
  content,
  shortcut,
  children,
  side = 'top',
  align = 'center',
  delay = TOOLTIP_DELAY,
  disabled,
  className,
}: TooltipProps) {
  const styles = tooltipStyles()
  return (
    <BaseTooltip.Root disabled={disabled}>
      {/* The delay is set here, not only on the provider, so a tooltip outside one opens as quickly. */}
      <BaseTooltip.Trigger render={children} delay={delay} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} align={align} sideOffset={8} className={styles.positioner()}>
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
  /** How long tooltips stay warm after one closes, in ms: a neighbor hovered within it opens at once. */
  warmWindow?: number
}

/** Groups tooltips so they warm up together: wrap the app, or a toolbar, once. */
export function TooltipProvider({ children, warmWindow = TOOLTIP_WARM_WINDOW }: TooltipProviderProps) {
  return <BaseTooltip.Provider timeout={warmWindow}>{children}</BaseTooltip.Provider>
}
