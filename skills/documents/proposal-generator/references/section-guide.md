# Section guide - technical proposal (VN template)

Checklist for proposals matching the bundled eight-section template. Keep all **8**
top-level sections; default language is **Tiếng Việt** unless the user requests
English.

## Contents

- Cover
- 1 Tổng quan
- 2 Kiến trúc giải pháp
- 3 Mapping năng lực theo yêu cầu
- 4 Deliverables
- 5 Timeline dự kiến
- 6 Tiêu chí nghiệm thu
- 7 Assumptions
- 8 Out of scope
- `(pending)` vs ask
- Tone

## Cover

| Field | Required | Notes |
|-------|----------|-------|
| Title | yes | `[Tên dự án] Proposal (POC/Production)` |
| Prepared by | yes | Default TechX AI Team |
| Date | yes | `dd/mm/yyyy` or `(pending)` |
| Scope | yes | One-line scope summary |

## 1 - Tổng quan

Section 1 is read by people who did not see the brief and did not scope the
engagement. It states the problem and the commitment. It never narrates how the
proposal was built.

### 1.1 Bối cảnh

2-3 paragraphs, ~200-260 words:

1. The customer's situation, and why the current state does not serve them.
2. The brief's requirements restated as layers of one problem, in the customer's
   own vocabulary.
3. How the layers constrain each other, plus one oblique pointer to the next phase.

**Banned from 1.1:**

| Do not write | Because |
|--------------|---------|
| Engagement type or duration ("POC 2 tuần", "bản pilot này") | 1.1 is the problem, not the contract. Duration belongs to section 5 |
| "Phạm vi được cắt xuống mức nhỏ nhất" | Announces a limitation the reader had no reason to suspect |
| "Đề xuất này cố ý không cam kết ngưỡng" | A term, not context. It belongs to 3.3 and 6 where it binds |
| Any sentence negating an out-of-scope item | Out of scope is handled by silence here; the reason lives in section 8 |

**Silence, not negation.** Describe capability in words true of the in-scope
version. In scope only with a schema → "trích metadata theo schema nghiệp vụ".
Never "chỉ hỗ trợ khi có schema", which advertises the gap in the opening section.

**Vocabulary:** business language. No field names, no library names, no model or
vendor names unless the user asked for them.

### 1.2 Mục tiêu

Assume the reader has never seen the brief; every row stands alone.

Lead-in sentence before the table: how many goals, and where the quality metrics
are defined.

| Cell | Shape |
|------|-------|
| Mục tiêu | **One bold sentence naming what the system does.** Then one sentence on why it matters to the user |
| Đo lường | A countable check: a percentage of the sample set, a named metric, an inspection anyone can repeat |

- **6-10 rows**, one per requirement family in the brief. Three vague goals fail a
  reader who does not have the brief in hand.
- No technical field names in the goal cell (`page_num`, `bbox`, schema keys) -
  those belong to sections 3 and 4.
- Metrics defined elsewhere get a pointer, not a definition: "định nghĩa ở mục 3.x".
- A goal about *producing measurement data* rather than about capability goes in a
  paragraph after the table. Inside the table its measurement cell would be
  self-referential.
- Do not invent thresholds. Propose and label, or `(pending)`.

### 1.3 Phạm vi

Two-column table mapping to the IN / OUT cells in DOCX.

| In scope | Out of scope |
|----------|--------------|
| Plain sentence, no leading dash | Plain sentence, no leading dash |

- **No leading `-` inside cells.**
- **No technical field names** - translate them: "vùng bao trong trang" not `bbox`,
  "cờ đánh dấu nội dung không mang thông tin" not `is_boilerplate`.
- Keep the terms the customer's own brief used (markdown, schema); do not invent
  paraphrases for words they already chose.
- Rows need not pair up. Leave a cell empty rather than forcing a match.
- Each OUT item names a capability only. Its reason lives in section 8.
- 8-12 rows per side is normal for a multi-module brief.

DOCX note: `fill_scope_table` joins the cells with newlines and adds no bullet
glyphs, so dropping `-` renders the Word cell as plain lines.

## 2 - Kiến trúc giải pháp

### 2.1 Kiến trúc tổng thể

- Note `[Ảnh kiến trúc giải pháp]` or reference `*.drawio` path if user has one
- List 4-6 architecture layers as bullets: `Tên lớp: mô tả`

### 2.2 Pipeline / luồng chính

- End-to-end prose: input → steps → output, async/error handling if relevant

### 2.3 Kiểm soát chất lượng & mở rộng

- Metrics, sample sets, reporting; model upgrade / scale path

## 3 - Mapping năng lực theo yêu cầu

- Opening paragraph: how to read the mapping tables
- Per group `3.x`: heading includes group code + name

| ID | Yêu cầu [Khách hàng] & tiêu chí đo | Giải pháp đề xuất (Nền tảng) |
|----|-----------------------------------|------------------------------|
| G1-01 | ... | ... |

Template supports **two** mapping groups in DOCX (3.1, 3.2). Extra groups stay in
Markdown; note manual DOCX adjustment.

### 3.3 Ngưỡng đo lường

- Prose listing metrics needing customer sign-off before evaluation phase

## 4 - Deliverables

| # | Hạng mục | Mô tả |
|---|----------|-------|
| 1 | ... | ... |

4-8 rows typical (code, agents, docs, runbooks, training).

## 5 - Timeline dự kiến

- Notes paragraph: start date, access, sample data dependencies
- Optional bullets: prerequisites, failure scenario if thresholds missed

| Giai đoạn | Nội dung | Output |
|-----------|----------|--------|
| Tuần 1-2 | ... | ... |

## 6 - Tiêu chí nghiệm thu

| # | Tiêu chí | Cách kiểm tra |
|---|----------|---------------|
| 1 | ... | ... |

Align with section 3.3 thresholds when known.

## 7 - Assumptions

6-10 bullet assumptions (data, thresholds, access, SMEs).

## 8 - Out of scope

5-8 bullets - distinct from 1.3 OUT column (here: contractual / phase boundaries).

## `(pending)` vs ask

| Situation | Action |
|-----------|--------|
| Customer name unknown in mapping header | `[Khách hàng]` placeholder |
| Thresholds not given | Propose defaults; mark for sign-off in 3.3 |
| Architecture diagram missing | Keep `[Ảnh kiến trúc giải pháp]` line |
| Date unknown | `(dd/mm/yyyy)` on cover |

## Tone

- Professional Vietnamese (or English if requested)
- Measurable criteria, explicit customer actions
- No fabricated pricing unless user supplies numbers
- Nothing that reads as machine output. The tone gate in SKILL.md (tell list and
  pre-approval grep) applies to every section on this page, and it is checked
  before the Markdown goes to the user, not after
