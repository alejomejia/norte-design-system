# 0013. A curated set of Lucide icons

**Status:** Accepted · 2026-11-04

## Context

A workspace for AI agents needs a few dozen icons: run, stop, retry, approve, tool, agent. Drawing a set is a design
project of its own, and an app that picks icons freely from a library of thousands ends up with three icons for
"settings".

## Decision

- **[Lucide](https://lucide.dev)** (ISC license) draws the icons, through `lucide-react`.
- **Norte curates them:** an `Icon` component draws one of a short list, named after what the icon means in Norte
  (`agent`, `approve`), not what it shows (`bot`, `check`). The list is `ICONS` in `src/components/icon/icon.const.ts`.
- **One stroke at every size:** icons draw with an absolute 1.5px stroke, so a 16px icon in a button and a 32px icon in
  an empty state have the same weight as the text around them.
- **Accessible by default:** hidden from screen readers unless they have a `label`, then announced as an image.

## Consequences

- Adding an icon is one line in `ICONS`, and the gallery on Foundations/Icons shows it right away.
- Names are typed: a misspelled icon doesn't compile.
- **Cost:** every icon in the list ships with `Icon`, used or not (about 3 KB compressed for 36). If the list grows past
  a hundred, icons move to one export each, which bundlers drop when unused.
- Lucide's look is Norte's look. Redrawing the set later means replacing the components behind the names: apps don't
  change.

## Revisit when

Norte gets icons of its own, or the list grows past a hundred.
