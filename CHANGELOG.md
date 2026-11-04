# norte-design-system

## 0.1.0

### Minor Changes

- 413c767: Add `Badge`: a status or a count in five tones, with a `dot` that pulses when `live`.
- d9fae2d: Add the brand foundations to `theme.css`: color roles, type scale, radii, shadows and motion. It replaces
  Tailwind's default theme, so classes like `bg-blue-500` become Norte's (`bg-accent`).
- 6478e6a: Add `Button`: four variants, two sizes, and `loading` and `success` states. Adds `motion`.
- b5785f8: Add `Checkbox`, with an `indeterminate` state for groups.
- 0e58f58: Add `IconButton`: an icon-only `Button` with a required `label`.
- 7ea71c5: Add `Icon`: 36 Lucide icons named by meaning, in three sizes. Adds `lucide-react`.
- dce870f: Add `KeyboardKey`, a key written the way it looks on a keyboard.
- c9912d9: Add the `--ease-spring` easing and `--duration-spring`, made with Motion's `spring()`.
- 0fd0e95: Add `Switch`, for settings that apply right away.

### Patch Changes

- 3008b0c: Add `clsx` and `tailwind-merge` as dependencies, to merge an app's `className`.
