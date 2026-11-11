# @alejomejia/norte-design-system

## 0.7.1

### Patch Changes

- 7cce147: Fix a hydration warning when `ToolCall` is rendered on a server: its fill's progress is rounded to four decimals, so the server and the browser print the same value.
- 13bd87e: Fix `VoiceInput` taking focus as it mounts in React's Strict Mode, as in a Next.js app in development: focus only moves when recording starts or stops.

## 0.7.0

### Minor Changes

- f9be52f: Add the helpers' entries: `/utils` (`cn`, `tv`, `toCSSVars`, `formatCompact`, `formatElapsed`, `initials`, `domainOf`), `/hooks` (`useMediaQuery`, `useReducedMotion`, `useInViewport`, `useElapsed`, `useCopy`) and `/motion` (Norte's timings, `loadMotionFeatures`, and Motion's `m`, `AnimatePresence`, `LazyMotion` and `MotionConfig`).
- 5549916: Add `Topography`: a live topographic map drifting north, dark for a cover or light as a texture behind a panel, drawn with WebGL only while on screen.

## 0.6.0

### Minor Changes

- 126d8c5: Add `CodeField`'s `description` and `error`: a wrong code turns the slots red, shakes them once and shows its error under them, on the same field frame as `TextField`, which also ties the label and description to the code for screen readers. The slots now narrow to fit a 320px phone, and a disabled field is gray like a text field instead of faded.
- 68ca8e2: Publish the package privately on GitHub Packages as `@alejomejia/norte-design-system`. Import from `@alejomejia/norte-design-system` instead of `norte-design-system`, and point the `@alejomejia` scope at `https://npm.pkg.github.com` in your app's `.npmrc`.

## 0.5.0

### Minor Changes

