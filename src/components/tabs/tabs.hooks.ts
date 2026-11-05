'use client'

import { createContext, useContext } from 'react'

import { type TABS_SIZES, type TABS_VARIANTS } from './tabs.const'

type TabsLook = {
  variant: (typeof TABS_VARIANTS)[number]
  size: (typeof TABS_SIZES)[number]
}

/** The root's variant and size, so the list and its tabs don't repeat them. */
export const TabsLookContext = createContext<TabsLook>({ variant: 'line', size: 'm' })

/** The variant and size of the `Tabs` around a part. */
export function useTabsLook() {
  return useContext(TabsLookContext)
}
