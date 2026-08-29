# claudify-prompt

Reviews or drafts prompts intended for Claude against a Claude-specific prompt-engineering checklist.

## 📌 What it's for

Prompts that work fine with other LLMs often leave value on the table with Claude — no XML structure, the actual task buried above a wall of reference data, no guardrail against guessing. This skill checks a prompt (or drafts one from scratch) against seven concerns:

- **Role & Context** — who is Claude acting as, and what's the tone?
- **Context Placement** — long documents near the top, the specific query at the bottom (Claude weights the end of the prompt more heavily)
- **XML Tagging** — sections separated with tags like `<context>`, `<instructions>`, `<examples>`
- **Few-Shot Examples** — 1–3 realistic input/output pairs
- **Positive Framing** — what Claude *should* do, not just constraints
- **Uncertainty Guardrail** — explicit permission to say "I don't know" instead of guessing
- **Output Schema** — a precise response structure (JSON schema, XML, character limits)

## 🚀 When to use it

- You're writing a new system prompt, few-shot template, or agent instruction set for Claude.
- You're reviewing someone else's Claude prompt and want a structural pass, not a prose edit.
- A Claude-based prompt is underperforming and you suspect structure (not content) is the problem.

Not for: prompts targeting other models, or a stylistic rewrite of wording/tone — this skill flags structure, it doesn't rewrite prose.

## 💬 Example interaction

**Developer**, working on a `pr-summarizer` plugin, pastes their draft system prompt:

> ```
> You are a PR summarizer. Given the diff and the list of changed files below, write a summary.
>
> Diff:
> [... 600 lines of diff ...]
>
> Changed files:
> [... 40 file paths ...]
> ```
>
> `/claudify-prompt` review this

**claudify-prompt** responds:

| Check | Verdict | Reason |
|---|---|---|
| Role & Context | fail | No persona or tone specified beyond "PR summarizer" |
| Context Placement | fail | Diff and file list (reference data) are fine at the top, but there's no query below them — the task is only implied by the opening line |
| XML Tagging | fail | No tags; diff and instructions run together as plain text |
| Few-Shot Examples | fail | None — no sample summary shown |
| Positive Framing | pass | "write a summary" is a positive instruction |
| Uncertainty Guardrail | fail | No fallback if the diff is empty or unreadable |
| Output Schema | fail | No length limit or format (prose? bullets? conventional-commit style?) |

Suggested rewrite:

```xml
<role>
You are a senior engineer summarizing a pull request for teammates skimming a PR queue. Be concise and factual.
</role>

<context>
<diff>
[... 600 lines of diff ...]
</diff>
<changed_files>
[... 40 file paths ...]
</changed_files>
</context>

<instructions>
Summarize what changed and why, in 3-5 bullet points. If the diff is empty or the intent isn't clear from the code alone, say so instead of guessing.
</instructions>

<examples>
<example>
Input: a diff adding rate limiting to an API handler
Output:
- Add per-IP rate limiting to `/api/upload`
- Return 429 with a `Retry-After` header on limit breach
- Cover new limiter logic with unit tests
</example>
</examples>

<output_formatting>
3-5 bullet points, no preamble.
</output_formatting>

<task>
Write the PR summary for the diff and changed files above.
</task>
```
