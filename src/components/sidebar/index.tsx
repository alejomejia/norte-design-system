'use client'

import { type ComponentProps, useCallback, useMemo, useState } from 'react'

import { TooltipProvider } from '@/components/tooltip'
import { nameParts } from '@/lib/utils'

import { SidebarContext } from './sidebar.hooks'
import { sidebarStyles } from './sidebar.styles'
import {
  SidebarButton,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarSection,
  SidebarToggle,
} from './sidebar-parts'

export { useSidebar } from './sidebar.hooks'
export type {
  SidebarButtonProps,
  SidebarFooterProps,
  SidebarHeaderProps,
  SidebarItemProps,
  SidebarNavProps,
  SidebarSectionProps,
  SidebarToggleProps,
} from './sidebar-parts'

export type SidebarProps = Omit<ComponentProps<'div'>, 'className'> & {
  /** Shows only the icons, controlled: pair it with `onCollapsedChange`. */
  collapsed?: boolean
  /** Whether it starts collapsed, when the sidebar keeps its own state. */
  defaultCollapsed?: boolean
  /** Called with the new state when `Sidebar.Toggle`, or `setCollapsed` from `useSidebar`, changes it. */
  onCollapsedChange?: (collapsed: boolean) => void
  className?: string
}

/**
 * The workspace's navigation, down the side of the page: a header for the logo and the workspace switcher, the pages
 * in sections, and a footer for the user. It collapses to its icons, with each name in a tooltip; `useSidebar` tells
 * what you put inside whether it's collapsed.
 *
 * @example
 * <Sidebar>
 *   <Sidebar.Nav>
 *     <Sidebar.Section>
 *       <Sidebar.Item icon="home" href="/">Home</Sidebar.Item>
 *       <Sidebar.Item icon="run" href="/runs" current>Runs</Sidebar.Item>
 *       <Sidebar.Item icon="permission" href="/approvals" count={3} countLabel="3 waiting" countTone="accent">
 *         Approvals
 *       </Sidebar.Item>
 *     </Sidebar.Section>
 *   </Sidebar.Nav>
 *   <Sidebar.Footer>
 *     <Sidebar.Toggle />
 *   </Sidebar.Footer>
 * </Sidebar>
 */
function SidebarRoot({
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  className,
  children,
  ...props
}: SidebarProps) {
  const [ownCollapsed, setOwnCollapsed] = useState(defaultCollapsed)
  const isCollapsed = collapsed ?? ownCollapsed

  const setCollapsed = useCallback(
    (next: boolean) => {
      if (collapsed === undefined) setOwnCollapsed(next)
      onCollapsedChange?.(next)
    },
    [collapsed, onCollapsedChange],
  )
  const state = useMemo(() => ({ collapsed: isCollapsed, setCollapsed }), [isCollapsed, setCollapsed])

  return (
    <SidebarContext value={state}>
      {/* Collapsed, the names live in tooltips: once one is open, its neighbors open at once. */}
      <TooltipProvider>
        <div {...props} data-collapsed={isCollapsed ? '' : undefined} className={sidebarStyles().root({ className })}>
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext>
  )
}

// The root's name too: its function is `SidebarRoot`.
SidebarRoot.displayName = 'Sidebar'

export const Sidebar = Object.assign(
  SidebarRoot,
  nameParts('Sidebar', {
    Header: SidebarHeader,
    Nav: SidebarNav,
    Section: SidebarSection,
    Item: SidebarItem,
    Button: SidebarButton,
    Toggle: SidebarToggle,
    Footer: SidebarFooter,
  }),
)
