'use client'

import { Avatar as BaseAvatar } from '@base-ui/react/avatar'

import { initials, toCSSVars } from '@/lib/utils'

import {
  AVATAR_AGENT_COLORS,
  type AVATAR_EFFECTS,
  AVATAR_FALLBACK_DELAY,
  type AVATAR_SIZES,
  AVATAR_STATUS_LABELS,
  type AVATAR_STATUSES,
} from './avatar.const'
import { avatar } from './avatar.styles'
import { type AvatarAgentColors } from './avatar.utils'
import { AvatarEffect } from './avatar-effect'

export type AvatarStatus = (typeof AVATAR_STATUSES)[number]

export type AvatarSize = (typeof AVATAR_SIZES)[number]

type AvatarBaseProps = Omit<BaseAvatar.Root.Props, 'className' | 'children' | 'render'> & {
  /** Who it is. It gives the initials and the name screen readers hear. */
  name: string
  /** `s` (24px) in dense rows, `m` (32px) in messages and cards, `l` (40px) in the sidebar's footer. */
  size?: AvatarSize
  /** A dot on the corner: whether they're around. Screen readers hear it after the name. */
  status?: AvatarStatus
  /** What screen readers hear for each status, to translate them. */
  statusLabels?: Partial<Record<AvatarStatus, string>>
  /**
   * Working right now: an agent's colors move, and the status dot pulses. Both hold still under reduced motion and
   * pause off-screen.
   */
  live?: boolean
  /**
   * Hides the avatar from screen readers, for when the name is written right next to it (a message, an approval
   * request), so it isn't heard twice.
   */
  decorative?: boolean
  className?: string
}

type PersonProps = AvatarBaseProps & {
  /** A person (the default) or an agent. */
  kind?: 'person'
  /** Their photo. Their initials show if it's missing, while a slow one loads and if it fails. */
  src?: string
  effect?: never
  colors?: never
}

type AgentProps = AvatarBaseProps & {
  kind: 'agent'
  /**
   * How its colors move: `orb` swirls like liquid lit as a sphere, `mesh` blends four drifting points.
   */
  effect?: (typeof AVATAR_EFFECTS)[number]
  /**
   * Its colors, deep to light: the shadow, the body and the highlight. Any CSS color, `var(--…)` included. Norte's blues
   * by default.
   */
  colors?: AvatarAgentColors
  src?: never
}

export type AvatarProps = PersonProps | AgentProps

/**
 * Who someone is, at a glance, in a circle: a person's photo or initials, or an agent's own colors, moving while it
 * works. An optional dot shows whether they're around.
 *
 * @example
 * <Avatar name="Sofía Herrera" src="/people/sofia.jpg" status="online" />
 * <Avatar kind="agent" name="Research agent" live />
 */
export function Avatar({
  kind = 'person',
  name,
  size = 'm',
  status,
  statusLabels,
  live = false,
  decorative = false,
  src,
  effect = 'orb',
  colors = AVATAR_AGENT_COLORS,
  className,
  ...props
}: AvatarProps) {
  const styles = avatar({ kind, size, status, live })
  const statusLabel = status && (statusLabels?.[status] ?? AVATAR_STATUS_LABELS[status])

  return (
    <BaseAvatar.Root
      {...props}
      // One image named by the person, its status included: what's inside it is only the picture.
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : statusLabel ? `${name}, ${statusLabel}` : name}
      aria-hidden={decorative || undefined}
      className={styles.root({ className })}
    >
      <span
        className={styles.frame()}
        style={
          kind === 'agent'
            ? toCSSVars({ 'avatar-deep': colors[0], 'avatar-mid': colors[1], 'avatar-light': colors[2] })
            : undefined
        }
      >
        {kind === 'agent' ? (
          <AvatarEffect
            name={name}
            effect={effect}
            colors={colors}
            live={live}
            size={size}
            className={styles.effect()}
          />
        ) : (
          <>
            {src && <BaseAvatar.Image src={src} alt="" className={styles.image()} />}
            <BaseAvatar.Fallback delay={src ? AVATAR_FALLBACK_DELAY : undefined} className={styles.initials()}>
              {initials(name)}
            </BaseAvatar.Fallback>
          </>
        )}
      </span>
      {status && <span className={styles.status()} />}
    </BaseAvatar.Root>
  )
}
