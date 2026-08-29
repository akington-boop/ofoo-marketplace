# Changelog

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
