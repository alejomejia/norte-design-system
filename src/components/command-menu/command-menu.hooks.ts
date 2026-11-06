'use client'

import { createContext, use, useEffect, useState } from 'react'

import { COMMAND_MENU_HOTKEY, COMMAND_MENU_LABELS } from './command-menu.const'
import { type CommandMenuLabels } from './command-menu.types'

/** What the trigger needs from the root: the key it shows and its words. */
export const CommandMenuContext = createContext<{ hotkey: string | false; labels: CommandMenuLabels }>({
  hotkey: COMMAND_MENU_HOTKEY,
  labels: COMMAND_MENU_LABELS,
})

/** The root's hotkey and labels, for its trigger. */
export function useCommandMenu() {
  return use(CommandMenuContext)
}

// Every mounted menu that listens for a hotkey, in mount order.
const listening: symbol[] = []

/**
 * Whether this menu is the one that answers the hotkey: the first mounted. A page should have one command menu, but a
 * docs page shows several, and one ⌘K shouldn't open them all.
 */
export function useAnswersHotkey(enabled: boolean): () => boolean {
  const [id] = useState(() => Symbol('command-menu'))

  useEffect(() => {
    if (!enabled) return
    listening.push(id)
    return () => {
      listening.splice(listening.indexOf(id), 1)
    }
  }, [id, enabled])

  return () => listening[0] === id
}
