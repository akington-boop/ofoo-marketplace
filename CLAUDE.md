# Repository Guidelines: Plugin Marketplace

## Architecture & Layout
This repository acts as an organizational Claude Code marketplace. Components are auto-discovered based on strict folder conventions.

- .claude-plugin/marketplace.json: Registry catalog listing available plugins.
- plugins/<plugin-id>/: Root directory for an individual plugin.
  - .claude-plugin/plugin.json: Required manifest file.
  - skills/<skill-name>/SKILL.md: Domain instructions (optional).
  - commands/<command-name>.md: Custom slash commands (optional).
  - agents/<agent-name>.md: Sub-agent definitions (optional).
  - hooks/hooks.json: Execution triggers (optional).
  - .mcp.json: MCP server integrations (optional).

## Critical Structure Rules
1. Manifest Isolation: The `.claude-plugin/` directory inside a plugin must ONLY contain `plugin.json`.
2. Root Placement: Place `skills/`, `commands/`, `agents/`, `hooks/`, and `.mcp.json` directly under `plugins/<plugin-id>/`, NOT inside `.claude-plugin/`.
3. Progressive Disclosure: Keep `SKILL.md` descriptions under 50 words to avoid context bloat during catalog scans.
4. Path Portability: Always use `${CLAUDE_PLUGIN_ROOT}` inside `.mcp.json` or hook configurations when referring to local plugin assets.

## Local Testing
- Test a plugin in isolation: `claude --plugin-dir ./plugins/<plugin-id>`
- Reload plugin state in active session: `/reload-plugins`
- Run `/marketplace-master` after adding or editing any plugin, and before committing marketplace/plugin.json changes, to catch violations of the Critical Structure Rules above.

## Agent skills

### Issue tracker

Issues live as markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context layout: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.