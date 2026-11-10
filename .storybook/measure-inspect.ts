/**
 * The inspect mode, on top of the Measure tool (the ruler in the toolbar, or M), adapted from the one on
 * alejandromejia.dev. While the ruler is on, a click selects an element instead of pressing it: the panel lists its
 * size, padding, gap, radius and type in Norte's names (`px-3`, `rounded-m`, `text-body-s`), and hovering another
 * element draws the redlines between the two, like Figma. Esc clears the selection; ⌥-click still uses the component,
 * to open a menu and measure it.
 */
import { type Decorator } from '@storybook/react-vite'
import { useEffect } from 'storybook/preview-api'

import { TOKENS } from '@/handbook/tokens'

import { describeSpecs, formatLength, measureDistances, nameElement, readScale, type Spec } from './measure-specs'

/** The overlay's id, which the accessibility checks hide like the Measure canvas (`measure.ts`). */
export const INSPECT_ID = 'nt-inspect'

const SCALE = readScale(TOKENS)

/** The events a click is made of: none reaches the story while it selects instead. */
const POINTER_EVENTS = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click', 'dblclick'] as const

let selected: Element | null = null

/** The selected element, which the Measure tool alone keeps drawing (`measure.ts`). */
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

/** Turns the inspect mode on, and returns what turns it off. */
function startInspecting() {
  const pointer = { x: 0, y: 0 }
  let hovered: Element | null = null
  let frame = 0

  const overlay = create('div', 'nt-inspect')
  overlay.id = INSPECT_ID
  overlay.setAttribute('aria-hidden', 'true')
  const selectedBox = create('div', 'nt-inspect-box')
  selectedBox.dataset.selected = ''
  const sizeLabel = create('span', 'nt-inspect-label')
  selectedBox.append(sizeLabel)
  const hoveredBox = create('div', 'nt-inspect-box')
  const lines = create('div', '')
  const panel = create('div', 'nt-inspect-panel')
  overlay.append(hoveredBox, selectedBox, lines, panel)
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

  function render() {
    // A story that renders again replaces its elements.
    if (selected && !selected.isConnected) select(null)
    const selection = selected

    selectedBox.hidden = !selection
    hoveredBox.hidden = !selection || !hovered || hovered === selection
    lines.replaceChildren()

    if (!selection) {
      panel.replaceChildren(
        create('p', 'nt-inspect-name', 'Click an element to inspect it'),
        create('p', 'nt-inspect-hint', '⌥-click to use it · M to close'),
      )
      delete panel.dataset.x
      delete panel.dataset.y
      return
    }

    const scale = rootScale()
    const box = selection.getBoundingClientRect()
    place(selectedBox, box)
    sizeLabel.textContent = `${formatLength(box.width / scale)} × ${formatLength(box.height / scale)}`

    if (hovered && hovered !== selection) {
      const target = hovered.getBoundingClientRect()
      place(hoveredBox, target)
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
    const text = selection instanceof HTMLElement ? selection.innerText : (selection.textContent ?? '')
    panel.replaceChildren(
      create('p', 'nt-inspect-name', nameElement(selection.tagName.toLowerCase(), text)),
      renderSpecs(readSpecs(selection)),
      create('p', 'nt-inspect-hint', 'Esc to clear · ⌥-click to use it'),
    )
    // In the corner away from the selection, so it doesn't cover what it describes.
    panel.dataset.x = box.left + box.width / 2 > innerWidth / 2 ? 'left' : 'right'
    panel.dataset.y = box.top + box.height / 2 > innerHeight / 2 ? 'top' : 'bottom'
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
    if (selected) draw()
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

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !selected) return
    event.preventDefault()
    event.stopPropagation()
    select(null)
  }

  // On the window, in the capture phase: before React's own listeners on the story's root and portals.
  const options = { capture: true }
  document.addEventListener('pointermove', handlePointerMove, { capture: true, passive: true })
  document.addEventListener('pointerover', handlePointerOver, { capture: true, passive: true })
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
  const active = viewMode === 'story' && Boolean(globals.measureEnabled) && !parameters.measure?.disable
  useEffect(() => (active ? startInspecting() : undefined), [active])
  return Story()
}
