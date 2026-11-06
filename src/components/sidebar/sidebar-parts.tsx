'use client'

import { useRender } from '@base-ui/react/use-render'
import { type ComponentProps, type MouseEvent, type ReactNode, useId } from 'react'

import { Badge } from '@/components/badge'
import { Icon, type IconName } from '@/components/icon'
import { Tooltip } from '@/components/tooltip'

import { type SIDEBAR_COUNT_TONES, SIDEBAR_LABELS } from './sidebar.const'
import { useSidebar } from './sidebar.hooks'
import { sidebarRowStyles, sidebarStyles } from './sidebar.styles'

const styles = sidebarStyles()

export type SidebarHeaderProps = Omit<ComponentProps<'div'>, 'className'> & { className?: string }

/** The top of the sidebar: the logo and the workspace switcher. */
export function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  return <div {...props} className={styles.header({ className })} />
}

export type SidebarNavProps = Omit<ComponentProps<'nav'>, 'className'> & {
  /** The navigation's name, which screen readers announce with the landmark. */
  label?: string
  className?: string
}

/** The pages, in sections: a `nav` landmark that scrolls on its own when it's taller than the room it has. */
export function SidebarNav({ label = SIDEBAR_LABELS.nav, className, ...props }: SidebarNavProps) {
  return <nav {...props} aria-label={label} className={styles.nav({ className })} />
}

export type SidebarSectionProps = Omit<ComponentProps<'div'>, 'className'> & {
  /** A heading for the section, which also names its list. The first section usually has none. */
  label?: string
  /** Its items. */
  children: ReactNode
  className?: string
}

/** A group of items, under an optional heading. Collapsed, the heading becomes a hairline. */
export function SidebarSection({ label, children, className, ...props }: SidebarSectionProps) {
  const labelId = useId()
  return (
    <div {...props} className={styles.section({ className })}>
      {label && (
        <div id={labelId} className={styles.sectionLabel()}>
          <span className={styles.sectionLabelText()}>{label}</span>
        </div>
      )}
      <ul aria-labelledby={label ? labelId : undefined} className={styles.list()}>
        {children}
      </ul>
    </div>
  )
}

export type SidebarItemProps = Omit<useRender.ComponentProps<'a'>, 'className' | 'children'> & {
  /** The page's icon, by its name in Norte's set: all that shows when the sidebar is collapsed. */
  icon: IconName
  /** The page that's open: marked with `aria-current="page"`, filled and in medium weight. */
  current?: boolean
  /** A number after the label, like approvals waiting. Collapsed, it becomes a dot on the icon. */
  count?: number
  /** What the count means, heard after the label and shown in the collapsed tooltip: "3 waiting". The number by default. */
  countLabel?: string
  /** `neutral` for totals, `accent` for what's waiting for someone. */
  countTone?: (typeof SIDEBAR_COUNT_TONES)[number]
  /** Your router's link, so navigation stays client-side: `render={<NextLink href="/runs" />}`. */
  render?: useRender.ComponentProps<'a'>['render']
  /** The page's name. */
  children: ReactNode
  className?: string
}

/** A link to a page. Collapsed, only its icon shows, and its name appears in a tooltip on hover and focus. */
export function SidebarItem({
  icon,
  current = false,
  count,
  countLabel,
  countTone = 'neutral',
  render,
  children,
  className,
  ref,
  ...props
}: SidebarItemProps) {
  const { collapsed } = useSidebar()
  const row = sidebarRowStyles({ tone: countTone })
  const counted = countLabel ?? (count === undefined ? undefined : String(count))

  const link = useRender({
    defaultTagName: 'a',
    render,
    ref,
    props: {
      ...props,
      'aria-current': current ? 'page' : undefined,
      'data-current': current ? '' : undefined,
      className: row.row({ className }),
      children: (
        <>
          <span className={row.leading()}>
            <Icon name={icon} />
            {count !== undefined && <span aria-hidden="true" className={row.dot()} />}
          </span>
          {/* What the count means sits inside the label, so the name reads as one phrase: "Approvals, 3 waiting". */}
          <span className={row.label()}>
            {children}
            {counted && <span className="sr-only">, {counted}</span>}
          </span>
          {count !== undefined && (
            <span aria-hidden="true" className={row.trailing()}>
              <Badge tone={countTone}>{count}</Badge>
            </span>
          )}
        </>
      ),
    },
  })

  return (
    <li className="flex">
      <Tooltip
        content={
          counted ? (
            <>
              {children} · {counted}
            </>
          ) : (
            children
          )
        }
        side="right"
        disabled={!collapsed}
      >
        {link}
      </Tooltip>
    </li>
  )
}

export type SidebarButtonProps = Omit<ComponentProps<'button'>, 'className' | 'children'> & {
  /** Its icon, by its name in Norte's set. */
  icon?: IconName
  /** A 24px picture instead of an icon: the workspace's logo on a tile, a person's avatar. Hidden from screen readers. */
  media?: ReactNode
  /** An icon after the label, like the chevron of a switcher. Hidden when collapsed. */
  trailingIcon?: IconName
  /** What it says, and its name in the collapsed tooltip. */
  children: ReactNode
  className?: string
}

/**
 * A row that acts instead of leading to a page: the trigger of the workspace switcher or the user menu
 * (`<Menu.Trigger render={<Sidebar.Button … />} />`). Collapsed, its label appears in a tooltip.
 */
export function SidebarButton({
  icon,
  media,
  trailingIcon,
  children,
  className,
  type = 'button',
  ...props
}: SidebarButtonProps) {
  const { collapsed } = useSidebar()
  const row = sidebarRowStyles({ media: Boolean(media) })
  return (
    <Tooltip content={children} side="right" disabled={!collapsed}>
      <button {...props} type={type} className={row.row({ className })}>
        <span aria-hidden={media ? true : undefined} className={row.leading()}>
          {media ?? (icon && <Icon name={icon} />)}
        </span>
        <span className={row.label()}>{children}</span>
        {trailingIcon && (
          <span className={row.trailing()}>
            <Icon name={trailingIcon} />
          </span>
        )}
      </button>
    </Tooltip>
  )
}

export type SidebarToggleProps = Omit<SidebarButtonProps, 'children' | 'icon' | 'media' | 'trailingIcon'> & {
  /** Its label while the sidebar is open. */
  collapseLabel?: string
  /** Its label, heard and shown in the tooltip, while the sidebar is collapsed. */
  expandLabel?: string
}

/** Collapses the sidebar to its icons, and opens it again. Place it last, in the footer. */
export function SidebarToggle({
  collapseLabel = SIDEBAR_LABELS.collapse,
  expandLabel = SIDEBAR_LABELS.expand,
  onClick,
  ...props
}: SidebarToggleProps) {
  const { collapsed, setCollapsed } = useSidebar()

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (!event.defaultPrevented) setCollapsed(!collapsed)
  }

  return (
    <SidebarButton {...props} icon="sidebar" onClick={toggle}>
      {collapsed ? expandLabel : collapseLabel}
    </SidebarButton>
  )
}

export type SidebarFooterProps = Omit<ComponentProps<'div'>, 'className'> & { className?: string }

/** The bottom of the sidebar: the user menu and the collapse button. */
export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return <div {...props} className={styles.footer({ className })} />
}
