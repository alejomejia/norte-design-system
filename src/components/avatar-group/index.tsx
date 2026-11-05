import { Avatar, type AvatarProps, type AvatarSize } from '@/components/avatar'
import { Tooltip, TooltipProvider } from '@/components/tooltip'
import { type DistributiveOmit } from '@/lib/utils'

import { AVATAR_GROUP_LABELS, AVATAR_GROUP_MAX } from './avatar-group.const'
import { avatarGroup } from './avatar-group.styles'

/** One avatar of the group: a person or an agent, with everything Avatar takes but its size, which the group sets. */
export type AvatarGroupItem = DistributiveOmit<AvatarProps, 'size' | 'decorative' | 'className'>

export type AvatarGroupProps = {
  /** Who's in it, in the order they show. */
  avatars: AvatarGroupItem[]
  /**
   * How many circles show, the "+N" included, so the row keeps its width: six people with `max={4}` show three avatars
   * and "+3". Everyone shows when they fit.
   */
  max?: number
  /** Avatar's sizes: `s` (24px), `m` (32px) or `l` (40px). */
  size?: AvatarSize
  /** What screen readers hear and the "+N" tooltip shows, to translate them. */
  labels?: typeof AVATAR_GROUP_LABELS
  className?: string
}

/**
 * A few people at a glance, like the six who'll get an email: their avatars overlap in a row, and when there are more
 * than `max`, the last circle counts the rest. Hovering an avatar shows its name, and the "+N" is a button whose tooltip
 * names everyone it stands for. Screen readers hear one group, "6 people", with each visible name and the "+N"'s list.
 *
 * @example
 * <AvatarGroup avatars={recipients} max={4} />
 */
export function AvatarGroup({
  avatars,
  max = AVATAR_GROUP_MAX,
  size = 'm',
  labels = AVATAR_GROUP_LABELS,
  className,
}: AvatarGroupProps) {
  const styles = avatarGroup({ size })
  // The "+N" takes the last circle, but never hides the only avatar left.
  const shown = avatars.length <= max ? avatars.length : Math.max(max - 1, 1)
  const hiddenNames = avatars.slice(shown).map(({ name }) => name)

  return (
    <TooltipProvider>
      {/* biome-ignore lint/a11y/useSemanticElements: a `<fieldset>` groups form controls; this is a row of pictures */}
      <div role="group" aria-label={labels.group(avatars.length)} className={styles.root({ className })}>
        {avatars.slice(0, shown).map((avatar, index) => (
          // Names can repeat; their place in the row can't.
          <Tooltip key={`${avatar.name}-${index}`} content={avatar.name}>
            <Avatar {...avatar} size={size} className={styles.item()} />
          </Tooltip>
        ))}
        {hiddenNames.length > 0 && (
          <Tooltip content={labels.moreTooltip(hiddenNames)}>
            <button type="button" aria-label={labels.more(hiddenNames)} className={styles.more()}>
              +{hiddenNames.length}
            </button>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
