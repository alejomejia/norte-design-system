'use client'

import { isValidElement, type ReactNode, useMemo } from 'react'

import { flattenChildren, nameParts, toCSSVars } from '@/lib/utils'
import {
  BREADCRUMB_ITEMS_AFTER,
  BREADCRUMB_ITEMS_BEFORE,
  BREADCRUMB_LABEL,
  BREADCRUMB_MAX_ITEMS,
  BREADCRUMB_MORE_LABEL,
  BREADCRUMB_SEPARATOR,
  type BREADCRUMB_TRUNCATE,
} from './breadcrumb.const'
import { BreadcrumbLookContext } from './breadcrumb.hooks'
import { breadcrumbStyles } from './breadcrumb.styles'
import { BreadcrumbItem, type BreadcrumbItemProps, BreadcrumbMore, BreadcrumbPlace } from './breadcrumb-parts'

export type { BreadcrumbItemProps } from './breadcrumb-parts'

export type BreadcrumbProps = {
  /** The navigation's accessible name, what a screen reader's list of landmarks calls it. */
  label?: string
  /** Above this many items, the middle of the path collapses into a "…" button that opens the hidden pages in a menu. */
  maxItems?: number
  /** How many items stay visible before the collapsed part. */
  itemsBefore?: number
  /** How many items stay visible after it: the current page and its parent by default. */
  itemsAfter?: number
  /** The accessible name and tooltip of the "…" button. */
  moreLabel?: string
  /** What sits between two items: a slash by default, or an icon (`<Icon name="chevron-right" />`). */
  separator?: ReactNode
  /**
   * Which labels may truncate when the row runs out of room: `all`, sharing it; only the `ancestors`, so the current
   * page stays whole; or only the `current` page, so the path above it stays whole. Labels that may not truncate can
   * push the row past its container.
   */
  truncate?: (typeof BREADCRUMB_TRUNCATE)[number]
  /**
   * The most characters a label shows before it truncates, even when there's room. Only for the labels `truncate`
   * allows. Unset, labels truncate only when the row runs out of room.
   */
  maxLabelLength?: number
  /** The `Breadcrumb.Item`s, from the top of the path down to the current page. */
  children: ReactNode
  className?: string
}

/**
 * Where the page sits in the app, from the top down to the page itself, each step a link back up. A `nav` with an
 * ordered list, the current page marked with `aria-current`; a long path folds its middle into a menu.
 *
 * @example
 * <Breadcrumb>
 *   <Breadcrumb.Item render={<NextLink href="/agents" />}>Agents</Breadcrumb.Item>
 *   <Breadcrumb.Item render={<NextLink href="/agents/research" />}>Research agent</Breadcrumb.Item>
 *   <Breadcrumb.Item>Run #128</Breadcrumb.Item>
 * </Breadcrumb>
 */
function BreadcrumbRoot({
  label = BREADCRUMB_LABEL,
  maxItems = BREADCRUMB_MAX_ITEMS,
  itemsBefore = BREADCRUMB_ITEMS_BEFORE,
  itemsAfter = BREADCRUMB_ITEMS_AFTER,
  moreLabel = BREADCRUMB_MORE_LABEL,
  separator = BREADCRUMB_SEPARATOR,
  truncate = 'all',
  maxLabelLength,
  children,
  className,
}: BreadcrumbProps) {
  const items = flattenChildren(children).filter(isValidElement<BreadcrumbItemProps>)
  // Collapse only when it hides at least two items: a menu for one page is a click more than the page itself.
  const collapses = items.length > maxItems && items.length - itemsBefore - itemsAfter > 1
  const before = collapses ? items.slice(0, itemsBefore) : items
  const hidden = collapses ? items.slice(itemsBefore, items.length - itemsAfter) : []
  const after = collapses ? items.slice(items.length - itemsAfter) : []
  const styles = breadcrumbStyles()
  const look = useMemo(() => ({ separator, truncate }), [separator, truncate])

  function place(item: (typeof items)[number], index: number) {
    return (
      <BreadcrumbPlace key={item.key} first={index === 0} last={index === items.length - 1}>
        {item}
      </BreadcrumbPlace>
    )
  }

  return (
    <BreadcrumbLookContext value={look}>
      <nav
        aria-label={label}
        className={styles.root({ className })}
        // In `ch`, resolved on each label, so it counts characters of the label's own font.
        style={toCSSVars({ 'breadcrumb-label-max': maxLabelLength == null ? undefined : `${maxLabelLength}ch` })}
      >
        <ol className={styles.list()}>
          {before.map((item, index) => place(item, index))}
          {collapses && <BreadcrumbMore items={hidden} label={moreLabel} />}
          {after.map((item, index) => place(item, items.length - itemsAfter + index))}
        </ol>
      </nav>
    </BreadcrumbLookContext>
  )
}

// The root's name too: its function is `BreadcrumbRoot`.
BreadcrumbRoot.displayName = 'Breadcrumb'

export const Breadcrumb = Object.assign(BreadcrumbRoot, nameParts('Breadcrumb', { Item: BreadcrumbItem }))
