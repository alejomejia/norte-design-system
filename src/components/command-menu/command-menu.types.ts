import { type IconName } from '@/components/icon'

import { type COMMAND_MENU_ITEM_TONES, type COMMAND_MENU_LABELS } from './command-menu.const'

/** One command: a place to go or something to do. */
export type CommandMenuItem = {
  /** Unique across the menu: what `onSelect` and tests tell commands apart by. */
  value: string
  /** What it's called, and what the search matches first. */
  label: string
  /** An icon before the label, by its name in Norte's set. */
  icon?: IconName
  /** Quieter text after the label: `Research agent · 4m ago`. */
  description?: string
  /** The keyboard shortcut for the same action, shown at the end: `['⌘', 'L']`. It only shows it: wire the keys yourself. */
  shortcut?: string[]
  /** More words it's found by, ranked below the label: `['invite', 'people']` for Share run. */
  keywords?: string[]
  /** `danger` for what deletes or can't be undone. */
  tone?: (typeof COMMAND_MENU_ITEM_TONES)[number]
  /** Shown but can't be chosen. The arrows still reach it, so screen readers hear it; say why in `description`. */
  disabled?: boolean
  /** What choosing it does. The menu closes after. */
  onSelect?: () => void
}

/** Commands under a title, like "Go to" or "Run #128". */
export type CommandMenuGroup = {
  label: string
  items: readonly CommandMenuItem[]
}

/** Every word the menu shows or announces. */
export type CommandMenuLabels = typeof COMMAND_MENU_LABELS
