# ofoo-marketplace

A personal Claude Code plugin marketplace: shared skills packaged as installable plugins.

## 📦 Adding this marketplace

```
/plugin marketplace add https://github.com/akington-boop/ofoo-marketplace.git
```

Then install any plugin from it:

```
/plugin install <plugin-id>@ofoo-marketplace
```

## 🧩 Plugins

| Plugin              | Description                                                                          |
| ------------------- | ------------------------------------------------------------------------------------ |
| `wcag-audit`        | WCAG 2.2 AA accessibility auditor, single-pass                                       |
| `ponytail`          | Enforces the laziest working solution (YAGNI ladder)                                 |
| `cve-table`         | npm audit to Vulnerable/Severity/GitHub-Id table                                     |
| `upscale-markdown`  | Decorates Markdown headers with matched emoji                                        |
| `changelog`         | Generates/updates CHANGELOG.md from git history                                      |
| `claudify-prompt`   | Reviews or drafts prompts intended for Claude against a prompt-engineering checklist |
| `phipii-mini-audit` | Audits staged changes for untagged PII/PHI exposure                                  |
| `commit-message`    | Generates a commit message for staged changes, prefixed with an issue ID             |

## ➕ Adding a plugin

1. Scaffold `plugins/<plugin-id>/` following the structure rules in `CLAUDE.md` and the reference schemas in `maintain-plugin.md`.
2. Add the corresponding entry to `.claude-plugin/marketplace.json`.
3. Run the verification check before committing:
   ```
   npm run verify
   ```
   or, from an active Claude Code session, `/marketplace-master` (repo-level skill, lives in `.claude/skills/marketplace-master/`, not a plugin).

## 🛠️ Development

```
npm test     # run verify.ts's unit tests
npm run verify   # check all plugins against the structural rules
```
