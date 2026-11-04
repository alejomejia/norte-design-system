# Decisions

Why Norte is built the way it is. Each record is one decision: the context, what was decided, what it costs, and when
to look at it again. A record is never rewritten after the fact: if a decision changes, a new record replaces it and the
old one says so.

| #                                     | Decision                                  | Status   |
| ------------------------------------- | ----------------------------------------- | -------- |
| [0001](0001-react-for-nextjs-apps.md) | React, for Next.js apps                   | Accepted |
| [0002](0002-tailwind-css.md)          | Tailwind CSS v4, with the tokens as theme | Accepted |
| [0003](0003-tailwind-variants.md)     | tailwind-variants for component styles    | Accepted |
| [0004](0004-base-ui.md)               | Base UI for accessible behavior           | Accepted |
| [0005](0005-biome.md)                 | Biome for linting and formatting          | Accepted |
| [0006](0006-storybook.md)             | Storybook as handbook and test suite      | Accepted |
| [0007](0007-vite-library-build.md)    | Vite library build, ESM only              | Accepted |
| [0008](0008-changesets-and-semver.md) | Changesets and semantic versioning        | Accepted |
| [0009](0009-git-workflow.md)          | One main branch, checked by git hooks     | Accepted |

New record: copy the shape of an existing one, take the next number, and add it to this table.
