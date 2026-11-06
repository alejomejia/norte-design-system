'use client'

import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import { useMemo } from 'react'

import { nameParts } from '@/lib/utils'
import { type TABS_SIZES, type TABS_VARIANTS } from './tabs.const'
import { TabsLookContext } from './tabs.hooks'
import { tabsStyles } from './tabs.styles'
import { TabsList, TabsPanel, TabsTab } from './tabs-parts'

export type { TabsListProps, TabsPanelProps, TabsTabProps } from './tabs-parts'

export type TabsProps = Omit<BaseTabs.Root.Props, 'className' | 'orientation'> & {
  /** `line`, a bar under the active tab, for a panel's sections; `segmented`, a tile on a track, for a small switch. */
  variant?: (typeof TABS_VARIANTS)[number]
  /** `s` (32px) or `m` (40px). */
  size?: (typeof TABS_SIZES)[number]
  className?: string
}

/**
 * Sections of one view, one shown at a time: a row of tabs and the panel of the active one. An indicator glides from
 * tab to tab. Built on Base UI's Tabs, which brings the roles, the arrow keys and the link between each tab and its
 * panel.
 *
 * @example
 * <Tabs defaultValue="results">
 *   <Tabs.List>
 *     <Tabs.Tab value="results" count={5}>Results</Tabs.Tab>
 *     <Tabs.Tab value="details">Details</Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Panel value="results">…</Tabs.Panel>
 *   <Tabs.Panel value="details">…</Tabs.Panel>
 * </Tabs>
 */
function TabsRoot({ variant = 'line', size = 'm', className, ...props }: TabsProps) {
  const look = useMemo(() => ({ variant, size }), [variant, size])
  return (
    <TabsLookContext value={look}>
      <BaseTabs.Root {...props} className={tabsStyles().root({ className })} />
    </TabsLookContext>
  )
}

// The root's name too: its function is `TabsRoot`.
TabsRoot.displayName = 'Tabs'

export const Tabs = Object.assign(TabsRoot, nameParts('Tabs', { List: TabsList, Tab: TabsTab, Panel: TabsPanel }))
