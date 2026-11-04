/**
 * Groups the props table into sections, like the Controls panel's bands (`manager-styles/controls.css`): Props, then
 * Events. Vue's docgen sorts props, slots and events on its own; React's has no groups, so a prop named `on…` is an
 * event and the rest are props. A story can still set its own `table.category`.
 */
import { type Preview } from '@storybook/react-vite'
import { type SBType } from 'storybook/internal/types'

type ArgTypesEnhancer = NonNullable<Preview['argTypesEnhancers']>[number]

/** An event handler's name: `onClick`, `onValueChange`. */
const EVENT_NAME = /^on[A-Z]/

/** The type Storybook would infer for an arg's value: enough for the table and the controls. */
function inferType(value: unknown): SBType {
  switch (typeof value) {
    case 'function':
      return { name: 'function' }
    case 'string':
      return { name: 'string' }
    case 'number':
      return { name: 'number' }
    case 'boolean':
      return { name: 'boolean' }
    default:
      return { name: 'other', value: typeof value }
  }
}

/**
 * Puts every arg without a category under `props` or `events`, props first. Storybook writes the names; the table
 * capitalizes them. Args a story passes without docgen knowing them (a handler's `fn()` spy) get their row here, with
 * their type: Storybook would otherwise infer them after this runs, and list them before every other row.
 */
export function addArgCategories({ argTypes, initialArgs = {} }: Parameters<ArgTypesEnhancer>[0]) {
  const rows: typeof argTypes = { ...argTypes }
  for (const [name, value] of Object.entries(initialArgs)) {
    if (!rows[name]?.type) rows[name] = { ...rows[name], name, type: inferType(value) }
  }

  const props: typeof argTypes = {}
  const events: typeof argTypes = {}
  for (const [name, argType] of Object.entries(rows)) {
    const category = argType.table?.category ?? (EVENT_NAME.test(name) ? 'events' : 'props')
    const group = category === 'events' ? events : props
    group[name] = { ...argType, table: { ...argType.table, category } }
  }
  return { ...props, ...events }
}
