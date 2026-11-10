import { tv } from '@/lib/utils'

/**
 * A citation: a small number chip set into the text, raised to the top of the line so it reads as a note, not a word.
 * At rest it's quiet (muted ink on a muted fill); hovered, focused or while its preview is open it takes the accent, so
 * the chip and its card read as one. The preview grows out of the chip (from `--transform-origin`) and fades, like a
 * popover: the source's site, its title and, quoted under a rule, the passage the agent used.
 */
export const citationStyles = tv({
  slots: {
    marker: [
      'inline-flex h-4 min-w-4 cursor-pointer items-center justify-center rounded-s px-1 align-text-top',
      'bg-surface-muted text-caption-s font-medium text-ink-muted tabular-nums no-underline',
      'transition-colors duration-(--duration-fast) ease-standard',
      'hover:bg-accent-subtle hover:text-accent-ink data-popup-open:bg-accent-subtle data-popup-open:text-accent-ink',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    ],
    positioner: 'z-50 outline-none',
    popup: [
      'flex w-80 max-w-(--available-width) flex-col gap-3 rounded-l border border-line bg-surface p-4 shadow-m',
      'origin-(--transform-origin) text-body-s text-ink outline-none',
      'transition-[opacity,scale] duration-(--duration-fast) ease-standard',
      'data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0',
    ],
    header: 'flex flex-col gap-1',
    site: 'flex min-w-0 items-center gap-2 text-caption text-ink-subtle',
    domain: 'truncate',
    title: 'line-clamp-2 font-semibold',
    excerpt: 'line-clamp-3 border-l-2 border-line pl-3 text-ink-muted',
  },
})

/** A source's site icon, 16px like an icon: the favicon, or the site's first letter on a quiet tile, or a file. */
export const citationFaviconStyles = tv({
  slots: {
    favicon: 'size-4 shrink-0 rounded-s object-contain',
    // The site's first letter, when it has no favicon or it doesn't load.
    initial:
      'grid size-4 shrink-0 place-items-center rounded-s bg-surface-muted text-caption-s font-semibold text-ink-muted uppercase',
    // A page in the app has no site.
    file: 'text-ink-subtle',
  },
})
