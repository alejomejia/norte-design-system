import { tv } from '@/lib/utils'

/**
 * The sign-in page: the form's column, and on wide screens (1024px and up) the brand panel beside it, inset 16px from
 * the window's edges. The form is 360px at most and sits in the middle of whatever height is left under the logo; on a
 * phone the column keeps 24px at its sides, 40px from 640px up. As the page opens, the first step's rows rise in one
 * after another; between steps, Motion slides the old one out and the new one in.
 */
export const signInStyles = tv({
  slots: {
    page: 'grid min-h-dvh bg-canvas text-ink lg:grid-cols-2',
    main: 'flex min-w-0 flex-col gap-10 p-6 sm:px-10 sm:py-8',
    body: 'flex flex-1 items-center justify-center',
    column: 'w-full max-w-90',
    footer: 'text-caption text-ink-subtle',
    // Each row of the step the page opens on, rising in after the one before.
    rise: 'animate-rise [animation-delay:var(--rise-delay)] motion-reduce:animate-none',
  },
})

/** A step of the form: its title and lead, the fields and the button, then a line that offers another way. */
export const signInStepStyles = tv({
  slots: {
    root: 'flex flex-col gap-8',
    intro: 'flex flex-col gap-2',
    // Focused when a person reaches the last step, so screen readers read it: no ring for a heading nobody tabs to.
    title: 'text-heading-m font-semibold text-balance text-ink outline-none',
    lead: 'text-body-s text-pretty text-ink-muted',
    // The email a code went to, whole: an address is never cut.
    email: 'font-medium break-all text-ink',
    form: 'flex flex-col gap-4',
    submit: 'w-full',
    note: 'text-body-s text-pretty text-ink-muted',
    fine: 'text-caption text-pretty text-ink-subtle',
    status: 'flex items-center gap-2 text-body-s text-ink-muted',
  },
})

/** Every cell of the panel's bento: a card that can shrink with its row, lifted a little off the map. */
const CELL = 'min-h-0 shadow-s'

/**
 * The brand panel: a soft blue wash under the Introduction's topographic map (its lines alone, faint), with the pitch
 * at the top and a bento of run #128 filling the rest: rows that share the height left, so nothing is cut off and
 * nothing scrolls on a short laptop. The layout follows the panel's own width (a container query), not the window's.
 *
 * Cells come in three sizes. Narrower panels (1024 to 1439px windows) have three columns: three small stats (tokens,
 * cost, tool calls) over the run, which spans the width. From 576px inside (1440px windows), six columns: the stats
 * take two each across the top; under them the run is the big cell (four columns), beside the approval it waits for
 * (who the email goes to, two columns).
 * The approval is as tall as its list, not its row, and gives up height only when the row is shorter.
 *
 * The run's feed anchors to the bottom: new work pushes the older up, where it fades out. It glides there instead of
 * jumping (`useGlideOnGrow`), and each new block (the agent's plan, a tool call, the summary) fades and rises in.
 */
export const signInPanelStyles = tv({
  slots: {
    // The window's height, never more: the bento gives up height on a short screen rather than making the page scroll.
    root: 'hidden min-w-0 p-4 lg:sticky lg:top-0 lg:flex lg:h-dvh',
    surface: [
      '@container relative isolate flex flex-1 flex-col gap-8 overflow-hidden rounded-xl p-8 xl:p-10',
      'bg-linear-to-b from-accent-subtle to-surface-muted',
    ],
    // The topographic map's lines, at a fifth: a texture you notice, quiet behind the pitch and the cards.
    texture: 'opacity-20',
    intro: 'flex max-w-120 shrink-0 flex-col gap-2 @xl:gap-3',
    title: 'text-heading-m font-semibold text-balance text-ink @xl:text-heading-l',
    lead: 'text-body-s text-pretty text-ink-muted @xl:text-body',
    bento: 'grid min-h-0 flex-1 grid-cols-3 grid-rows-[auto_minmax(0,1fr)] gap-3 @xl:grid-cols-6',
    stat: [CELL, '@xl:col-span-2'],
    run: [CELL, 'col-span-3 @xl:col-span-4'],
    feed: 'flex min-h-0 flex-1 flex-col justify-end overflow-hidden mask-t-from-80%',
    thread: 'flex flex-col gap-6',
    // A block that just arrived in the feed: it fades in and rises the last 4px while the feed glides up under it.
    arrive: 'animate-rise motion-reduce:animate-none',
    work: 'flex flex-col gap-3',
    approval: [CELL, 'hidden max-h-full @xl:col-span-2 @xl:flex @xl:self-start'],
    approvalBody: 'flex min-h-0 flex-col gap-4',
    people: 'flex min-h-0 flex-col gap-2 overflow-hidden',
    person: 'flex min-w-0 items-center gap-2 text-body-s text-ink',
    name: 'truncate',
    badge: 'self-start',
  },
})
