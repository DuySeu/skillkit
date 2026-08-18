---
name: performance-optimization
description: "Use when the user explicitly requests a performance review, scalability review, production-grade performance audit, or asks which code paths will not scale / what concurrent load a path can handle. Trigger for Python, TypeScript/JavaScript, Go, and web frontend. Do not trigger for general code review, security-only review, or measurement-led optimize-and-fix work unless they ask for this audit."
---

# Performance Optimization

## Overview

Production-oriented **performance and scalability audit** of the current codebase. Default mode is **report only**: find bottlenecks, classify scale risk, assign qualitative capacity bands, suggest improvements. Do not change application code unless the user explicitly asks after reading the report.

**Core principle:** Static review is enough to ship the report. Never invent precise RPS or concurrent-user counts. Capacity is expressed as bands with stated assumptions.

## Workflow

1. Stay in audit mode — do not expand into security/style review or start fixes.
2. Detect languages and stacks in scope (frontend and backend when both exist). Cite evidence (`package.json`, `go.mod`, `*.py`, etc.). Apply monorepo rules below.
3. Load **only** matching files under `references/`, and **always** load `references/scalability-capacity-bands.md`.
4. Static-review hot paths: entrypoints, handlers, DB/remote calls, loops, shared mutable state, unbounded work.
5. Emit findings with severity Critical / Medium / Low. Track = `web` | `api` | `runtime` only (scalability lives in the Path Capacity table, not a separate track).
6. Build the **Path Capacity** table using selection rules and allowed verdict↔band pairs in `scalability-capacity-bands.md`.
7. Write `performance_optimization_report.md` at the project root (or a path the user gives). If the file exists, overwrite in place and say so in the chat summary.
8. Summarize in chat; offer fixes only if the user asks.

### Which references to load

| Evidence in scope | Load |
|-------------------|------|
| Web/UI assets, React/Vue/etc. | `web-frontend-performance.md` |
| HTTP/RPC handlers, APIs, jobs | `api-backend-performance.md` |
| Python | `python-performance.md` |
| TypeScript / JavaScript | `typescript-javascript-performance.md` |
| Go | `golang-performance.md` |
| Every audit | `scalability-capacity-bands.md` |

### Monorepo / scope

- Default: workspace root, or paths the user named.
- Multiple apps: list candidates briefly; audit the package(s) named by the user, else the primary app evidenced by open files / recent edits / root README. State which was chosen. Do not silently audit every package.
- Incidental metrics (pasted timings, existing profiles): may strengthen severity. Never block the report to gather new measurements.

## Severity

| Level | Meaning |
|-------|---------|
| Critical | Likely production incident or hard ceiling under modest growth |
| Medium | Clear bottleneck or scale friction before production scale goals |
| Low | Hygiene / improvement; not blocking typical production |

## Report format

Write markdown with this shape:

1. Executive summary (production-readiness for perf/scale).
2. **Path Capacity** table: path/symbol, verdict, band, assumptions.
3. Findings by severity (Critical → Medium → Low).
4. Each finding: numeric ID, track (`web` \| `api` \| `runtime`), file:line, one-sentence impact, why, suggested improvement. Cite Path Capacity **symbol/name** exactly when relevant — do not put conflicting verdict/band pairs on the finding itself.
5. Optional “what to measure next” (profilers/benchmarks) — optional, not a gate.

### Finding template

```markdown
### P-001 — [short title]
- **Severity:** Critical | Medium | Low
- **Track:** web | api | runtime
- **Location:** `path/to/file.ext:LINE`
- **Path:** `SymbolOrHandlerName` (from Path Capacity table, if applicable)
- **Impact:** One sentence.
- **Why:** …
- **Suggestion:** …
```

## Tone

Be specific, explain why, suggest rather than demand, prioritize, and call out good patterns when present.

## Red flags — stop and correct

| Excuse | Reality |
|--------|---------|
| "Ship tonight — just give RPS numbers" | Use qualitative bands + assumptions only |
| "I'll fix the N+1 while reviewing" | Finish the report first; fix only after explicit ask |
| "Also check security / style" | Out of scope unless user asked another skill |
| "No profiles, so I can't severity-rate" | Static audit is enough; suggest measure-next optionally |
| "Scales + Needs horizontal scale" | Forbidden pair — see capacity-bands reference |

**Violating the letter of these rules is violating the spirit.**

## After the report

Tell the user where the report was written. If they want fixes, do one finding at a time and follow their normal change/approval workflow.
