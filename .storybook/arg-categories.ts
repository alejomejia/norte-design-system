/**
 * Groups the props table into sections, like the Controls panel's bands (`manager-styles/controls.css`): Props, then
 * Events. Vue's docgen sorts props, slots and events on its own; React's has no groups, so a prop named `on…` is an
 * event and the rest are props. A story can still set its own `table.category`.
 */
import { type Preview } from '@storybook/react-vite'

type ArgTypesEnhancer = NonNullable<Preview['argTypesEnhancers']>[number]

/** An event handler's name: `onClick`, `onValueChange`. */
const EVENT_NAME = /^on[A-Z]/

/** Puts every arg without a category under `props` or `events`. Storybook writes the names; the table capitalizes them. */
export function addArgCategories({ argTypes }: Parameters<ArgTypesEnhancer>[0]) {
  const enhanced: typeof argTypes = {}
  for (const [name, argType] of Object.entries(argTypes)) {
    const category = argType.table?.category ?? (EVENT_NAME.test(name) ? 'events' : 'props')
    enhanced[name] = { ...argType, table: { ...argType.table, category } }
  }
  return enhanced
}
