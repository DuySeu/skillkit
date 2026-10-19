# Skill authoring best practices

Condensed from Anthropic's guide at https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices. Read this while drafting a skill, and run the checklist at the end before calling a skill done.

## Contents

- Frontmatter rules
- Naming
- Writing the description
- Conciseness
- Degrees of freedom
- Progressive disclosure
- Workflows and feedback loops
- Content rules
- Common patterns
- Skills with scripts
- Testing across models
- Checklist before shipping

## Frontmatter rules

`name` has at most 64 characters, only lowercase letters, digits and hyphens, no XML tags, and must not contain the reserved words `anthropic` or `claude`.

`description` is non-empty, at most 1024 characters and has no XML tags (no `<` or `>` at all, since `<topic>` reads as a tag). If the value contains `: ` (colon then space), quote it, or YAML parsers that load the frontmatter will fail and some installers silently skip the skill.

`scripts/quick_validate.py` checks these rules plus the 500-line body limit. Run it on every draft.

## Naming

Prefer the gerund form, which names the activity: `processing-pdfs`, `analyzing-spreadsheets`, `writing-documentation`. Noun phrases (`pdf-processing`) and action forms (`process-pdfs`) are acceptable. Whichever form a collection uses, use it for every skill in that collection.

Avoid vague names (`helper`, `utils`, `tools`), overly generic ones (`documents`, `data`, `files`) and names containing reserved words (`claude-tools`).

## Writing the description

The description is the only part of the skill loaded at startup, and Claude picks from possibly 100+ skills using it alone. It must say both what the skill does and when to use it.

Write in third person, because the description is injected into the system prompt and a shifting point of view hurts discovery.

- Good: "Processes Excel files and generates reports."
- Avoid: "I can help you process Excel files."
- Avoid: "You can use this to process Excel files."

Name concrete trigger terms: file types, phrases users actually type, and adjacent contexts where the skill should still fire. Claude tends to undertrigger skills, so list the situations where the skill applies even when the user never names it.

```yaml
description: Extracts text and tables from PDF files, fills forms, merges documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

Vague descriptions fail selection: "Helps with documents", "Processes data", "Does stuff with files".

## Conciseness

The context window is shared with the system prompt, the conversation and other skills. Once SKILL.md loads, every token competes with them. Assume Claude is already smart and add only what it does not know. For each paragraph ask: does Claude need this explanation, and does it justify its token cost?

Good, about 50 tokens:

````markdown
## Extract PDF text

Use pdfplumber for text extraction:

```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
````

Bad: a paragraph explaining what a PDF is, that many libraries exist and that pdfplumber must be installed first. Claude knows all of that.

## Degrees of freedom

Match how specific the instructions are to how fragile the task is.

| Freedom | Form | Use when |
| --- | --- | --- |
| High | Prose heuristics | Many approaches are valid; decisions depend on context (code review) |
| Medium | Pseudocode or a script with parameters | A preferred pattern exists, some variation is fine (report generation) |
| Low | An exact command, no flags to change | The operation is fragile, consistency is critical, the order matters (database migration) |

A narrow bridge with cliffs on both sides needs exact guardrails. An open field needs a direction and trust.

## Progressive disclosure

Skills load in three levels: metadata (always), SKILL.md body (when triggered), bundled files (only when read or executed).

- Keep the SKILL.md body under 500 lines. Split content into separate files as it approaches that.
- Keep references one level deep: every reference file is linked directly from SKILL.md. When a referenced file links to another file, Claude may only preview the second one (`head -100`) and miss content.
- Give every reference file longer than 100 lines a table of contents at the top, so a partial read still shows the full scope.
- Organize by domain when a skill covers several (`reference/finance.md`, `reference/sales.md`), so Claude loads only the relevant one.
- Name files by content (`form_validation_rules.md`, not `doc2.md`) and use forward slashes in every path.
- Say when to read each file: "For tracked changes, see REDLINING.md".

## Workflows and feedback loops

Break complex operations into numbered steps. For long workflows, give a checklist Claude copies into its response and ticks off:

````markdown
Copy this checklist and track your progress:

