---
name: crux-bot-lint
description: Lint code against the crux-bot merged rules (crux-bot-merged-03.xml). Use when the user says "/crux-bot-lint", "lint against crux-bot rules", or wants a crux-bot compliance report. Default target is staged git changes; "full" targets the client source folder; paths up to 10 levels deep are supported.
version: 5
---

When editing this file, increment `version:` in the front matter as part of the same change.

# crux-bot-lint

Audit code against the canonical crux-bot rule set and produce a markdown report.

## Rule source

`./crux-bot-merged-03.xml` — the file colocated with this SKILL.md, in the
same skill directory (not the cwd, not a notes path). Read it fresh on every
invocation (never cache/paraphrase it from memory). Each `<rule>` has `applies_to`
(glob-scoped), `trigger` (substring/pattern hints), and `message` (what to flag).
`rule_type="advisory"` findings should be reported as advisory, not as hard
violations. If a rule has no `rule_type` attribute, treat it as core by default.

If the rules are updated, edit the canonical copy at
`~/notes/00_AI/crux-bot/rule-source/crux-bot-merged-03.xml` first, then re-copy it into
this skill's directory (and its mirrors in `~/.claude/skills/crux-bot-lint/`
and `~/.agents/skills/crux-bot-lint/`) — see the crux-bot README for the
propagation pattern.

## Inputs

`/crux-bot-lint [target]` — `target` is optional, one of:

- *(absent)* — lint **staged changes** (`git diff --staged`). If nothing is
  staged, fall back to `git diff` (unstaged) and note that in the report. If
  neither has changes, report "no changes to lint" and stop before writing a
  report file.
- `full` — lint the client source tree. Find the folder matching `src/client`
  or `client` (case-insensitive) under the current directory — search
  up to 10 levels deep, don't assume it's at the top level. Skip node_modules
  directories. If more than one match exists, ask the user which to use. If
  none exists, report the miss and stop.
- anything else — treat it as a path (relative or absolute). Search up to 10
  levels deep from the current directory or from the root if an absolute path.
  Skip node_modules directories. If the path is not found, report the miss and
  stop.

## Execution steps

1. Resolve the target per **Inputs** above.
2. Read `crux-bot-merged-03.xml`.
3. Gather the files to review:
   - staged/unstaged mode: the changed file paths from the diff, restricted to
     files matching any rule's `applies_to` glob. For each matched file path,
     read the full current file content (not just the diff lines) before
     applying rules, so that rule triggers that depend on surrounding context
     can be evaluated accurately.
   - full/folder mode: enumerate files under the target matching any rule's
     `applies_to` glob.
4. For each candidate file, check it against every rule whose `applies_to`
   scope covers it. A rule's `trigger` is a hint for what pattern indicates a
   violation — use judgment, not literal string matching, since triggers are
   compressed heuristics.
5. Skip files/folders with no rule coverage silently — don't report "no rules
   applied" noise per file, just omit them from the report.

## Report

Write a markdown file to the **current working directory root** named:

```
crux-lint<shortdate-shorttime>.md
```

e.g. `crux-lint0723-1815.md` (MMDD-HHMM, 24h clock, no separators beyond the
single dash shown).

Report structure:

```markdown
# Crux Bot Lint Report — <human-readable timestamp>

**Target:** <staged changes | unstaged changes | full: <path> | folder: <path>>
**Files scanned:** <n>
**Violations found:** <n> core, <n> advisory

## Violations

### ⚠️ [rule id] — `path/to/file.tsx:line`
**Rule:** <message text>
**Type:** core | advisory
```typescript
<offending snippet>
```

## Clean files
<list files scanned with zero findings, or "All scanned files had findings.">
```

If zero violations: report "✅ No crux-bot rule violations detected." with the
scan summary still included.

## Post-processing

After writing the report, check whether the `upscale-markdown` skill is
available (it decorates headers with emoji for scannability). If available,
invoke it on the generated report file. If not available, skip silently —
this is a nice-to-have, not a requirement.

## Output

Report the absolute path to the generated markdown file and a one-line
summary of findings.

## Triggers

- `/crux-bot-lint`
- `/crux-bot-lint full`
- `/crux-bot-lint <foldername>`
