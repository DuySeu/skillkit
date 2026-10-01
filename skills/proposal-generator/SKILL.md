---
name: proposal-generator
description: Use when drafting a technical or POC proposal — overview, solution architecture, requirement mapping, deliverables, timeline, and acceptance criteria. Trigger on proposal, đề xuất kỹ thuật, technical proposal, POC proposal, mapping yêu cầu, tiêu chí nghiệm thu, or exporting a partner proposal to Word.
---

# Proposal Generator

Draft **technical / POC proposals** using the bundled Word template in `assets/`.
Engagement customer and requirements change every run; load partner boilerplate
from `references/defaults-techx.md` unless the user overrides.

**Deliverables:** `docs/<slug>-proposal.md` then, after approval,
`docs/<slug>-proposal.docx` via `scripts/fill-proposal.py`.

<HARD-GATE>
Do NOT export DOCX or call `fill-proposal.py` until the user explicitly approves
the Markdown. Do NOT invent measurement thresholds or pricing — use `(pending)` or
propose values clearly marked for sign-off. Do NOT reuse names or facts from prior
engagements. Do NOT hand the Markdown over for approval before the tone pass in
`references/human-tone.md` is clean.
</HARD-GATE>

## Checklist

Complete in order:

1. **Read references** - `references/section-guide.md`, `references/defaults-techx.md`, `references/human-tone.md`
2. **Collect inputs (one batch)** — see Interview batch below
3. **Draft full Markdown** — `docs/<slug>-proposal.md` using the MD template
4. **Tone pass** - re-read against `references/human-tone.md`, run its grep, fix every hit
5. **User approves MD** - revise until approved
6. **Export DOCX** - run `fill-proposal.py` (ensure template exists; see Export DOCX)
7. **Report paths** - both files, any `(pending)` / sign-off items, and any tone-grep hit kept on purpose

## Interview batch

Ask in **one message** (defaults apply silently where noted):

| Topic | Required | Default |
|-------|----------|---------|
| Language | ask | Tiếng Việt |
| Project name + POC/Production | yes | — |
| Customer name + context | yes | — |
| Scope one-liner (cover) | yes | — |
| Proposal date | optional | `(dd/mm/yyyy)` |
| Goals + how to measure | optional | propose thresholds |
| IN / OUT scope hints | optional | propose from context |
| Architecture / AWS stack | yes | — |
| Requirement groups (N) + items | yes | 2 groups typical |
| Timeline (weeks) + phases | yes | — |
| Acceptance criteria | optional | align with 3.3 thresholds |
| Prepared by | optional | TechX AI Team |

**Slug:** kebab-case from customer + short project name
(e.g. `example-genai-poc`).

## Markdown template

YAML frontmatter + eight top-level sections. Mapping groups scale 1–N in Markdown;
DOCX template fills **two** mapping tables (3.1, 3.2).

```markdown
---
slug: example-genai-poc
language: vi
title: [Tên dự án] Proposal (POC)
prepared_by: TechX AI Team
date: (dd/mm/yyyy)
scope: POC triển khai trợ lý AI trên AWS
customer: Example Customer
engagement_type: POC
total_weeks: 8
---

## 1 Tổng quan

### 1.1 Bối cảnh

Para 1: customer situation and why the current state does not serve them.
Para 2: the problem restated as layers, from the brief.
Para 3: how the layers constrain each other, and a forward pointer to the
next phase. No engagement meta - see Section 1 rules.

### 1.2 Mục tiêu

Lead-in sentence: how many goals, and where the metrics are defined.

| # | Mục tiêu | Đo lường |
|---|----------|----------|
| 1 | **What the system does, one sentence.** Why that matters to the user | Countable check |

Trailing paragraph for any goal about producing data rather than capability.

### 1.3 Phạm vi

| In scope | Out of scope |
|----------|--------------|
| Plain sentence, no leading dash | Plain sentence, no leading dash |

## 2 Kiến trúc giải pháp

### 2.1 Kiến trúc tổng thể

[Ảnh kiến trúc giải pháp]

Giải pháp gồm N lớp chính:

- Lớp 1: mô tả

### 2.2 Luồng xử lý chính

End-to-end prose.

### 2.3 Kiểm soát chất lượng & khả năng mở rộng

Prose.

## 3 Mapping năng lực theo yêu cầu POC

Intro paragraph explaining the mapping tables.

### 3.1 Nhóm G1 — Nhóm yêu cầu 1

| ID | Yêu cầu [Khách hàng] & tiêu chí đo | Giải pháp đề xuất (AWS) |
|----|-----------------------------------|-------------------------|
| G1-01 | … | … |

### 3.2 Nhóm G2 — Nhóm yêu cầu 2

| ID | Yêu cầu [Khách hàng] & tiêu chí đo | Giải pháp đề xuất (AWS) |
|----|-----------------------------------|-------------------------|
| G2-01 | … | … |

### 3.3 Ngưỡng đo lường

Prose — metrics needing sign-off before evaluation.

## 4 Deliverables

| # | Hạng mục | Mô tả |
|---|----------|-------|
| 1 | … | … |

## 5 Timeline dự kiến (8 tuần)

Ghi chú điều kiện timeline.

| Giai đoạn | Nội dung | Output |
|-----------|----------|--------|
| Tuần 1–2 | … | … |

## 6 Tiêu chí nghiệm thu

| # | Tiêu chí | Cách kiểm tra |
|---|----------|---------------|
| 1 | … | … |

## 7 Assumptions

- Assumption 1

## 8 Out of scope

- Hạng mục ngoài phạm vi 1
```

