---
name: verify-marketplace
description: Verifies this marketplace repo's plugins against the structural rules in CLAUDE.md and maintain-plugin.md — manifest isolation, root placement, SKILL.md frontmatter, ${CLAUDE_PLUGIN_ROOT} usage, plugin.json fields, and marketplace.json consistency. Use for "/verify-marketplace" or when adding/reviewing a plugin.
---

# verify-marketplace

Runs the marketplace's structural verification checks and reports the results. All checking logic lives in `verify.sh` and its `lib/` modules, colocated with this file — read those files if you need to know exactly what a check does; don't re-derive the rules from memory.

## Steps

1. From the repo root, run:
   ```
   .claude/skills/verify-marketplace/verify.sh
   ```
2. Print the report it emits directly — it is already formatted Markdown.
3. If it reports violations, summarize the highest-priority fix in one line before the full report.
4. If `verify.sh` fails to run (throws, non-zero exit with no report, syntax error) — do not invent or guess at a report. Print the raw error and stop.
5. If this run was triggered by adding or updating a plugin (not just a routine check), also:
   - Add or update `plugins/<id>/README.md` for that plugin — what it's for, when to use it, usage — matching the style of existing plugin READMEs.
   - Add or update the root `CHANGELOG.md` with an entry for the change, following the existing Keep a Changelog style in that file (or use the `changelog` skill).
     Root `README.md`'s plugin table is already kept in sync automatically (see below) — don't hand-edit it.

### Example output

Clean run: `verify.sh` prints "No violations found." — relay it as-is, no extra summary line.

Violations found: `verify.sh` prints a Markdown report with one line per violation, e.g. `plugin-foo/manifestIsolation: .claude-plugin/notes.txt should not exist — .claude-plugin/ must contain only plugin.json`. Precede it with a one-line summary of the highest-priority fix, e.g. "Highest priority: `plugins/foo` is missing `plugin.json`."

## Checks performed

1. **Manifest isolation** (`check_manifest.sh`) — `.claude-plugin/` contains only `plugin.json`.
2. **Root placement** (`check_manifest.sh`) — `skills/`, `commands/`, `agents/`, `hooks/`, `.mcp.json` live directly under `plugins/<id>/`, not nested deeper.
3. **SKILL.md frontmatter** (`check_skills.sh`) — every `SKILL.md` has `name` and `description`, and the description is 50 words or fewer.
4. **`${CLAUDE_PLUGIN_ROOT}`** (`check_env.sh`) — `.mcp.json` / `hooks/hooks.json` use the env var instead of hardcoded absolute paths.
5. **plugin.json fields** (`check_manifest.sh`) — valid JSON with non-empty `name`, `version`, `description`, `author` (string or `{name}` object); `name` must be lowercase kebab-case and match its plugin folder name.
6. **marketplace.json consistency** (`check_market.sh`) — every `plugins/<id>` has a matching entry in `.claude-plugin/marketplace.json`.
7. **Frontmatter lint (suggestion, not a violation)** (`check_skills.sh`) — for any `SKILL.md` changed in the working tree (`git diff --name-only HEAD`), flags frontmatter fields Claude Code doesn't use (anything outside `name`, `description`, `license`, `allowed-tools`, `metadata`) and suggests removing them. Printed as `suggestion` lines; doesn't count toward total violations.

## Implementation notes

- **Report-only for violations**: this skill never edits files to fix a violation — those are for the developer to fix. The one exception: it auto-syncs the README.md plugin table from `marketplace.json` on every run (`sync_readme` in `check_market.sh`), since that's mechanical and always derivable.
- If `verify.sh`'s logic needs to change, update the relevant `lib/*.sh` module directly — there are no colocated unit tests for the bash version, so re-run `verify.sh` against the repo to confirm behavior after edits.
