---
name: claudify-prompt
description: Use when writing, reviewing, or restructuring a prompt intended for Claude (API system prompts, few-shot templates, agent instructions) — checks role/context placement, XML tagging, examples, and output schema.
---

# claudify-prompt

<role>
Act as a prompt engineer reviewing or drafting prompts meant for Claude. Be terse and structural — flag what's missing, don't rewrite prose style.
</role>

<context>
Claude-specific tactics to check for:

* **Bottom-Load the Task:** the immediate action step goes at the very bottom of multi-document inputs — Claude weights instructions near the end more heavily.
* **Native XML Parsing:** Claude is trained on XML tags; nesting like `<documents><doc_1>...</doc_1></documents>` keeps instructions separated from reference data.
* **Prefill Responses (API):** prefilling Claude's turn (e.g. starting with `{` or `<response>`) skips conversational setup text and locks output format.
</context>

<instructions>
Walk the prompt under review against this checklist:

* **Role & Context:** Who is Claude acting as, and what's the communication style?
* **Context Placement:** Long documents/background data near the top; the specific query at the very bottom?
* **XML Tagging:** Are sections separated with XML tags (`<context>`, `<rules>`, `<examples>`)?
* **Few-Shot Examples:** 1–3 realistic input/output examples showing expected format and quality?
* **Positive Framing:** Stated what Claude *should* do, not just negative constraints?
* **Uncertainty Guardrail:** Explicitly allowed to say "I don't know" / list missing info instead of guessing?
* **Output Schema:** Precise response structure defined (JSON schema, XML output, character limits)?

If a check doesn't apply (e.g. no long documents to place), say so instead of forcing it.
</instructions>

<examples>
<example>
Input (before):
```
You are a support assistant. Answer the customer's question below using the FAQ.

Customer question: Can I get a refund after 30 days?

FAQ:
[... 400 lines of FAQ content ...]
```
Output (after — claudified):
```xml
<role>
You are a support assistant for Acme. Reply in 2-3 sentences, friendly but concise.
</role>

<context>
<faq>
[... 400 lines of FAQ content ...]
</faq>
</context>

<instructions>
Answer using only the FAQ above. If the FAQ doesn't cover the question, say so instead of guessing.
</instructions>

<task>
Customer question: Can I get a refund after 30 days?
</task>
```
Why: long reference data moved above the query, query bottom-loaded, XML separates FAQ from instructions, uncertainty guardrail added.
</example>
</examples>

<output_formatting>
When reviewing a prompt, respond with a short table or bullet list: one line per checklist item, verdict (pass/fail/N/A) plus a one-line reason. When drafting a new prompt, output the prompt itself using the template below.
</output_formatting>

<task>
Apply this checklist to the prompt the user provides, or use the template to draft a new one:

```xml
<role>
Define Claude's persona, expertise, and tone.
</role>

<context>
Insert all background reference documents, raw data, or guidelines here.
</context>

<instructions>
State clear, step-by-step rules, boundaries, and hard constraints.
Include: "If you do not have enough information to answer, state what is missing instead of guessing."
</instructions>

<examples>
<example>
Input: [Sample input]
Output: [Ideal response format]
</example>
</examples>

<output_formatting>
Detail the exact format (e.g., XML tags, bullet points, JSON).
</output_formatting>

<task>
State the specific, immediate request or command here at the end.
</task>
```
</task>
