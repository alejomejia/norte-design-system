/** A menu item's tones: `default`, or `danger` for what deletes or can't be undone. */
export const MENU_ITEM_TONES = ['default', 'danger'] as const

/** Where a menu opens, relative to its trigger. It flips when there's no room. */
export const MENU_SIDES = ['top', 'bottom', 'left', 'right'] as const

/** How a menu lines up with its trigger along that side. It shifts to stay on screen. */
export const MENU_ALIGNS = ['start', 'center', 'end'] as const

/** The gap between a menu and its trigger, in px. */
export const MENU_SIDE_OFFSET = 4

/**
 * How a submenu lines up with its row: shifted up by the popup's padding and border (4px + 1px), so its first item sits
 * level with the row that opened it.
 */
export const MENU_SUBMENU_ALIGN_OFFSET = -5
