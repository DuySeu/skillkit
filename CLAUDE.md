# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

A collection of agentic **skills** for AI coding assistants (Claude Code, Kiro CLI, etc.) plus two installer/scaffolding bash scripts. There is no build system, linter, or test suite — the deliverables are markdown skill definitions and the two scripts.

## Commands

```bash
# Preview what install.sh would do (safe, no changes)
./install.sh --dry-run

# Install all skills into the current project's ./.claude/skills (default: Claude Code)
cd /path/to/project && /path/to/this-repo/install.sh   # --kiro installs to ./.kiro/skills instead (mutually exclusive); --target DIR for custom
./install.sh --global         # install into ~/.claude/skills (or ~/.kiro/skills with --kiro) instead
./install.sh --link           # symlink instead of copy — edits to this repo take effect immediately

# Scaffold a Python project (run FROM the target directory — it writes into cwd)
cd /path/to/new-project && /path/to/this-repo/project_setup.sh [--demo|--production] [--kiro|--claude] [--force]

# Syntax-check a script after editing
bash -n install.sh

# Manually exercise a scaffolded project (test/ is one such sample output)
cd test && python3 main.py    # LOG_LEVEL=DEBUG to change verbosity
```

Without `--force`, both scripts skip existing files/skills (install.sh prompts interactively; project_setup.sh silently skips).

## Architecture

### skills/ — the installable skills
Each subdirectory containing a `SKILL.md` is one skill; `install.sh` discovers skills purely by the presence of that file (subdirs without it are skipped with a warning). `SKILL.md` has YAML frontmatter (`name`, `description` — the description is the trigger text the assistant uses to decide when to invoke it) followed by the skill instructions. Supporting files (reviewer prompts, helper docs) live beside `SKILL.md` in the same folder and are installed with it.

Current skills: `brainstorming` (design-before-code gate for feature work), `demo-planning` (design gate specialized for demos/prototypes), `conceptual-design` (draw.io `.drawio.svg` architecture diagrams), `ui-design-pro` (frontend visual foundation, in two phases: **planning** — stack + two concept questions → seed 3-5 theme options from a local database → tabbed preview → pick → `docs/design/UI-PLAN.md` for review; **implementation** — on plan approval, scaffold if greenfield → tokens/fonts/components). The planning skills share a pattern: HARD-GATE against writing code before an approved design, a mandatory task checklist, a dot-graph process flow, and a subagent review loop using a sibling reviewer-prompt file. `ui-design-pro` follows the same shape but with **two** gates: Gate 1 is "user picked one of the presented options", Gate 2 is "user approved `UI-PLAN.md`" — and Gate 2, not Gate 1, is what holds back scaffolding and any code.

`ui-design-pro` is the only skill here with executable parts, and it is much larger than the rest (~1.6MB, mostly `data/`). It merges two previously separate skills — a process/gate layer and a searchable design database (originally `ui-ux-pro-max`) — so the option-picking gate is fed by real data instead of invented palettes. These things about it are load-bearing and easy to break:

