---
'@alejomejia/norte-design-system': patch
---

Fix a hydration error when `VoiceInput` is rendered on a server: before the first recording, its hidden timer reads `0:00` instead of counting from 1970.
