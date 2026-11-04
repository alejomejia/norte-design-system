# 0005. Biome for linting and formatting

**Status:** Accepted · 2026-11-04

## Context

The usual setup is ESLint for linting and Prettier for formatting: two tools, two configs, and a plugin so they don't
fight each other. Here it took nine dev dependencies.

## Decision

[Biome](https://biomejs.dev/) does both, plus import order and Tailwind class order, from one config (`biome.json`).
House rules on top of the recommended ones:

- Named functions and components are declarations, never arrow functions (inline callbacks are fine).
- Type-only imports are marked as such.
- Cross-folder imports use the `@/` alias, never `../`.
- Tailwind classes are sorted.

`pnpm lint` checks, `pnpm lint:fix` fixes what it can, and `pnpm check` runs it in CI mode.

## Consequences

- One tool, one config, and much faster runs.
- **Cost:** a smaller plugin ecosystem (no Storybook-specific rules), and two of the rules above are still in Biome's
  nursery, so they may change between versions.

## Revisit when

The project needs a custom lint plugin, or the deepest type-aware rules that typescript-eslint offers. ESLint is still
the standard in large organizations.
