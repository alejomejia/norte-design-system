'use client'

import { useRender } from '@base-ui/react/use-render'
import { isValidElement, type ReactNode } from 'react'

import { Icon } from '@/components/icon'
import { isExternalUrl } from '@/lib/utils'

import { LINK_NEW_TAB_REL, type LINK_VARIANTS } from './link.const'
import { link } from './link.styles'

export type LinkProps = Omit<useRender.ComponentProps<'a'>, 'className' | 'children'> & {
  /**
   * Where it sits: `inline` inside a sentence, underlined at rest, its line turning solid on hover; `standalone` on its
   * own (a menu, a list of sources, "View all runs"), in medium weight, with an underline that draws in on hover.
   */
  variant?: (typeof LINK_VARIANTS)[number]
  /**
   * Opens the page in a new tab, with an arrow that says so and `newTabLabel` for screen readers. On by default for
   * links to other sites (`https://…`), off for the app's own pages; set it to force either.
   */
  newTab?: boolean
  /** Announced after the text of a link that opens a new tab, which the arrow only shows. */
  newTabLabel?: string
  /**
   * Your router's link, so navigation stays client-side and its options (prefetching, scroll, replace) stay yours. It
   * gets Norte's classes, children and the rest of the props: `render={<NextLink href="/runs" prefetch={false} />}`.
   */
  render?: useRender.ComponentProps<'a'>['render']
  /** The link's text. */
  children: ReactNode
  className?: string
}

/**
 * Takes the reader to another page. A native `<a>`, or your router's link through `render`, so it works in any React
 * app. Links to other sites open in a new tab and say so.
 *
 * @example
 * <p>
 *   The agent compared <Link render={<NextLink href="/runs/127" prefetch={false} />}>last week's run</Link> with this one.
 * </p>
 */
export function Link({
  variant = 'inline',
  newTab,
  newTabLabel = '(opens in a new tab)',
  render,
  rel,
  className,
  children,
  ref,
  ...props
}: LinkProps) {
  // The href may live on the router's link (its types require it there) rather than on this one.
  const href = props.href ?? hrefOf(render)
  const opensNewTab = newTab ?? isExternalUrl(href)
  const styles = link({ variant })

  return useRender({
    defaultTagName: 'a',
    render,
    ref,
    props: {
      ...props,
      ...(opensNewTab ? { target: '_blank', rel: rel ? `${LINK_NEW_TAB_REL} ${rel}` : LINK_NEW_TAB_REL } : { rel }),
      className: styles.root({ className }),
      children: (
        <>
          <span className={styles.label()}>{children}</span>
          {opensNewTab && (
            <>
              <Icon name="external" className={styles.icon()} />
              <span className="sr-only"> {newTabLabel}</span>
            </>
          )}
        </>
      ),
    },
  })
}

/** The `href` a router's link was given, when `render` is an element with a string one. */
function hrefOf(render: LinkProps['render']): string | undefined {
  if (!isValidElement<{ href?: unknown }>(render)) return undefined
  return typeof render.props.href === 'string' ? render.props.href : undefined
}
