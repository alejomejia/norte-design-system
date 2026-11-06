'use client'

import { createContext, useContext } from 'react'

type SidebarState = {
  /** Whether the sidebar shows only its icons. */
  collapsed: boolean
  /** Collapses or expands it, calling `onCollapsedChange`. */
  setCollapsed: (collapsed: boolean) => void
}

/** The sidebar's collapsed state, shared with its parts and with what the app puts in its header and footer. */
export const SidebarContext = createContext<SidebarState>({ collapsed: false, setCollapsed: () => {} })

/**
 * The collapsed state of the `Sidebar` around a component, and a way to change it: for header and footer content that
 * adapts, or a shortcut of the app's own.
 *
 * @example
 * const { collapsed } = useSidebar()
 * return <Logo variant={collapsed ? 'mark' : 'full'} />
 */
export function useSidebar() {
  return useContext(SidebarContext)
}
