'use client'

import { Menu as BaseMenu } from '@base-ui/react/menu'
import { type ReactNode } from 'react'

import { Icon, type IconName } from '@/components/icon'
import { KeyboardKey } from '@/components/keyboard-key'

import {
  type MENU_ALIGNS,
  type MENU_ITEM_TONES,
  MENU_SIDE_OFFSET,
  type MENU_SIDES,
  MENU_SUBMENU_ALIGN_OFFSET,
} from './menu.const'
import { menuStyles } from './menu.styles'

const styles = menuStyles()

/** The props every row shares: an icon, a shortcut and a tone. */
type RowProps = {
  /** An icon before the label, by its name in Norte's set. */
  icon?: IconName
  /** The keyboard shortcut for the same action, shown at the end: `['⌘', 'L']`. It only shows it: wire the keys yourself. */
  shortcut?: string[]
  /** `danger` for what deletes or can't be undone: red, with a red highlight. */
  tone?: (typeof MENU_ITEM_TONES)[number]
  /** The label. */
  children: ReactNode
  className?: string
}

/** A row's icon, label and shortcut. */
function RowContent({ icon, shortcut, tone, children }: Omit<RowProps, 'className'>) {
  return (
    <>
      {icon && (
        <span data-menu-icon="" className={menuStyles({ tone }).icon()}>
          <Icon name={icon} />
        </span>
      )}
      <span className={styles.label()}>{children}</span>
      {shortcut && <KeyboardKey keys={shortcut} className={styles.shortcut()} />}
    </>
  )
}

export type MenuPopupProps = {
  /** Where it opens, relative to the trigger. It flips when there's no room. */
  side?: (typeof MENU_SIDES)[number]
  /** How it lines up with the trigger along that side. `start` by default. */
  align?: (typeof MENU_ALIGNS)[number]
  /** The gap from the trigger, in px. */
  sideOffset?: number
  /** The items, groups, separators and submenus. */
  children: ReactNode
  className?: string
}

/** The popup and its gliding highlight, shared by a menu and its submenus. */
function PopupFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <BaseMenu.Popup className={styles.popup({ className })}>
      {children}
      {/* After the rows: an anchored element can only follow anchors that come before it. */}
      <span aria-hidden="true" className={styles.highlight()} />
    </BaseMenu.Popup>
  )
}

/** The menu itself, opened by its trigger. */
export function MenuPopup({
  side = 'bottom',
  align = 'start',
  sideOffset = MENU_SIDE_OFFSET,
  children,
  className,
}: MenuPopupProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner side={side} align={align} sideOffset={sideOffset} className={styles.positioner()}>
        <PopupFrame className={className}>{children}</PopupFrame>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
}

export type MenuItemProps = Omit<BaseMenu.Item.Props, 'className' | 'children'> & RowProps

/** An action. It closes the menu when picked, unless `closeOnClick` is false. */
export function MenuItem({ icon, shortcut, tone = 'default', children, className, ...props }: MenuItemProps) {
  return (
    <BaseMenu.Item {...props} data-tone={tone} className={menuStyles({ tone }).item({ className })}>
      <RowContent icon={icon} shortcut={shortcut} tone={tone}>
        {children}
      </RowContent>
    </BaseMenu.Item>
  )
}

export type MenuLinkItemProps = Omit<BaseMenu.LinkItem.Props, 'className' | 'children'> &
  Omit<RowProps, 'tone'> & {
    /** Your router's link, so navigation stays client-side: `render={<NextLink href="/settings" />}`. */
    render?: BaseMenu.LinkItem.Props['render']
  }

/** An item that takes the reader to another page: a real link, with `href` or your router's link through `render`. */
export function MenuLinkItem({ icon, shortcut, children, className, ...props }: MenuLinkItemProps) {
  return (
    <BaseMenu.LinkItem {...props} className={styles.item({ className })}>
      <RowContent icon={icon} shortcut={shortcut}>
        {children}
      </RowContent>
    </BaseMenu.LinkItem>
  )
}

export type MenuCheckboxItemProps = Omit<BaseMenu.CheckboxItem.Props, 'className' | 'children'> &
  Omit<RowProps, 'icon' | 'tone'>

