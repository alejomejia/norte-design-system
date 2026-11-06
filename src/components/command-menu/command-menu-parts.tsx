'use client'

import { Autocomplete } from '@base-ui/react/autocomplete'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { type ReactNode, useMemo } from 'react'

import { EmptyState } from '@/components/empty-state'
import { Icon } from '@/components/icon'
import { IconButton } from '@/components/icon-button'
import { KeyboardKey } from '@/components/keyboard-key'
import { useIsApplePlatform } from '@/lib/hooks'

import { dialogStyles } from '../dialog/dialog.styles'
import { useCommandMenu } from './command-menu.hooks'
import { commandMenuStyles } from './command-menu.styles'
import { type CommandMenuGroup, type CommandMenuItem, type CommandMenuLabels } from './command-menu.types'
import { visibleGroups } from './command-menu.utils'

const styles = commandMenuStyles()
const backdrop = dialogStyles().backdrop()

export type CommandMenuTriggerProps = Omit<BaseDialog.Trigger.Props, 'className' | 'children'> & {
  /**
   * Another element to open it with, like an `IconButton` in a toolbar: `render={<IconButton icon="search" label="Search"
   * />}`. Without it, the trigger is a quiet search box with the shortcut.
   */
  render?: BaseDialog.Trigger.Props['render']
  /** The default trigger's text. `labels.trigger` ("Search…") by default. */
  children?: ReactNode
  className?: string
}

/** What opens the menu: a quiet search box that shows the shortcut, ⌘K or Ctrl K, or any button through `render`. */
export function CommandMenuTrigger({ render, children, className, ...props }: CommandMenuTriggerProps) {
  const { hotkey, labels } = useCommandMenu()
  const apple = useIsApplePlatform()
  const key = hotkey ? hotkey.toUpperCase() : undefined
  const keyshortcuts = key ? `${apple ? 'Meta' : 'Control'}+${key}` : undefined

  if (render)
    return <BaseDialog.Trigger aria-keyshortcuts={keyshortcuts} {...props} render={render} className={className} />

  return (
    <BaseDialog.Trigger aria-keyshortcuts={keyshortcuts} {...props} className={styles.trigger({ className })}>
      <Icon name="search" />
      <span className={styles.triggerLabel()}>{children ?? labels.trigger}</span>
      {key && <KeyboardKey keys={[apple ? '⌘' : 'Ctrl', key]} />}
    </BaseDialog.Trigger>
  )
}

type CommandMenuPopupProps = {
  groups: readonly CommandMenuGroup[]
  recent?: readonly CommandMenuItem[]
  query: string
  onQueryChange: (query: string) => void
  onSelect: (item: CommandMenuItem) => void
  labels: CommandMenuLabels
  className?: string
}

/** The panel: the search field, the results, and the hints under them. */
export function CommandMenuPopup({
  groups,
  recent,
  query,
  onQueryChange,
  onSelect,
  labels,
  className,
}: CommandMenuPopupProps) {
  const recentGroup = useMemo(
    () => (recent?.length ? { label: labels.recent, items: recent } : undefined),
    [recent, labels.recent],
  )
  const items = useMemo(() => visibleGroups(groups, '', recentGroup), [groups, recentGroup])
  const filteredItems = useMemo(() => visibleGroups(groups, query, recentGroup), [groups, query, recentGroup])

  function handleValueChange(value: string, details: Autocomplete.Root.ChangeEventDetails) {
    // Choosing a command would type its label into the field as the panel fades out: it closes instead.
    if (details.reason === 'item-press') return
    onQueryChange(value)
  }

  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={backdrop} />
      <BaseDialog.Viewport className={styles.viewport()}>
        <BaseDialog.Popup aria-label={labels.menu} className={styles.popup({ className })}>
          <Autocomplete.Root
            open
            inline
            items={items}
            filteredItems={filteredItems}
            value={query}
            onValueChange={handleValueChange}
            itemToStringValue={(item: CommandMenuItem) => item.label}
            // Typing highlights the best match, so Enter takes it. Otherwise the highlight follows the pointer and the
            // arrows, and fades where it is when the pointer leaves the rows, like Menu's.
            autoHighlight
          >
            <Autocomplete.InputGroup className={styles.search()}>
              <Icon name="search" className={styles.searchIcon()} />
              <Autocomplete.Input
                aria-label={labels.menu}
                placeholder={labels.placeholder}
                className={styles.input()}
              />
              <Autocomplete.Clear
                render={<IconButton icon="close" label={labels.clear} size="s" />}
                className={styles.clear()}
              />
            </Autocomplete.InputGroup>

            <div className={styles.results()}>
              <Autocomplete.List className={styles.list()}>
                {(group: CommandMenuGroup) => (
                  <Autocomplete.Group key={group.label} items={group.items} className={styles.group()}>
                    <Autocomplete.GroupLabel className={styles.groupLabel()}>{group.label}</Autocomplete.GroupLabel>
                    <Autocomplete.Collection>
                      {(item: CommandMenuItem) => (
                        // The same command can be in Recent and in its own group: the key tells them apart.
                        <CommandMenuRow key={`${group.label}:${item.value}`} item={item} onSelect={onSelect} />
                      )}
                    </Autocomplete.Collection>
                  </Autocomplete.Group>
                )}
              </Autocomplete.List>
              {/* Stays mounted, so screen readers hear when nothing matches; only its content comes and goes. */}
              <Autocomplete.Empty className={styles.empty()}>
                {query.trim() && (
                  <EmptyState
                    variant="plain"
                    size="s"
                    icon="search"
                    title={labels.emptyTitle(query.trim())}
                    description={labels.emptyDescription}
                  />
                )}
              </Autocomplete.Empty>
              {/* After the rows: an anchored element can only follow anchors that come before it. */}
              <span aria-hidden="true" className={styles.highlight()} />
            </div>

            <CommandMenuHints labels={labels} />
          </Autocomplete.Root>
          <BaseDialog.Close className="sr-only">{labels.close}</BaseDialog.Close>
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  )
}

/** One command: its icon, label, description and shortcut. */
function CommandMenuRow({ item, onSelect }: { item: CommandMenuItem; onSelect: (item: CommandMenuItem) => void }) {
  const { icon, label, description, shortcut, tone, disabled } = item
  const toned = commandMenuStyles({ tone })

  return (
    <Autocomplete.Item
      value={item}
      disabled={disabled}
      onClick={() => onSelect(item)}
      data-tone={tone}
      className={toned.item()}
    >
      {icon && (
        <span data-command-icon="" className={toned.icon()}>
          <Icon name={icon} />
        </span>
      )}
      <span className={styles.text()}>
        <span className={styles.label()}>{label}</span>
        {description && <span className={styles.description()}>{description}</span>}
      </span>
      {shortcut && <KeyboardKey keys={shortcut} />}
    </Autocomplete.Item>
  )
}

/** The keys that work in the menu. Hidden from screen readers, which announce the list their own way, and on touch. */
function CommandMenuHints({ labels }: { labels: CommandMenuLabels }) {
  return (
    <div aria-hidden="true" className={styles.hints()}>
      <span className={styles.hint()}>
        <KeyboardKey keys={['↑', '↓']} />
        {labels.hintNavigate}
      </span>
      <span className={styles.hint()}>
        <KeyboardKey keys={['↵']} />
        {labels.hintSelect}
      </span>
      <span className={styles.hint()}>
        <KeyboardKey>esc</KeyboardKey>
        {labels.hintClose}
      </span>
    </div>
  )
}
