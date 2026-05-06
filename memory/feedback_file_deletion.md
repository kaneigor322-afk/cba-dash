---
name: Always ask before deleting files
description: User wants confirmation before any file is deleted
type: feedback
---

Always ask the user for confirmation before deleting any file, even if it appears unused or redundant.

**Why:** User was not asked before main.jsx was deleted and explicitly called this out.

**How to apply:** Any time a Remove-Item, Delete, or equivalent destructive file operation is about to run, pause and ask first.
