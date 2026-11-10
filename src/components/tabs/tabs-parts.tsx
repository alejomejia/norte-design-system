'use client'

import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import { type ReactNode, useRef } from 'react'

import { Badge } from '@/components/badge'
import { Icon, type IconName } from '@/components/icon'
import { IconButton } from '@/components/icon-button'
import { useScrollEdges } from '@/lib/hooks'
import { scrollByPage } from '@/lib/utils'

import { TABS_SCROLL_LABELS } from './tabs.const'
import { useTabsLook } from './tabs.hooks'
import { tabsStyles } from './tabs.styles'

export type TabsListProps = Omit<BaseTabs.List.Props, 'className' | 'children'> & {
  /** Stretches the tabs to share the whole width, for a narrow panel. */
  fill?: boolean
  /** What the chevrons on a row that doesn't fit are called: `start` scrolls back, `end` forward. */
  scrollLabels?: { start: string; end: string }
  /** The `Tabs.Tab`s, in order. */
  children: ReactNode
  /** Goes on the row's outer box. */
  className?: string
}

/**
 * The row of tabs and the indicator that glides to the active one. Arrow keys move between tabs, Home and End jump
 * to the ends, and Enter or Space picks one (or set `activateOnFocus` to pick it as it's reached). When the tabs don't
 * fit, the row scrolls sideways: the tabs fade out on each side that hides more, with a chevron there that scrolls
 * them. The chevrons are for pointers only, out of the tab order and hidden from screen readers, since the arrow keys
 * already move along the row.
 */
export function TabsList({
  fill = false,
  scrollLabels = TABS_SCROLL_LABELS,
  children,
  className,
  ...props
}: TabsListProps) {
  const styles = tabsStyles({ ...useTabsLook(), fill })
  const scrollerRef = useRef<HTMLDivElement>(null)
  const edges = useScrollEdges(scrollerRef)

  return (
    <div
      data-overflow-start={edges.start || undefined}
      data-overflow-end={edges.end || undefined}
      className={styles.bar({ className })}
    >
      <div ref={scrollerRef} className={styles.scroller()}>
        <BaseTabs.List {...props} className={styles.list()}>
          <BaseTabs.Indicator className={styles.indicator()} />
          {children}
        </BaseTabs.List>
      </div>
      <span aria-hidden="true" className={styles.scrollStart()}>
        <IconButton
          icon="chevron-left"
          label={scrollLabels.start}
          size="s"
          tabIndex={-1}
          onClick={() => scrollByPage(scrollerRef.current, -1)}
        />
      </span>
      <span aria-hidden="true" className={styles.scrollEnd()}>
        <IconButton
          icon="chevron-right"
          label={scrollLabels.end}
          size="s"
          tabIndex={-1}
          onClick={() => scrollByPage(scrollerRef.current, 1)}
        />
      </span>
    </div>
  )
}

export type TabsTabProps = Omit<BaseTabs.Tab.Props, 'className' | 'children'> & {
  /** An icon before the label, by its name in Norte's set. */
  icon?: IconName
  /** A number after the label, like the rows a tab holds. Screen readers hear it as part of the tab's name. */
  count?: number
  /** The label. */
  children: ReactNode
  className?: string
}

/** One tab: a label, with an optional icon and count. Its `value` matches the `Tabs.Panel` it shows. */
export function TabsTab({ icon, count, children, className, ...props }: TabsTabProps) {
  const styles = tabsStyles(useTabsLook())
  return (
    <BaseTabs.Tab {...props} className={styles.tab({ className })}>
      {icon && <Icon name={icon} />}
      {children}
      {count !== undefined && <Badge className={styles.count()}>{count}</Badge>}
    </BaseTabs.Tab>
  )
}

export type TabsPanelProps = Omit<BaseTabs.Panel.Props, 'className'> & { className?: string }

/**
 * What a tab shows, when its tab is active. It fades in, and it's in the tab order, so the keyboard reaches content
 * that has nothing focusable in it. `keepMounted` keeps it in the page while it's hidden, to keep its state.
 */
export function TabsPanel({ className, ...props }: TabsPanelProps) {
  return <BaseTabs.Panel {...props} className={tabsStyles().panel({ className })} />
}
