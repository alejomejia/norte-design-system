---
name: base-ui
description: How Norte builds interactive components on Base UI 1.x (@base-ui/react): importing parts, styling them with Tailwind through their data attributes and CSS variables, the render prop, nativeButton, className as a string, forwarding refs and props, and animating popups. Use whenever a component has behavior (buttons, menus, dialogs, popovers, tabs, selects, fields, switches…).
---

# Base UI in Norte

[Base UI](https://base-ui.com/react/overview/quick-start) 1.x (`@base-ui/react`, decision 0004): unstyled,
accessible parts. Norte adds the look. The docs for every component are at `https://base-ui.com/react/components/<name>`,
and each part's props and data attributes are typed in `node_modules/@base-ui/react/<component>/`. Read them before
using a component.

## Imports

One subpath per component, so apps only bundle what they use:

```tsx
import { Button as BaseButton } from '@base-ui/react/button'
import { Menu } from '@base-ui/react/menu'
```

Multi-part components are namespaces: `Menu.Root`, `Menu.Trigger`, `Menu.Portal`, `Menu.Positioner`, `Menu.Popup`,
`Menu.Item`. A Norte compound component wraps each part it styles and exports `Object.assign(Root, { Item })`.

## Styling

- **States are data attributes** on the part: `data-disabled`, `data-highlighted`, `data-checked`, `data-open`,
  `data-pressed`, `data-popup-open`… Tailwind reads them as variants: `data-disabled:opacity-50`,
  `data-highlighted:bg-surface-muted`. Check the part's `*DataAttributes` file for its list.
- **Popups expose CSS variables** (`--anchor-width`, `--available-height`, `--transform-origin`), read with the `(--var)`
  shorthand: `origin-(--transform-origin) max-h-(--available-height)`.
- **Enter and exit animations** use `data-starting-style:` and `data-ending-style:` (Base UI waits for the transition
  before unmounting): `transition-[opacity,scale] duration-(--duration-base) data-starting-style:scale-96 data-starting-style:opacity-0`.
- **`className` is a string in Norte's API.** Base UI also accepts a function of the state; Norte computes its classes
  with `tv` and passes the result, so apps pass a plain string too.

## Props and refs

- Spread the rest of the props onto the Base UI part, so apps keep every native prop (`aria-*`, `onClick`, `type`,
  `form`…) and the `ref` (React 19 passes `ref` as a prop).
- **`render`** swaps the element a part renders (`render={<a href="/runs" />}`). When a button part renders something
  that isn't a `<button>`, set `nativeButton={false}` so Base UI adds the role and keyboard behavior itself.
- **`disabled`** sets `data-disabled` and blocks interaction. `focusableWhenDisabled` keeps it in the tab order: use it
  for a temporary disabled state (a button while its action runs), so focus isn't lost.
- Base UI parts are client components: the files that import them start with `'use client'`.
