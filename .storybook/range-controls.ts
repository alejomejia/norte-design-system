/**
 * Number props get a slider (a `range` control) instead of a number field. Each story gives the slider its `min` and
 * `max`, the step follows from them, and `manager-styles/controls.css` draws it as a settings row: the field is the
 * track, it fills up to a handle, and the value sits at its end.
 */
import { type Preview } from '@storybook/react-vite'

type ArgTypesEnhancer = NonNullable<Preview['argTypesEnhancers']>[number]

/** The steps a slider can take, coarsest first. Whole numbers: a prop that takes fractions sets its own `step`. */
const RANGE_STEPS = [100, 50, 10, 5, 1]

/** The fewest stops a slider keeps between its ends. A coarser step would make it jump. */
const RANGE_MIN_STOPS = 30

/**
 * The coarsest step that keeps enough stops: 1 for a span under 150 (pixels, items…), then 5, 10, 50 and 100 as the
 * span grows (durations in ms). Pick a `min` and a default that fall on a step.
 */
export function getRangeStep(min: number, max: number) {
  return RANGE_STEPS.find((step) => (max - min) / step >= RANGE_MIN_STOPS) ?? 1
}

/** Gives each slider with no `step` of its own the one that fits its span. */
export function addRangeSteps({ argTypes }: Parameters<ArgTypesEnhancer>[0]) {
  const enhanced: typeof argTypes = {}
  for (const [name, argType] of Object.entries(argTypes)) {
    const { control } = argType
    const needsStep =
      typeof control === 'object' && control.type === 'range' && control.step === undefined && control.max !== undefined
    enhanced[name] = needsStep
      ? { ...argType, control: { ...control, step: getRangeStep(control.min ?? 0, control.max ?? 0) } }
      : argType
  }
  return enhanced
}

/**
 * Leaves each slider's label with its value alone. Storybook writes "value / max" as three text nodes of one span, which
 * CSS can't split: emptying the last two does it, and React never writes them again, since they don't change.
 */
function trimRangeLabels() {
  for (const label of document.querySelectorAll(".docblock-argstable input[type='range'] + span")) {
    for (const node of [...label.childNodes].slice(1)) {
      if (node.nodeValue) node.nodeValue = ''
    }
  }
}

/** Trims the sliders' labels now and whenever Storybook renders the controls again. */
export function watchRangeLabels() {
  trimRangeLabels()
  // Emptying a node triggers the observer again, but finds nothing left to empty, so it stops there.
  new MutationObserver(trimRangeLabels).observe(document.body, { subtree: true, childList: true, characterData: true })
}
