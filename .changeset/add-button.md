---
'norte-design-system': minor
---

Add `Button`: `primary`, `secondary`, `ghost` and `danger` variants in two sizes (`s`, `m`), and `type="button"` by
default so it never submits a form by accident. Built on Base UI.

- **Hover and press:** a fill grows from the button's center on hover, and a press sinks it a little and lets it spring
  back.
- **`loading`:** a spinner in place of the label; the button keeps its width and focus, and ignores clicks.
- **`success`:** set it as `loading` turns off, and the spinner turns into a check that draws itself, then the label
  comes back. Screen readers hear `successLabel` ("Done"). Animated with Motion, which loads the first time a button is
  busy. Adds `motion` as a dependency.
