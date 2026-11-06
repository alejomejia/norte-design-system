'use client'

import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { type ReactNode, useMemo, useState } from 'react'

import { useModShortcut } from '@/lib/hooks'
import { nameParts } from '@/lib/utils'
import { COMMAND_MENU_HOTKEY, COMMAND_MENU_LABELS } from './command-menu.const'
import { CommandMenuContext, useAnswersHotkey } from './command-menu.hooks'
import { type CommandMenuGroup, type CommandMenuItem, type CommandMenuLabels } from './command-menu.types'
import { CommandMenuPopup, CommandMenuTrigger } from './command-menu-parts'

export type { CommandMenuGroup, CommandMenuItem, CommandMenuLabels } from './command-menu.types'
export type { CommandMenuTriggerProps } from './command-menu-parts'

export type CommandMenuProps = {
  /** The commands, in groups, in the order they show while nothing is typed. */
  groups: readonly CommandMenuGroup[]
  /** Commands used lately, shown first under "Recent" while the search is empty. They can repeat ones in `groups`. */
  recent?: readonly CommandMenuItem[]
  /** Whether it's open, to control it. Leave it out and the trigger and the hotkey open it on their own. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Called with the command chosen, after its own `onSelect`. The menu closes after. */
  onSelect?: (item: CommandMenuItem) => void
  /** The key that toggles it with ⌘ (Ctrl off Apple devices), anywhere on the page. `false` for none. */
  hotkey?: string | false
  /** Its words, to translate them: pass only the ones to change. */
  labels?: Partial<CommandMenuLabels>
  /** `CommandMenu.Trigger`, if something on the page opens it. */
  children?: ReactNode
  /** Classes for the panel. */
  className?: string
}

/**
 * ⌘K: a search over everything someone can go to or do, in groups, from anywhere on the page. Typing ranks the
 * commands that match; Escape clears the search, then closes. Built on Base UI's Dialog and Autocomplete: focus stays
 * in it, the arrows move through the results, and focus goes back where it was when it closes.
 *
 * @example
 * <CommandMenu
 *   recent={[{ value: 'run-128', label: 'Run #128', icon: 'run', description: 'Research agent · 4m ago' }]}
 *   groups={[{ label: 'Go to', items: [{ value: 'runs', label: 'Runs', icon: 'run', onSelect: () => router.push('/runs') }] }]}
 * >
 *   <CommandMenu.Trigger />
 * </CommandMenu>
 */
function CommandMenuRoot({
  groups,
  recent,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  hotkey = COMMAND_MENU_HOTKEY,
  labels: labelsProp,
  children,
  className,
}: CommandMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const open = openProp ?? uncontrolledOpen
  const [query, setQuery] = useState('')
  const labels = useMemo(() => ({ ...COMMAND_MENU_LABELS, ...labelsProp }), [labelsProp])
  const context = useMemo(() => ({ hotkey, labels }), [hotkey, labels])

  function setOpen(next: boolean) {
    if (openProp === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  const answersHotkey = useAnswersHotkey(Boolean(hotkey))
  useModShortcut(hotkey, () => answersHotkey() && setOpen(!open))

  function handleOpenChange(next: boolean, details: BaseDialog.Root.ChangeEventDetails) {
    // Escape clears what was typed first; a second one closes.
    if (!next && details.reason === 'escape-key' && query) {
      details.cancel()
      setQuery('')
      return
    }
    setOpen(next)
  }

  function handleSelect(item: CommandMenuItem) {
    item.onSelect?.()
    onSelect?.(item)
    setOpen(false)
  }

  return (
    <CommandMenuContext value={context}>
      <BaseDialog.Root
        open={open}
        onOpenChange={handleOpenChange}
        // Emptied once it's gone, not as it fades out: every opening starts with a clean search.
        onOpenChangeComplete={(isOpen) => !isOpen && setQuery('')}
      >
        {children}
        <CommandMenuPopup
          groups={groups}
          recent={recent}
          query={query}
          onQueryChange={setQuery}
          onSelect={handleSelect}
          labels={labels}
          className={className}
        />
      </BaseDialog.Root>
    </CommandMenuContext>
  )
}

// The root's name too: its function is `CommandMenuRoot`.
CommandMenuRoot.displayName = 'CommandMenu'

export const CommandMenu = Object.assign(CommandMenuRoot, nameParts('CommandMenu', { Trigger: CommandMenuTrigger }))
