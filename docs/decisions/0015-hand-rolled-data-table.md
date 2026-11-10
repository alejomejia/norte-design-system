# 0015. A hand-rolled data table

**Status:** Accepted · 2026-11-10

## Context

The Run view's Results tab needs a table: five competitors under headers that sort them, a checkbox per row, a header
that stays put while the rows scroll, placeholder rows while they load, an empty state, and the keyboard for all of
it. A headless library is the usual answer, and TanStack Table is the one most React teams reach for.

Measured on 2026-11-10: a table with sorting and row selection, bundled with esbuild, React external, gzipped.

- **TanStack Table 9.3.1: 14.4 KB** (with `@tanstack/table-core` and `@tanstack/store`). Headless, so it styles as
  freely as anything hand-written; what it brings is the state: sorting, selection, filtering, pagination, grouping,
  column sizing, and virtualization with TanStack Virtual. v9 manages that state in a store with atoms and
  subscriptions, a model of its own to learn.
- **Hand-rolled: 3.0 KB for the whole component,** its markup, classes, sorting, selection and row glide (Norte's
  Checkbox, Skeleton and `tv` are shared, so not counted). Sorting is a stable sort with missing values last; selection
  is an array of ids. Both are small pure functions with unit tests.

## Decision

- **`DataTable` is hand-rolled** on a native `<table>`: a caption, column and row headers, `aria-sort`, and every
  control in the Tab order (WAI-ARIA's sortable table, not the arrow-key grid of a spreadsheet).
- **Data-driven:** it takes `columns` and `rows`, and owns sorting and selection, each controlled or not.
- **No runtime dependency:** rows glide to their new places through the Web Animations API, not Motion's layout
  animations, which would bring its 38 KB `domMax`.

## Consequences

- Apps install nothing for it, and every class comes from Norte's roles.
- **Cost:** no filtering, pagination, column resizing, grouping or virtualization. Each one built later is Norte's to
  write and test.
- The API is Norte's own, not TanStack's, so an app that needs more than `DataTable` gives starts over with a library
  rather than growing out of this one.

## Revisit when

A page needs a table with hundreds of rows (virtualization), or two of filtering, pagination and column resizing.
