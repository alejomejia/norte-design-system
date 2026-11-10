/**
 * The Measure tool (the ruler in the toolbar, or M), adjusted: focused on the story's components, with their flex and
 * grid gaps, without its content box, and out of the way of the accessibility checks. Storybook has an option for none
 * of this, and the tool draws on a canvas, so the canvas's drawing calls are patched for that canvas only.
 */
import { INSPECT_ID, inspectedElement, isInStory } from './measure-inspect'

const CANVAS_ID = 'storybook-addon-measure'

/** The gap color: purple, next to Storybook's margin orange and padding green. */
const GAP_COLOR = '#8e7cc3'

type Box = { top: number; right: number; bottom: number; left: number }

type Axe = { run: (...args: unknown[]) => unknown }

/** Storybook's content blue (`#6fa8dc`), as the canvas reads back its fill (`a8`), label (`dd`) and outline colors. */
function isContentColor(style: CanvasRenderingContext2D['fillStyle']) {
  return typeof style === 'string' && (style === '#6fa8dc' || style.startsWith('rgba(111, 168, 220,'))
}

function isMeasureCanvas(context: CanvasRenderingContext2D) {
  return context.canvas.id === CANVAS_ID
}

/**
 * Hides the content box. Storybook paints the box inside the padding blue and centers its size on it ("86 x 20"), and
 * on small elements, like a button's label, that label covers the padding values: the ones the tool is used for here.
 * If Storybook changes its colors, the box simply shows again.
 *
 * A label is a rounded rectangle filled in its color, outlined, then its text: once the fill is skipped as blue, the
 * text that follows is the content's too.
 */
export function hideMeasureContentBox() {
  const { fill, fillRect, fillText, stroke } = CanvasRenderingContext2D.prototype
  let isContentLabel = false

  CanvasRenderingContext2D.prototype.fillRect = function (...args) {
    if (isMeasureCanvas(this) && isContentColor(this.fillStyle)) return
    fillRect.apply(this, args)
  }
  CanvasRenderingContext2D.prototype.fill = function (...args: unknown[]) {
    isContentLabel = isMeasureCanvas(this) && isContentColor(this.fillStyle)
    if (!isContentLabel) Reflect.apply(fill, this, args)
  }
  CanvasRenderingContext2D.prototype.stroke = function (...args: unknown[]) {
    if (isMeasureCanvas(this) && isContentColor(this.strokeStyle)) return
    Reflect.apply(stroke, this, args)
  }
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    if (isMeasureCanvas(this) && isContentLabel) return
    fillText.apply(this, args)
  }
}

/**
 * Runs axe with the Measure canvas and the inspect mode's overlay hidden, then shows them again. axe-core registers
 * `window.axe` before it defines its own functions, so its `run` is caught as it's assigned, too.
 */
function hideCanvasWhileRunning(axe: Axe) {
  let { run } = axe
  async function runWithoutCanvas(this: Axe, ...args: unknown[]) {
    const layers = [CANVAS_ID, INSPECT_ID].map((id) => document.getElementById(id)).filter((layer) => layer !== null)
    // Inline, like the canvas's own size: Storybook styles it inline, which a `hidden` attribute wouldn't beat.
    const displays = layers.map((layer) => layer.style.display)
    for (const layer of layers) layer.style.display = 'none'
    try {
      return await Reflect.apply(run, this, args)
    } finally {
      layers.forEach((layer, index) => {
        layer.style.display = displays[index] ?? ''
      })
    }
  }
  Object.defineProperty(axe, 'run', {
    configurable: true,
    enumerable: true,
    get: () => runWithoutCanvas,
    set(value: Axe['run']) {
      run = value
    },
  })
}

/**
 * Keeps the Measure tool out of the Accessibility tab. While the ruler is on, its canvas covers the whole story, so axe
 * can't tell the background behind any text and lists every contrast check under "Needs review". The addon hides
 * Storybook's own highlight during its scans, but not this canvas. axe-core registers itself as `window.axe`, the same
 * object the addon runs: its `run` is wrapped where it is, or as it's assigned if it isn't loaded yet.
 */
export function ignoreMeasureInAccessibilityChecks() {
  const host = window as { axe?: Axe }
  let axe = host.axe
  if (axe) hideCanvasWhileRunning(axe)
  Object.defineProperty(window, 'axe', {
    configurable: true,
    get: () => axe,
    set(value: Axe) {
      hideCanvasWhileRunning(value)
      axe = value
    },
  })
}

/**
 * A flex or grid item's margin box, in page coordinates, as the Measure canvas draws. A run of text is an item too (a
 * button's label), measured with a range: it has no margins.
 */
function itemBox(node: Node): Box | null {
  if (node instanceof Text) {
    if (!node.textContent?.trim()) return null
    const range = document.createRange()
    range.selectNodeContents(node)
    const rect = range.getBoundingClientRect()
    return {
      top: rect.top + scrollY,
      right: rect.right + scrollX,
      bottom: rect.bottom + scrollY,
      left: rect.left + scrollX,
    }
  }
  if (!(node instanceof Element)) return null

  const style = getComputedStyle(node)
  if (['absolute', 'fixed'].includes(style.position) || style.display === 'none') return null
  const rect = node.getBoundingClientRect()
  return {
    top: rect.top + scrollY - parseFloat(style.marginTop),
    right: rect.right + scrollX + parseFloat(style.marginRight),
    bottom: rect.bottom + scrollY + parseFloat(style.marginBottom),
    left: rect.left + scrollX - parseFloat(style.marginLeft),
  }
}