/** A setting that's on or off, with a check in the icon column while it's on. The menu stays open. */
export function MenuCheckboxItem({ shortcut, children, className, ...props }: MenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem {...props} className={styles.item({ className })}>
      <span data-menu-icon="" className={styles.icon()}>
        <BaseMenu.CheckboxItemIndicator className={styles.indicator()}>
          <Icon name="approve" />
        </BaseMenu.CheckboxItemIndicator>
      </span>
      <RowContent shortcut={shortcut}>{children}</RowContent>
    </BaseMenu.CheckboxItem>
  )
}

export type MenuRadioGroupProps = Omit<BaseMenu.RadioGroup.Props, 'className' | 'children'> & {
  /** A heading for the choice, like "Density". */
  label?: ReactNode
  /** Its `Menu.RadioItem`s. */
  children: ReactNode
  className?: string
}

/** One choice among a few, like a density or a sort order: its items are radio items. */
export function MenuRadioGroup({ label, children, className, ...props }: MenuRadioGroupProps) {
  return (
    <BaseMenu.RadioGroup {...props} className={className}>
      {label && <BaseMenu.GroupLabel className={styles.groupLabel()}>{label}</BaseMenu.GroupLabel>}
      {children}
    </BaseMenu.RadioGroup>
  )
}

export type MenuRadioItemProps = Omit<BaseMenu.RadioItem.Props, 'className' | 'children'> &
  Omit<RowProps, 'icon' | 'tone'>

/** One option of a `Menu.RadioGroup`, with a dot in the icon column while it's picked. The menu stays open. */
export function MenuRadioItem({ shortcut, children, className, ...props }: MenuRadioItemProps) {
  return (
    <BaseMenu.RadioItem {...props} className={styles.item({ className })}>
      <span data-menu-icon="" className={styles.icon()}>
        <BaseMenu.RadioItemIndicator className={styles.indicator()}>
          <span className={styles.dot()} />
        </BaseMenu.RadioItemIndicator>
      </span>
      <RowContent shortcut={shortcut}>{children}</RowContent>
    </BaseMenu.RadioItem>
  )
}

export type MenuGroupProps = Omit<BaseMenu.Group.Props, 'className' | 'children'> & {
  /** A heading for the group, read as its name. */
  label?: ReactNode
  /** Its items. */
  children: ReactNode
  className?: string
}

/** Items that belong together, under an optional heading. */
export function MenuGroup({ label, children, className, ...props }: MenuGroupProps) {
  return (
    <BaseMenu.Group {...props} className={className}>
      {label && <BaseMenu.GroupLabel className={styles.groupLabel()}>{label}</BaseMenu.GroupLabel>}
      {children}
    </BaseMenu.Group>
  )
}

export type MenuSeparatorProps = { className?: string }

/** A line between sections of a menu. */
export function MenuSeparator({ className }: MenuSeparatorProps) {
  return <BaseMenu.Separator className={styles.separator({ className })} />
}

export type MenuSubmenuProps = Omit<BaseMenu.SubmenuRoot.Props, 'children'> & {
  /** The row's label, which opens the submenu. */
  label: ReactNode
  /** An icon before the label. */
  icon?: IconName
  /** Ignores the pointer and the keyboard, and dims the row. */
  disabled?: boolean
  /** The submenu's items. */
  children: ReactNode
  className?: string
}

/** A row that opens more items beside it: on hover, ArrowRight or Enter. ArrowLeft or Escape comes back. */
export function MenuSubmenu({ label, icon, disabled, children, className, ...props }: MenuSubmenuProps) {
  return (
    <BaseMenu.SubmenuRoot {...props}>
      <BaseMenu.SubmenuTrigger disabled={disabled} className={styles.item()}>
        <RowContent icon={icon}>{label}</RowContent>
        <span className={styles.chevron()}>
          <Icon name="chevron-right" />
        </span>
      </BaseMenu.SubmenuTrigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner alignOffset={MENU_SUBMENU_ALIGN_OFFSET} className={styles.positioner()}>
          <PopupFrame className={className}>{children}</PopupFrame>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.SubmenuRoot>
  )
}
