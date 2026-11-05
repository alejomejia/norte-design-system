'use client'

import { Menu as BaseMenu } from '@base-ui/react/menu'

import {
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubmenu,
} from './menu-parts'

export type {
  MenuCheckboxItemProps,
  MenuGroupProps,
  MenuItemProps,
  MenuLinkItemProps,
  MenuPopupProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuSeparatorProps,
  MenuSubmenuProps,
} from './menu-parts'

export type MenuProps = BaseMenu.Root.Props

/**
 * A list of actions that opens from a trigger: items with icons and shortcuts, groups under a heading, separators,
 * settings that toggle (checkbox and radio items), submenus, and a danger item for what can't be undone. Its highlight
 * glides from row to row, like Select's. Built on Base UI's Menu, which brings the keyboard, typeahead and focus.
 *
 * @example
 * <Menu>
 *   <Menu.Trigger render={<IconButton icon="more" label="Run actions" />} />
 *   <Menu.Popup align="end">
 *     <Menu.Item icon="copy">Duplicate run</Menu.Item>
 *     <Menu.Item icon="delete" tone="danger">Delete run</Menu.Item>
 *   </Menu.Popup>
 * </Menu>
 */
function MenuRoot(props: MenuProps) {
  return <BaseMenu.Root {...props} />
}

export type MenuTriggerProps = BaseMenu.Trigger.Props

/**
 * What opens the menu: Norte's `Button` or `IconButton`, through `render`. It can sit inside a `Tooltip`.
 *
 * @example
 * <Menu.Trigger render={<Button variant="secondary">Actions</Button>} />
 */
function MenuTrigger(props: MenuTriggerProps) {
  return <BaseMenu.Trigger {...props} />
}

export const Menu = Object.assign(MenuRoot, {
  Trigger: MenuTrigger,
  Popup: MenuPopup,
  Item: MenuItem,
  LinkItem: MenuLinkItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Group: MenuGroup,
  Separator: MenuSeparator,
  Submenu: MenuSubmenu,
})
