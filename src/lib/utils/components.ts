import { Children, cloneElement, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react'

/**
 * Names a compound component's parts after it, `Menu.Item` rather than `MenuItem`, for React DevTools and Storybook's
 * code panel, and returns them for `Object.assign`. Call it in the component's own `index.tsx`: Storybook's docgen
 * names every exported function after itself at the end of the module that declares it, which would undo a name set
 * there.
 * @example
 * export const Menu = Object.assign(MenuRoot, nameParts('Menu', { Item: MenuItem }))
 */
export function nameParts<T extends Record<string, object>>(name: string, parts: T): T {
  for (const [key, part] of Object.entries(parts)) Object.assign(part, { displayName: `${name}.${key}` })
  return parts
}

/**
 * A component's element children as one flat list, with fragments opened, so a root that counts or slices its parts
 * (a breadcrumb that collapses its middle) sees each one, however the app grouped them. Text, numbers and empty
 * children are dropped. Keys stay unique: a part inside a fragment takes the fragment's key as a prefix.
 * @example
 * flattenChildren(<><Item /><Item /></>) // [<Item key=".0.0" />, <Item key=".0.1" />]
 */
export function flattenChildren(children: ReactNode): ReactElement[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return []
    if (child.type !== Fragment) return [child]
    return flattenChildren(child.props.children).map((nested) =>
      cloneElement(nested, { key: `${child.key}${nested.key}` }),
    )
  })
}
