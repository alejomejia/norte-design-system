'use client'

import { type ComponentProps, type ReactNode, useMemo } from 'react'

import { flattenChildren, nameParts } from '@/lib/utils'

import { SUGGESTIONS_LABELS } from './suggestions.const'
import { SuggestionsContext } from './suggestions.hooks'
import { SuggestionsItem } from './suggestions-item'
import { SuggestionsRow } from './suggestions-row'

export type { SuggestionsItemProps } from './suggestions-item'

export type SuggestionsProps = Omit<ComponentProps<'div'>, 'children' | 'className' | 'onSelect'> & {
  /** Called with a chip's prompt when it's picked: put it in the prompt input and focus it there. */
  onSelect: (value: string) => void
  /** Turns every chip off, like while the agent is still writing. */
  disabled?: boolean
  /** The list's name, for screen readers. */
  label?: string
  /** What the chevrons on a row that doesn't fit are called: `start` scrolls back, `end` forward. */
  scrollLabels?: { start: string; end: string }
  /** The `Suggestions.Item`s, in order. With none, nothing renders. */
  children?: ReactNode
  className?: string
}

/**
 * Follow-up prompts under a conversation, as chips that fill the prompt when picked rather than sending it, so the
 * person can still edit it. The chips rise in one after another; a row that doesn't fit scrolls sideways, with fades
 * and chevrons on the sides that hide chips.
 *
 * @example
 * <Suggestions onSelect={(prompt) => { setPrompt(prompt); promptRef.current?.focus() }}>
 *   <Suggestions.Item>Add annual prices</Suggestions.Item>
 *   <Suggestions.Item value="Only include prices for EU customers">Only EU</Suggestions.Item>
 * </Suggestions>
 */
function SuggestionsRoot({
  onSelect,
  disabled = false,
  label = SUGGESTIONS_LABELS.list,
  scrollLabels = { start: SUGGESTIONS_LABELS.scrollStart, end: SUGGESTIONS_LABELS.scrollEnd },
  children,
  className,
  ...props
}: SuggestionsProps) {
  const state = useMemo(() => ({ onSelect, disabled }), [onSelect, disabled])
  const items = flattenChildren(children)
  if (items.length === 0) return null

  return (
    <SuggestionsContext value={state}>
      <SuggestionsRow {...props} label={label} scrollLabels={scrollLabels} className={className}>
        {items}
      </SuggestionsRow>
    </SuggestionsContext>
  )
}

// The root's name too: its function is `SuggestionsRoot`.
SuggestionsRoot.displayName = 'Suggestions'

export const Suggestions = Object.assign(SuggestionsRoot, nameParts('Suggestions', { Item: SuggestionsItem }))
