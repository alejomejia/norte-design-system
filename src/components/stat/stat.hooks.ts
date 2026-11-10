'use client'

import { createContext, useContext } from 'react'

import { type STAT_SIZES, type STAT_VARIANTS } from './stat.const'

type StatLook = {
  variant: (typeof STAT_VARIANTS)[number]
  size: (typeof STAT_SIZES)[number]
}

/** The group's look, so its stats don't repeat it. `null` outside a group: the stat is then its own list. */
export const StatGroupContext = createContext<StatLook | null>(null)

/** The look of the `Stat.Group` around a stat, or `null` when it stands alone. */
export function useStatGroup() {
  return useContext(StatGroupContext)
}
