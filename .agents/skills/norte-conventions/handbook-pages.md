# Handbook pages

How Norte writes its Storybook-only pages (`src/handbook/`): foundations, guides, the docs blocks. Read it when a
change touches one.

- Every page opens with `PageHeader`; sections are `##`, subsections `###` with a one-line description under them.
- Foundation pages render **live tokens** through the blocks in `src/handbook/blocks/`, never a value typed by hand.
- Every token is a `CopyToken` chip that copies its **variable** (`var(--color-ink)`), never the raw value. A new
  token gets its card or row on its foundation page in the same change.
- **Links that leave Storybook open in a new tab,** with an arrow and "(opens in a new tab)" for screen readers. MDX
  links do it on their own (`docs-link.tsx`); a block that renders its own link uses `DocsLink` or `isExternal`.
