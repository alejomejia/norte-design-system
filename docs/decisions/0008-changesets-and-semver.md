# 0008. Changesets and semantic versioning

**Status:** Accepted · 2026-11-04

## Context

Teams that use a design system need two things from it: to know exactly what changes when they upgrade, and to choose
when they upgrade. A changelog written from memory at release time misses things, and one generated from every commit
is noise.

## Decision

- **Every change that ships records a changeset:** a small Markdown file, written with the change, saying what changed
  for the people who install the package and how big the change is (`patch`, `minor`, `major`).
- **A release turns the waiting changesets into a version.** [Changesets](https://github.com/changesets/changesets)
  bumps `package.json` once, by the biggest change waiting, writes the notes into `CHANGELOG.md` and deletes them.
- **Versions follow [semver](https://semver.org/),** and every release is a git tag (`v0.2.0`). On `0.x`, `minor` also
  covers breaking changes; `1.0.0` comes once a product uses the system in production.
- **`pnpm check` fails** if a branch changed files that ship and has no changeset.

## Consequences

- The changelog is written for the people who read it, one entry per change, at the moment the change is made.
- Teams pin a version and upgrade when they are ready, reading what changed first.
- What ships in each version is always answerable: `CHANGELOG.md`, or `git log v0.1.0..v0.2.0`.
- **Cost:** one more step per change. The check makes it impossible to forget.

## Revisit when

Releases need to happen on every merge. Then the release step moves to CI.
