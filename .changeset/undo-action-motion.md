---
'norte-design-system': patch
---

`UndoAction` grows in, fades away before `onUndo` is called when it's undone, and once committed dissolves its box and button around the outcome instead of cutting them, so nothing moves.
