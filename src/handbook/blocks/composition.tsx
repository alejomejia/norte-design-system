import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** The layers of the example, each with its marker's look: darker the higher the layer. */
const LAYERS = {
  ai: { name: 'AI', marker: 'bg-neutral-900 text-white' },
  component: { name: 'Component', marker: 'bg-accent text-on-accent' },
  element: { name: 'Element', marker: 'bg-accent-subtle text-accent-ink inset-ring inset-ring-accent/30' },
} as const

type Layer = keyof typeof LAYERS

/** The pieces of the example, in the order of their markers. */
const PIECES: { layer: Layer; name: string; description: string }[] = [
  {
    layer: 'ai',
    name: 'Approval request',
    description: 'Knows what an approval is: who asks, for what, and what happens next.',
  },
  { layer: 'component', name: 'Card', description: 'A surface that groups content. It knows nothing about agents.' },
  { layer: 'element', name: 'Avatar', description: 'Who is asking: here, an agent.' },
  { layer: 'element', name: 'Badge', description: 'The state, in a tone: needs review.' },
  { layer: 'element', name: 'Button', description: 'The two answers: one secondary, one primary.' },
]

/** A numbered marker on a piece of the example, in its layer's look. */
function Marker({ index, className }: { index: number; className?: string }) {
  const piece = PIECES[index - 1]
  return (
    <span
      className={cn(
        'absolute grid size-4 place-items-center rounded-full font-mono text-caption leading-none',
        piece && LAYERS[piece.layer].marker,
        className,
      )}
    >
      {index}
    </span>
  )
}

/** A mock of an element, drawn with tokens: the real ones arrive with their components. */
function Piece({ index, className, children }: { index: number; className?: string; children: ReactNode }) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      {children}
      <Marker index={index} className="-top-2 -right-2" />
    </span>
  )
}

/**
 * An approval request taken apart: the AI piece, the component inside it and the elements inside that, each numbered
 * and listed under it by layer. A picture of the composition, not the real components, so it's hidden from screen
 * readers and the list says the same in words.
 */
export function CompositionExample() {
  return (
    <figure className="sb-unstyled my-6 overflow-hidden rounded-l border border-line">
      <div aria-hidden="true" className="bg-surface-muted/60 px-6 py-12">
        <div className="relative mx-auto max-w-md rounded-xl outline-1 outline-offset-8 outline-neutral-400 outline-dashed">
          <Marker index={1} className="-top-4 -left-4" />
          <div className="relative rounded-l border border-line bg-surface p-4 shadow-s">
            <Marker index={2} className="-top-2 -right-2" />
            <div className="flex items-center gap-3">
              <Piece index={3}>
                <span className="grid size-8 place-items-center rounded-full bg-accent-subtle text-caption font-semibold text-accent-ink">
                  RA
                </span>
              </Piece>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-body-s font-medium text-ink">Research agent</span>
                <span className="text-caption text-ink-subtle">2 minutes ago</span>
              </span>
              <Piece index={4}>
                <span className="rounded-s bg-warning-subtle px-2 text-caption font-medium text-warning">
                  Needs review
                </span>
              </Piece>
            </div>
            <p className="mt-3 text-body-s text-ink">Send the follow-up email to 214 contacts in “Q3 leads”?</p>
            <p className="mt-1 text-caption text-ink-muted">Drafted from yesterday's call notes.</p>
            <div className="mt-4 flex justify-end gap-2">
              <span className="inline-flex h-8 items-center rounded-m border border-line-strong px-3 text-body-s font-medium text-ink">
                Reject
              </span>
              <Piece index={5}>
                <span className="inline-flex h-8 items-center rounded-m bg-accent px-3 text-body-s font-medium text-on-accent">
                  Approve
                </span>
              </Piece>
            </div>
          </div>
        </div>
      </div>
      <figcaption>
        <ol className="divide-y divide-line border-t border-line">
          {PIECES.map(({ layer, name, description }, index) => (
            <li key={name} className="flex items-start gap-3 px-6 py-3">
              <span className="relative mt-0.5 size-4 shrink-0">
                <Marker index={index + 1} className="inset-0" />
              </span>
              <span className="flex flex-col gap-0.5 md:flex-row md:gap-2">
                <span className="text-body-s font-medium text-ink">
                  {LAYERS[layer].name} · {name}
                </span>
                <span className="text-body-s text-ink-muted">{description}</span>
              </span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  )
}
