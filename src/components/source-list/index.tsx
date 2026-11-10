'use client'

import { Collapsible } from '@base-ui/react/collapsible'

import { CitationFavicon } from '@/components/citation/citation-favicon'
import { Icon } from '@/components/icon'
import { domainOf } from '@/lib/utils'

import { SOURCE_LIST_LABELS, SOURCE_LIST_STACK_MAX } from './source-list.const'
import { sourceListStyles } from './source-list.styles'
import { type SourceListLabels, type SourceListSource } from './source-list.types'
import { SourceListItem } from './source-list-item'

export type { SourceListLabels, SourceListSource, SourceListStatus } from './source-list.types'

export type SourceListProps = Omit<Collapsible.Root.Props, 'className' | 'children' | 'render'> & {
  /**
   * The sources the run read, in the order its answer cites them. Those read are numbered 1, 2, 3… to match the
   * answer's citations; a failed one has nothing to cite and shows a cross instead.
   */
  sources: SourceListSource[]
  /** The words it says, for another language: the fold's count, "failed", and what screen readers hear. */
  labels?: Partial<SourceListLabels>
  className?: string
}

/**
 * The sources an agent's run read, folded under its answer to "5 sources · 1 failed" with their favicons, and opening
 * to a list where each row links to its source, numbered like the answer's citations. Built on Base UI's Collapsible.
 *
 * @example
 * <SourceList
 *   sources={[
 *     { href: 'https://fieldnote.example/pricing', title: 'Fieldnote pricing' },
 *     { href: 'https://orbit.example/pricing', title: 'Orbit pricing', status: 'failed', reason: 'Timed out after 30s' },
 *   ]}
 * />
 */
export function SourceList({ sources, labels: customLabels, className, ...props }: SourceListProps) {
  const labels = { ...SOURCE_LIST_LABELS, ...customLabels }
  const styles = sourceListStyles()
  const failedCount = sources.filter((source) => source.status === 'failed').length

  // Read sources take the next number; failed ones none, so the numbers stay those of the answer's citations.
  let next = 0
  const numbers = sources.map((source) => (source.status === 'failed' ? undefined : ++next))

  return (
    <Collapsible.Root {...props} className={styles.root({ className })}>
      <Collapsible.Trigger className={styles.trigger()}>
        <span aria-hidden className={styles.stack()}>
          {sources.slice(0, SOURCE_LIST_STACK_MAX).map((source) => (
            <CitationFavicon
              key={source.href}
              favicon={source.favicon}
              domain={source.domain ?? domainOf(source.href)}
              className={styles.stackItem()}
            />
          ))}
        </span>
        <span className={styles.label()}>
          {labels.count(sources.length)}
          {failedCount > 0 && (
            <>
              <span aria-hidden>·</span>
              {/* A comma for screen readers, which skip the dot: "5 sources, 1 failed". */}
              <span className="sr-only">,</span>
              <span className={styles.failedCount()}>{labels.failed(failedCount)}</span>
            </>
          )}
        </span>
        <Icon name="chevron-down" className={styles.chevron()} />
      </Collapsible.Trigger>
      <Collapsible.Panel className={styles.panel()}>
        <ul className={styles.list()}>
          {sources.map((source, index) => (
            <SourceListItem
              key={source.href}
              source={source}
              number={numbers[index]}
              position={index}
              labels={labels}
            />
          ))}
        </ul>
      </Collapsible.Panel>
    </Collapsible.Root>
  )
}
