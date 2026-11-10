# 0016. visx for charts

**Status:** Accepted · 2026-11-10

## Context

The Run view's Details tab needs two charts: tokens per minute over the run (a line) and tool calls by tool
(horizontal bars). Both need axes, a grid, a tooltip that follows the pointer and the keyboard, a summary and a table
for screen readers, and a size that follows their parent. Charts are the one place a design system usually gives up
its own classes for a library's props.

Measured on 2026-11-05: the same line and bar chart (axes, grid, tooltip, resize) bundled with each candidate, React
external, gzipped.

- **visx 4.0.0: 29 KB.** Primitives (scales, shapes, axes) for React 19: the component writes the SVG, so every color
  and line comes from Norte's roles and classes. Tooltips, legends, motion and accessibility are left to the component.
- **Recharts 3.10.1: 111 KB.** The quickest to ship, but v3 bundles Redux Toolkit, Immer and react-redux, and it's
  styled through props, not classes.
- **uPlot 1.6.32: 22.5 KB.** The smallest and fastest, but it draws on a canvas (no DOM for screen readers, no
  classes), isn't React, and is weak at bars.
- **Tremor:** pre-styled Recharts wrappers with their own primitives (Headless UI or Radix, not Base UI).
  `@tremor/react` last published in January 2025 with a React 18 peer, and its copy-paste repository hasn't been
  pushed since October 2025.

## Decision

- **Charts are built on visx 4,** only the packages they use: `@visx/scale`, `@visx/shape` and `@visx/curve`. The
  axes, grid, tooltip, crosshair, keyboard and sizing are Norte's, on the same roles and tokens as every other
  component. `@visx/axis` was left out: it draws tick labels through `@visx/text` with offsets of its own, and a chart's
  ticks are a few `<text>` elements read from the scale.
- **Tremor is the visual reference, not a dependency:** its dashboards (quiet grids, soft areas, tooltips, empty
  states) are studied and rebuilt on visx, and the docs credit the idea ("Idea from Tremor's area chart").
- **Every chart is readable without its picture:** a figure with a summary, its data as a table for screen readers,
  and a plot the keyboard can walk point by point.

## Consequences

- Apps that use a chart install visx's packages with it, under the 29 KB measured for a line and a bar chart (which
  counted `@visx/axis`); apps that don't import a chart load none of it.
- Every color, line and label is a Norte class, so charts change with the theme like everything else.
- **Cost:** tooltips, legends, motion and accessibility are Norte's to build and test, chart by chart.

## Revisit when

A page needs a chart visx's primitives make hard (thousands of points, a map, a zoomable timeline), or a chart library
ships with Norte's same requirements (classes, Base UI, React 19) at a comparable size.
