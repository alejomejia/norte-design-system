# norte-design-system

## 0.1.0

### Minor Changes

- 413c767: Add `Badge`, a short label for a status or a count, in five tones (`neutral`, `accent`, `success`, `warning`,
  `danger`). `dot` shows a dot in its tone, and `live` pulses it for a state that's still changing, like a run in progress.
- d9fae2d: Add the brand foundations to `theme.css`. Colors come in two layers: primitives (a neutral scale, one blue accent and
  status colors) and roles that components read (`canvas`, `surface`, `ink`, `line`, `accent`, `focus`, `success`…). It
  also adds the type scale (`text-caption` to `text-display`, in Inter and JetBrains Mono), font weights, radii, shadows,
  easings and durations, which drop to zero under reduced motion.
  
  The theme replaces Tailwind's defaults: classes like `bg-blue-500`, `text-xl` or `rounded-lg` no longer exist in apps
  that import it. Use the Norte names instead (`bg-accent`, `text-heading-s`, `rounded-l`).
- 6478e6a: Add `Button`: `primary`, `secondary`, `ghost` and `danger` variants in two sizes (`s`, `m`), and `type="button"` by
  default so it never submits a form by accident. Built on Base UI.
  
  - **Hover and press:** a fill grows from the button's center on hover, and a press sinks it a little and lets it spring
    back.
  - **`loading`:** a spinner in place of the label; the button keeps its width and focus, and ignores clicks.
  - **`success`:** set it as `loading` turns off, and the spinner turns into a check that draws itself, then the label
    comes back. Screen readers hear `successLabel` ("Done"). Animated with Motion, which loads the first time a button is
    busy. Adds `motion` as a dependency.
- b5785f8: Add `Checkbox`, for options a form saves later: when checked, the box fills and draws its check, and `indeterminate`
  shows a mixed state for a box that checks a group. `children` is its label. Built on Base UI.
- 0e58f58: Add `IconButton`: a square button with an `icon` and no visible label, for actions that repeat in toolbars, rows and
  cards. It has `Button`'s variants, sizes and states, is `ghost` by default, and requires a `label`, its accessible name.
- 7ea71c5: Add `Icon`, which draws one of Norte's 36 icons, drawn by Lucide and named after what they mean (`agent`, `approve`,
  `run`…): `name` picks it, `size` sets `s` (16px, the default), `m` (24px) or `l` (32px), and `label` gives it an
  accessible name when nothing next to it says what it means. It takes the color of its text and keeps a 1.5px stroke at
  every size. Adds `lucide-react` as a dependency.
- dce870f: Add `KeyboardKey`, one key written the way it looks on a keyboard (`<kbd>`). Place several side by side for a shortcut,
  and give symbols a `label` (`Command` for `⌘`) so screen readers say the key's name.
- c9912d9: Add the `--ease-spring` easing (`ease-spring`) and its `--duration-spring` duration: Motion's `spring(0.3, 0.3)` as a CSS
  `linear()` curve, for small things that settle, like a press or a check. `cn` and `tv` now know Norte's easings, so
  `cn('ease-standard', 'ease-spring')` keeps only the last one.
- 0fd0e95: Add `Switch`, for a setting that applies right away: its thumb springs across the track, and stretches toward where
  it's going while pressed. `children` is its label, and clicking the label toggles it. Built on Base UI.

### Patch Changes

- 3008b0c: Add `clsx` and `tailwind-merge` as dependencies: the components merge their classes with an app's `className` through them.
