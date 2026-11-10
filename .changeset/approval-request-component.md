---
'norte-design-system': minor
---

Add `ApprovalRequest`: an agent asking before it acts, with who asks, what for, a preview that folds when it's long, and what happens next, answered with Reject or Approve, which can be undone for a moment before they run. `UndoAction` now fills its row, with Undo at the end, and takes `afterCommit` (`settle`, or `leave` to fade and close its height), an `icon` and a `tone`.
