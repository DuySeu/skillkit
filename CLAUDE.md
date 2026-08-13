# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

A personal workshop for **authoring agentic skills** for AI coding assistants (Claude Code, Kiro CLI), plus two bash scripts that push those skills — and a project scaffold — into *other* repos. There is no build system, linter, or test suite; the deliverables are markdown skill definitions and the two scripts.

Three parts, one per top-level directory:

| Path | Purpose |
| --- | --- |
| `skills/` | Source of truth for the skills. This is where a new skill is written. Use the `writing-skills` skill to create or edit one. |
| `test/` | Scratch projects used to exercise a freshly written skill by actually invoking the AI on it (e.g. `test/ai-assistant-chat` came out of running `ui-planning` end to end). Not an automated test suite. |
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

The exception worth documenting here is a skill with executable parts or invariants spread across several files, where editing one file and not the others breaks it — as `ui-planning` does below.

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

### skills/ui-planning — the skill with code
`ui-planning` has executable parts: a context probe, a preview harness, a contrast gate, and a guide builder. Its question is *record the direction*, not *build it once*: it picks a direction and **writes it down**, then stops. Deliverables are `docs/DESIGN.md` (a standing design contract) and `docs/index.css` (the real tokens); it never scaffolds an app and never writes component code. It has two modes — **Author** when no guide exists, **Comply** when one does — and the mode is decided by `scripts/probe-context.py`, not by the user's phrasing.

**Author invents 3–5 options by hand** (palette, type, surface kit, light + dark), writes `option-tokens/*.css` + `manifest.json`, runs `contrast-check.mjs`, then `fill-preview.py` into `ui-options.html`.

These things about it are load-bearing and easy to break:

- **Scope is web-only.** The preview harness is an HTML file and the verification gate is a CSS parser, so a native branch would have neither.
- **Token vocabulary is shadcn's** (`--primary`, not `--color-primary`). `framework-recipes.md` maps from it, `contrast-check.mjs` parses it, `mockup-template.html` renders it, and `shadcn-tokens.md` documents it. Renaming a token means changing all four.
- **The `--surface-*` kit is the style layer, and it is load-bearing in four places at once.** Seven vars (`surface-border-width`, `surface-shadow`, `surface-shadow-raised`, `surface-shadow-inset`, `surface-blur`, `surface-gradient`, `surface-wash`) + a kit name from six (`flat`, `outlined`, `elevated`, `soft`, `glass`, `hard`). The Author writes them into every option CSS, `mockup-template.html` renders them (plus `.kit-<name>` rules for what a variable can't express), `shadcn-tokens.md` documents them, `framework-recipes.md` ports them. Without this layer every option is the same flat card in a new hue — that is the whole reason it exists, so don't "simplify" it back into colours. Three kits also mutate the palette (`glass` → translucent `card`/`popover` with contrast enforced against the *composited* surface; `soft` → card = background and no pure-white page; `hard`/`outlined` → border toward the ink), which is why the kit is decided **before** contrast checks, not after.
- **`scripts/probe-context.py` is step 1, and its verdict is the control flow.** It resolves versions from `node_modules` first and the declared range second (labelled, because a range is not a resolved version), and returns one of four verdicts — `GREENFIELD` / `FRESH` / `THEMED` / `GUIDED` — each with the steps it requires. `GUIDED` fires on `docs/DESIGN.md` and is what routes into Comply mode. `scan_css` skips all of `docs/` (not just `docs/design/`), otherwise the skill's own generated `docs/index.css` makes every second run report `THEMED`. Two things it deliberately does *not* decide: which layout conventions an existing app is worth preserving (it lists the screen files; reading them is the assistant's job), and refresh-vs-replacement on `THEMED` (a question for the user; the script's job is to make sure it gets asked). `NEXT_STEPS` in the script and the verdict table in SKILL.md's *Context Probe* are the same four cases and must stay in sync.
- **`scripts/fill-preview.py` is the bridge** between authored option CSS and the gate. It reads `manifest.json` + `option-tokens/*.css` and injects them into `mockup-template.html` so the preview cannot drift from the files `contrast-check.mjs` and `make-guide.py` read. Colour values are **hex** — `mockup-template.html` and its demo `OPTIONS` array are hex too, so don't reintroduce `oklch()` in one without the other.
- **Archetype spans the manifest and the harness, and there are five of them.** The Author sets one archetype for the whole set in `manifest.json`; `mockup-template.html` renders it (`LAYOUTS` → five miniature products, `RAIL_ARCHETYPES` → the component rail that keeps token coverage identical outside the dashboard). `ARCHETYPES` in `fill-preview.py` and `LAYOUTS` in the template must stay in sync, and a new archetype needs both plus `ARCHETYPE_LABEL` and the shell CSS. Prefer `chat` over `dashboard` when the product is an assistant: console vocabulary ("workspace", "sidebar", "used all day") otherwise previews the wrong screen.
- **Author mode never asks about the stack; section 7 is stack-neutral.** Checklist: probe → two concept questions → invent options → gate → fill preview → pick → guide. `docs/index.css` is plain custom properties; guide §7 is token-and-state rows, never framework class names. **Stack surfaces only in Comply step 2** (`package.json` + `framework-recipes.md`). Tailwind v4 needs `@theme inline` for every colour variable; v3 needs `theme.extend` — skipping fails silently. `reviewer-prompt.md` blocks framework syntax in §7.
- **The interview is two questions** — (1) what the product is / who uses it; (2) pick one anchor: brand colour, OR inspiration site, OR neither. Font/radius/density/mood questions stay out: dials come from the concept; the option set surfaces shape and type. A brand hex pins `primary` in every option; an inspiration link must be fetched, with ≥1 option answering it and ≥1 not.
- **`scripts/make-guide.py` turns the winning option's CSS into `docs/index.css` with comments stripped**, and prints the markdown token summary for the guide's section 2. Both halves are deliberately lossy in one direction only: the summary covers `KEY_ROLES` plus charts, radius and the surface kit, and points at `index.css` for the rest — because inlining all ~35 variables into the guide creates a second copy of the values, and the copy that is easier to edit is the one that drifts.
- **`references/guide-template.md` is the shape of the deliverable** and carries the reasoning for each of its nine sections. Section 5 holds an **app shell** — region sizes, where a new component goes by default, what a new screen must reuse — because a component built with the right tokens but its own sidebar or its own max width still reads as imported from another product; that section is what Comply mode places new work inside. `reviewer-prompt.md` reviews the *guide document* (unfilled placeholders, adjective-only rules, summary hexes disagreeing with `index.css`, recipes in the wrong framework's syntax, a missing or generic app shell), not implemented code.
- **"No comments in `index.css`" is stated in four files** — SKILL.md, `framework-recipes.md` and `shadcn-tokens.md` (as a note, so their commented examples aren't copied), and `reviewer-prompt.md` (as a grep check). The rule covers CSS token files only, not JS theme objects. Option CSS may carry a provenance header — that header is what `make-guide.py` strips on port, so don't "fix" it away before the guide is written.
- The rule that makes the whole thing work is that **the guide is edited in place**. No `DESIGN-v2.md`, no dated copies: a design contract with two versions is a contract with none. Option previews still version (`ui-options-v2.html`).

After changing option CSS shape or the preview harness, smoke-test from `skills/ui-planning/`: write a tiny `manifest.json` + one option CSS, run `python3 scripts/fill-preview.py …`, then `node scripts/contrast-check.mjs` and `python3 scripts/make-guide.py` on a winning file.

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
