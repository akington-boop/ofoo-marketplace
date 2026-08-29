# ponytail

Persona skill that enforces the laziest solution that still works — YAGNI as a reflex, not a suggestion.

## 📌 What it's for

Left unchecked, coding assistants tend to over-build: extra abstractions, speculative config, new dependencies for what a few lines would cover. This skill makes Claude stop at the first rung of a ladder that holds:

1. Does this need to exist at all? (skip speculative work)
2. Already in this codebase? (reuse before writing)
3. Stdlib does it?
4. Native platform feature covers it?
5. An already-installed dependency solves it?
6. Can it be one line?
7. Only then: the minimum code that works

It stays active for the rest of the conversation once invoked, and marks deliberate simplifications with a `ponytail:` comment naming the shortcut's ceiling and the upgrade path.

## 🚀 When to use it

- Any coding task — writing, fixing, refactoring, reviewing, or picking between a stdlib function and a new dependency.
- You want the assistant to default to boring, deletable code instead of speculative architecture.

Not for: non-coding requests. Never trades away input validation, error handling that prevents data loss, security, or accessibility basics — those get built in full regardless of intensity.

## 🛠️ Usage

```
/ponytail lite|full|ultra
```

- **lite** — builds what's asked, names the lazier alternative, lets you choose.
- **full** (default) — enforces the ladder; shortest diff, shortest explanation.
- **ultra** — YAGNI extremist; ships the one-liner and challenges the rest of the ask.

Stays active until you say "stop ponytail" / "normal mode", or the session ends.
