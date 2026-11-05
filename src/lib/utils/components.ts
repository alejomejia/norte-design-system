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
