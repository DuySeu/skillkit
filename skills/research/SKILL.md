---
name: research
description: Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent.
---

# Research

Spin up a **background agent** to do the research, so you keep working while it reads. If no Agent or background tool exists, do the same steps inline yourself.

The job:

1. Investigate the question against **primary sources** (official docs, source code, specs, first-party APIs), not a secondary write-up of them. Follow every claim back to the source that owns it.
2. Write the findings to a single Markdown file using the template below.
3. Save it where the repo already keeps such notes; match the existing convention. If there is none, use `docs/research/<topic>.md`.
4. Hand off in one line: report the file path back.

Output template:

```markdown
Question: <the question as asked>
Short answer: <2-3 sentences>
Findings: <one bullet per claim, each ending with a source URL or path/file:line>
Unverified: <what you could not confirm, or "none">
```
