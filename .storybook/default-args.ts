/**
 * Default args. Every control starts at the value the component uses on its own (its prop's default), so a segmented
 * control has an option selected and a boolean shows its switch instead of a "Set boolean" button. The story renders
 * the same either way, and a story's code leaves those values out again (`story-source.ts`): nobody writes a prop
 * that's at its default.
 */
import { type Args, type ArgTypes, type Preview } from '@storybook/react-vite'

type ArgsEnhancer = NonNullable<Preview['argsEnhancers']>[number]

/** The defaults a control can show: a literal, or a list of them. */
type Literal = string | number | boolean | Literal[]

function isLiteral(value: unknown): value is Literal {
  if (Array.isArray(value)) return value.every(isLiteral)
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
}

/**
 * Reads a default as docgen writes it. `react-docgen-typescript` gives the source text of the default: a JSON literal
 * (`false`, `3`, `["a", "b"]`), a string with or without its quotes (`'primary'`, `primary`), or an expression, like the
 * name of a constant, which isn't a value. A bare word only counts as a string when it's one of the prop's options.
 */
function parseLiteral(summary: string, options: readonly unknown[] | undefined): Literal | undefined {
  try {
    const value: unknown = JSON.parse(summary)
    return isLiteral(value) ? value : undefined
  } catch {
    const quoted = summary.match(/^'(.*)'$/)?.[1]
    if (quoted !== undefined) return quoted
    return options?.includes(summary) ? summary : undefined
  }
}

/** The props with a literal default, and that default. */
export function getDefaults(argTypes: ArgTypes) {
  const defaults = new Map<string, Literal>()
  for (const [name, argType] of Object.entries(argTypes)) {
    const summary = argType.table?.defaultValue?.summary
    if (typeof summary !== 'string' || !summary) continue

    const value = parseLiteral(summary, argType.options)
    if (value !== undefined) defaults.set(name, value)
  }
  return defaults
}

/** Starts each prop with no value at its default. */
export function addDefaultArgs({ argTypes, initialArgs }: Parameters<ArgsEnhancer>[0]) {
  const args: Args = {}
  for (const [name, value] of getDefaults(argTypes)) {
    if (initialArgs[name] === undefined) args[name] = value
  }
  return args
}