- **Scope is web-only.** The upstream database shipped 22 stacks including native and desktop; 10 were removed because the preview harness is an HTML file and the verification gate is a CSS parser, so a native branch would have neither. `scripts/core.py` `STACK_CONFIG` and `data/stacks/` must stay in sync — `scripts/validate_data.py` fails loudly if they drift.
- **Token vocabulary is shadcn's** (`--primary`, not `--color-primary`). `framework-recipes.md` maps from it, `contrast-check.mjs` parses it, `mockup-template.html` renders it, and `design_system.py` documents it. Renaming a token means changing all four.
- **The `--surface-*` kit is the style layer, and it is load-bearing in four places at once.** Seven vars (`surface-border-width`, `surface-shadow`, `surface-shadow-raised`, `surface-shadow-inset`, `surface-blur`, `surface-gradient`, `surface-wash`) + a kit name from six (`flat`, `outlined`, `elevated`, `soft`, `glass`, `hard`). `seed-options.py` derives them (`surface_for` / `surface_tokens`), `mockup-template.html` renders them (plus `.kit-<name>` rules for what a variable can't express) and its five demo options each hardcode a different kit, `shadcn-tokens.md` documents them, `framework-recipes.md` ports them. Without this layer every option is the same flat card in a new hue — that is the whole reason it exists, so don't "simplify" it back into colours. Three kits also mutate the palette (`glass` → translucent `card`/`popover` with contrast enforced against the *composited* surface; `soft` → card = background and no pure-white page; `hard`/`outlined` → border toward the ink), which is why the kit is decided **before** `enforce_contrast`, not after.
- **Style-row matching is name-first, then technique text, then a ladder.** `SURFACE_NAME_HINTS` runs against `Style Category` alone because several rows describe a technique they contrast themselves *against* — Neo Brutalism's own cell says "hard offset shadows (4–8px, no blur)", and a bare `blur` pattern classified it as glassmorphism. Keep negation-prone words (`blur`, `shadow`) out of the broad patterns.
- **`scripts/seed-options.py` is the bridge** between the database and the gate. The database returns one best match per domain; the gate needs 3-5 distinct directions. That script anchors the set (safe / bolder / structurally different), enforces distinctness on style + font pairing + hue simultaneously, **derives dark mode** (`colors.csv` has no dark values at all), and nudges lightness until every WCAG text pair clears 4.5:1 so the contrast gate passes by construction. Colour maths is in OKLCH and output is **hex** (`fmt`/`FORMATTERS`, `--format oklch` to switch) — `mockup-template.html` and its demo `OPTIONS` array are hex too, so don't reintroduce `oklch()` in one without the other.
- **The planning phase ends in a document, not in code.** `references/plan-template.md` is the shape of `UI-PLAN.md`; the "what goes in / what stays out" table lives in SKILL.md's *The Plan File*. Keep the two aligned, and keep the plan the single copy — the skill forbids `UI-PLAN-v2.md` on purpose (revisions edit in place), while option previews *do* version (`ui-options-v2.html`).
- **"No comments in `index.css`" is stated in four files** — SKILL.md (*Implementing* step 2, with the rationale), `framework-recipes.md` and `shadcn-tokens.md` (as a note, so their commented examples aren't copied), and `reviewer-prompt.md` (as a grep check). The rule covers CSS token files only, not JS theme objects. `seed-options.py` still writes a provenance header onto `option-tokens/*.css` deliberately — that header is what gets stripped on port, so don't "fix" it in the generator.
- **The interview is deliberately two questions** — what the product is, and whether it has a brand colour. Font/radius/density/mood questions were removed on purpose: `--density`/`--variance`/`--motion` are inferred from the query by `infer_dials` and the option set is what surfaces shape and type. Re-adding those questions defeats the point of the option gate. `--brand <hex>` pins `primary` in every option and spends the hue axis, so distinctness shifts to page surface + accent strategy (`ACCENT_STRATEGIES`) + style + type; without it each option proposes its own colour.

Run `python3 scripts/validate_data.py && python3 scripts/tests/test_core.py` after touching any CSV or `core.py`.

### project_setup.sh — template sourcing
Generated file content comes from two places, which matters when changing what gets scaffolded:
1. **`project/` templates** (editable files): `project/log.py` is the shared logging module (all modes); `project/demo/` and `project/production/` each hold a `coding-conventions.md` + `folder-structure.md` pair selected by `--demo`/`--production`.
2. **Inline heredocs in the script itself**: `main.py`, `.gitignore`, `README.md`, `requirements.txt`, `__init__.py` files.

`{{PROJECT_NAME}}` in any template is replaced with the target directory's basename. The `--kiro`/`--claude` flag decides where conventions land: `--kiro` copies the two convention files into `.kiro/steering/` (Kiro auto-loads that dir); `--claude` strips their YAML frontmatter and concatenates them into a single `CLAUDE.md` at the project root (see `write_claude_md`). Keep the demo and production convention pairs structurally parallel — both are consumed by the same code paths.

### .claude/skills/ — generated, not source
`skills/` is the only source of truth. `.claude/skills/` (this repo dogfooding its own skills) is git-ignored and contains nothing but relative symlinks — `.claude/skills/<name> -> ../../skills/<name>` — so editing a `SKILL.md` under `skills/` takes effect here immediately, with no copy step. Recreate the whole dir with `./install.sh --link --force`; after adding a new skill under `skills/`, run that again to get its symlink (new skills are not picked up automatically). Never commit files under `.claude/skills/`, and never edit through the symlink path in a way that assumes it's a separate copy — it isn't.

### Repo-level conventions vs. templates
`.kiro/steering/` at the repo root is Kiro steering for working on *this repo* (Vietnamese-language variants of the conventions). It is separate from `project/demo/` (English), which is what gets shipped into scaffolded projects — don't confuse or "sync" the two.

### test/
A sample project generated by `project_setup.sh` and extended by hand — used for manually verifying the scaffold and conventions. Not an automated test suite.

## Notes

- The README and some docs are in Vietnamese; skill content is in English. Follow the existing language of whichever file you're editing.
- The scaffolded-project convention (each `core/` file = one workflow step, helpers in `utils/`, centralized logging via `utils/log.py`) is defined in `project/*/folder-structure.md` and `coding-conventions.md` — change those files, not just the README, when evolving the convention.
