---
'norte-design-system': minor
---

Add `keys` to `KeyboardKey`, for shortcuts: `keys={['⌘', 'K']}` draws one cap with the keys side by side, like `⌘K`, and
screen readers say the symbols by name ("Command K"; `keyLabels` translates them). The cap is now outlined and flat,
on a muted fill. A single key still goes in `children`.