- f78a9a2: Add `ApprovalRequest`: an agent asking before it acts, with who asks, what for, a preview that folds when it's long, and what happens next, answered with Reject or Approve, which can be undone for a moment before they run. `UndoAction` now fills its row, with Undo at the end, and takes `afterCommit` (`settle`, or `leave` to fade and close its height), an `icon` and a `tone`.
- 0d73fa7: Add `BarChart`: several things compared, one horizontal bar each, on visx, with Line chart's readout following the pointer and the arrow keys, a summary and the data as a table for screen readers, rows that set its height, and bars that glide to their new lengths and places as the data changes.
- 921144d: Add `Citation`: a numbered marker in an agent's answer that links to its source and previews it on hover or focus (the site, its title and the quoted passage), with a `CitationSource` type to share with a list of sources; plus a `domainOf` URL helper.
- 844133b: Add `DataTable`: rows of records under headers that sort them, with an optional checkbox per row and a select-all, a header that stays put while the rows scroll, placeholder rows while they load and an empty state, on a native table. Rows glide to their new places as they sort. `Icon` gets a `sort` arrow.
- 1071d8b: Add `LineChart`: one number over time on visx, with a crosshair readout that follows the pointer and the arrow keys, a summary and the data as a table for screen readers, a size that follows its box, updates that glide in, and `maxPoints` for a live chart that scrolls.
- 650b246: Add `Message`: one turn of a conversation, with its author's avatar, name and time, a content slot, copy and retry actions that show on hover or focus, and, for agents, a `status` (thinking, streaming, done) that moves the avatar and says what it's doing until there's content; plus a `done` icon, `Tooltip`'s `closeOnClick` and a `shimmer-text` utility in `theme.css`, now shared with `Reasoning`.
- 1d572b7: Add `Message`'s `thinkingEffect` (`breathe` by default, `shimmer` or `none`), `thinkingTimer`, a clock in tenths of a second after "Thinking", and `thinkingSince`. A message is no longer `aria-busy` while an agent writes, so live regions inside it (a streaming answer's paragraphs) are heard.
- 35f7a8e: Add `SourceList`: the sources an agent's run read, folded to a count with their favicons ("5 sources · 1 failed") and opening to rows that link to each source, numbered like the answer's citations, with a failed source saying why.
- 2e9f71a: Add `Stat`: a label, a value and how it moved since a run before (an arrow, colored by whether that's good news, as `better` decides), with an optional help popover and a loading skeleton; `Stat.Group` lays several out as one description list. Adds the `trend-up`, `trend-down` and `trend-flat` icons.
- 1d572b7: Add `StreamingText`: text an agent writes as it arrives, with paragraphs, lists, bold and citation markers (`renderCitation`), revealed word by word at a steady pace behind a breathing caret in one of four `reveal`s (rise, fade, blur, ink), holding back syntax cut off mid-stream, and announced to screen readers a paragraph at a time.
- 9a5e29d: Add `Suggestions`: follow-up prompts as chips that fill the prompt when picked, rising in one after another, in a row that scrolls sideways with fades and chevrons where it hides chips; plus a `ref` on `PromptInput` to focus its text area, and a `rise` animation and a `scroll-fade-x` utility in `theme.css`, now shared with `Tabs`.

## 0.4.0

### Minor Changes

- 044d395: Add the `--duration-appear` token (700ms) for content that appears in the page: Alert, Reasoning's steps, a field's error, Undo action and Skeleton now enter on it, slow enough to be seen.
- 5aa65a2: Add `CommandMenu`: ⌘K opens a search over grouped commands, with recent items, ranked results, shortcuts, a danger tone and an empty result, built on Base UI's Dialog and Autocomplete.
- 8a39e55: Add `EmptyState`: an icon or an image, a title, a description and actions, as a card on a faint topographic map, a dashed space or plain, in sizes `s` and `m`.
- 4ec577b: Add `Sidebar`: the workspace's navigation, with a header, sections of pages with icons, counts and the current page, and a footer, collapsing to its icons with each name in a tooltip; `useSidebar` reads and sets its state. Add the `home` and `sidebar` icons.

### Patch Changes

- 8a98568: Fix the gliding highlight in `Menu` and `Select`: when the pointer leaves the rows (onto a separator, a group label or the popup's edge), it now fades where it is instead of sliding up to the top.
- 4ec577b: Show a pointer over Menu's items, as over Select's options.

## 0.3.0

### Minor Changes

- 8325fbf: Add `Accordion`: sections that open one or several at a time under their headings, with icons, descriptions, two looks and calm height motion.
- d325c12: Add `Alert`: an inline message in four tones with a title, a description, an action and an optional dismiss, rising in as it appears and closing its height when dismissed.
- 239903c: Add `Avatar`: a person's photo or initials, or an agent's colors in one of two effects that move while it works, in three sizes with an optional status dot.
- be09b3c: Add `AvatarGroup`: overlapping avatars of people and agents, capped at `max` with a "+N" whose tooltip names the rest.
- ae624e7: Add `Breadcrumb`: where the page sits in the app, each step a link back up, the current page marked, and a long path's middle folded into a menu.
- 9c76eef: Add the `caption-s` type size (10px) for a few characters in a tight space, and use it for the initials of small `Avatar`s.
- 12bb560: Add `Card`: a surface with optional header, body and footer parts, `outline` or `muted`, in three paddings, that becomes one link with `Card.Link`.
- 80962db: Add the `chevron-left` icon to `Icon`.
- 4014fe0: Add `Dialog` and `AlertDialog`: a window over a dimmed page with a header, a body, a footer and a close, in three sizes, and a confirmation for what can't be undone.
- 980832d: Add `focusableWhenDisabled` to `Button` and `IconButton`, so a disabled button can still open its tooltip, and use it on `PromptInput`'s send button, whose tooltip didn't open on an empty prompt.
- 49d112d: Add `Link`: inline and standalone links with an underline that reacts to hover, that open other sites in a new tab and take a router's link through `render`.
- acb1ee5: Add `Logo`: Norte's needle and outlined wordmark, whole, as the mark or on a tile, in three sizes for light or dark backgrounds, with an optional settle as it appears.
- a7d2d2b: Add `Menu`: items with icons and shortcuts, groups, checkbox and radio items, link items, submenus and a danger tone, with a gliding highlight.
- 8a5f35e: Add the `overlay` color role, ink at 10%: ghost buttons and icon buttons now fill with it on hover, so they darken whatever surface they sit on instead of laying gray over it.
- 5659d7b: Add `Popover`: a small panel that opens from a trigger, with a header, any content and an optional close, in three widths.
- a7d2d2b: Add the `share` and `download` icons to `Icon`.
- 50ba504: Add `Skeleton`: placeholder lines of text, boxes and circles that breathe while content loads, with a label for screen readers.
- 3a65a72: Add `Spinner`: an arc that turns around a faint ring, in Icon's three sizes, named for screen readers or decorative, that draws itself in as it appears. Button and Toast now use it, and under reduced motion their spinners keep turning slowly instead of stopping.
- 80962db: Add `Tabs`: a row of tabs with icons and counts and the active one's panel, in `line` and `segmented` looks and two sizes, with an indicator that glides between tabs.
- 7fed530: Add `TextField`: a labelled input with a description, an error, an optional leading icon and a clear button, in sizes `s` and `m`.
- 6af1d3b: Add `Textarea`: a labelled field that grows with its text up to `maxRows`, with a description, an error and an optional character count.
- 1988e53: Open `Tooltip` after 100ms of rest (was 500ms), also outside a `TooltipProvider`, sliding out from its trigger, with new `delay` and `align` props. `TooltipProvider` no longer takes `delay`: set it on each `Tooltip` instead.
- ae624e7: `Tooltip` takes `disabled`, to stay closed when it would only repeat what's on screen, like a label that isn't truncated.

### Patch Changes

- 8f38b28: Fix `Dialog`: a scrolling body shows its focus ring again when reached by keyboard.
- 0377fb6: Lengthen the duration tokens (`fast` 150ms, `base` 240ms, `slow` 400ms) so transitions on Norte's front-loaded easings are still seen.
- 8a01975: Fix `Tabs`: tabs and panels show their focus ring again when reached by keyboard.
- c9c40a4: Fix `Tooltip` showing behind a dialog, menu or popover it opens from: it now sits a layer above them.
- 9173ef4: `UndoAction` grows in, fades away before `onUndo` is called when it's undone, and once committed dissolves its box and button around the outcome instead of cutting them, so nothing moves.

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
