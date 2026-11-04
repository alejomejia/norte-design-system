import { AnchorMdx } from '@storybook/addon-docs/blocks'
import { type ComponentProps, type ReactNode } from 'react'

/** Storybook's MDX link. Its types list only `href` and `target`, but it passes every other prop on to the `<a>`. */
export const StorybookLink = AnchorMdx as unknown as (
  props: Partial<ComponentProps<typeof AnchorMdx>> & { className?: string; children: ReactNode },
) => ReactNode

/** Whether a link leaves Storybook: a full URL to another site. */
export function isExternal(href: string | undefined): href is string {
  return href !== undefined && /^https?:\/\//.test(href)
}

/** Lucide's arrow-up-right, the mark of a link that opens in a new tab. */
export function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M7 7h10v10M7 17 17 7" />
    </svg>
  )
}

type DocsLinkProps = {
  href?: string
  className?: string
  children: ReactNode
  /** Announced after an external link's text, which the arrow only shows. */
  newTabLabel?: string
}

/**
 * Every link of the docs pages (`docs.components.a` in `.storybook/preview.ts`). One that leaves Storybook opens in a
 * new tab, so the handbook stays where the reader left it, with an arrow that says so and the same in words for screen
 * readers. Links inside Storybook (`?path=…`, `#heading`) stay Storybook's, which opens them in its UI.
 */
export function DocsLink({ href, className, children, newTabLabel = '(opens in a new tab)' }: DocsLinkProps) {
  if (!isExternal(href)) {
    return (
      <StorybookLink href={href} className={className}>
        {children}
      </StorybookLink>
    )
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
      <ExternalIcon className="ml-0.5 inline-block size-3 align-baseline" />
      <span className="sr-only"> {newTabLabel}</span>
    </a>
  )
}
