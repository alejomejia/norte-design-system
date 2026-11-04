# 0010. The theme replaces Tailwind's defaults, and color comes in two layers

**Status:** Accepted · 2026-11-04

## Context

Tailwind ships a full palette, type scale, radii and shadows. Next to a design system's tokens, that means two ways
to write every value: `bg-accent` or `bg-blue-600`, `text-heading-s` or `text-lg`. Every default left in place is a
door for an off-brand value.

Components also need to look right in light and dark themes, and their text has to stay readable in both.

## Decision

- **`theme.css` resets Tailwind's defaults** (`--color-*: initial` and the same for type, weights, radii, shadows and
  easings) and defines only Norte's. Spacing keeps Tailwind's 4px scale, which already matches the grid.
- **Color has two layers.** Primitives describe a value (`--color-blue-600`). Roles describe a purpose
  (`--color-accent`, `--color-ink-muted`) and point at a primitive. Components only read roles.
- **A theme is a set of roles.** The dark theme (`data-theme="dark"`) remaps roles to other primitives, so components
  carry no `dark:` classes.
- **Colors are written in OKLCH,** where equal steps in lightness look equal, which makes the scales even. Every
  primitive stays inside sRGB, so it looks the same on every screen.
- **Contrast is a test, not a review step.** `pnpm test` reads `theme.css`, resolves every role in both themes and
  checks each pair components may combine against WCAG 2.2 AA: 4.5:1 for text, 3:1 for control borders and focus rings.

## Consequences

- One name per value, in the components and in the apps that import the theme.
- A new theme, or a rebrand, is a new set of roles. No component changes.
- A color change that breaks contrast fails before it merges. On its first run the test caught one: white text on the
  dark theme's hover blue was 3.75:1, so the hover got darker instead of lighter.
- **Cost:** apps that import the theme lose Tailwind's default palette and sizes too. That's the point, but an app
  migrating to Norte has to rename those classes, and the changeset says so.

## Revisit when

Norte needs a second brand on the same components (then roles move to per-brand files), or WCAG 3's contrast method
replaces 2.2's.
