---
name: project-plan-generator
description: Use when drafting an AWS Partner GenAI POC or SCA project plan with milestones, architecture narrative, resource estimates, and path to production — especially quick project plans or multi-use-case POC timelines. Trigger on project plan, POC plan, SCA engagement plan, milestones and deliverables, or exporting a partner project plan to Word.
---

# Project Plan Generator

Draft **AWS Partner GenAI POC / SCA project plans** using the bundled Word template
in `assets/`. Engagement customer and use cases change every run; load partner
defaults from `references/defaults-techx.md` unless the user overrides.

**Deliverables:** `docs/<slug>-project-plan.md` then, after approval,
`docs/<slug>-project-plan.docx` via `scripts/fill-plan.py`.

<HARD-GATE>
Do NOT export DOCX or call `fill-plan.py` until the user explicitly approves the
Markdown. Do NOT invent AWS dollar amounts, customer contacts, or headcount —
use `(pending)` or ask. Do NOT reuse names or facts from prior engagements. Do NOT
hand the Markdown over for approval before the tone pass in
`references/human-tone.md` is clean.
</HARD-GATE>

## Checklist

Complete in order:

1. **Read references** - `references/engagement-context.md` (why the document is shaped the way it is; never written into the deliverable), `references/section-guide.md`, `references/defaults-techx.md`, `references/human-tone.md`
2. **Collect inputs (one batch)** — see Interview batch below
3. **Draft full Markdown** - `docs/<slug>-project-plan.md` using the Markdown template
4. **Tone pass** - re-read against `references/human-tone.md`, run its grep, fix every hit
5. **User approves Markdown** - revise until approved
6. **Export DOCX** - run `fill-plan.py` (ensure template exists; see Export DOCX)
7. **Report paths** - both files, any `(pending)` items left for the user, and any tone-grep hit kept on purpose

## Interview batch

Ask in **one message** (defaults apply silently where noted):

| Topic | Required | Default |
|-------|----------|---------|
| Language | ask | English |
| Customer name + context | yes | — |
| Program label | yes | APN Partner Deal Acceleration Program |
| Engagement title | yes | — |
| Use cases (N): title, weeks, scope summary | yes | — |
| Success criteria hints | optional | propose measurable criteria |
| AWS services / region notes | optional | — |
| Out-of-scope hints | optional | propose from section-guide |
| AWS cost inputs | optional | `(pending)` in section 4 |
| Customer stakeholders | optional | `(pending)` in tables |
| Team / rates / split | optional | `defaults-techx.md` |

**Slug:** kebab-case from customer + short engagement name
(e.g. `example-genai-poc`).

## Markdown template

Use YAML frontmatter + six top-level sections. Subsections scale with use-case
count (1–N).

```markdown
---
slug: example-genai-poc
language: en
program: APN Partner Deal Acceleration Program
cover_title: PROJECT PLAN
engagement_title: POC – Example GenAI Engagement
use_case_oneline: Use case 1 label | Use case 2 label | Use case 3 label
customer: Example Customer
partner: TechX
total_weeks: 8
---

## 1 Project Overview

### 1.1 Executive Summary

Prose paragraphs + bulleted use-case list with durations.

### 1.2 Project Sponsor(s) / Stakeholder(s) / Project Team

| Name | Title | Role | Email / Contact |
|------|-------|------|-----------------|
| ... | ... | ... | ... |

Include customer rows or `(pending)`; append TechX rows from defaults.

### 1.3 Project Success Criteria

Per use case: measurable bullets.

### 1.4 Project Assumptions

Bullet list.

### 1.5 Out of Scope

Bullet list.

## 2 Scope of Work

Intro paragraph (total weeks, use-case count).

### 2.1 Use Case 1: Title - N Weeks

Scope bullets.

### 2.2 ...

## 3 Solution Architecture

### 3.1 Use Case 1: ...

Prose architecture walkthrough.

## 4 Summary of Milestones & Deliverables

### 4.1 Use Case 1: ... - Milestones & Deliverables (N Weeks)

| Week | Milestone | Deliverables | Acceptance Criteria |
|------|-----------|--------------|---------------------|
| ... | ... | ... | ... |

### 4.4 Expected AWS Cost Breakdown by Services

The cost section is always keyed `4.4`, because `fill-plan.py` and the template reserve `4.1`-`4.3` for up to three use cases. With fewer use cases, skip the unused numbers.

Subscription assumption table + service breakdown, or `(pending)` with note.

## 5 Resources & Cost Estimates

### 5.1 Partner Technical Team

Bullet list from defaults unless overridden.

### 5.2 Resources & Cost Estimate - All Use Cases (N Weeks)

| Project Phase | PM | SA | AIE 1 | AIE 2 | Tester | DevOps | Total |
|-------------|-----|-----|-------|-------|--------|--------|-------|
| ... | ... | ... | ... | ... | ... | ... | ... |

Second table: contribution split (Customer / Partner / AWS).

## 6 Path to Production

### 6.1 Use Case 1: ... - Path to Production

Bullets: UAT, pilot, production, hypercare.

### 6.2 ...
```