/** The gaps of a flex or grid container, as boxes between its neighboring items. */
function findGaps(container: Element) {
  const style = getComputedStyle(container)
  if (!/flex|grid/.test(style.display)) return []

  const columnGap = parseFloat(style.columnGap) || 0
  const rowGap = parseFloat(style.rowGap) || 0
  const items = [...container.childNodes]
    .map(itemBox)
    .filter((box): box is Box => box !== null && (box.right > box.left || box.bottom > box.top))
  const gaps: (Box & { size: number })[] = []

  for (const item of items) {
    // The closest item on its right in the same line, and the closest one below in the same column.
    const right = items
      .filter((other) => other.left >= item.right - 0.5 && other.top < item.bottom && other.bottom > item.top)
      .sort((a, b) => a.left - b.left)[0]
    if (columnGap && right) {
      const top = Math.max(item.top, right.top)
      const bottom = Math.min(item.bottom, right.bottom)
      gaps.push({ top, bottom, left: item.right, right: item.right + columnGap, size: columnGap })
    }
    const below = items
      .filter((other) => other.top >= item.bottom - 0.5 && other.left < item.right && other.right > item.left)
      .sort((a, b) => a.top - b.top)[0]
    if (rowGap && below) {
      const left = Math.max(item.left, below.left)
      const right = Math.min(item.right, below.right)
      gaps.push({ left, right, top: item.bottom, bottom: item.bottom + rowGap, size: rowGap })
    }
  }
  return gaps
}

function drawGaps(context: CanvasRenderingContext2D, element: Element) {
  for (const gap of findGaps(element)) {
    const width = gap.right - gap.left
    const height = gap.bottom - gap.top
    context.fillStyle = `${GAP_COLOR}aa`
    context.fillRect(gap.left, gap.top, width, height)

    // A label like Storybook's: 12px monospace on a rounded tag in the box's color.
    const text = String(Math.round(gap.size * 100) / 100)
    context.font = '600 12px monospace'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    const tagWidth = context.measureText(text).width + 12
    const x = gap.left + width / 2
    const y = gap.top + height / 2
    context.beginPath()
    context.roundRect(x - tagWidth / 2, y - 10, tagWidth, 20, 3)
    context.fillStyle = `${GAP_COLOR}dd`
    context.fill()
    context.fillStyle = '#232020'
    context.fillText(text, x, y)
  }
}

/**
 * Focuses the Measure tool on the story's components. Storybook redraws by clearing its canvas, then drawing the hovered
 * element's box synchronously, so the clear tells what comes next:
 *
 * - Outside the story, Storybook's drawing is skipped: hovering the canvas around a component showed the canvas's own
 *   padding, which says nothing about the component. Components work in isolation, so only they, what's inside them
 *   and the popups they open are measured (`isInStory`).
 * - With an element selected in the inspect mode, only that one is drawn: hovering another draws the redlines between
 *   the two (`measure-inspect.ts`), which its box would bury.
 * - Inside it, the gaps of a flex or grid container are added, in purple with their size, right after Storybook's box
 *   (in a microtask): the tool draws margin, padding and border only, so the space between a button's icon and label
 *   didn't show. Hover the container, or the gap itself, which belongs to it.
 */
export function focusMeasureOnStory() {
  const { clearRect, fill, fillRect, fillText, stroke } = CanvasRenderingContext2D.prototype
  const pointer = { x: 0, y: 0 }
  let skipping = false

  function trackPointer(event: PointerEvent) {
    pointer.x = event.clientX
    pointer.y = event.clientY
  }
  document.addEventListener('pointerover', trackPointer, { capture: true, passive: true })
  document.addEventListener('pointermove', trackPointer, { capture: true, passive: true })

  function isSkipped(context: CanvasRenderingContext2D) {
    return skipping && isMeasureCanvas(context)
  }

  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    clearRect.apply(this, args)
    if (!isMeasureCanvas(this)) return

    const element = document.elementFromPoint(pointer.x, pointer.y)
    const selected = inspectedElement()
    skipping = !isInStory(element) || (selected !== null && element !== selected)
    queueMicrotask(() => {
      const skipped = skipping
      skipping = false
      if (element && !skipped && this.canvas.isConnected) drawGaps(this, element)
    })
  }
  CanvasRenderingContext2D.prototype.fillRect = function (...args) {
    if (!isSkipped(this)) fillRect.apply(this, args)
  }
  CanvasRenderingContext2D.prototype.fill = function (...args: unknown[]) {
    if (!isSkipped(this)) Reflect.apply(fill, this, args)
  }
  CanvasRenderingContext2D.prototype.stroke = function (...args: unknown[]) {
    if (!isSkipped(this)) Reflect.apply(stroke, this, args)
  }
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    if (!isSkipped(this)) fillText.apply(this, args)
  }
}
