---
'norte-design-system': minor
---

Add `Icon`, which draws one of Norte's 36 icons, drawn by Lucide and named after what they mean (`agent`, `approve`,
`run`…): `name` picks it, `size` sets `s` (16px, the default), `m` (24px) or `l` (32px), and `label` gives it an
accessible name when nothing next to it says what it means. It takes the color of its text and keeps a 1.5px stroke at
every size. Adds `lucide-react` as a dependency.
