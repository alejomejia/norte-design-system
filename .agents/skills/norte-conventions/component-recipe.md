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
- Durations from tokens: `duration-(--duration-fast|base|slow)`, easings `ease-standard|enter|exit`. Hovers `base`,
  things that open `slow`. They look about half as long as they are (front-loaded curves), so don't go shorter.

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
`docs/plan.md` → Example content (Lumen, run #128, `@norte.com`).

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

## Pitfalls already hit

- **`outline-none` + `focus-visible:outline-2` on one element draws no ring** (Tailwind v4 sets `--tw-outline-style:
  none`). Drop `outline-none`.
- **A moved box changes a measured height:** a `translate` on the box Base UI measures counts toward its scroll
  height, so the panel overshoots and snaps. Move an inner box that sits inside the padding.
- **`userEvent.hover` doesn't trigger CSS `:hover`** in story tests: test hover looks by eye, not in play tests.
- **Tailwind's `translate-*` sets `translate`, applied outside `rotate`:** to move along a rotated element's own axis,
  use `[transform:…]`.
- **Biome's class sort is an unsafe fix:** `pnpm biome check --write --unsafe <folder>`.
- **First story run after adding a Base UI import** fails while Vite re-optimizes: run it again.
- Specificity: `rtl:` adds none, `group-data-*:` adds some, so a group state beats `rtl:` without ordering tricks.
- **Flexbox shrinks in proportion to width,** so the shortest labels in a row vanish first. To share a row fairly,
  grow instead: `grow basis-0 max-w-max min-w-0` on each item (equal shares, each stopping at its own width).
- **A root that counts or slices its children** sees a fragment as one child: use `flattenChildren` from
  `@/lib/utils`.
- **ResizeObserver's first report waits for a rendered frame,** which test runs can hold back for over a second:
  measure once on mount too (`useOverflows` does).

- **An exit that starts before Motion's lazy features load never runs,** and `AnimatePresence` keeps the element for
  good. Whatever removes itself through an exit (a dismissed alert) also leaves on a timer a little longer than its exit
  (Alert's `ALERT_EXIT_TIMEOUT`), and a play test dismisses it right after render, by keyboard.

## Checks, in order

1. While iterating: `pnpm vitest run --project=storybook src/components/<name>`.
2. Before the commit: `pnpm check`, `pnpm test:stories`, the review checklist in `SKILL.md`.
3. The browser only to measure or debug something tests can't show (a jump, a clipped ring), never for screenshots
   of the look; ask the user to look when in doubt.
