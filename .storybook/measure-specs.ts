/**
 * What the inspect mode (`measure-inspect.ts`) reads off an element, in Norte's names: its padding and gap as spacing
 * classes (`px-3`, `gap-2`), its radius and type as tokens (`rounded-m`, `text-body-s`), and the redlines to another
 * element. A value off Norte's scale says so, which is what an inspector in a design system is for. Pure: the caller
 * brings the computed values, in design px, and the tokens.
 */
import { type Token } from '@/handbook/tokens/tokens'

/** A rectangle in viewport px, like a `DOMRect`. */
export type Rect = { left: number; top: number; right: number; bottom: number; width: number; height: number }

/** A redline: starts at (`x`, `y`) and runs `length` px along `axis`. */
export type Redline = { axis: 'x' | 'y'; x: number; y: number; length: number }

/** One row of the panel: `padding`, `0 12`, `px-3`. */
export type Spec = {
  label: 'size' | 'padding' | 'gap' | 'radius' | 'type' | 'font'
  value: string
  /** The classes that give the value, when Norte has them. */
  utility?: string
  /** The value isn't on Norte's scale: no class gives it. */
  offScale?: boolean
}

/** The tokens the specs are named after, read from `theme.css`. */
export type Scale = {
  /** Radius tokens by their px: `8` → `m`. */
  radii: Map<number, string>
  /** The type scale: each size with its line height, in px. */
  text: { name: string; size: number; lineHeight: number }[]
  /** Font weight tokens by their value: `500` → `medium`. */
  weights: Map<number, string>
}

/** An element as the panel describes it, in design px. */
export type SpecInput = {
  width: number
  height: number
  /** Top, right, bottom, left. */
  padding: number[]
  /** Row and column gap, for a flex or grid container. */
  gap?: [row: number, column: number]
  /** Top-left, top-right, bottom-right, bottom-left. */
  radius: number[]
  /** For an element with text of its own. Line height is `NaN` when it's `normal`. */
  type?: { family: string; size: number; lineHeight: number; weight: number }
}

/** `rounded-full` computes to a huge length (`calc(infinity * 1px)`): anything past this is a pill. */
const FULL_RADIUS = 9999

/** Rounds to one decimal and drops a trailing `.0`: `24`, `12.5`. */
export function formatLength(value: number) {
  return String(Math.round(value * 10) / 10)
}

/** A rem token's px: `0.5rem` → `8`. */
function remToPx(value: string) {
  return Number.parseFloat(value) * 16
}

/** The radius, type and weight tokens of `theme.css`, by the values an element computes. */
export function readScale(tokens: Map<string, Token>): Scale {
  const radii = new Map<number, string>()
  const text: Scale['text'] = []
  const weights = new Map<number, string>()

  for (const [name, { value }] of tokens) {
    if (name.startsWith('radius-')) radii.set(remToPx(value), name.slice('radius-'.length))
    if (name.startsWith('font-weight-')) weights.set(Number(value), name.slice('font-weight-'.length))
    const textName = /^text-([\w-]+?)$/.exec(name)?.[1]
    const lineHeight = tokens.get(`${name}--line-height`)?.value
    if (textName && lineHeight) text.push({ name: textName, size: remToPx(value), lineHeight: remToPx(lineHeight) })
  }
  return { radii, text, weights }
}

/**
 * A length as a step of Tailwind's spacing scale (px ÷ 4), where Norte allows it: the 8px grid plus 1, 2, 4 and 12px.
 * `undefined` off it.
 */
export function spacingStep(px: number) {
  const step = Math.round(px * 100) / 100 / 4
  if ([0, 0.25, 0.5, 1, 3].includes(step) || (Number.isInteger(step) && step % 2 === 0)) return String(step)
  return undefined
}

/** Classes from prefixed steps, or `undefined` if one of them is off the scale: `[['px', 12]]` → `px-3`. */
function spacingClasses(parts: [prefix: string, px: number][]) {
  const classes: string[] = []
  for (const [prefix, px] of parts) {
    if (px === 0) continue
    const step = spacingStep(px)
    if (step === undefined) return undefined
    classes.push(`${prefix}-${step}`)
  }
  return classes.join(' ')
}

/** Four sides as Figma lists them: one value when they match, two when opposite sides do, else all four. */
export function formatSides([top = 0, right = 0, bottom = 0, left = 0]: number[]) {
  if (top === right && right === bottom && bottom === left) return formatLength(top)
  if (top === bottom && left === right) return `${formatLength(top)} ${formatLength(right)}`
  return [top, right, bottom, left].map(formatLength).join(' ')
}

/** Padding as its shortest classes: `p-4`, `px-3`, `py-2 px-4`, or one per side. */
function paddingSpec(sides: number[]): Spec | undefined {
  const [top = 0, right = 0, bottom = 0, left = 0] = sides
  if (sides.every((side) => side === 0)) return undefined

  let utility: string | undefined
  if (top === right && right === bottom && bottom === left) utility = spacingClasses([['p', top]])
  else if (top === bottom && left === right)
    utility = spacingClasses([
      ['py', top],
      ['px', right],
    ])
  else
    utility = spacingClasses([
      ['pt', top],
      ['pr', right],
      ['pb', bottom],
      ['pl', left],
    ])
  return { label: 'padding', value: formatSides(sides), utility, offScale: utility === undefined }
}

