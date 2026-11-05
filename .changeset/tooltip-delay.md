---
'norte-design-system': minor
---

Open `Tooltip` after 100ms of rest (was 500ms), also outside a `TooltipProvider`, sliding out from its trigger, with new `delay` and `align` props. `TooltipProvider` no longer takes `delay`: set it on each `Tooltip` instead.
