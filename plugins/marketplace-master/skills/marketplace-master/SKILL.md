---
name: marketplace-master
description: Verifies this marketplace repo's plugins against the structural rules in CLAUDE.md and maintain-plugin.md — manifest isolation, root placement, SKILL.md frontmatter, ${CLAUDE_PLUGIN_ROOT} usage, plugin.json fields, and marketplace.json consistency. Use for "/marketplace-master" or when adding/reviewing a plugin.
---

# marketplace-master

Runs the marketplace's structural verification checks and reports the results. All checking logic lives in `verify.js`, colocated with this file — read that file if you need to know exactly what a check does; don't re-derive the rules from memory.

## Steps

1. From the repo root, run:
   ```
   node plugins/marketplace-master/skills/marketplace-master/verify.js
   ```
   (equivalent to `npm run verify`).
2. Print the report it emits directly — it is already formatted Markdown.
3. If it reports violations, summarize the highest-priority fix in one line before the full report.
4. If `verify.js` fails to run (throws, non-zero exit with no report, syntax error) — do not invent or guess at a report. Print the raw error and stop.

### Example output

Clean run: `verify.js` prints `✅ All checks passed.` — relay it as-is, no extra summary line.

Violations found: `verify.js` prints a Markdown report with one bullet per violation, e.g. `- ❌ plugins/foo/.claude-plugin/ contains extra file: notes.txt (manifest isolation)`. Precede it with a one-line summary of the highest-priority fix, e.g. "Highest priority: `plugins/foo` is missing `plugin.json`."

## Checks performed

1. **Manifest isolation** — `.claude-plugin/` contains only `plugin.json`.
2. **Root placement** — `skills/`, `commands/`, `agents/`, `hooks/`, `.mcp.json` live directly under `plugins/<id>/`, not nested deeper.
3. **SKILL.md frontmatter** — every `SKILL.md` has `name` and `description`, and the description is 50 words or fewer.
4. **`${CLAUDE_PLUGIN_ROOT}`** — `.mcp.json` / `hooks/hooks.json` use the env var instead of hardcoded local paths.
5. **plugin.json fields** — valid JSON with non-empty `name`, `version`, `description`, `author` (string or `{name}` object); `name` must be lowercase kebab-case and match its plugin folder name.
6. **marketplace.json consistency** — every `plugins/<id>` has a matching entry in `.claude-plugin/marketplace.json`, and vice versa.

## Implementation notes

- **Report-only for violations**: this skill never edits files to fix a violation — those are for the developer to fix. The one exception: it auto-syncs the README.md plugin table from `marketplace.json` on every run (`syncReadme`), since that's mechanical and always derivable.
- If `verify.js`'s logic needs to change, update it and its tests together (`test/verify.test.js`, run via `npm test`) — the check functions are unit-tested; don't hand-edit around a failing test.
