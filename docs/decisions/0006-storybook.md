# 0006. Storybook as handbook and test suite

**Status:** Accepted · 2026-11-04

## Context

A design system lives or dies by whether people use it, and people use what they can find, read and trust.
Documentation written apart from the code goes stale, and tests written apart from the docs cover different cases.

## Decision

[Storybook](https://storybook.js.org/) is the handbook, and every story does three jobs:

1. **Documentation,** rendered with the real component. Props tables come from the TypeScript types and their comments.
2. **Review:** designers check components in Storybook before they ship.
3. **A test.** With the Vitest addon, every story renders in a real Chromium (Playwright, not a simulated DOM). It fails
   if it throws, if its `play` function fails, or if the accessibility checks find a violation.

## Consequences

- Docs and tests can't drift from the code, because they are the code.
- Focus, layout and accessibility are tested the way users meet them.
- **Cost:** Storybook is heavy, and browser tests are slower than jsdom. Lighter tools exist (Ladle), with a much
  smaller ecosystem.

## Revisit when

Storybook's build time starts slowing the team down more than it helps.
