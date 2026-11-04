# 0001. React, for Next.js apps

**Status:** Accepted · 2026-11-04

## Context

A design system follows the stack of the apps that use it. Norte is a workspace where teams run AI agents and review
their work, and products like it are mostly built with React and Next.js (App Router, Server Components).

The system this one is based on was written in Vue, because the store it served was Vue. Same principle, different
consumers.

## Decision

Components are React 19 function components, written to work in the App Router: interactive components are client
components, and nothing depends on a runtime that only exists in the browser unless it has to.

## Consequences

- Any React app can use it, Next.js or not.
- Vue or Svelte apps can't. They would need their own components on top of the same tokens (see 0002), which is why
  the tokens don't live in JavaScript.

## Revisit when

A product that needs the system isn't built with React.
