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

## Checks performed

1. **Manifest isolation** — `.claude-plugin/` contains only `plugin.json`.
2. **Root placement** — `skills/`, `commands/`, `agents/`, `hooks/`, `.mcp.json` live directly under `plugins/<id>/`, not nested deeper.
3. **SKILL.md frontmatter** — every `SKILL.md` has `name` and `description`, and the description is 50 words or fewer.
4. **`${CLAUDE_PLUGIN_ROOT}`** — `.mcp.json` / `hooks/hooks.json` use the env var instead of hardcoded local paths.
5. **plugin.json fields** — valid JSON with non-empty `name`, `version`, `description`, `author`.
6. **marketplace.json consistency** — every `plugins/<id>` has a matching entry in `.claude-plugin/marketplace.json`, and vice versa.

## Implementation notes

- **Report-only**: this skill never edits files. Violations are for the developer to fix.
- If `verify.js`'s logic needs to change, update it and its tests together (`test/verify.test.js`, run via `npm test`) — the check functions are unit-tested; don't hand-edit around a failing test.
