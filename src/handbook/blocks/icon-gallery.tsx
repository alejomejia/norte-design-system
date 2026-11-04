import { type MouseEvent, useEffect, useId, useRef, useState } from 'react'

import { Icon } from '@/components/icon'
import { ICON_NAMES, ICONS } from '@/components/icon/icon.const'
import { cn } from '@/lib/utils'

/** How long a tile shows its check after a copy, as the code blocks' copy button does. */
const COPIED_DURATION = 1600

/** What a tile copies: the component for apps, or the SVG for design files and anything that isn't React. */
const FORMATS = {
  jsx: { label: 'JSX', code: (name: string) => `<Icon name="${name}" />` },
  svg: { label: 'SVG', code: (_name: string, svg: string) => svg },
} as const

type Format = keyof typeof FORMATS

/** Lucide's name for an icon (`Bot` for `agent`), to find it by what it shows. */
function lucideName(name: keyof typeof ICONS) {
  return ICONS[name].displayName ?? ''
}

/**
 * A drawn icon's SVG, ready to paste: without the classes and attributes that only make sense inside Norte, at 24px
 * with its 1.5px stroke.
 */
function cleanSvg(svg: SVGElement) {
  return svg.outerHTML
    .replaceAll(/ (class|aria-hidden|focusable|vector-effect)="[^"]*"/g, '')
    .replaceAll(/><\/(path|circle|rect|line|polyline|ellipse)>/g, ' />')
    .replaceAll(/></g, '>\n  <')
    .replace(/\n {2}<\/svg>$/, '\n</svg>')
}

/**
 * Every icon of `ICONS`, searchable by its name or Lucide's. A click copies its code, in the format picked above the
 * grid, and the tile answers with a check.
 */
export function IconGallery() {
  const [query, setQuery] = useState('')
  const [format, setFormat] = useState<Format>('jsx')
  const [copied, setCopied] = useState<string>()
  const [status, setStatus] = useState('')
  const timer = useRef(0)
  const searchId = useId()

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const search = query.trim().toLowerCase()
  const names = ICON_NAMES.filter((name) => name.includes(search) || lucideName(name).toLowerCase().includes(search))

  async function copy(name: string, event: MouseEvent<HTMLButtonElement>) {
    const svg = event.currentTarget.querySelector('svg')
    const code = FORMATS[format].code(name, svg ? cleanSvg(svg) : '')
    await navigator.clipboard.writeText(code)
    setCopied(name)
    setStatus(`Copied ${format === 'jsx' ? code : `the SVG of ${name}`}`)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setCopied(undefined)
      setStatus('')
    }, COPIED_DURATION)
  }

  return (
    <div className="sb-unstyled my-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor={searchId} className="relative flex min-w-56 flex-1 items-center">
          <span className="sr-only">Search icons</span>
          <Icon name="search" className="pointer-events-none absolute left-3 text-ink-subtle" />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder={`Search ${ICON_NAMES.length} icons`}
            className="h-10 w-full rounded-m border border-line bg-surface pr-3 pl-10 text-body-s text-ink transition-colors duration-(--duration-fast) placeholder:text-ink-subtle hover:border-line-strong focus-visible:border-transparent focus-visible:outline-2 focus-visible:outline-focus"
          />
        </label>
        <fieldset className="flex items-center gap-1 rounded-m bg-surface-muted p-1">
          <legend className="sr-only">Copy as</legend>
          <span aria-hidden="true" className="px-2 text-caption text-ink-muted">
            Copy as
          </span>
          {Object.entries(FORMATS).map(([key, { label }]) => (
            <label
              key={key}
              className="cursor-pointer rounded-s px-3 py-1 text-caption font-medium text-ink-muted transition-colors duration-(--duration-fast) hover:text-ink has-checked:bg-surface has-checked:text-ink has-checked:shadow-s has-focus-visible:outline-2 has-focus-visible:outline-focus"
            >
              <input
                type="radio"
                name="icon-format"
                value={key}
                checked={format === key}
                onChange={() => setFormat(key as Format)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </fieldset>
      </div>

      {names.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {names.map((name) => (
            <li key={name}>
              <button
                type="button"
                title={`Lucide: ${lucideName(name)}`}
                data-copied={copied === name || undefined}
                onClick={(event) => copy(name, event)}
                className="group flex w-full cursor-pointer flex-col items-center gap-3 rounded-l border border-line bg-surface px-2 pt-6 pb-4 text-ink transition-[background-color,border-color,scale] duration-(--duration-fast) hover:border-line-strong hover:bg-surface-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-97"
              >
                <span className="grid place-items-center">
                  <span className="col-start-1 row-start-1 transition-[opacity,scale,translate] duration-(--duration-spring) ease-spring group-hover:-translate-y-0.5 group-data-copied:scale-50 group-data-copied:opacity-0">
                    <Icon name={name} size="m" />
                  </span>
                  <span className="col-start-1 row-start-1 scale-50 text-success opacity-0 transition-[opacity,scale] duration-(--duration-spring) ease-spring group-data-copied:scale-100 group-data-copied:opacity-100">
                    <Icon name="approve" size="m" />
                  </span>
                </span>
                <span
                  className={cn(
                    'font-mono text-caption transition-colors duration-(--duration-fast)',
                    copied === name ? 'text-success' : 'text-ink-muted group-hover:text-ink',
                  )}
                >
                  {copied === name ? 'Copied' : name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-l border border-dashed border-line-strong p-8 text-center text-body-s text-ink-muted">
          No icon matches “{query}”. Need one that's missing? Add it to <code>ICONS</code>.
        </p>
      )}

      <p role="status" className="sr-only">
        {status}
      </p>
    </div>
  )
}
