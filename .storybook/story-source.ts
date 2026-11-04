/**
 * A story's code, as the docs pages and the Code panel show it (`parameters.docs.source.transform`): without event
 * handlers and props left at their default, and, in the Code panel, with the import, so it pastes into an app as it is.
 */
import { type StoryContext } from '@storybook/react-vite'

import * as library from '@/index'

import packageJson from '../package.json'
import { getDefaults } from './default-args'

/** The spies of `fn()`, which Storybook prints as `onClick={function…}`: noise in code meant to be copied. */
const HANDLER = /\s+on[A-Z]\w*=\{(?:function\s*\w*\(\)\s*\{\}|\(\)\s*=>\s*\{\})\}/g

/** An element that carries only story helper classes (`preview.css`), opening on a line of its own. */
const HELPER_OPEN = /^(\s*)<(\w+) className="sb-[\w-]+(?: sb-[\w-]+)*">$/

/** A tag longer than this keeps one prop per line. */
const MAX_TAG_LENGTH = 80

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** How Storybook's JSX writes a prop with this value, so it can be found and left out. */
function toAttribute(name: string, value: unknown) {
  if (typeof value === 'string') return `${name}="${value}"`
  if (value === true) return name
  if (typeof value === 'number' || value === false) return `${name}={${value}}`
  return undefined
}

/** Leaves out the props of the story's component that are at their default (`default-args.ts`). */
function withoutDefaults(code: string, { argTypes }: StoryContext) {
  let result = code
  for (const [name, value] of getDefaults(argTypes)) {
    const attribute = toAttribute(name, value)
    if (attribute) result = result.replace(new RegExp(`\\s+${escapeRegExp(attribute)}(?=[\\s/>])`, 'g'), '')
  }
  return result
}

/**
 * Puts a tag's props back on its line when they fit. Storybook writes one prop per line as soon as a tag has any
 * (`<Button\n  variant="ghost"\n>`), and leaves a tag whose props all went with its `>` on a line of its own.
 */
function withShortTags(code: string) {
  return code.replace(
    /<([A-Z][\w.]*)((?:\n[ \t]+[^\n<>]+)*)\n[ \t]*(\/?)>/g,
    (tag, name: string, props: string, slash: string) => {
      const line = [
        name,
        ...props
          .split('\n')
          .map((prop) => prop.trim())
          .filter(Boolean),
      ].join(' ')
      const short = `<${line}${slash ? ' /' : ''}>`
      return short.length <= MAX_TAG_LENGTH ? short : tag
    },
  )
}

/**
 * Leaves out the elements that only lay out the canvas (`sb-row`, `sb-stack`…): an app has none of them. Their content
 * stays, one level less indented. Storybook writes an element with children over several lines, its closing tag at its
 * opening tag's indent, which tells where each one ends.
 */
function withoutHelpers(code: string) {
  const open: { indent: string; tag: string }[] = []
  const lines: string[] = []

  for (const line of code.split('\n')) {
    const helper = HELPER_OPEN.exec(line)
    const last = open.at(-1)
    if (helper) {
      open.push({ indent: helper[1] ?? '', tag: helper[2] ?? '' })
    } else if (last && line === `${last.indent}</${last.tag}>`) {
      open.pop()
    } else {
      lines.push(line.slice(Math.min(open.length * 2, line.length - line.trimStart().length)))
    }
  }
  return lines.join('\n')
}

/** Imports the package's components the code uses. */
function withImports(code: string) {
  const exported = new Set(Object.keys(library))
  const used = new Set(
    [...code.matchAll(/<([A-Z]\w*)/g)].flatMap(([, name]) => (name && exported.has(name) ? [name] : [])),
  )
  if (!used.size) return code
  return `import { ${[...used].sort().join(', ')} } from '${packageJson.name}'\n\n${code}`
}

/** `parameters.docs.source.transform`. The docs pages keep their snippets short, without the import. */
export function transformSource(code: string, context: StoryContext) {
  const clean = withShortTags(withoutDefaults(withoutHelpers(code.replace(HANDLER, '')), context))
  return context.viewMode === 'story' ? withImports(clean) : clean
}
