import { tv } from '@/lib/utils'

/**
 * The run view: the sidebar, a header across the page, the conversation, and the run's panel (results, details, logs).
 *
 * - **From 1024px** it's an app: the window's height, never more. The header spans the conversation and the panel (384px,
 *   400px from 1280px: as narrow as the results table allows), and each of those scrolls on its own; the prompt stays under the conversation.
 * - **Below 1024px** the panel moves under the conversation and the page scrolls as one, the header pinned to the top.
 * - **The sidebar** is the window's height beside it all from 768px: icons only up to 1280px, names from there. Below
 *   768px it leaves, and the search button in the header (the command menu) takes over the navigation.
 *
 * The conversation and the prompt keep a 720px reading column, centered in whatever room they have.
 */
export const runViewStyles = tv({
  slots: {
    page: 'flex min-h-dvh bg-canvas text-ink lg:h-dvh lg:overflow-hidden',
    sidebar: 'sticky top-0 hidden h-dvh md:flex',
    shell: [
      'grid min-w-0 flex-1 grid-cols-1 content-start',
      'lg:grid-cols-[minmax(0,1fr)_24rem] lg:grid-rows-[auto_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_25rem]',
    ],
    main: 'flex min-w-0 flex-col lg:min-h-0 lg:border-r lg:border-line',
    runBar: 'border-b border-line',
    runBarInner: 'mx-auto flex h-10 w-full max-w-180 items-center px-4 sm:px-6',
    runStatus: 'flex-1',
    // Positioned, like the panel: absolute text inside (screen-reader-only labels) stays in the scroller, instead of
    // escaping it and making the window scroll.
    scroller: 'relative lg:min-h-0 lg:flex-1 lg:overflow-y-auto',
    composer: 'mx-auto flex w-full max-w-180 shrink-0 flex-col gap-3 px-4 pb-4 sm:px-6 sm:pb-6',
    panel: 'relative min-w-0 border-t border-line lg:min-h-0 lg:overflow-y-auto lg:border-t-0',
  },
})

/**
 * The header: where the run sits (a breadcrumb that folds its middle below 640px) and its state, then Share, the run's
 * menu and search. Below 640px Share and search are icon buttons, and the state is left to the run's own bar.
 */
export const runViewHeaderStyles = tv({
  slots: {
    root: [
      'sticky top-0 z-10 flex h-14 min-w-0 items-center gap-3 border-b border-line bg-canvas px-4 sm:px-6',
      'lg:static lg:col-span-2',
    ],
    // The breadcrumb says where the page is; screen readers also get it as the page's heading.
    title: 'sr-only',
    where: 'flex min-w-0 flex-1 items-center gap-3',
    badge: 'shrink-0 max-sm:hidden',
    actions: 'flex shrink-0 items-center gap-2',
    wide: 'max-sm:hidden',
    narrow: 'sm:hidden',
    search: 'w-48 max-md:hidden',
    searchIcon: 'md:hidden',
  },
})

/** The share dialog: who to invite, then who has access, one person a row. */
export const runViewShareStyles = tv({
  slots: {
    body: 'flex flex-col gap-6',
    invite: 'flex flex-col gap-3',
    inviteButton: 'self-end',
    people: 'flex flex-col gap-3',
    peopleTitle: 'text-body-s font-medium text-ink',
    list: 'flex flex-col gap-3',
    person: 'flex min-w-0 items-center gap-3',
    who: 'flex min-w-0 flex-1 flex-col',
    name: 'truncate text-body-s font-medium text-ink',
    email: 'truncate text-caption text-ink-muted',
    role: 'shrink-0 text-body-s text-ink-muted',
  },
})

/**
 * The conversation: Sofía's ask, the agent's answer (its plan, reasoning, tool calls, the timeout, the summary and its
 * sources) and the approval it waits on, then any follow-ups. Blocks inside the answer sit 16px apart; turns 32px.
 * The answer's blocks rise one by one as the agent gets to them.
 */
export const runViewConversationStyles = tv({
  slots: {
    thread: 'mx-auto flex w-full max-w-180 flex-col gap-8 px-4 py-6 sm:px-6 lg:py-8',
    // Each block mounts when the agent gets to it (see `useOpening`), and rises as it does.
    answer: 'flex flex-col gap-4 *:animate-rise motion-reduce:*:animate-none',
    calls: 'flex flex-wrap items-center gap-2 *:animate-rise motion-reduce:*:animate-none',
    more: 'text-caption text-ink-subtle',
    email: 'flex flex-col gap-3',
    emailList: 'list-disc pl-6',
    recipients: 'text-ink-muted',
  },
})

/**
 * The run's panel: Results, Details and Logs. From 1024px its tabs stay at the top while the panel scrolls under them.
 * Details stacks the stats, two charts and the settings, 32px apart, each under a small heading.
 */
export const runViewPanelStyles = tv({
  slots: {
    tabs: 'gap-0',
    bar: 'bg-canvas px-4 pt-2 sm:px-6 lg:sticky lg:top-0 lg:z-10 lg:px-4 xl:px-6',
    tabPanel: 'flex flex-col gap-8 p-4 sm:p-6 lg:p-4 xl:p-6',
    section: 'flex flex-col gap-3',
    heading: 'text-body-s font-medium text-ink',
    lead: 'text-caption text-ink-muted',
    note: 'text-caption text-pretty text-ink-subtle',
    table: 'w-full',
    // The citation sits close to the badge it backs: 4px, which also lets the table fit a 375px phone.
    change: 'flex items-center gap-1',
    selection: 'flex min-h-8 items-center justify-between gap-3 text-body-s text-ink-muted',
    cost: 'grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-2 text-right text-body-s tabular-nums',
    // A step's three cells, in the grid's row: the wrapper only groups them for the list.
    costRow: 'contents',
    costStep: 'text-left text-ink-muted',
    costTotal: 'border-t border-line pt-2 font-medium',
    chart: 'h-48',
    fields: 'flex flex-col gap-4',
  },
})
