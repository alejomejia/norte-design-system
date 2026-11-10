# Component recipe

The shape every Norte component takes, so a new one starts from this page instead of from reading whole components.
Open an existing component only for the specific pattern its brief names (a gliding highlight, a scroll fade), and
read only that part. Accordion (`src/components/accordion/`) is the reference for everything below.

## Files

```
src/components/<name>/
  index.tsx              the root, the context provider, `Object.assign(Root, nameParts(...))`, re-exported part types
  <name>-parts.tsx       the parts (Item, Trigger, Panel…), one exported function and `<Name>XProps` type each
  <name>.styles.ts       one `tv` recipe with slots; a top comment says how it looks and moves, and why
  <name>.const.ts        option lists (`VARIANTS`, `SIZES`) `as const`, English label defaults, magic numbers
  <name>.hooks.ts        `<Name>LookContext` + `use<Name>Look()` when parts need the root's variant or size
  <name>.stories.tsx     Playground, then one story per variant and state, with play tests
```

A simple element is `index.tsx` + `.styles.ts` + `.stories.tsx`. Logic worth testing goes in `.utils.ts` (or
`src/lib/utils/` if it's generic) with a `.test.ts`.

## The root (`index.tsx`)

```tsx
'use client'

import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import { useMemo } from 'react'

import { nameParts } from '@/lib/utils'

export type { AccordionItemProps } from './accordion-parts'

export type AccordionProps = Omit<BaseAccordion.Root.Props<string>, 'className' | 'orientation'> & {
  /** One line per prop whose meaning isn't obvious: Storybook's props table shows it. */
  variant?: (typeof ACCORDION_VARIANTS)[number]
  className?: string
}

/** What it is, what it does, what Base UI brings. `@example` with realistic content. */
function AccordionRoot({ variant = 'line', className, ...props }: AccordionProps) {
  const look = useMemo(() => ({ variant }), [variant])
  return (
    <AccordionLookContext value={look}>
      <BaseAccordion.Root {...props} className={accordionStyles({ variant }).root({ className })} />
    </AccordionLookContext>
  )
}

// The root's name too: its function is `AccordionRoot`.
AccordionRoot.displayName = 'Accordion'

export const Accordion = Object.assign(AccordionRoot, nameParts('Accordion', { Item: AccordionItem }))
```

Then: export it and its prop types from `src/index.ts` (alphabetical), add it to `storySort` in
`.storybook/preview.ts` if missing, and a changeset (`.changeset/<name>-component.md`, `minor`, "Add `X`: …").

## Styles (`<name>.styles.ts`)

- `tv` from `@/lib/utils`, `slots`, variants typed with `satisfies Record<(typeof X_VARIANTS)[number], object>`.
- States come from Base UI's data attributes (`data-panel-open:`, `data-disabled:`, `data-starting-style:`); check
  the part's `*DataAttributes.d.ts` in `node_modules/@base-ui/react/<component>/`.
- Children react to the trigger with `group` / `group-data-*:` / `group-enabled:group-hover:`; name groups when
  nested (`group/panel`).
- Durations from tokens: `duration-(--duration-fast|base|slow|appear)`, easings `ease-standard|enter|exit`. Hovers
  `base`, popups that open `slow`, and **content that appears in the page `appear`** (700ms: an alert, an empty state,
  a new step, an error under a field), with an 8px rise for big blocks. They look about half as long as they are
  (front-loaded curves): an entrance on `base` reads as a flicker, and one too quick to see isn't worth adding.

## Stories (`<name>.stories.tsx`)

```tsx
const meta = {
  title: 'Components/<Group>/<Name>',
  component: X,
  tags: ['beta'],
  argTypes: { variant: { control: 'inline-radio', options: X_VARIANTS }, children: { table: { disable: true } } },
  args: { onValueChange: fn() },
  parameters: { docs: { description: { component: 'What it is, the one or two things worth knowing, its base.' } } },
  render: (args) => <div className="sb-box-m"><X {...args}>{sections()}</X></div>,
} satisfies Meta<typeof X>

export const Playground: Story = { parameters: { docs: { canvas: { sourceState: 'shown' } } }, play: … }
/** One JSDoc line per story: it's the description on the docs page. */
export const Outline: Story = { args: { variant: 'outline' } }
```

**Descriptions stay short.** The component's: two or three sentences, what it is and when to use it, the one or two
capabilities a reader wouldn't guess, and "Built on Base UI's X" or the idea's credit. Leave out the look, the motion,
the anatomy, every prop and the ARIA details: the props table, the stories and the examples show those. A story's:
one line, saying what that story shows that the others don't. Tone it like Accordion's: "Sections that open and close
under their headings, one at a time or several with `multiple`. Closed panels stay in the page, so the browser's find
can open them. Built on Base UI's Accordion."

Shared markup is a plain function (`sections()`), not a component, so "Show code" shows the markup. Content follows
`docs/plan.md` → Example content (Norte, run #128, `@norte.com`).

Play tests to cover, as `step`s:

- **Roles and names:** `getByRole` for every part; headings at the right level; `aria-expanded`, `aria-controls`,
  `aria-selected`; a region or panel named by its trigger.
- **Pointer:** click changes state; `onXChange` called with the value (`toHaveBeenLastCalledWith(v, expect.anything())`).
- **Keyboard:** `userEvent.tab()` reaches it, Enter and Space act, arrows where the pattern has them.
- **Focus ring draws:** `expect(getComputedStyle(el).outlineStyle).toBe('solid')` after keyboard focus.
- **Disabled:** `toBeDisabled()` or `aria-disabled`, and a click (`{ pointerEventsCheck: 0 }`) changes nothing.
- **States the look depends on:** compare computed colors between states (open vs closed).
- **Motion that measures:** if Base UI measures a size (`--accordion-panel-height`), check the measured value equals
  the final one.

## Pitfalls

Problems already hit once, one file per topic. Read only the files the piece touches, and add a new pitfall to its
topic's file.

- [Styling and layout](pitfalls/styling.md): focus rings that don't draw, tailwind-merge dropping a class, Biome's
  class sort, `rtl:` specificity, translate on rotated elements, flex rows that share space, borders, gaps that can't
  close.
- [Behavior and measuring](pitfalls/behavior.md): boxes Base UI measures, anchored highlights that slide, roots that
  count their children, ResizeObserver's late first report, the first run after a new Base UI import.
- [Motion](pitfalls/motion.md): exits that start before Motion's features load, items that `rise` in turn.
- [Tests and accessibility](pitfalls/tests-and-accessibility.md): hover and pointer moves in play tests, `sr-only`
  in names, `aria-busy` muting live regions, `aria-label` mismatches, computed custom properties, `inert` and Tab.

## Checks, in order

1. While iterating: `pnpm vitest run --project=storybook src/components/<name>`.
2. Before the commit: `pnpm check`, `pnpm test:stories`, the [review checklist](review-checklist.md).
3. The browser only to measure or debug something tests can't show (a jump, a clipped ring), never for screenshots
   of the look; ask the user to look when in doubt.
