/** A command's looks: `danger` for what deletes or can't be undone, red with a red highlight. */
export const COMMAND_MENU_ITEM_TONES = ['default', 'danger'] as const

/** The key that opens the menu with ⌘ (or Ctrl). */
export const COMMAND_MENU_HOTKEY = 'k'

/** Every word the menu shows or announces, in English: pass yours, all or some, to translate them. */
export const COMMAND_MENU_LABELS = {
  /** What screen readers hear for the menu and its search field. */
  menu: 'Command menu',
  /** The search field's placeholder. */
  placeholder: 'Search or jump to…',
  /** The default trigger's text. */
  trigger: 'Search…',
  /** The title over the recent items, shown while the search is empty. */
  recent: 'Recent',
  /** The empty result's title, with what was typed. */
  emptyTitle: (query: string) => `No results for “${query}”`,
  /** The empty result's description. */
  emptyDescription: 'Try another word, or search for a run or an agent.',
  /** The button that clears the search. */
  clear: 'Clear search',
  /** The hidden close button, kept for touch screen readers. */
  close: 'Close',
  /** The hints under the results. */
  hintNavigate: 'Navigate',
  hintSelect: 'Open',
  hintClose: 'Close',
}
