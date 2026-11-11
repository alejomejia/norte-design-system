/**
 * The inspect mode, on top of the Measure tool (the ruler in the toolbar, or M), adapted from the one on
 * alejandromejia.dev. While the ruler is on, an 8px grid anchored to the story and the story's frame lie over the
 * canvas, so the mode is plain to see. Hovering an element previews it, and a click pins it instead of pressing it: both
 * show the same readout, the element's box model (the Measure tool's drawing) and a panel with its size, padding, gap,
 * radius and type in Norte's names (`px-3`, `rounded-m`, `text-body-s`). With one pinned, hovering another draws the
 * redlines between the two, like Figma. Esc unpins, then exits; ⌥-click still uses the component, to open a menu and
 * measure it.
 */
import { type Decorator } from '@storybook/react-vite'
import { useEffect, useGlobals } from 'storybook/preview-api'

import { TOKENS } from '@/handbook/tokens'

import { describeSpecs, formatLength, measureDistances, nameElement, readScale, type Spec } from './measure-specs'

/** The overlay's id, which the accessibility checks hide like the Measure canvas (`measure.ts`). */
export const INSPECT_ID = 'nt-inspect'

const SCALE = readScale(TOKENS)

/** The events a click is made of: none reaches the story while it pins instead. */
const POINTER_EVENTS = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click', 'dblclick'] as const

/** The panel's corners, by `data-x` and `data-y`. */
type Corner = [x: 'left' | 'right', y: 'top' | 'bottom']

let selected: Element | null = null

/** The pinned element, which the Measure tool alone keeps drawing (`measure.ts`). */
export function inspectedElement() {
  return selected
}

/**
 * Whether an element belongs to the story: inside its root, or in a popup Base UI portals to the body (a menu, a
 * tooltip). The root itself, the canvas's padding around a component, is the page's.
 */
export function isInStory(element: Element | null): element is Element {
  const root = document.getElementById('storybook-root')
  if (!element || !root || element === root) return false
  return root.contains(element) || element.closest('[data-base-ui-portal]') !== null
}

