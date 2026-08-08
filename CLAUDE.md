# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

A personal workshop for **authoring agentic skills** for AI coding assistants (Claude Code, Kiro CLI), plus two bash scripts that push those skills — and a project scaffold — into *other* repos. There is no build system, linter, or test suite; the deliverables are markdown skill definitions and the two scripts.

Three parts, one per top-level directory:

| Path | Purpose |
| --- | --- |
| `skills/` | Source of truth for the skills. This is where a new skill is written. Use the `writing-skills` skill to create or edit one. |
| `test/` | Scratch projects used to exercise a freshly written skill by actually invoking the AI on it (e.g. `test/vn-stock-analytics` came out of running `ui-design-pro` end to end). Not an automated test suite. |
| `script/` + `project/` | Run from *another* repo: `script/project_setup.sh` scaffolds the folder structure and conventions there. It resolves its content one level up from `script/` — `../project` — so it must stay inside `script/` in this repo. Skills are no longer installed by a script here; consumers run `npx skills add https://github.com/DuySeu/skillkit`. |

`sample/` is git-ignored scratch space. `.claude/` and `.kiro/` at the root are this repo consuming its own output (see below).

## Ground Rule: Never Commit or Push

**No automatic `git commit`, `git push`, branch, or PR — for any file in this repo.** Make the change, then stop and report what changed and where; the user reviews it and pushes to GitHub themselves. This applies to every path — `skills/`, the `.sh` scripts, `project/`, `test/`, this file — no matter how small or routine the edit looks. Don't offer to commit either; leave the work in the working tree. Only commit when the user asks for it in that message.

## Adding or Editing a Skill

1. Write `skills/<name>/SKILL.md` (plus any sibling reference files) using the `writing-skills` skill.
2. For a *new* skill, create the dogfooding symlink so `.claude/skills/` picks it up — new skills are **not** discovered automatically:
   ```bash
   ln -sfn "../../skills/<name>" ".claude/skills/<name>"   # repeat with .kiro for Kiro CLI
   ```
   Editing an existing skill needs no install step: the symlinks make the change live immediately.
3. `SKILL.md` frontmatter must carry `name` and `description`, and the `description` value must not contain a colon-plus-space unless it is quoted — the `skills` CLI parses it as YAML and silently **skips** any skill that fails. Verify with `npx skills add . -l` and confirm the found count matches the number of skill directories.

**Do not add the new skill to this file.** CLAUDE.md describes the repo, not the skill catalogue. A skill is discovered and fired from its own `description` frontmatter, so every skill here except `writing-skills` is invoked proactively by the assistant; a list in CLAUDE.md would only rot. `writing-skills` is the one invoked explicitly, when working on skills themselves.

The exception worth documenting here is a skill with executable parts or invariants spread across several files, where editing one file and not the others breaks it — as `ui-design-pro` does below.

## Commands

```bash
# List the skills the installer can see — the count must match the skills/ subdir count
npx skills add . -l

# Install skills into a project (this is what consumers run)
npx skills add https://github.com/DuySeu/skillkit          # -g for ~/.claude/skills; -a <agent> to target one agent
npx skills add https://github.com/DuySeu/skillkit --all    # every skill, every detected agent

# Scaffold a Python project (run FROM the target directory — it writes into cwd)
cd /path/to/new-project && /path/to/this-repo/script/project_setup.sh [--demo|--production] [--kiro|--claude] [--force]

# Syntax-check a script after editing
bash -n script/project_setup.sh

# Run a scaffolded Python project (from its own directory; LOG_LEVEL=DEBUG to change verbosity)
python3 main.py
```

Without `--force`, `project_setup.sh` silently skips files that already exist.

## Architecture

### skills/ — the installable skills
Each subdirectory containing a `SKILL.md` is one skill; the `skills` CLI discovers them by walking up to three levels down from the repo root looking for that file. `SKILL.md` has YAML frontmatter (`name`, `description` — the description is the trigger text the assistant uses to decide when to invoke it) followed by the skill instructions. Supporting files (reviewer prompts, helper docs) live beside `SKILL.md` in the same folder and are installed with it.

The planning-style skills share a pattern worth reusing when writing a new one: a HARD-GATE against writing code before an approved design, a mandatory task checklist, a dot-graph process flow, and a subagent review loop driven by a sibling reviewer-prompt file.

