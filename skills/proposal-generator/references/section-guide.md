# Section guide — technical proposal (VN template)

Checklist for proposals matching the bundled eight-section template. Keep all **8**
top-level sections; default language is **Tiếng Việt** unless the user requests
English.

## Cover

| Field | Required | Notes |
|-------|----------|-------|
| Title | yes | `[Tên dự án] Proposal (POC/Production)` |
| Prepared by | yes | Default TechX AI Team |
| Date | yes | `dd/mm/yyyy` or `(pending)` |
| Scope | yes | One-line scope summary |

## 1 — Tổng quan

### 1.1 Bối cảnh

- 1–2 paragraphs: customer context, pain, why now
- Length: ~120–200 words

### 1.2 Mục tiêu

Markdown table:

| # | Mục tiêu | Đo lường |
|---|----------|----------|
| 1 | … | Measurable threshold |

3–5 goals typical. Do not invent thresholds — propose and label, or `(pending)`.

### 1.3 Phạm vi

Two-column table (maps to IN / OUT cells in DOCX):

| In scope | Out of scope |
|----------|--------------|
| - Hạng mục 1 | - Hạng mục 1 |

Use `-` bullets inside cells. 4–8 items per side typical.

## 2 — Kiến trúc giải pháp

### 2.1 Kiến trúc tổng thể

- Note `[Ảnh kiến trúc giải pháp]` or reference `*.drawio` path if user has one
- List 4–6 architecture layers as bullets: `Tên lớp: mô tả`

### 2.2 Pipeline / luồng chính

- End-to-end prose: input → steps → output, async/error handling if relevant

### 2.3 Kiểm soát chất lượng & mở rộng

- Metrics, sample sets, reporting; model upgrade / scale path

## 3 — Mapping năng lực theo yêu cầu

- Opening paragraph: how to read the mapping tables
- Per group `3.x`: heading includes group code + name

| ID | Yêu cầu [Khách hàng] & tiêu chí đo | Giải pháp đề xuất (Nền tảng) |
|----|-----------------------------------|------------------------------|
| G1-01 | … | … |

Template supports **two** mapping groups in DOCX (3.1, 3.2). Extra groups stay in
Markdown; note manual DOCX adjustment.

### 3.3 Ngưỡng đo lường

- Prose listing metrics needing customer sign-off before evaluation phase

## 4 — Deliverables

| # | Hạng mục | Mô tả |
|---|----------|-------|
| 1 | … | … |

4–8 rows typical (code, agents, docs, runbooks, training).

## 5 — Timeline dự kiến

- Notes paragraph: start date, access, sample data dependencies
- Optional bullets: prerequisites, failure scenario if thresholds missed

| Giai đoạn | Nội dung | Output |
|-----------|----------|--------|
| Tuần 1–2 | … | … |

## 6 — Tiêu chí nghiệm thu

| # | Tiêu chí | Cách kiểm tra |
|---|----------|---------------|
| 1 | … | … |

Align with section 3.3 thresholds when known.

## 7 — Assumptions

6–10 bullet assumptions (data, thresholds, access, SMEs).

## 8 — Out of scope

5–8 bullets — distinct from 1.3 OUT column (here: contractual / phase boundaries).

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