function gapSpec([row, column]: [number, number]): Spec | undefined {
  if (row === 0 && column === 0) return undefined
  const utility =
    row === column
      ? spacingClasses([['gap', row]])
      : spacingClasses([
          ['gap-x', column],
          ['gap-y', row],
        ])
  const value = row === column ? formatLength(row) : `${formatLength(row)} ${formatLength(column)}`
  return { label: 'gap', value, utility, offScale: utility === undefined }
}

/** Radius as a token when its corners match. Corners that differ are listed, without a class. */
function radiusSpec(corners: number[], { radii }: Scale): Spec | undefined {
  const [first = 0] = corners
  if (corners.every((corner) => corner === 0)) return undefined
  if (!corners.every((corner) => corner === first))
    return { label: 'radius', value: corners.map(formatLength).join(' ') }
  if (first >= FULL_RADIUS) return { label: 'radius', value: 'full', utility: 'rounded-full' }

  const name = radii.get(Math.round(first * 100) / 100)
  return { label: 'radius', value: formatLength(first), utility: name && `rounded-${name}`, offScale: !name }
}

/**
 * Type as its token: `text-body-s`, or `text-body-s/6` when the line height is another step of the spacing scale, and
 * its weight unless it's the regular one every text starts with.
 */
function typeSpecs({ family, size, lineHeight, weight }: NonNullable<SpecInput['type']>, scale: Scale): Spec[] {
  const token = scale.text.find((text) => text.size === Math.round(size * 100) / 100)
  const weightName = scale.weights.get(weight)
  const value = `${formatLength(size)}/${Number.isNaN(lineHeight) ? 'auto' : formatLength(lineHeight)} · ${weight}`

  let sizeClass: string | undefined
  if (token) {
    const step = Number.isNaN(lineHeight) ? undefined : spacingStep(lineHeight)
    if (Number.isNaN(lineHeight) || Math.abs(lineHeight - token.lineHeight) < 0.05) sizeClass = `text-${token.name}`
    else if (step !== undefined) sizeClass = `text-${token.name}/${step}`
  }
  const weightClass = weightName && weightName !== 'regular' ? ` font-${weightName}` : ''
  const utility = sizeClass && weightName ? `${sizeClass}${weightClass}` : undefined

  return [
    { label: 'type', value, utility, offScale: utility === undefined },
    { label: 'font', value: family },
  ]
}

/** The panel's rows for an element: its size, then its padding, gap, radius and type when it has them. */
export function describeSpecs(input: SpecInput, scale: Scale): Spec[] {
  const specs: (Spec | undefined)[] = [
    { label: 'size', value: `${formatLength(input.width)} × ${formatLength(input.height)}` },
    paddingSpec(input.padding),
    input.gap && gapSpec(input.gap),
    radiusSpec(input.radius, scale),
    ...(input.type ? typeSpecs(input.type, scale) : []),
  ]
  return specs.filter((spec) => spec !== undefined)
}

/**
 * The redlines between two elements, as Figma draws them. Apart on an axis: the gap between their facing edges, through
 * the middle of what they share on the other axis (or through `from`'s center). One inside the other: the inner box's
 * distance to each edge of the outer one.
 */
export function measureDistances(from: Rect, to: Rect): Redline[] {
  const overlapX = from.left < to.right && to.left < from.right
  const overlapY = from.top < to.bottom && to.top < from.bottom
  const midX = overlapX
    ? (Math.max(from.left, to.left) + Math.min(from.right, to.right)) / 2
    : from.left + from.width / 2
  const midY = overlapY
    ? (Math.max(from.top, to.top) + Math.min(from.bottom, to.bottom)) / 2
    : from.top + from.height / 2
  const lines: Redline[] = []

  if (overlapX && overlapY) {
    const [inner, outer] = from.width * from.height <= to.width * to.height ? [from, to] : [to, from]
    lines.push(
      { axis: 'y', x: midX, y: outer.top, length: inner.top - outer.top },
      { axis: 'y', x: midX, y: inner.bottom, length: outer.bottom - inner.bottom },
      { axis: 'x', x: outer.left, y: midY, length: inner.left - outer.left },
      { axis: 'x', x: inner.right, y: midY, length: outer.right - inner.right },
    )
  } else {
    if (!overlapX) {
      const [left, right] = from.right <= to.left ? [from, to] : [to, from]
      lines.push({ axis: 'x', x: left.right, y: midY, length: right.left - left.right })
    }
    if (!overlapY) {
      const [top, bottom] = from.bottom <= to.top ? [from, to] : [to, from]
      lines.push({ axis: 'y', x: midX, y: top.bottom, length: bottom.top - top.bottom })
    }
  }

  return lines
    .filter(({ length }) => length >= 0.5)
    .map((line) => ({ ...line, x: Math.round(line.x), y: Math.round(line.y) }))
}

/** A tag and the first words of its text: `button "Approve"`. */
export function nameElement(tag: string, text: string) {
  const words = text.trim().replace(/\s+/g, ' ')
  const snippet = words.length > 24 ? `${words.slice(0, 24)}…` : words
  return snippet ? `${tag} "${snippet}"` : tag
}
