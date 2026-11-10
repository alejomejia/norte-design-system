# Pitfalls: styling and layout

Tailwind, tailwind-merge, Biome's class sort, flex and grid, and boxes that move or close.
Each was hit once while building a component. Add a new one at the end of the file for its topic.

- **`outline-none` + `focus-visible:outline-2` on one element draws no ring** (Tailwind v4 sets `--tw-outline-style:
  none`). Drop `outline-none`.
- **Tailwind's `translate-*` sets `translate`, applied outside `rotate`:** to move along a rotated element's own axis,
  use `[transform:…]`.
- **A custom utility named `text-…` is merged away:** tailwind-merge reads any `text-x` it doesn't know as a text
  color, so `text-caption text-shimmer` loses one. Name shared utilities so they start with their own word
  (`shimmer-text` in `theme.css`).
- **Biome's class sort is an unsafe fix:** `pnpm biome check --write --unsafe <folder>`.
- Specificity: `rtl:` adds none, `group-data-*:` adds some, so a group state beats `rtl:` without ordering tricks.
- **Flexbox shrinks in proportion to width,** so the shortest labels in a row vanish first. To share a row fairly,
  grow instead: `grow basis-0 max-w-max min-w-0` on each item (equal shares, each stopping at its own width).
- **Tailwind's reset gives every element `border-style: solid`** (with no width): test a border's presence with
  `borderTopWidth`, not `borderStyle`.
- **A parent's `gap` can't close:** an element that collapses its height still leaves the gap above it until it
  unmounts, then the gap snaps shut. When a part closes in place, its space above is its own padding, inside the box
  that closes (Approval request's footer, `pt-4` → `pt-0` in step with Undo action's height).
- **A small icon button's 32px is too big beside a 16px caption:** its hover fill swallows the text. Trim it to 24px
  (`h-6 w-6 rounded-s`, overhanging the row with `-my-1`), WCAG 2.2's minimum target size, 4px after the text (Stat's
  help button).
- **`Skeleton.Text` lines of different sizes stack about 15px apart,** since each bar sits in the middle of its line
  box. For a tight stack, draw `Skeleton.Box` bars sized to the text, and pad around them so the placeholder keeps the
  loaded height (Stat's loading).
- **A line that wraps mid-phrase** ("No change vs run" / "#127"): make it `flex-wrap`, with what must stay together
  in a `whitespace-nowrap` group, so the rest moves to the next line whole (Stat's change line).
- **A sticky table header loses its bottom border** with `border-collapse`: collapsed borders belong to the table, so
  they scroll away under the header. Use `border-separate border-spacing-0` and give each header cell its own
  `border-b` (Data table).
- **A folder created while Storybook runs isn't scanned by Tailwind:** its classes are missing from the page (no grid,
  no padding) until the server rescans, though story tests, which start fresh, pass. Touch `src/styles/index.css` to
  make the running server rescan, or restart it (the sign-in page, `src/handbook/pages/`).
