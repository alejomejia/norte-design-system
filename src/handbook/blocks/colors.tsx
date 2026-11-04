import { token } from '@/handbook/tokens'
import { cn, contrastRatio, oklchToLinearRgb, parseOklch, toCSSVars, toHex } from '@/lib/utils'

import { CopyIcon, CopySurface, CopyToken } from './copy-token'
import { Meta } from './token-label'

type Role = { name: string; text?: boolean }

/** The roles by purpose, in the order a screen is built: the page, its text, its lines, then the accent and states. */
const ROLE_GROUPS = {
  surfaces: [{ name: 'canvas' }, { name: 'surface' }, { name: 'surface-muted' }, { name: 'surface-strong' }],
  text: [
    { name: 'ink', text: true },
    { name: 'ink-muted', text: true },
    { name: 'ink-subtle', text: true },
    { name: 'accent-ink', text: true },
  ],
  lines: [{ name: 'line' }, { name: 'line-strong' }, { name: 'focus' }],
  accent: [{ name: 'accent' }, { name: 'accent-hover' }, { name: 'accent-subtle' }, { name: 'on-accent', text: true }],
  status: [
    { name: 'success', text: true },
    { name: 'warning', text: true },
    { name: 'danger', text: true },
    { name: 'success-subtle' },
    { name: 'warning-subtle' },
    { name: 'danger-subtle' },
    { name: 'danger-muted' },
  ],
} satisfies Record<string, Role[]>

function rgb(name: string) {
  return oklchToLinearRgb(parseOklch(token(name).value))
}

/** Whether white reads better than ink on a color: the text printed on a swatch follows it. */
function isDark(name: string) {
  return contrastRatio(rgb(name), rgb('color-white')) >= 4.5
}

/** `ink-muted` → `Ink muted`. */
function toLabel(name: string) {
  const words = name.replace(/-/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * One role as a card: the color with its value printed on it (and, for text, its contrast where it's read), then its
 * name, its token, what it's for and the primitive behind it.
 */
function RoleCard({ role }: { role: Role }) {
  const name = `color-${role.name}`
  const { reference, note } = token(name)
  // `on-accent` is read on the accent, every other text role on the page.
  const ratio = role.text
    ? contrastRatio(rgb(name), rgb(role.name === 'on-accent' ? 'color-accent' : 'color-canvas'))
    : null

  return (
    <li className="flex flex-col overflow-hidden rounded-l border border-line bg-surface">
      <div
        className={cn(
          'flex h-24 items-end justify-between gap-2 bg-(--swatch) p-3 font-mono text-caption',
          isDark(name) ? 'text-white' : 'text-neutral-900',
        )}
        style={toCSSVars({ swatch: `var(--${name})` })}
      >
        <span>{toHex(rgb(name))}</span>
        {ratio !== null && <span title="Contrast where it's read">{ratio.toFixed(1)}:1</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-line p-3">
        <span className="text-body-s font-medium text-ink">{toLabel(role.name)}</span>
        <CopyToken name={name} />
        {note && <span className="text-caption text-ink-muted">{note}</span>}
        {reference && <Meta>{reference.replace('color-', '')}</Meta>}
      </div>
    </li>
  )
}

/** A group of color roles as cards. Components read these, never the scales. */
export function ColorRoles({ group }: { group: keyof typeof ROLE_GROUPS }) {
  return (
    <ul className="sb-unstyled my-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {ROLE_GROUPS[group].map((role) => (
        <RoleCard key={role.name} role={role} />
      ))}
    </ul>
  )
}

/**
 * A primitive scale as one strip, lightest first. Each step shows its name and hex, and copies its variable on a click.
 */
export function ColorScale({
  name,
  steps,
  className,
}: {
  name: string
  steps: (number | string)[]
  className?: string
}) {
  return (
    <div className={cn('sb-unstyled my-6 flex flex-col gap-2', className)}>
      <span className="flex items-baseline gap-2">
        <span className="text-body-s font-medium text-ink">{toLabel(name)}</span>
        <Meta>{`--color-${name}-{step}`}</Meta>
      </span>
      <ol className="flex overflow-x-auto rounded-l inset-ring inset-ring-neutral-950/8">
        {steps.map((step) => {
          const tokenName = `color-${name}-${step}`
          return (
            <li key={step} className="min-w-16 flex-1">
              <CopySurface
                name={tokenName}
                style={toCSSVars({ swatch: `var(--${tokenName})` })}
                className={cn(
                  'flex h-24 w-full flex-col justify-between bg-(--swatch) p-2 font-mono text-caption',
                  isDark(tokenName) ? 'text-white' : 'text-neutral-900',
                )}
              >
                {(copied) => (
                  <>
                    <span className="flex items-center justify-between gap-1">
                      <span className="font-medium">{step}</span>
                      <CopyIcon
                        copied={copied}
                        className={cn(
                          'transition-opacity duration-(--duration-fast)',
                          !copied && 'opacity-0 group-hover/copy:opacity-100 group-focus-visible/copy:opacity-100',
                        )}
                      />
                    </span>
                    <span className="truncate opacity-80">{toHex(rgb(tokenName))}</span>
                  </>
                )}
              </CopySurface>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