/** CSS px per design px: a larger default font scales every rem, and the labels read in the design's px. */
function rootScale() {
  return (Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16
}

/** The story's own element, whose corner anchors the grid: the canvas's padding around it isn't the component's. */
function storyElement() {
  return document.getElementById('storybook-root')?.firstElementChild ?? null
}

function intersects(a: Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom'>, b: typeof a) {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
}

/** Whether an element has text of its own, not only through its children, so its type is worth listing. */
function hasOwnText(element: Element) {
  return [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
}

function readSpecs(element: Element): Spec[] {
  const style = getComputedStyle(element)
  const scale = rootScale()
  function px(value: string) {
    return (Number.parseFloat(value) || 0) / scale
  }
  const { width, height } = element.getBoundingClientRect()

  return describeSpecs(
    {
      width: width / scale,
      height: height / scale,
      padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(px),
      gap: /flex|grid/.test(style.display) ? [px(style.rowGap), px(style.columnGap)] : undefined,
      radius: [
        style.borderTopLeftRadius,
        style.borderTopRightRadius,
        style.borderBottomRightRadius,
        style.borderBottomLeftRadius,
      ].map(px),
      type: hasOwnText(element)
        ? {
            family: style.fontFamily.split(',')[0]?.replace(/['"]/g, '').trim() ?? '',
            size: px(style.fontSize),
            lineHeight: style.lineHeight === 'normal' ? Number.NaN : px(style.lineHeight),
            weight: Number(style.fontWeight),
          }
        : undefined,
    },
    SCALE,
  )
}

function create<T extends keyof HTMLElementTagNameMap>(tag: T, className: string, text?: string) {
  const element = document.createElement(tag)
  element.className = className
  if (text) element.textContent = text
  return element
}

/** Places a box over a rect in viewport px, through the variables `measure-inspect.css` reads. */
function place(element: HTMLElement, { left, top, width, height }: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>) {
  element.style.setProperty('--x', `${Math.round(left)}px`)
  element.style.setProperty('--y', `${Math.round(top)}px`)
  element.style.setProperty('--w', `${Math.round(width)}px`)
  element.style.setProperty('--h', `${Math.round(height)}px`)
}

/** The panel's rows: a label, the value, and the classes that give it or "off scale". */
function renderSpecs(specs: Spec[]) {
  const list = create('dl', 'nt-inspect-specs')
  for (const { label, value, utility, offScale } of specs) {
    const note = offScale ? create('dd', 'nt-inspect-off-scale', 'off scale') : create('dd', '', utility)
    list.append(create('dt', '', label), create('dd', 'nt-inspect-value', value), note)
  }
  return list
}

/** Turns the inspect mode on, and returns what turns it off. `exit` turns the ruler off. */
function startInspecting(exit: () => void) {
  const pointer = { x: 0, y: 0 }
  let hovered: Element | null = null
  let frame = 0

  const overlay = create('div', 'nt-inspect')
  overlay.id = INSPECT_ID
  overlay.setAttribute('aria-hidden', 'true')
  const grid = create('div', 'nt-inspect-grid')
  const storyFrame = create('div', 'nt-inspect-frame')
  // The element the panel describes: the pinned one, or the hovered one until there's a pin.
  const focusBox = create('div', 'nt-inspect-box')
  const sizeLabel = create('span', 'nt-inspect-label')
  focusBox.append(sizeLabel)
  // The one measured against the pin.
  const targetBox = create('div', 'nt-inspect-box')
  const lines = create('div', '')
  const panel = create('div', 'nt-inspect-panel')
  const panelBody = create('div', 'nt-inspect-body')
  const panelHint = create('p', 'nt-inspect-hint')
  const header = create('div', 'nt-inspect-header')
  header.append(create('p', 'nt-inspect-title', 'Inspect'), create('p', 'nt-inspect-hint', 'Esc to exit'))
  panel.append(header, panelBody, panelHint)
  overlay.append(grid, storyFrame, targetBox, focusBox, lines, panel)
  document.body.append(overlay)
  document.documentElement.dataset.ntInspecting = ''

  const resizes = new ResizeObserver(() => draw())

  /** Asks the Measure tool to draw again where the pointer is: it only redraws when the pointer enters an element. */
  function redrawMeasure() {
    const { x, y } = pointer
    document
      .elementFromPoint(x, y)
      ?.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, clientX: x, clientY: y }))
  }

  function select(element: Element | null) {
    if (selected) resizes.unobserve(selected)
    selected = element
    if (selected) resizes.observe(selected)
    draw()
    redrawMeasure()
  }

  /** The 8px grid from the story's corner, and its frame. */
  function renderGrid() {
    const story = storyElement()?.getBoundingClientRect()
    grid.style.setProperty('--x', `${Math.round(story?.left ?? 0)}px`)
    grid.style.setProperty('--y', `${Math.round(story?.top ?? 0)}px`)
    storyFrame.hidden = !story?.width || !story.height
    if (story) place(storyFrame, story)
  }

  /**
   * Keeps the panel in its corner unless it would cover the element it describes, then moves it to the nearest free
   * one: on hover, a panel that hopped at every element would be hard to read.
   */
  function placePanel(box: DOMRect) {
    const [x = 'right', y = 'bottom'] = [panel.dataset.x, panel.dataset.y] as Partial<Corner>
    const flipX = x === 'left' ? 'right' : 'left'
    const flipY = y === 'top' ? 'bottom' : 'top'
    const corners: Corner[] = [
      [x, y],
      [flipX, y],
      [x, flipY],
      [flipX, flipY],
    ]
    const inset = 16 * rootScale()
    const { offsetWidth: width, offsetHeight: height } = panel
    const free = corners.find(([cornerX, cornerY]) => {
      const left = cornerX === 'left' ? inset : innerWidth - inset - width
      const top = cornerY === 'top' ? inset : innerHeight - inset - height
      return !intersects({ left, top, right: left + width, bottom: top + height }, box)
    })
    const [cornerX, cornerY] = free ?? [x, y]
    panel.dataset.x = cornerX
    panel.dataset.y = cornerY
  }

  function render() {
    // A story that renders again replaces its elements.
    if (selected && !selected.isConnected) select(null)
    if (hovered && !hovered.isConnected) hovered = null
    const focus = selected ?? hovered

    renderGrid()
    focusBox.hidden = !focus
    focusBox.toggleAttribute('data-pinned', selected !== null)
    targetBox.hidden = !selected || !hovered || hovered === selected
    lines.replaceChildren()
    panelHint.textContent = selected ? 'Esc to unpin · ⌥-click to use it' : 'Click to pin · ⌥-click to use it'

    if (!focus) {
      panelBody.replaceChildren(create('p', 'nt-inspect-name', 'Hover an element to inspect it'))
      return
    }

    const scale = rootScale()
    const box = focus.getBoundingClientRect()
    place(focusBox, box)
    sizeLabel.textContent = `${formatLength(box.width / scale)} × ${formatLength(box.height / scale)}`

    if (selected && hovered && hovered !== selected) {
      const target = hovered.getBoundingClientRect()
      place(targetBox, target)
      for (const { axis, x, y, length } of measureDistances(box, target)) {
        const line = create('div', 'nt-inspect-line')
        line.dataset.axis = axis
        line.style.setProperty('--x', `${x}px`)
        line.style.setProperty('--y', `${y}px`)
        line.style.setProperty('--length', `${Math.round(length)}px`)
        line.append(create('span', 'nt-inspect-label', formatLength(length / scale)))
        lines.append(line)
      }
    }
    // The redlines take the size's place under the box; the panel still lists it.
    sizeLabel.hidden = lines.childElementCount > 0

    // biome-ignore lint/performance/useDomNodeTextContent: the visible text keeps the breaks between blocks, which `textContent` glues
    const text = focus instanceof HTMLElement ? focus.innerText : (focus.textContent ?? '')
    panelBody.replaceChildren(
      create('p', 'nt-inspect-name', nameElement(focus.tagName.toLowerCase(), text)),
      renderSpecs(readSpecs(focus)),
    )
    placePanel(box)
  }

  /** Draws on the next frame, once, however many events asked for it. */
  function draw() {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(render)
  }

  /** Fades the panel while the pointer is under it: it lets the pointer through, but covers what's there. */
  function fadePanel() {
    const { left, right, top, bottom } = panel.getBoundingClientRect()
    const { x, y } = pointer
    panel.toggleAttribute('data-covering', x >= left && x <= right && y >= top && y <= bottom)
  }

  function handlePointerMove(event: PointerEvent) {
    pointer.x = event.clientX
    pointer.y = event.clientY
    fadePanel()
  }

  function handlePointerOver(event: PointerEvent) {
    const target = event.target instanceof Element && isInStory(event.target) ? event.target : null
    if (target === hovered) return
    hovered = target
    draw()
  }

  function handlePointerLeave() {
    hovered = null
    draw()
  }

  function handlePointer(event: MouseEvent) {
    const target = event.target instanceof Element ? event.target : null
    if (event.altKey || target?.closest(`#${INSPECT_ID}`)) return
    if (!isInStory(target)) {
      if (event.type === 'click' && selected) select(null)
      return
    }
    event.preventDefault()
    event.stopPropagation()
    // A press that's prevented leaves the focus where it was, often in Storybook's window: the story's takes it, without
    // focusing the element, so Esc reaches it.
    if (event.type === 'pointerdown') window.focus()
    if (event.type === 'click') select(target === selected ? null : target)
  }

  /** Esc unpins, then exits; inside an open popup, it's the popup's, to close it. */
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return
    if (!selected && event.target instanceof Element && event.target.closest('[data-base-ui-portal]')) return
    event.preventDefault()
    event.stopPropagation()
    if (selected) select(null)
    else exit()
  }

  // On the window, in the capture phase: before React's own listeners on the story's root and portals.
  const options = { capture: true }
  document.addEventListener('pointermove', handlePointerMove, { capture: true, passive: true })
  document.addEventListener('pointerover', handlePointerOver, { capture: true, passive: true })
  document.documentElement.addEventListener('pointerleave', handlePointerLeave)
  for (const type of POINTER_EVENTS) window.addEventListener(type, handlePointer, options)
  window.addEventListener('keydown', handleKeyDown, options)
  window.addEventListener('scroll', draw, { capture: true, passive: true })
  window.addEventListener('resize', draw)
  render()

  return () => {
    cancelAnimationFrame(frame)
    resizes.disconnect()
    selected = null
    overlay.remove()
    delete document.documentElement.dataset.ntInspecting
    document.removeEventListener('pointermove', handlePointerMove, options)
    document.removeEventListener('pointerover', handlePointerOver, options)
    document.documentElement.removeEventListener('pointerleave', handlePointerLeave)
    for (const type of POINTER_EVENTS) window.removeEventListener(type, handlePointer, options)
    window.removeEventListener('keydown', handleKeyDown, options)
    window.removeEventListener('scroll', draw, options)
    window.removeEventListener('resize', draw)
  }
}

/**
 * Runs the inspect mode with the Measure tool: in the story view, while the ruler is on, unless a story turns the tool
 * off (`parameters.measure.disable`). Storybook's own tool is a decorator alike.
 */
export const withInspect: Decorator = (Story, { globals, parameters, viewMode }) => {
  const [, updateGlobals] = useGlobals()
  const active = viewMode === 'story' && Boolean(globals.measureEnabled) && !parameters.measure?.disable
  useEffect(() => (active ? startInspecting(() => updateGlobals({ measureEnabled: false })) : undefined), [active])
  return Story()
}
