import { contrastRatio, oklchToLinearRgb, parseOklch, toHex, token } from '@/handbook/tokens'

import { Code, Meta } from './token-label'

type Role = { name: string; utility: string; text?: boolean }

/** The roles by purpose, in the order a screen is built: the page, its text, its lines, then the accent and states. */
const ROLE_GROUPS: { title: string; roles: Role[] }[] = [
  {
    title: 'Surfaces',
    roles: [
      { name: 'canvas', utility: 'bg-canvas' },
      { name: 'surface', utility: 'bg-surface' },
      { name: 'surface-muted', utility: 'bg-surface-muted' },
    ],
  },
  {
    title: 'Text',
    roles: [
      { name: 'ink', utility: 'text-ink', text: true },
      { name: 'ink-muted', utility: 'text-ink-muted', text: true },
      { name: 'ink-subtle', utility: 'text-ink-subtle', text: true },
      { name: 'accent-ink', utility: 'text-accent-ink', text: true },
    ],
  },
  {
    title: 'Lines',
    roles: [
      { name: 'line', utility: 'border-line' },
      { name: 'line-strong', utility: 'border-line-strong' },
      { name: 'focus', utility: 'outline-focus' },
    ],
  },
  {
    title: 'Accent',
    roles: [
      { name: 'accent', utility: 'bg-accent' },
      { name: 'accent-hover', utility: 'bg-accent-hover' },
      { name: 'accent-subtle', utility: 'bg-accent-subtle' },
      { name: 'on-accent', utility: 'text-on-accent', text: true },
    ],
  },
  {
    title: 'Status',
    roles: [
      { name: 'success', utility: 'text-success', text: true },
      { name: 'success-subtle', utility: 'bg-success-subtle' },
      { name: 'warning', utility: 'text-warning', text: true },
      { name: 'warning-subtle', utility: 'bg-warning-subtle' },
      { name: 'danger', utility: 'text-danger', text: true },
      { name: 'danger-subtle', utility: 'bg-danger-subtle' },
    ],
  },
]

function rgb(name: string) {
  return oklchToLinearRgb(parseOklch(token(name).value))
}

/** A color chip. A hairline keeps the white ones visible on the white page. */
function Chip({ name, className = 'size-10' }: { name: string; className?: string }) {
  return (
    <span
      className={`${className} shrink-0 rounded-m shadow-[inset_0_0_0_1px_oklch(0_0_0/8%)]`}
      style={{ backgroundColor: `var(--${name})` }}
    />
  )
}

/** One role: its chip, its class, what it's for, the primitive behind it and, for text, its contrast on the page. */
function RoleRow({ role }: { role: Role }) {
  const { reference, note, value } = token(`color-${role.name}`)
  // `on-accent` is read on the accent, every other text role on the page.
  const background = role.name === 'on-accent' ? 'color-accent' : 'color-canvas'
  const ratio = role.text ? contrastRatio(rgb(`color-${role.name}`), rgb(background)) : null

  return (
    <li className="flex items-center gap-4 py-3">
      <Chip name={`color-${role.name}`} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Code>{role.utility}</Code>
        {note && <span className="text-body-s text-ink-muted">{note}</span>}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
        <Meta>{reference?.replace('color-', '') ?? value}</Meta>
        <Meta>
          {toHex(rgb(`color-${role.name}`))}
          {ratio !== null && ` · ${ratio.toFixed(1)}:1`}
        </Meta>
      </div>
    </li>
  )
}

/** The color roles, grouped by purpose. Components read these, never the scales below. */
export function ColorRoles() {
  return (
    <div className="sb-unstyled my-6 flex flex-col gap-8">
      {ROLE_GROUPS.map(({ title, roles }) => (
        <section key={title}>
          <h4 className="mb-1 text-caption font-medium tracking-wide text-ink-subtle uppercase">{title}</h4>
          <ul className="divide-y divide-line border-y border-line">
            {roles.map((role) => (
              <RoleRow key={role.name} role={role} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

/** A primitive scale, light to dark, with each step's hex. The label switches to white where the chip gets dark. */
export function ColorScale({ name, steps }: { name: string; steps: (number | string)[] }) {
  return (
    <div className="sb-unstyled mb-6">
      <Code>{name}</Code>
      <ol className="mt-2 grid grid-cols-6 gap-1 sm:grid-cols-12">
        {steps.map((step) => {
          const tokenName = `color-${name}-${step}`
          const color = rgb(tokenName)
          const light = contrastRatio(color, rgb('color-white')) >= 4.5
          return (
            <li
              key={step}
              title={toHex(color)}
              className="flex h-16 flex-col justify-end rounded-m p-2 shadow-[inset_0_0_0_1px_oklch(0_0_0/8%)]"
              style={{ backgroundColor: `var(--${tokenName})` }}
            >
              <span className={`font-mono text-caption ${light ? 'text-white' : 'text-neutral-900'}`}>{step}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
