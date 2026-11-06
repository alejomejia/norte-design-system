'use client'

import { type ReactElement, type ReactNode, useMemo, useRef } from 'react'

import { IconButton } from '@/components/icon-button'
import { Link, type LinkProps } from '@/components/link'
import { Menu } from '@/components/menu'
import { Tooltip } from '@/components/tooltip'
import { useOverflows } from '@/lib/hooks'

import { BreadcrumbPlaceContext, useBreadcrumbLook, useBreadcrumbPlace } from './breadcrumb.hooks'
import { breadcrumbStyles } from './breadcrumb.styles'

const styles = breadcrumbStyles()

export type BreadcrumbItemProps = Omit<LinkProps, 'variant' | 'className' | 'children'> & {
  /**
   * Marks this item as the page you're on (`aria-current="page"`), shown as plain text. The last item is the current
   * page unless an item says otherwise.
   */
  current?: boolean
  /** The page's name. */
  children: ReactNode
  className?: string
}

/**
 * One page in the path: a link to it, through `href` or your router's link in `render`, or plain text for the current
 * page and for a step that has no page of its own. While its label is truncated, a tooltip shows the whole of it.
 */
export function BreadcrumbItem({ current, href, render, children, className, ...props }: BreadcrumbItemProps) {
  const { first, last } = useBreadcrumbPlace()
  const { truncate } = useBreadcrumbLook()
  const isCurrent = current ?? last
  const isLink = !isCurrent && Boolean(href || render)
  const truncates = truncate === 'all' || (truncate === 'current') === isCurrent
  const itemStyles = breadcrumbStyles({ truncates, kind: isCurrent ? 'current' : isLink ? 'link' : 'text' })
  const labelRef = useRef<HTMLSpanElement>(null)
  const truncated = useOverflows(labelRef, 'x')

  return (
    <li data-current={isCurrent ? '' : undefined} className={itemStyles.item({ className })}>
      {!first && <Separator />}
      {/* Below and from the label's start, where the eye already is; only while it's cut off, so it never repeats. */}
      <Tooltip content={children} disabled={!truncated} side="bottom" align="start">
        {isLink ? (
          <Link {...props} href={href} render={render} variant="standalone" className={itemStyles.link()}>
            <span ref={labelRef} className={itemStyles.label()}>
              {children}
            </span>
          </Link>
        ) : (
          <span ref={labelRef} aria-current={isCurrent ? 'page' : undefined} className={itemStyles.label()}>
            {children}
          </span>
        )}
      </Tooltip>
    </li>
  )
}

/** The mark between two items, hidden from screen readers: the list already says how many items there are. */
function Separator() {
  const { separator } = useBreadcrumbLook()
  return (
    <span aria-hidden="true" className={styles.separator()}>
      {separator}
    </span>
  )
}

type BreadcrumbPlaceProps = {
  first: boolean
  last: boolean
  children: ReactNode
}

/** Tells the item inside where it sits in the path. */
export function BreadcrumbPlace({ first, last, children }: BreadcrumbPlaceProps) {
  const place = useMemo(() => ({ first, last }), [first, last])
  return <BreadcrumbPlaceContext value={place}>{children}</BreadcrumbPlaceContext>
}

type BreadcrumbMoreProps = {
  /** The collapsed items, rebuilt as the menu's rows. */
  items: ReactElement<BreadcrumbItemProps>[]
  label: string
}

/** The collapsed middle of a long path: a "…" button that opens the hidden pages in a menu. */
export function BreadcrumbMore({ items, label }: BreadcrumbMoreProps) {
  return (
    <li className={styles.more()}>
      <Separator />
      <Menu>
        <Tooltip content={label}>
          <Menu.Trigger render={<IconButton icon="more" label={label} size="s" />} />
        </Tooltip>
        <Menu.Popup>
          {items.map(({ key, props: { href, render, children } }) =>
            href || render ? (
              <Menu.LinkItem key={key} href={href} render={render}>
                {children}
              </Menu.LinkItem>
            ) : (
              <Menu.Item key={key} disabled>
                {children}
              </Menu.Item>
            ),
          )}
        </Menu.Popup>
      </Menu>
    </li>
  )
}
