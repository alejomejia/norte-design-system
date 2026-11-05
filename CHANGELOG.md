# norte-design-system

## 0.2.0

### Minor Changes

- 02e0c26: Add `CodeField`: a one-time code with one slot per character, paste and autofill. Adds `animate-settle`.
- cc1d2e5: Add `Plan`: an agent's plan as a checklist it ticks off, each finished step struck through.
- 059f67f: Add `PromptInput`: a growing text area with attachments, the model, dictation, and send that becomes stop.
- d17fb14: Add `Reasoning`: an agent's steps under a "Thinking" header with a live clock, folded into one line when done. Adds the
  `animate-shimmer` animation.
- 87b535b: Add `RunStatus`: what an agent is doing in one row, with a rippling lattice and a stopwatch. Adds `animate-glimmer`.
- e905112: Add `Select`: one option from a short list, with a highlight that glides between rows and a `ghost` variant for toolbars.
- 747e1a0: Add `ToastProvider` and `useToast`: Sonner-style stacked toasts, with a type icon, an action and promise toasts.
- d3015f5: Add `ToolCall`: one tool call of an agent as a chip, with a live timer and its outcome. Adds the `animate-nudge` animation.
- 4ded760: Add `Tooltip` and `TooltipProvider`: short labels that warm up across a toolbar, with an optional shortcut. Adds the
  `inverse` and `on-inverse` color roles.
- b85f63a: Add `UndoAction`: a finished action with an Undo button and a draining countdown. Adds `animate-drain`.
- 2e43bbc: Add `VoiceInput`: a mic button that grows into a recording pill with live level bars. Adds the `voice` icon.
- b4dfb74: Add `hover` to `Button`: `fade` brings the fill in quietly, for buttons in a row. `IconButton` always fades, and a ghost icon rests muted.
- 74b5bdf: Add the `surface-strong` and `danger-muted` color roles and the `--duration-slower` duration; `accent-hover` is darker.
- 537d764: Add `keys` to `KeyboardKey`: a shortcut's keys in one cap, like `⌘K`.

### Patch Changes

- 7b8b8ee: `Button` hovers wipe a fill across from the left, and the secondary outline darkens with it.
- 8b31603: `Checkbox` draws its check a moment after the box starts filling.
- 501ecfd: `Checkbox` wipes its fill in from the left when checked, like the `Button` hover.

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
