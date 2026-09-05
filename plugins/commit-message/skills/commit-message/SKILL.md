---
name: commit-message
description: Generate a commit message for staged changes, optionally prefixed with an issue ID (`<ISSUE-ID> | ...`). Use for "/commit-message" or when asked to write/generate a commit message.
---

Generate a commit message for the currently staged changes.

1. Get the issue ID:
   - Read it from the user's request if provided (e.g. arg, or "for ABC-123").
   - Otherwise proceed without one.
2. Inspect staged changes: `git diff --cached --stat` and `git diff --cached` (use `git status --porcelain` to confirm what's staged if needed).
3. Write a commit message summarizing the *why* of the staged diff, one concise subject line:
   - With an issue ID: `<ISSUE-ID> | <summary>`
   - Without one: `<summary>`
   Add a short body only if the change needs more than one line to explain.
4. Render the commit message in chat as the final output. Never run `git commit` (or `git add`) yourself — only the user decides to commit, and only if they explicitly ask.
