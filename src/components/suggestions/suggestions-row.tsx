'use client'

import { type ComponentProps, type ReactElement, useRef } from 'react'

import { IconButton } from '@/components/icon-button'
import { useScrollEdges } from '@/lib/hooks'
import { scrollByPage, toCSSVars } from '@/lib/utils'

import { SUGGESTIONS_STAGGER } from './suggestions.const'
import { suggestionsStyles } from './suggestions.styles'

type SuggestionsRowProps = Omit<ComponentProps<'div'>, 'children' | 'className'> & {
  label: string
  scrollLabels: { start: string; end: string }
  children: ReactElement[]
  className?: string
}

/**
 * The list of chips, each in its turn to rise, and the chevrons for a row that doesn't fit. Its own part, so it mounts
 * with the first suggestion and starts watching the row's edges then, not while there's nothing to watch.
 */
export function SuggestionsRow({ label, scrollLabels, children, className, ...props }: SuggestionsRowProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const edges = useScrollEdges(listRef)
  const styles = suggestionsStyles()
  return (
    <div
      {...props}
      data-overflow-start={edges.start || undefined}
      data-overflow-end={edges.end || undefined}
      className={styles.root({ className })}
    >
      <ul ref={listRef} aria-label={label} className={styles.list()}>
        {children.map((item, index) => (
          <li
            key={item.key}
            className={styles.item()}
            style={toCSSVars({ 'suggestion-delay': `${index * SUGGESTIONS_STAGGER}ms` })}
          >
            {item}
          </li>
        ))}
      </ul>
      <span aria-hidden="true" className={styles.scrollStart()}>
        <IconButton
          icon="chevron-left"
          label={scrollLabels.start}
          size="s"
          tabIndex={-1}
          onClick={() => scrollByPage(listRef.current, -1)}
        />
      </span>
      <span aria-hidden="true" className={styles.scrollEnd()}>
        <IconButton
          icon="chevron-right"
          label={scrollLabels.end}
          size="s"
          tabIndex={-1}
          onClick={() => scrollByPage(listRef.current, 1)}
        />
      </span>
    </div>
  )
}
