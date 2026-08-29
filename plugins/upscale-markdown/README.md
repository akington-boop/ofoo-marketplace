# upscale-markdown

Decorates Markdown section headers (`##`/`###`) with semantically matched emoji, so READMEs and reports scan faster. A formatting pass only — wording, code blocks, links, and structure never change.

## 📌 What it's for

Long Markdown docs with plain-text headers are slower to scan than ones with a visual anchor per section. This skill:

- Adds exactly one emoji before each `##`/`###` header, matched to its meaning
- Leaves the H1 title and already-decorated headers untouched
- Picks from a README vocabulary (Overview, Getting Started, Installation, Usage, Architecture, Testing, Security, Contributing, etc.) or a report vocabulary (Objectives, Methodology, Key Findings, Recommendations, etc.), inferred from the document's own headers
- Falls back to judgment for a header that fits no listed term, and skips truly generic ones ("Notes", "Details") rather than forcing a match

## 🚀 When to use it

- You've just written or restructured a README, plugin doc, or report and want it decorated before committing.
- You're reviewing someone else's Markdown and want consistent header emoji without hand-picking each one.

Not for: prose or content edits — this only touches header lines, nothing else in the file.

## 🛠️ Usage

- **File reference** (e.g. `@README.md` or a bare path) — reads the file, decorates it in place with Edit, and reports a short summary of which headers got which emoji.
- **Inline paste** (no file reference) — decorates the pasted Markdown and prints the full result as a fenced code block; no file is written.

```
/upscale-markdown @README.md
```
