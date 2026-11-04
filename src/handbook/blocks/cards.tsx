import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { ExternalIcon, isExternal, StorybookLink } from './docs-link'

/** A grid of cards: groups, sections, related pages. */
export function Cards({ children }: { children: ReactNode }) {
  return <div className="sb-unstyled my-6 grid gap-3 sm:grid-cols-2">{children}</div>
}

type CardProps = {
  title: string
  /** A Lucide icon, named in `.storybook/manager-styles/icons.css`. */
  icon?: string
  /**
   * Turns the card into a link: a Storybook path like `?path=/docs/elements-actions-button--docs`, or a full URL, which
   * opens in a new tab.
   */
  href?: string
  children?: ReactNode
}

/**
 * One card of `Cards`: an icon, a title and a short description. A linked card shows an arrow: inside Storybook it's
 * Storybook's link, which opens the page in its UI instead of inside the docs frame; outside, it opens in a new tab.
 */
export function Card({ title, icon, href, children }: CardProps) {
  const className = cn(
    'nt-card group relative flex flex-col gap-1 rounded-l border border-line bg-surface p-4 text-ink no-underline',
    href &&
      'transition-colors duration-(--duration-fast) hover:border-line-strong hover:bg-surface-muted/60 focus-visible:outline-2 focus-visible:outline-focus',
  )
  const content = (
    <>
      {icon && (
        <span aria-hidden="true" className="mb-3 grid size-8 place-items-center rounded-m bg-surface-muted">
          <span
            data-icon={icon}
            className="size-4 bg-current mask-(--sb-icon) mask-contain mask-center mask-no-repeat"
          />
        </span>
      )}
      <span className="text-body font-semibold">{title}</span>
      {/* MDX wraps the description in paragraphs: they take its type. */}
      {children && <div className="text-body-s text-ink-muted [&_p]:m-0">{children}</div>}
      {href && (
        <ExternalIcon className="absolute top-4 right-4 size-4 text-ink-subtle transition-colors duration-(--duration-fast) group-hover:text-ink" />
      )}
      {isExternal(href) && <span className="sr-only"> (opens in a new tab)</span>}
    </>
  )

  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    )
  }
  return href ? (
    <StorybookLink href={href} className={className}>
      {content}
    </StorybookLink>
  ) : (
    <div className={className}>{content}</div>
  )
}