```
Task Progress:
- [ ] Step 1: Analyze the form (run analyze_form.py)
- [ ] Step 2: Create field mapping (edit fields.json)
- [ ] Step 3: Validate mapping (run validate_fields.py)
- [ ] Step 4: Fill the form (run fill_form.py)
- [ ] Step 5: Verify output (run verify_output.py)
```
````

For quality-critical output, add a loop: run the validator, fix the errors, run it again, and only continue when it passes. The validator can be a script or a reference document Claude checks the draft against.

For decision points, branch explicitly: "Creating new content? Follow the creation workflow. Editing existing content? Follow the editing workflow." Move large branches into their own files.

## Content rules

- No time-sensitive information. "Before August 2025 use the old API" goes stale. Put the current method in the body and the deprecated one in a collapsed "Old patterns" section.
- Consistent terminology. Pick one term ("field", "API endpoint", "extract") and use it everywhere; mixing synonyms makes Claude wonder whether they differ.
- Concrete examples, not abstract ones.
- Give a default instead of a menu. "Use pdfplumber. For scanned PDFs that need OCR, use pdf2image with pytesseract instead." beats a list of five libraries.

## Common patterns

Template pattern: for strict formats say "ALWAYS use this exact template"; for flexible ones say "a sensible default, adapt as needed".

Examples pattern: when output quality depends on style, give input/output pairs.

```markdown
**Example:**
Input: Fixed bug where dates displayed incorrectly in reports
Output: fix(reports): correct date formatting in timezone conversion
```

## Skills with scripts

- Solve, don't defer: scripts handle expected errors (missing file, bad permissions) with a clear message or a fallback, rather than crashing and leaving Claude to guess.
- No voodoo constants: every timeout, retry count or threshold has a comment saying why it has that value.
- Prefer bundled scripts for deterministic operations. They are more reliable than generated code, cost no context until their output, and behave the same every run.
- State the intent for each script: "Run `analyze_form.py` to extract fields" (execute) versus "See `analyze_form.py` for the algorithm" (read).
- List required packages and do not assume they are installed. claude.ai can install from npm and PyPI; the Claude API has no network access.
- For batch or destructive work, use plan-validate-execute: Claude writes a plan file (`changes.json`), a script validates it with specific error messages ("Field 'signature_date' not found. Available fields: ..."), and only then is it applied.
- When the input can be rendered as an image (a PDF page, a UI), have Claude look at the rendering.
- Refer to MCP tools by their fully qualified name, `ServerName:tool_name` (`BigQuery:bigquery_schema`), or Claude may not find them when several servers are loaded.

## Testing across models

Skills add to the model, so the same skill behaves differently per model. Test with every model the skill will run on.

- Haiku: is there enough guidance?
- Sonnet: is it clear and efficient?
- Opus: does it avoid over-explaining?

Build evaluations before writing extensive documentation: run Claude on representative tasks without the skill, note where it fails, write at least three scenarios for those gaps, then write just enough instruction to pass them. While iterating, watch how Claude navigates the skill: files read in an unexpected order, references never followed, or one file read every time (move it into SKILL.md) are all signals about the structure.

## Checklist before shipping

```
Core quality
- [ ] Description is specific, third person, says what the skill does and when to use it
- [ ] quick_validate.py passes (name rules, description rules, body under 500 lines)
- [ ] Details that would push SKILL.md past 500 lines live in separate files
- [ ] Every reference file is linked from SKILL.md (one level deep), none orphaned
- [ ] Reference files over 100 lines start with a table of contents
- [ ] No time-sensitive information outside an "Old patterns" section
- [ ] One term per concept throughout
- [ ] Examples are concrete
- [ ] A default is given wherever options are listed
- [ ] Workflows have clear steps; quality-critical output has a validation loop

Scripts
- [ ] Scripts handle errors instead of deferring to Claude
- [ ] Every constant is justified in a comment
- [ ] Required packages are listed
- [ ] Execute-or-read intent is stated for each script
- [ ] Forward slashes in every path
- [ ] MCP tools use ServerName:tool_name

Testing
- [ ] At least three evaluations in evals/evals.json
- [ ] Tested on each model the skill will run on
- [ ] Tested with real usage scenarios
```
