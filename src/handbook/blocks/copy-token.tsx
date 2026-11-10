import { type CSSProperties, type ReactNode } from 'react'

import { useCopy } from '@/lib/hooks'
import { cn } from '@/lib/utils'

/** Lucide's copy and check, drawn in the current color. */
export function CopyIcon({ copied, className }: { copied: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('size-3 shrink-0', className)}
    >
      {copied ? (
        <path d="M20 6 9 17l-5-5" />
      ) : (
        <>
          <rect width="14" height="14" x="8" y="8" rx="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </>
      )}
    </svg>
  )
}

type CopyTokenProps = {
  /** The token without its `--`: `color-ink`. */
  name: string
  /** What the chip shows, when it isn't the token itself. */
  label?: string
  /** What gets copied. By default the variable: `var(--color-ink)`. */
  value?: string
  /** "Copied", announced to screen readers. */
  copiedLabel?: string
  className?: string
}

/**
 * A token, as a chip that copies it. It copies the variable (`var(--color-ink)`), never the raw value, so what's pasted
 * keeps following the theme.
 */
export function CopyToken({ name, label, value, copiedLabel = 'Copied', className }: CopyTokenProps) {
  const [copied, copy] = useCopy()
  const text = value ?? `var(--${name})`

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      aria-label={`Copy ${text}`}
      className={cn(
        'group/copy inline-flex max-w-full cursor-pointer items-center gap-1 self-start rounded-s bg-surface-muted px-1 py-0.5 font-mono text-caption text-ink transition-colors duration-(--duration-fast) hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-focus',
        className,
      )}
    >
      <span className="truncate">{label ?? `--${name}`}</span>
      <CopyIcon
        copied={copied}
        className={cn(
          'transition-colors duration-(--duration-fast)',
          copied ? 'text-accent-ink' : 'text-ink-subtle group-hover/copy:text-ink',
        )}
      />
      <span className="sr-only" aria-live="polite">
        {copied ? copiedLabel : ''}
      </span>
    </button>
  )
}

/**
 * A whole surface that copies a token, like a step of a color scale: the same behavior as `CopyToken`, for blocks whose
 * look is the token itself.
 */
export function CopySurface({
  name,
  className,
  style,
  children,
}: {
  name: string
  className?: string
  /** CSS variables only, from `toCSSVars`, for runtime values like a swatch's color. */
  style?: CSSProperties
  children: (copied: boolean) => ReactNode
}) {
  const [copied, copy] = useCopy()
  const text = `var(--${name})`

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      aria-label={`Copy ${text}`}
      style={style}
      className={cn(
        'group/copy cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-focus',
        className,
      )}
    >
      {children(copied)}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Copied' : ''}
      </span>
    </button>
  )
}