**Rules:** Keep sections 1-8; headings 4, 7 and 8 stay in English because the bundled DOCX template titles them that way; use `###` keys `3.1`, `3.2`, `3.3`; section 1.3
uses the two-column IN/OUT table (not separate bullet lists).

## Section 1 rules

Section 1 is read by people who have not seen the brief and who did not scope the
engagement. It states the problem and the commitment; it never narrates the
proposal's own construction.

### 1.1 Bối cảnh - general, no engagement meta

Write the customer's situation, then the brief's requirements restated as layers
of one problem. 2-3 paragraphs.

**Never appears in 1.1:** engagement type or duration (POC, 2 tuần, pilot); that
scope was narrowed or cut; that thresholds are not committed; any sentence
beginning "đề xuất này không...". Those belong to sections 3, 5, 6 and 8, where they
are terms, not disclaimers.

**Out-of-scope items are omitted by silence, never negated.** A capability left out
is simply not mentioned. Describe what the system does in words true of the
in-scope version: if only schema-driven extraction is in scope, write "trích
metadata theo schema nghiệp vụ", not "chỉ hỗ trợ khi có schema".

Point at the next phase obliquely, at most once: "căn cứ để chốt ngưỡng chất lượng
và phạm vi cho giai đoạn tiếp theo". Business language only - no field names, no
library names, no model or vendor names unless the user asked for them.

### 1.2 Mục tiêu - self-contained and detailed

Assume the reader has never seen the brief. Each row must stand alone.

Goal cell = **one bold sentence naming what the system does**, then one sentence
on why that matters. Measurement cell = a countable check, not an adjective.

- One goal per requirement family in the brief. Typically **6-10 rows**, not 3-5.
- No technical field names in the goal cell (`page_num`, `bbox`, schema key names).
  Those live in section 3 and section 4.
- Metrics defined elsewhere get a pointer, not a definition: "định nghĩa ở mục 3.x".
- A goal about *producing measurement data* rather than about capability goes in a
  paragraph after the table - its measurement column would be self-referential.
- Lead-in sentence before the table: how many goals, and where metrics are defined.

### 1.3 Phạm vi - plain sentences, both columns

Two-column table. **No leading `-` inside cells** and no technical field names -
translate them ("vùng bao trong trang", not `bbox`). Keep terms the customer's own
brief used (markdown, schema) rather than inventing paraphrases for them.

Rows need not pair up; leave a cell empty rather than forcing a match. Each OUT
item names a capability, and section 8 carries its reason - 1.3 stays a list.

Note for DOCX: `fill_scope_table` joins cells with newlines and adds no bullet
glyphs, so dropping `-` means the Word cell renders as plain lines.

## Export DOCX

**Dependency:** `python-docx`, supplied per run by `uv run --with python-docx` in the commands below. `<skill-dir>` below means the folder containing this SKILL.md.

**Template:** `assets/proposal-template.docx` (bundled with the skill). Verify with:

```bash
uv run --with python-docx python3 <skill-dir>/scripts/prepare-template.py
```

**After MD approval:**

```bash
uv run --with python-docx python3 <skill-dir>/scripts/fill-proposal.py docs/<slug>-proposal.md
```

Output: `docs/<slug>-proposal.docx` beside the Markdown file.

The script maps:

- Frontmatter → cover (title, prepared by, date, scope)
- `###` sections → matching Heading bodies
- Tables → goals, IN/OUT scope, mapping (×2), deliverables, timeline, acceptance

## Writing quality

Read `references/section-guide.md` for tone, length, and `(pending)` rules.

- Measurable goals and acceptance criteria
- Section 3.3 thresholds linked to section 6
- Architecture prose - no code; optional `conceptual-design` for `*.drawio`
- Default **Vietnamese**; switch to English only when user requests
- **No AI-writing tells.** `references/human-tone.md` is a gate, not advice: banned
  vocabulary (VN + EN), trailing "đảm bảo..." clauses, "không chỉ ... mà còn",
  rule-of-three padding, invented sections, em dashes, curly quotes, precision
  theatre. Run its grep on the draft before step 5

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Export DOCX before MD approval | Wait for explicit approval |
| Invent signed thresholds | Mark proposed / `(pending)` for sign-off |
| Skip section 3.3 or 6 misalignment | Cross-reference thresholds |
| Section 1 breaks the rules in "Section 1 rules" above | Re-read that section before approval |
| Puffery, "không chỉ ... mà còn", trailing "đảm bảo..." clauses | Run the `human-tone.md` pass before approval |
| Sections the template does not have ("Kết luận", "Tổng kết") | Keep sections 1-8 exactly |
| Invented precision (94.7%) to look measured | Round proposed threshold, labelled proposed, or `(pending)` |
| Confuse with project-plan | Proposals = mapping + acceptance; plans = milestones + partner cost |

## Related skills

- **project-plan-generator** - AWS Partner project plan (EN milestones / cost /
  path to production), not this proposal format
- **conceptual-design** - optional architecture diagram for section 2.1
