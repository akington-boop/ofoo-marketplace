---
name: upscale-markdown
description: Decorate Markdown section headers (H2/H3) with semantically matched emoji to improve scannability in READMEs and reports. Rewrites a file in place if given one, otherwise prints the result.
---

Decorate the headers of a Markdown document with relevant emoji. This is a formatting pass only — never change wording, code blocks, links, or any other content.

## Input handling

Arguments may be:
1. **A file reference** (e.g. `@somefile.md` or a bare path) — read the file, decorate it, then write the result back to the same path with Edit. Report what changed (which headers got which emoji) in a short summary; do not print the full file back.
2. **Raw Markdown pasted inline** (no file reference present) — decorate it and print the full result directly to the terminal as a fenced ` ```markdown ` block. Do not write any file.

If no argument and no pasted content is given, ask the user for the file or text to process.

## Formatting rules (strict)

1. Exactly one space between the emoji and the header text: `## 🚀 Getting Started`.
2. Emoji goes AFTER the `#` markers and BEFORE the text — never before the hashes.
3. Only decorate `##` and `###` headers. Never touch the H1 (`#`) title, and never touch headers already decorated with an emoji.
4. Match each emoji to the header's semantic meaning using the mapping below as the primary vocabulary. If a header doesn't fit any listed term, pick the closest universally recognized emoji by judgment rather than skipping it — but skip generic/ambiguous headers (e.g. "Details", "Notes") if no sensible emoji fits, rather than forcing one.
5. Keep every other character of the document byte-for-byte identical: body text, code blocks, tables, links, list markers, blank lines.

## Emoji vocabulary

**READMEs / repos:**
- Management: 📌 Overview · 🗺️ Roadmap · 👥 Contributors · 📄 License
- Execution: 🚀 Getting Started · 📦 Installation · ⚙️ Configuration · 🛠️ Usage
- Technical: 🧬 Architecture · 📊 Benchmarks · 🧪 Testing · 🛡️ Security
- Community: 🤝 Contributing · 🙌 Acknowledgments · 💬 Support/FAQ

**Reports (business/academic/analytical):**
- Foundations: 🎯 Objectives · 📖 Background · 📝 Executive Summary
- Data & Methods: 🔬 Methodology · 📊 Data Analysis · 📉 Limitations
- Outcomes: 💡 Key Findings · ✅ Recommendations · 🔮 Future Outlook
- End Matter: 📚 References · 📎 Appendix

Infer which vocabulary fits from the document's own headers (a README has Installation/Usage-style sections; a report has Methodology/Findings-style sections) — don't ask the user to pick.
