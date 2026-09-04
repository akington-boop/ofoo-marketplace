# Handoff: phipii-mini-audit plugin docs vs. real source

## Context
Branch: `phipii-mini-audit` in `/home/akington/ofoo-marketplace`. Working on the
`plugins/phipii-mini-audit/` plugin, which documents the `MuiComponentDecoratorPlugin`
(a Webpack 5 build-time AST plugin that injects a `GlobalLinkNoTx` CSS class
into form inputs / MUI components to block PII/PHI from translation vendors).

## What was done this session (research only, no edits yet)
- Read `plugins/phipii-mini-audit/tech-brief.md` and
  `plugins/phipii-mini-audit/pii-protection-implementation-guide.md`. Found both are
  prose/marketing-style summaries with **no actual tagging rules, config
  syntax, or webpack setup code** — the "implementation guide" is literally
  just an 8-line table of contents with no real content.
- Located the real plugin source at
  `~/build/component-decorator/src/Webpack/MuiComponentDecoratorPlugin/`,
  which has a complete README with actual rule syntax, webpack config
  example, and core rules (`MuiComponentDecoratorCoreConfig.ts`,
  `MuiComponentDecoratorTypes.ts`).
- Extracted and reported to the user (not yet written into any repo file):
  - How to tell if something is tagged: check compiled DOM output at runtime
    (injection is invisible in source); Webpack emits a `stats.warnings`
    message per rule that matched nothing.
  - How to add a tagging rule: `component-decorator.config.js` `rules: []`
    entries using `match` + `target` (prop injection) or `wrapWith` (DOM
    wrapper), optionally guarded by `whenProp` (`exact`/`token` match,
    `matchConditionalBranches`), plus wildcard match forms (`*`, `**Foo`,
    `Foo**`, `**Foo**`) and package-mode matching for third-party npm
    packages.
  - Webpack setup snippet: register `MuiComponentDecoratorPlugin` in
    `webpack.config.js` with `configFile`, `className`, `useCoreRules`,
    `includePackages`, `validateRules` options.
  - Core rules already built in (MUI v5 `inputProps.className`, MUI v6
    `slotProps.*.className`, native `input`/`textarea`/`select`) but only
    active when `useCoreRules: true` is set.

Full extracted details are in the assistant's last message of this
conversation (not re-copied here to avoid duplication) — re-read the
conversation transcript, or re-read the source files listed above, rather
than re-deriving from scratch.

## Current git state
```
A  plugins/phipii-mini-audit/README.md
AM plugins/phipii-mini-audit/gemini-prompt.md
?? plugins/phipii-mini-audit/pii-protection-implementation-guide.md
?? plugins/phipii-mini-audit/tech-brief.md
```
No commits made this session. `plugins/phipii-mini-audit/README.md` (already
staged) has NOT been reviewed yet this session — check its content before
assuming it needs the same fix.

## Likely next step (not yet started/agreed with user)
The user was told the marketplace docs should probably be replaced with, or
link to, the real README content from `~/build/component-decorator/src/...`.
Confirm with the user whether they want:
1. The real README copied/adapted into `plugins/phipii-mini-audit/`, or
2. `tech-brief.md` / `pii-protection-implementation-guide.md` rewritten to
   include the actual rule syntax, or
3. Something else (e.g. just a link/pointer to the external repo).

No decision has been made yet — this is a fresh choice for the next session.

## Key file paths
- Marketplace plugin docs: `plugins/phipii-mini-audit/` (tech-brief.md, pii-protection-implementation-guide.md, README.md, gemini-prompt.md)
- Real plugin source (outside this repo): `~/build/component-decorator/src/Webpack/MuiComponentDecoratorPlugin/README.md` and sibling `.ts` files
- Repo root conventions: `CLAUDE.md` at repo root (plugin marketplace structure rules — manifest isolation, `${CLAUDE_PLUGIN_ROOT}`, run `/marketplace-master` before committing plugin.json changes)

## Suggested skills for next session
- `plugin-dev:plugin-validator` — run after any plugin file changes in `plugins/phipii-mini-audit/`
- `plugin-dev:skill-development` or `plugin-dev:plugin-structure` — if restructuring how the docs/plugin are organized
- `mattpocock-skills:writing-for-agents` — if rewriting these docs to be consumed by an agent (SKILL.md-style) rather than a human