### skills/ui-design-pro — the one skill with code
`ui-design-pro` is the only skill with executable parts, and much larger than the rest (~1.6MB, mostly `data/`). It merges two previously separate skills — a process/gate layer and a searchable design database (originally `ui-ux-pro-max`) — so the option-picking gate is fed by real data instead of invented palettes. It runs in two phases: the **planning phase** (stack + four concept questions → seed 3-5 theme options from the local database → tabbed preview → pick → `docs/design/UI-PLAN.md` for review) and the **implementation phase** (on plan approval: scaffold if greenfield → tokens/fonts/components → closing report in the chat). It has two gates — Gate 1 is "user picked one of the presented options", Gate 2 is "user approved `UI-PLAN.md`" — and Gate 2, not Gate 1, is what holds back scaffolding and any code.

These things about it are load-bearing and easy to break:

- **Scope is web-only.** The upstream database shipped 22 stacks including native and desktop; 10 were removed because the preview harness is an HTML file and the verification gate is a CSS parser, so a native branch would have neither. `scripts/core.py` `STACK_CONFIG` and `data/stacks/` must stay in sync — `scripts/validate_data.py` fails loudly if they drift.
- **Token vocabulary is shadcn's** (`--primary`, not `--color-primary`). `framework-recipes.md` maps from it, `contrast-check.mjs` parses it, `mockup-template.html` renders it, and `design_system.py` documents it. Renaming a token means changing all four.
- **The `--surface-*` kit is the style layer, and it is load-bearing in four places at once.** Seven vars (`surface-border-width`, `surface-shadow`, `surface-shadow-raised`, `surface-shadow-inset`, `surface-blur`, `surface-gradient`, `surface-wash`) + a kit name from six (`flat`, `outlined`, `elevated`, `soft`, `glass`, `hard`). `seed-options.py` derives them (`surface_for` / `surface_tokens`), `mockup-template.html` renders them (plus `.kit-<name>` rules for what a variable can't express) and its five demo options each hardcode a different kit, `shadcn-tokens.md` documents them, `framework-recipes.md` ports them. Without this layer every option is the same flat card in a new hue — that is the whole reason it exists, so don't "simplify" it back into colours. Three kits also mutate the palette (`glass` → translucent `card`/`popover` with contrast enforced against the *composited* surface; `soft` → card = background and no pure-white page; `hard`/`outlined` → border toward the ink), which is why the kit is decided **before** `enforce_contrast`, not after.
- **Style-row matching is name-first, then technique text, then a ladder.** `SURFACE_NAME_HINTS` runs against `Style Category` alone because several rows describe a technique they contrast themselves *against* — Neo Brutalism's own cell says "hard offset shadows (4–8px, no blur)", and a bare `blur` pattern classified it as glassmorphism. Keep negation-prone words (`blur`, `shadow`) out of the broad patterns.
- **`scripts/probe-context.py` is step 1, and its verdict is the control flow.** It resolves versions from `node_modules` first and the declared range second (labelled, because a range is not a resolved version), and returns one of four verdicts — `GREENFIELD` / `FRESH` / `THEMED` / `RESUME` — each with the steps it requires. Two things it deliberately does *not* decide: which layout conventions an existing app is worth preserving (it lists the screen files; reading them is the assistant's job), and refresh-vs-replacement on `THEMED` (that is a question for the user, and the script's job is to make sure it gets asked). It skips `docs/design/` when hunting for token files — the option CSS this skill generates is full of shadcn tokens and would otherwise read as "this project already has a theme". `NEXT_STEPS` in the script and the verdict table in SKILL.md's *Context Probe* are the same four cases and must stay in sync.
- **`scripts/seed-options.py` is the bridge** between the database and the gate. The database returns one best match per domain; the gate needs 3-5 distinct directions. That script anchors the set (safe / bolder / structurally different), enforces distinctness on style + font pairing + hue simultaneously, **derives dark mode** (`colors.csv` has no dark values at all), and nudges lightness until every WCAG text pair clears 4.5:1 so the contrast gate passes by construction. Colour maths is in OKLCH and output is **hex** (`fmt`/`FORMATTERS`, `--format oklch` to switch) — `mockup-template.html` and its demo `OPTIONS` array are hex too, so don't reintroduce `oklch()` in one without the other.
- **Motion and archetype are the newer half of an "option", and they span the same two files as the surface kit.** `seed-options.py` assigns a motion personality per option (`MOTION_STYLES`, `motion_for`, spread around the `--motion` dial by `MOTION_OFFSETS`) and one archetype for the whole set (`ARCHETYPE_HINTS`, `infer_archetype`); `mockup-template.html` renders both (`MOTION_SPECS` → the `--mo-*` variables, `LAYOUTS` → four miniature products, `RAIL_ARCHETYPES` → the component rail that keeps token coverage identical outside the dashboard). The two must stay in sync: `MOTION_STYLES` and `MOTION_SPECS` share key names, and `ARCHETYPES` and `LAYOUTS` share theirs. Motion is deliberately **not** a token — it ships as transitions/GSAP in the implementation phase and appears in the option CSS only in the stripped provenance header.
- **No `DECISIONS.md`.** The implementation phase ends with a report in the chat naming every deviation from the plan. The token file holds the values, `UI-PLAN.md` holds the agreement, and the old third document drifted from both. An existing one from a prior run still gets read and updated; one is never created.
- **The planning phase ends in a document, not in code.** `references/plan-template.md` is the shape of `UI-PLAN.md`; the "what goes in / what stays out" table lives in SKILL.md's *The Plan File*. Keep the two aligned, and keep the plan the single copy — the skill forbids `UI-PLAN-v2.md` on purpose (revisions edit in place), while option previews *do* version (`ui-options-v2.html`).
- **"No comments in `index.css`" is stated in four files** — SKILL.md (*Implementing* step 2, with the rationale), `framework-recipes.md` and `shadcn-tokens.md` (as a note, so their commented examples aren't copied), and `reviewer-prompt.md` (as a grep check). The rule covers CSS token files only, not JS theme objects. `seed-options.py` still writes a provenance header onto `option-tokens/*.css` deliberately — that header is what gets stripped on port, so don't "fix" it in the generator.
- **The interview is deliberately four questions** — what the product is, whether it has a brand colour, whether any site inspired them, and whether it should animate. Font/radius/density/mood/scope questions were removed on purpose: `--density`/`--variance`/`--motion`/`--archetype` are inferred from the query by `infer_dials`/`infer_archetype`, the option set is what surfaces shape and type, and the component scope is *proposed* in `UI-PLAN.md` for the user to cut at Gate 2 rather than asked for before the plan exists. Re-adding any of those questions defeats the point of the option gate. `--brand <hex>` pins `primary` in every option and spends the hue axis, so distinctness shifts to page surface + accent strategy (`ACCENT_STRATEGIES`) + style + type + motion; without it each option proposes its own colour.

From `skills/ui-design-pro/`, run `python3 scripts/validate_data.py && python3 scripts/tests/test_core.py` after touching any CSV or `core.py`.

### script/project_setup.sh — template sourcing
Generated file content comes from two places, which matters when changing what gets scaffolded:
1. **`project/` templates** (editable files): `project/log.py` is the shared logging module (all modes); `project/demo/` and `project/production/` each hold a `coding-conventions.md` + `folder-structure.md` pair selected by `--demo`/`--production`.
2. **Inline heredocs in the script itself**: `main.py`, `.gitignore`, `README.md`, `requirements.txt`, `__init__.py` files.

`{{PROJECT_NAME}}` in any template is replaced with the target directory's basename. The `--kiro`/`--claude` flag decides where conventions land: `--kiro` copies the two convention files into `.kiro/steering/` (Kiro auto-loads that dir); `--claude` strips their YAML frontmatter and concatenates them into a single `CLAUDE.md` at the project root (see `write_claude_md`). Keep the demo and production convention pairs structurally parallel — both are consumed by the same code paths.

### .claude/skills/ and .kiro/skills/ — generated, not hand-edited
`skills/` is the only source of truth. Both of those directories are this repo dogfooding its own skills, and they contain nothing but relative symlinks — `.claude/skills/<name> -> ../../skills/<name>` — so editing a `SKILL.md` under `skills/` takes effect here immediately, with no copy step. Recreate them with `for d in skills/*/; do ln -sfn "../../$d" ".claude/skills/$(basename "$d")"; done`. Do **not** recreate them with `npx skills add` — that installer copies files rather than linking into the working tree, which breaks the dogfooding loop. Never hand-write a real file inside them, and never edit through a symlink path in a way that assumes it's a separate copy — it isn't.

### Repo-level conventions vs. templates
`.kiro/steering/` at the repo root is Kiro steering for working on *this repo* (Vietnamese-language variants of the conventions). It is separate from `project/demo/` (English), which is what gets shipped into scaffolded projects — don't confuse or "sync" the two.

## Notes

- The README and some docs are in Vietnamese; skill content is in English. Follow the existing language of whichever file you're editing.
- The scaffolded-project convention (each `core/` file = one workflow step, helpers in `utils/`, centralized logging via `utils/log.py`) is defined in `project/*/folder-structure.md` and `coding-conventions.md` — change those files, not just the README, when evolving the convention.