**Rules:** Keep sections 1–6; use `###` keys `5.1` / `5.2` for resource subsections;
heading titles in `###` lines drive DOCX heading text on export.

## Export DOCX

**Dependency:** `python-docx`, supplied per run by `uv run --with python-docx` in the commands below. `<skill-dir>` below means the folder containing this SKILL.md.

**Template:** `assets/project-plan-template.docx` (bundled with the skill). Verify with:

```bash
uv run --with python-docx python3 <skill-dir>/scripts/prepare-template.py
```

**After Markdown approval:**

```bash
uv run --with python-docx python3 <skill-dir>/scripts/fill-plan.py docs/<slug>-project-plan.md
```

Output: `docs/<slug>-project-plan.docx` beside the Markdown file.

The script maps:

- Frontmatter → cover lines
- `###` sections → matching Heading2 bodies in the template
- Markdown tables → template tables (stakeholders, milestones per UC, AWS cost,
  hours, contribution split)

Milestone tables in the bundled template support up to **three** use cases; for
more use cases, keep extra milestone content in Markdown and note manual DOCX adjustment.

## Writing quality

Read `references/section-guide.md` for tone, length, and `(pending)` rules, and
`references/engagement-context.md` for the altitude the document is written at and the
truthfulness rules that outrank brevity.

- Measurable success criteria with test-set sizes where possible
- Explicit assumptions (data, region, subscription, SME access)
- Human decision authority where legally/operationally required
- No fabricated pricing — `(pending)` until user supplies numbers
- **No AI-writing tells.** `references/human-tone.md` is a gate, not advice: banned
  vocabulary (leverage, seamless, robust, pivotal, foster, showcase), trailing
  "ensuring ..." clauses, "not only ... but also", rule-of-three padding, invented
  sections, em dashes, curly quotes, filler assumptions, precision theatre. Run its
  grep on the draft before step 5

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Export DOCX before MD approval | Wait for explicit approval |
| Hard-code a prior engagement | Only use current interview inputs |
| Skip section 1.5 or 6 | All six top-level sections required |
| Invent AWS ARR | `(pending)` or user-supplied figures |
| Wrong `###` keys for section 5 | Use `5.1` and `5.2` |
| Puffery, trailing "ensuring ..." clauses, "not only ... but also" | Run the `human-tone.md` pass before approval |
| Sections the template does not have ("Key Takeaways", "Future Outlook") | Keep sections 1-6 exactly |
| Filler assumptions true of any project ("timelines may shift") | Assumptions this engagement actually depends on |
| Invented precision (94.7%) to look measured | Round proposed threshold, labelled proposed, or `(pending)` |

## Related skills

- **conceptual-design** — optional architecture diagram (`*.drawio`) alongside
  section 3 prose
- **demo-planning** — smaller demo scope, not partner project plans
- **proposal-generator** — customer-facing proposal (mapping + acceptance), not
  this project-plan format
