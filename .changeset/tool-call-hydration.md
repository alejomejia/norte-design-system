---
'@alejomejia/norte-design-system': patch
---

Fix a hydration warning when `ToolCall` is rendered on a server: its fill's progress is rounded to four decimals, so the server and the browser print the same value.
