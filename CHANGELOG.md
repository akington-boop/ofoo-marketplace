# Changelog

## [Unreleased] - 2026-09-05

### Added

- `phipii-mini-audit` plugin: audits code for untagged PII/PHI against a research-backed tagging ruleset.
- `commit-message` plugin: generates structured git commit messages with optional issue IDs.
- `verify-marketplace` skill (`.claude/skills/verify-marketplace/`): modular Bash verifier (`verify.sh` + `lib/*.sh`) that checks plugin manifests, catalog entries, and frontmatter.
- `ts-erasable-refactorer` skill (`.claude/skills/ts-erasable-refactorer/SKILL.md`): refactors JavaScript code into zero-compile TypeScript adhering to `erasableSyntaxOnly`.
- Oxlint and oxfmt evaluation documentation under `docs/oxlint-oxfmt/`.

### Changed

- Replaced Node.js/TypeScript verification tools with zero-dependency Bash scripts across the repository (including converting `cve-table` rendering to `render-table.sh`).
- Updated repository guidelines and documentation (`CLAUDE.md`, `README.md`, `maintain-plugin.md`, `docs/agents/`) to reference `verify-marketplace` and current workflow conventions.

### Removed

- `marketplace-master` skill/plugin, replaced by `verify-marketplace`.
- Node.js dependencies and tests (`package.json`, `test/verify.test.js`).
- Obsolete research documentation (`docs/research/bitbucket_w_claude_on_ubuntu.md`).

## [1.2.0] - 2026-08-31

### Added

- LICENSE file for the `ponytail` plugin, carrying over the MIT license and copyright notice from the original upstream project.

### Changed

- `ponytail` README now credits the upstream source, links to its license, and has fully emoji-decorated headers.

## [1.1.0] - 2026-08-29

### Added

- README.md for every plugin in the marketplace (`changelog`, `claudify-prompt`, `cve-table`, `marketplace-master`, `ponytail`, `upscale-markdown`, `wcag-audit`), covering what each does, when to use it, and usage.
- Diagram images for the `cve-table` and `wcag-audit` plugin READMEs.

## [1.0.0] - 2026-08-29

### Added

- `claudify-prompt` plugin: reviews or drafts prompts intended for Claude against a prompt-engineering checklist.
- `marketplace-master` now validates that each plugin's `name` is lowercase kebab-case and matches its folder name.

### Changed

- Renamed the `whs-wcag-audit` plugin to `wcag-audit` across the marketplace, plugin manifest, and skill.
- `marketplace-master` now matches plugins to `marketplace.json` by `name` instead of the unused `id` field.

### Removed

- Dropped the `crux-bot` plugin.

## [0.1.0] - 2026-08-29

### Added

- Initial marketplace repository with plugin catalog: changelog, crux-bot, cve-table, marketplace-master, ponytail, upscale-markdown, and wcag-audit.

### Fixed

- Correct marketplace.json plugin registry entries.
- Fix plugin manifest name and author fields across all plugins.
