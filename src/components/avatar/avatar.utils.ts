/** An agent's colors, deep to light, as CSS colors. */
export type AvatarAgentColors = readonly [deep: string, mid: string, light: string]

/**
 * A stable number from 0 to 100 from an agent's name. The effect starts from it, so every agent has its own pattern
 * and the same agent looks the same on every render.
 */
export function avatarSeed(name: string): number {
  let hash = 0
  for (const character of name) hash = (hash * 31 + (character.codePointAt(0) ?? 0)) >>> 0
  return (hash % 10_000) / 100
}
