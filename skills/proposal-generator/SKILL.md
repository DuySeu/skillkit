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
engagements.
</HARD-GATE>

## Checklist

Complete in order:

1. **Read references** — `references/section-guide.md`, `references/defaults-techx.md`
2. **Collect inputs (one batch)** — see Interview batch below
3. **Draft full Markdown** — `docs/<slug>-proposal.md` using the MD template
4. **User approves MD** — revise until approved
5. **Export DOCX** — run `fill-proposal.py` (ensure template exists; see Setup)
6. **Report paths** — both files and any `(pending)` / sign-off items

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

Prose paragraphs.

### 1.2 Mục tiêu

| # | Mục tiêu | Đo lường |
|---|----------|----------|
| 1 | … | … |

### 1.3 Phạm vi

| In scope | Out of scope |
|----------|--------------|
| - Hạng mục trong phạm vi | - Hạng mục ngoài phạm vi |

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

**Rules:** Keep sections 1–8; use `###` keys `3.1`, `3.2`, `3.3`; section 1.3
uses the two-column IN/OUT table (not separate bullet lists).

## Export DOCX

**Dependency:** `pip install python-docx`

**Template:** `assets/proposal-template.docx` (bundled with the skill). Verify with:

```bash
python3 skills/proposal-generator/scripts/prepare-template.py
```

**After MD approval:**

```bash
python3 skills/proposal-generator/scripts/fill-proposal.py docs/<slug>-proposal.md
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
- Architecture prose — no code; optional `conceptual-design` for `*.drawio`
- Default **Vietnamese**; switch to English only when user requests

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Export DOCX before MD approval | Wait for explicit approval |
| Invent signed thresholds | Mark proposed / `(pending)` for sign-off |
| Skip section 3.3 or 6 misalignment | Cross-reference thresholds |
| Wrong 1.3 format | Two-column table, not only bullets |
| Confuse with project-plan | Proposals = mapping + acceptance; plans = milestones + partner cost |

## Related skills

- **project-plan-generator** — AWS Partner project plan (EN milestones / cost /
  path to production), not this proposal format
- **conceptual-design** — optional architecture diagram for section 2.1
