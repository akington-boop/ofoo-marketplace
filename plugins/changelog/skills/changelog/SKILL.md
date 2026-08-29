---
name: changelog
description: Generate or update a CHANGELOG.md following the Keep a Changelog standard. Use when the user says "/changelog", "generate changelog", "update changelog", or "write the changelog".
version: 1
prompt:
  options:
    - name: mode
      description: "Source of changes to document"
      values: [staged, commits, full]
      default: staged
    - name: version
      description: "Version label for the changelog entry (e.g. 1.0.0); omit to use [Unreleased]"
      type: string
---

# changelog

Generate or update a `CHANGELOG.md` in the current project using staged/committed git history, formatted to the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) standard.

## Steps

1. **Read existing changelog** — Check if a `CHANGELOG.md` already exists. If so, read it to find the latest recorded version and date so you know where to start.

2. **Collect commits** — Run the appropriate git command based on context:
   - If updating an existing changelog: `git log <last-tag>..HEAD --oneline --no-merges`
   - If no prior version: `git log --oneline --no-merges` (last 50 commits max)
   - If the user wants to document staged changes specifically: use `git diff --staged --stat` and `git diff --staged` to describe the changeset directly.

3. **Filter noise** — Exclude commits whose messages are purely mechanical: `fix typo`, `bump version`, `merge branch *`, `wip`, formatting-only changes. Keep anything with user-facing value.

4. **Categorize** — Map each change to exactly one of the six Keep a Changelog categories. Do not invent custom headings:
   - **Added** — new capability or feature
   - **Changed** — modified existing behaviour
   - **Deprecated** — functionality being phased out
   - **Removed** — capability deleted
   - **Fixed** — bug or regression corrected
   - **Security** — vulnerability addressed

5. **Write entries** — Imperative mood, plain language, no internal class/file names unless they aid clarity. Focus on what the user or agent gains. Bad: _"Refactor ScopedCssBaseline repo attribute logic"_. Good: _"Apply ScopedCssBaseline rule universally across all repos"_.

6. **Format the block** — Use this structure. Place the new block immediately after the `# Changelog` header (newest first):

   ```markdown
   ## [Unreleased] - 2026-08-07

   ### Changed
   - Apply ScopedCssBaseline rule universally; remove repo-scoped carve-outs.

   ### Removed
   - Drop ui-messaging-specific view-model/JSX Editor() rule.
   ```

   - Use `[Unreleased]` when no version tag exists for this batch of changes.
   - Use `[x.y.z]` when a git tag is present.
   - Omit empty category headings.

7. **Write the file** — Prepend or create `CHANGELOG.md`. If the file already existed, insert the new block after the `# Changelog` header, before the previous `## [...]` entry.
