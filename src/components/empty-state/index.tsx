'use client'

import { useRender } from '@base-ui/react/use-render'
import { type ComponentProps, type ReactNode } from 'react'

import { Icon, type IconName } from '@/components/icon'
import { EMPTY_STATE_ICON_SIZES, type EMPTY_STATE_SIZES, type EMPTY_STATE_VARIANTS } from './empty-state.const'
import { emptyStateStyles } from './empty-state.styles'
import { EmptyStateContours } from './empty-state-contours'

export type EmptyStateProps = Omit<ComponentProps<'div'>, 'title' | 'className' | 'children'> & {
  /** What would be here, on a tile. */
  icon?: IconName
  /** An illustration of your own, in place of the icon's tile. */
  image?: ReactNode
  /** What's missing, in a few words: "No logs yet". */
  title: ReactNode
  /** Another element, for the heading level that fits the page: `titleRender={<h2 />}`. An `h3` by default. */
  titleRender?: useRender.ComponentProps<'h3'>['render']
  /** Why it's empty, and what will fill it. */
  description: ReactNode
  /** What to do about it: a primary button and a quieter one, or a link. */
  actions?: ReactNode
  /** `s` inside a panel or a tab, `m` filling a page. */
  size?: (typeof EMPTY_STATE_SIZES)[number]
  /**
   * `outline` is a card on a faint topographic map, `dashed` a space that fills up, `plain` sits on a surface that already
   * frames it.
   */
  variant?: (typeof EMPTY_STATE_VARIANTS)[number]
  className?: string
}

/**
 * What a space shows while there's nothing in it yet: an icon or an image, a title, a description and what to do
 * about it. As a card, it sits on a faint topographic map.
 *
 * @example
 * <EmptyState
 *   icon="terminal"
 *   title="No logs yet"
 *   description="Run #128 is waiting for your approval. Its steps show up here once it picks up again."
 *   actions={
 *     <>
 *       <Button size="s">Review the approval</Button>
 *       <Button variant="secondary" size="s">View the plan</Button>
 *     </>
 *   }
 * />
 */
export function EmptyState({
  icon,
  image,
  title,
  titleRender,
  description,
  actions,
  size = 's',
  variant = 'outline',
  className,
  ...props
}: EmptyStateProps) {
  const styles = emptyStateStyles({ size, variant })
  const heading = useRender({
    defaultTagName: 'h3',
    render: titleRender,
    props: { className: styles.title(), children: title },
  })

  return (
    <div {...props} className={styles.root({ className })}>
      {variant === 'outline' && <EmptyStateContours className={styles.contours()} />}
      <div className={styles.content()}>
        <div className={styles.lead()}>
          {image ??
            (icon && (
              <span aria-hidden="true" className={styles.tile()}>
                <Icon name={icon} size={EMPTY_STATE_ICON_SIZES[size]} />
              </span>
            ))}
          <div className={styles.text()}>
            {heading}
            <p className={styles.description()}>{description}</p>
          </div>
        </div>
        {actions && <div className={styles.actions()}>{actions}</div>}
      </div>
    </div>
  )
}
