# Section guide — project plan narrative

Per-section checklist for AWS Partner GenAI POC / SCA quick project plans. Match the
six top-level sections of the bundled template; do not rename or skip them.

## Cover block (before section 1)

| Field | Required | Notes |
|-------|----------|-------|
| Program label | yes | e.g. APN Partner Deal Acceleration Program |
| PROJECT PLAN | yes | Fixed title line |
| Engagement title | yes | POC / pilot name with primary AWS product if relevant |
| Use-case one-liner | yes | Pipe-separated short UC labels |

## 1 — Project Overview

### 1.1 Executive Summary

- 2–4 paragraphs: customer context, pain, partner + AWS solution, engagement shape
- Close with numbered or bulleted use-case list: title, duration, one-line outcome
- Tone: formal, third person, suitable for AWS Partner review
- Length: ~250–450 words for a 3-UC POC

### 1.2 Stakeholders / team

- Table: Name | Title | Role | Email / Contact
- Group rows: customer escalation (if known), customer stakeholders `(pending)` OK,
  partner escalation + stakeholders + delivery team from `defaults-techx.md`
- Mark unknown customer contacts `(pending)` — do not invent names

### 1.3 Success criteria

- Per use case: 2–4 measurable criteria with thresholds (%, counts, satisfaction scores)
- Prefer test-set sizes (e.g. 50 questions, 100 documents)
- State when human authority remains (final decision stays with the customer)

### 1.4 Assumptions

- 6–12 bullets: region, subscription tier, data provided by customer, SME access,
  non-production data, disabled features (e.g. external web search), UAT ownership

### 1.5 Out of scope

- 5–8 bullets: integrations, production data, real-time streams, custom hosting
  outside managed services, work not listed in scope

## 2 — Scope of Work

- Opening paragraph: total weeks, UC count, high-level outcome
- Per UC subsection `2.x`: title, duration in heading, 4–8 scope bullets
- Bullets = deliverable activities, not architecture

## 3 — Solution Architecture

- Per UC `3.x`: prose walkthrough (trigger → processing → output)
- Name AWS services and data flows; no code or class names
- Optional sub-headings per agent or flow within a UC
- No draw.io required in v1

## 4 — Milestones & Deliverables

- Per UC `4.x`: markdown table — Week | Milestone | Deliverables | Acceptance Criteria
- Align weeks with UC calendar (cumulative across engagement or per-UC — state which)
- `4.n` AWS cost: subscription assumption table + service breakdown, or `(pending)`
- Do not fabricate dollar amounts; use `(pending)` or user-supplied figures

## 5 — Resources & Cost Estimates

- Partner team bullet list (from defaults unless overridden)
- Phase hours table (roles × phases) — default from `defaults-techx.md` if not given
- Contribution split table — `(pending)` for customer/AWS when unknown

## 6 — Path to Production

- Per UC `6.x`: 4–6 bullets — UAT, security review, pilot/shadow mode, production
  promotion, hypercare, ongoing updates
- Include duration hints (e.g. 4-week pilot, 2-week hypercare)

## `(pending)` vs ask

| Situation | Action |
|-----------|--------|
| Customer stakeholder unknown | `(pending)` in table |
| AWS cost not provided | `(pending)` tables + assumption note |
| Success criteria vague from user | Propose measurable defaults; label as proposed |
| Rates/team unchanged | Silent use of TechX defaults |

## Success criteria examples

- Knowledge base indexes ≥95% of provided source documents.
- Q&A agent answers correctly ≥85% on a pre-agreed 50-question test set.
- Review agent detects ≥80% of common errors on a 100-item test set.
- End-user satisfaction ≥4/5 from a 10-person pilot group.
