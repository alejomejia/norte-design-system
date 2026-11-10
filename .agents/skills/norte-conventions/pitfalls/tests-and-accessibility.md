# Pitfalls: tests and accessibility

Play tests in Vitest browser mode, axe, accessible names and live regions.
Each was hit once while building a component. Add a new one at the end of the file for its topic.

- **`userEvent.hover` doesn't trigger CSS `:hover`** in story tests: test hover looks by eye, not in play tests.
- **`sr-only` text counts as a block in testing-library's names** (it's absolutely positioned), so a label plus
  `<span className="sr-only">, 3 waiting</span>` is named "Approvals , 3 waiting" there. Screen readers don't mind;
  match it with `/^Approvals\s?, 3 waiting$/` instead of moving the text around.
- **Biome flags `render={<h2 />}` as an empty heading:** in stories, pass a function, `(props) => <h2 {...props} />`.
- **Base UI ignores simulated pointer moves** (no movement), so `userEvent.hover` never puts a list in pointer mode
  and leaving a row doesn't clear it: dispatch a `pointermove` with `movementY: 1`, then a `pointerout` (Menu's play test).
- **`aria-busy` on a container can mute the live regions inside it:** some screen readers hold their announcements
  until it's no longer busy. Keep it for things with nothing to announce inside (a loading button, a table of
  skeletons); a container whose content speaks as it changes (a message streaming its answer) names its state another
  way, like Message's status word.
- **An `aria-label` that doesn't hold the visible text, in order, fails axe** (`label-content-name-mismatch`), and
  text in separate spans joins with no spaces ("Tandem pricingtandem.example"). Name a row link from its own content
  with `sr-only` joiners (", ", ": ", " (opens in a new tab)"), as Source list does.
- **`getComputedStyle` returns a custom property as written,** with `var()` filled in but `calc()` left alone
  (`calc(4rem * -1)`): test the property that uses it (`mask-position`), and wait for every layer that transitions,
  not just the first to arrive (Suggestions' Overflow test).
- **user-event's Tab doesn't skip `inert` elements,** as a browser does: it tries to focus them and focus stays put.
  Check inertness directly (`el.focus()`, then `not.toHaveFocus()`) and move on with `.focus()` (Approval request's
  Keyboard test).
- **A popup is not `toBeVisible()` right after it opens:** it's still at its starting style's opacity. Check what
  opened by its name and description (`toHaveAccessibleDescription`), or `waitFor` it (Stat's help popover).
