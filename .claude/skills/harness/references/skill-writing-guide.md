# Skill writing guide

Explains in detail how to raise the quality of skills built with the harness. A reference that supplements Step 4 of `SKILL.md`.

---

## Table of contents

1. [How to write `description`](#1-how-to-write-description)
2. [How to write the body](#2-how-to-write-the-body)
3. [How to define the output format](#3-how-to-define-the-output-format)
4. [How to write examples](#4-how-to-write-examples)
5. [How to load only the needed information in stages (Progressive Disclosure)](#5-how-to-load-only-the-needed-information-in-stages-progressive-disclosure)
6. [Criteria for deciding whether to bundle scripts](#6-criteria-for-deciding-whether-to-bundle-scripts)
7. [Data schema standard](#7-data-schema-standard)
8. [What not to put in a skill](#8-what-not-to-put-in-a-skill)
9. [Designing skills for reuse](#9-designing-skills-for-reuse)

---

<a id="1-how-to-write-description"></a>

## 1. How to write `description`

The skill fields exposed to Claude are `name` and `description`, and the specific trigger conditions go in `description`. Claude reads these two fields to decide which skill to use.

### How skills get executed

Claude tends not to run a skill for simple tasks it can easily handle with its basic tools. For example, a simple request like "read this PDF" may not run the skill even if the `description` is well written. The more complex the task, meaning it needs several steps or specialized judgment, the more likely the skill is to run.

### Writing principles

1. State both **what the skill does** and **the specific situations in which it should run**.
2. If there are cases that look similar but must not run the skill, state the scope of application and the exclusion conditions clearly.
3. Given that Claude is conservative about whether to run a skill, phrase the situations that should run it somewhat assertively.
4. For skills that coordinate multiple tasks, always include **words that signal follow-up work** (re-run, modify, supplement, improve previous results).

### Good example

```yaml
description: "Reads PDF files and extracts text and tables, and performs merging, splitting, rotation, watermarking,
  encryption and decryption, and OCR. Always use this skill when the user mentions a .pdf file or requests a PDF
  deliverable. It is especially useful for tasks that need conversion, editing, or analysis rather than a plain
  request to 'read' a PDF."
```

### Bad examples

- `"A skill that processes data"`: too vague to tell which files or tasks it handles.
- `"PDF-related tasks"`: does not say what tasks it can do or when it should run.

<a id="2-how-to-write-the-body"></a>

## 2. How to write the body

### Explain the reason first

When a large language model (LLM) understands why a rule is needed, it can judge appropriately even in exceptional situations. Rather than just listing what to do and what not to do as commands, it is more effective to tell the model why the rule should be followed.

**Bad example:**

```markdown
Always use pdfplumber for table extraction. Never use PyPDF2 for tables.
```

**Good example:**

```markdown
Use pdfplumber when extracting tables. PyPDF2 is for text extraction, so
it cannot preserve the row and column structure of a table. pdfplumber recognizes
cell boundaries and returns structured data.
```

### Fix with a principle that applies to many cases

When you find a problem in feedback or testing, do not add an instruction that fits only that specific example. Fix it with a principle that also applies to other cases.

**Overfitted fix:** `If there is a "Q4 revenue" column, convert that column to a number.`

**Generalized fix:** `If a column name contains a word that indicates a numeric value, such as "revenue", "amount", or "quantity", convert that column to a numeric type. Leave values that cannot be converted as they are.`

### Write in the imperative

Write plain directive forms such as "do X" and "use Y" instead of polite descriptive forms such as "it does X" and "it can do Y". This is because a skill is an instruction sheet that an AI agent must follow.

### Reduce the amount of information to consult at once

The amount of information a model can consult at once (the context window) is limited. This limit includes not only the skill instructions but also the other information the task needs. Judge whether each sentence is essential for the tokens it occupies, using the criteria below.

- "Does Claude already know this?" → Delete it.
- "Does Claude make mistakes without this explanation?" → Keep it.
- "Is one concrete example clearer than a long explanation?" → Replace it with the example.

<a id="3-how-to-define-the-output-format"></a>

## 3. How to define the output format

For a skill whose deliverable format matters, state the structure to follow.

```markdown
## Report structure
Follow the template below exactly.

# [Title]
## Summary
## Key findings
## Recommendations
```

Keep the format description short and add a real example for more effect.

**Deliverables read by the next step of a workflow:** If the next step reads and processes the deliverable in code, specify a **JSON structure** instead of a markdown template. Also state that the final text is return data to hand to the next step, not a message to show the user. `agent()` in `Workflow` enforces the return format through `schema`, so the structure defined in the skill and in the script must match.

<a id="4-how-to-write-examples"></a>

## 4. How to write examples

A concrete example conveys a rule more clearly than a long explanation.

```markdown
## Commit message format

**Example 1:**
Input: Add user authentication using JWT tokens
Output: feat(auth): implement JWT authentication

**Example 2:**
Input: Fix bug where the show password button on the login page does not work
Output: fix(login): fix password visibility toggle button behavior
```

<a id="5-how-to-load-only-the-needed-information-in-stages-progressive-disclosure"></a>

## 5. How to load only the needed information in stages (Progressive Disclosure)

### Method 1: Split files by business domain

```
bigquery-skill/
├── SKILL.md (overview + guidance for choosing a business domain)
└── references/
    ├── finance.md (revenue, billing metrics)
    ├── sales.md (sales opportunities, pipeline)
    └── product.md (API usage, features)
```

When the user asks about revenue, load only `finance.md`.

### Method 2: Read detailed instructions only when needed

```markdown
## Document editing
For simple edits, modify the XML directly.
**If change tracking is needed**, see [REDLINING.md](references/redlining.md).
```

### Method 3: Add a table of contents to large references

For a reference over 300 lines, put a table of contents at the top of the file.

<a id="6-criteria-for-deciding-whether-to-bundle-scripts"></a>

## 6. Criteria for deciding whether to bundle scripts

Look through the work log of the agent that ran the test. If the following things recur, include a script or procedure in the skill.

| Recurring work | Action |
|------------|------|
| The agent writes the same helper script in all three tests. | Put the script in `scripts/`. |
| The agent runs the same `pip install` or `npm install` command every time. | Write a dependency installation step in the skill. |
| The agent follows the same multi-step procedure every time. | Write the standard procedure in the skill body. |
| The agent hits a similar error and works around it the same way every time. | Write the known issue and its fix in the skill. |

Always run and verify any script included in a skill.

## 7. Data schema standard

Use the standard schemas below so that data can be exchanged consistently between skills. The same schemas can also be used when testing and evaluating skills built with the harness.

### `eval_metadata.json`

```json
{
  "eval_id": 0,
  "eval_name": "descriptive-name-here",
  "prompt": "The user's task prompt",
  "assertions": [
    "The deliverable contains X",
    "A file was created in Y format"
  ]
}
```

### `grading.json`

```json
{
  "expectations": [
    {
      "text": "The deliverable contains 'Seoul'",
      "passed": true,
      "evidence": "Confirmed 'Extract Seoul region data' in the third step"
    }
  ],
  "summary": { "passed": 1, "failed": 0, "total": 1, "pass_rate": 1.0 }
}
```

**Note on field names:** Use `text`, `passed`, and `evidence` exactly. Do not rename them to other names such as `name`/`met`/`details`.

### `timing.json`

```json
{
  "total_tokens": 84852,
  "duration_ms": 23332,
  "total_duration_seconds": 23.3
}
```

When a subagent's completion notification arrives, save `total_tokens` and `duration_ms` immediately. These two values can only be checked at the moment the notification is received and cannot be recovered later.

<a id="8-what-not-to-put-in-a-skill"></a>

## 8. What not to put in a skill

- Auxiliary documents such as `README.md`, `CHANGELOG.md`, and `INSTALLATION_GUIDE.md`
- Information needed only while building the skill (test results, iteration history)
- Instructions for users (a skill is an instruction sheet that an AI agent follows)
- General knowledge Claude already has
- Items used only in v1 (`TeamCreate`/`TeamDelete`, experimental flags, a `model` set uniformly for all agents)

## 9. Designing skills for reuse

Before creating a new skill, compare its function with the existing skills in `.claude/skills/`. If you build or extend a harness several times, skills with the same function can pile up under different names.

| Relationship to existing skills | Action |
|------|------|
| An existing skill covers all of the new function | Do not create a new one; connect the existing skill to the agent. |
| It overlaps only partly, and generalizing the existing skill lets it cover the new function too | Generalize and extend the existing skill. |
| It overlaps partly, but the domain is deliberately specialized | Create a separate new skill. |
| The functional scope is entirely different | Create a new one. |

**Principle:** The more a skill focuses on a single role, the easier it is to reuse and the less duplication there is. If a skill has two or more roles, first examine whether it can be split.

### How far to generalize

Generalization can go on endlessly, so stop at the scope of responsibility the skill has taken on. Keep the intended domain specialization and remove only the accidental dependencies.

For example, if you generalize a "fintech risk assessment PDF" skill, it goes as follows.

| Dependency removed | Result |
|------|------|
| Fintech | "Assessment result PDF". Stop here if the scope of responsibility is the assessment report. |
| Assessment | "PDF form filling". If a skill with the same function already exists, do not create a new one; use that skill. |

If the scope of responsibility was set from the start as "fintech risk assessment", do not generalize; keep it as a separate skill.

Extending an existing skill can also change the behavior of the agents that use it. Before extending, check which agents use this skill, and reflect the widened scope of use in `description`.
