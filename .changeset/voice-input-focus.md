---
'@alejomejia/norte-design-system': patch
---

Fix `VoiceInput` taking focus as it mounts in React's Strict Mode, as in a Next.js app in development: focus only moves when recording starts or stops.
