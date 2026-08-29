# marketplace-master

Verifies this marketplace's plugins against the structural rules in `CLAUDE.md` — manifest isolation, root placement, `SKILL.md` frontmatter, `${CLAUDE_PLUGIN_ROOT}` usage, `plugin.json` fields, and `marketplace.json` consistency.

## 📌 What it's for

Plugin structure violations (a stray file in `.claude-plugin/`, a mismatched `name` field, a missing `marketplace.json` entry) are easy to introduce and easy to miss in review. This skill runs `verify.js`, which checks:

- **Manifest isolation** — `.claude-plugin/` contains only `plugin.json`
- **Root placement** — `skills/`, `commands/`, `agents/`, `hooks/`, `.mcp.json` sit directly under `plugins/<id>/`
- **`SKILL.md` frontmatter** — every `SKILL.md` has `name` and a description ≤50 words
- **`${CLAUDE_PLUGIN_ROOT}`** — hooks/MCP configs use the env var, not hardcoded local paths
- **`plugin.json` fields** — valid JSON, non-empty `name`/`version`/`description`/`author`, `name` is lowercase kebab-case matching its folder
- **`marketplace.json` consistency** — every plugin folder has a matching registry entry, and vice versa

## 🚀 When to use it

- After adding or editing any plugin, before committing changes to it or to `marketplace.json`.
- As a quick health check across the whole marketplace when something seems off.

Not for: auto-fixing violations — this is report-only, the developer applies the fix.

## 🛠️ Usage

```
/marketplace-master
```

Runs `node plugins/marketplace-master/skills/marketplace-master/verify.js` (equivalent to `npm run verify`) and relays its Markdown report. A clean run prints `✅ All checks passed.`; violations are listed one per bullet, with the highest-priority fix called out first.
