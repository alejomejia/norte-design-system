'use client'

import { AnimatePresence, LazyMotion, MotionConfig, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import { type ComponentProps, type ReactNode, useEffect, useEffectEvent, useState } from 'react'

import { Button } from '@/components/button'
import { Icon, type IconName } from '@/components/icon'
import { IconButton } from '@/components/icon-button'
import { loadMotionFeatures, MOTION_DURATION, MOTION_EASE } from '@/lib/motion'

import {
  ALERT_DISMISS_LABEL,
  ALERT_EXIT_TIMEOUT,
  ALERT_ICON_DELAY,
  ALERT_ICONS,
  ALERT_ROLES,
  type ALERT_TONES,
} from './alert.const'
import { alertStyles } from './alert.styles'

export type AlertProps = Omit<ComponentProps<'div'>, 'title' | 'className' | 'children'> & {
  /** `info` for something worth knowing, `success`, `warning` or `danger` for how something went. */
  tone?: (typeof ALERT_TONES)[number]
  /** What happened, in a short sentence. */
  title: ReactNode
  /** What it means and what to do about it. */
  children?: ReactNode
  /** The label of the one action that deals with it, shown as a quiet button in the bottom-right corner. */
  actionLabel?: string
  /** Called when the action is pressed. */
  onAction?: () => void
  /** Shows a close button. The alert hides itself, then calls `onDismiss`. */
  dismissible?: boolean
  /** Called once the dismissed alert has left: the place to forget it, or to move focus on. */
  onDismiss?: () => void
  /** The close button's accessible name. */
  dismissLabel?: string
  /** Another icon in place of the tone's, or `false` for none. */
  icon?: IconName | false
  /** `alert` interrupts a screen reader, `status` waits. By the tone: `alert` for `warning` and `danger`. */
  role?: 'alert' | 'status'
  className?: string
}

/**
 * An inline message that stays where the problem is, in a tone: an icon, a title, a description, an action and an
 * optional close button. Not a toast: it doesn't float or time out, it sits next to what it's about until it's dealt
 * with or dismissed. A live region, so a screen reader announces it as it appears.
 *
 * @example
 * <Alert tone="warning" title="Orbit's pricing page timed out" actionLabel="Retry Orbit" onAction={retry}>
 *   The run went on with 4 of 5 competitors.
 * </Alert>
 */
export function Alert({
  tone = 'info',
  title,
  children,
  actionLabel,
  onAction,
  dismissible = false,
  onDismiss,
  dismissLabel = ALERT_DISMISS_LABEL,
  icon = ALERT_ICONS[tone],
  role = ALERT_ROLES[tone],
  className,
  ...props
}: AlertProps) {
  // Leaving while its exit plays; gone once it ends, or once the exit has had its time, so it never hangs on Motion.
  const [phase, setPhase] = useState<'open' | 'leaving' | 'gone'>('open')
  const reduceMotion = useReducedMotion()
  const styles = alertStyles({ tone, dismissible, endsWithText: Boolean(children) && !actionLabel })
  const dismissed = useEffectEvent(() => onDismiss?.())

  useEffect(() => {
    if (phase === 'gone') dismissed()
    if (phase !== 'leaving') return
    const timeout = setTimeout(() => setPhase('gone'), ALERT_EXIT_TIMEOUT)
    return () => clearTimeout(timeout)
  }, [phase])

  if (phase === 'gone') return null

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      {/* Transforms stop under reduced motion; the fades stay. */}
      <MotionConfig reducedMotion="user">
        <AnimatePresence onExitComplete={() => setPhase('gone')}>
          {phase === 'open' && (
            <m.div
              key="alert"
              className={styles.frame({ className })}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: MOTION_DURATION.base, ease: MOTION_EASE.enter }}
              exit={{
                opacity: 0,
                height: 0,
                transition: {
                  opacity: { duration: MOTION_DURATION.fast, ease: MOTION_EASE.standard },
                  // The height closes once the content has faded, at once under reduced motion: it moves the page.
                  height: reduceMotion
                    ? { duration: 0 }
                    : { duration: MOTION_DURATION.slow, ease: MOTION_EASE.standard, delay: MOTION_DURATION.fast },
                },
              }}
            >
              <div {...props} role={role} className={styles.root()}>
                {icon && (
                  <m.span
                    aria-hidden="true"
                    className={styles.icon()}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: MOTION_DURATION.base, ease: MOTION_EASE.enter, delay: ALERT_ICON_DELAY }}
                  >
                    <Icon name={icon} />
                  </m.span>
                )}
                <div className={styles.main()}>
                  <div className={styles.header()}>
                    <div className={styles.title()}>
                      <span>{title}</span>
                    </div>
                    {dismissible && (
                      <IconButton
                        icon="close"
                        label={dismissLabel}
                        size="s"
                        className={styles.close()}
                        onClick={() => setPhase('leaving')}
                      />
                    )}
                  </div>
                  {(children || actionLabel) && (
                    <div className={styles.body()}>
                      {children && <div className={styles.description()}>{children}</div>}
                      {actionLabel && (
                        <Button variant="ghost" size="s" hover="fade" className={styles.action()} onClick={onAction}>
                          {actionLabel}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>
  )
}
