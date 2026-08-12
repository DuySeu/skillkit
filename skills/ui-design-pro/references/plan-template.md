# UI-PLAN.md skeleton

The shape of the step 10 plan file. Copy it, fill every placeholder, delete the rows and
sections that do not apply — an unfilled `<…>` reaching the user is a defect.

Keep the whole thing to roughly one screen. It is a document the user reads in a minute
to catch a wrong stack or a wrong scope, not a specification.

It has two jobs and they pull in opposite directions, which is what the section list is
balancing:

- **Reviewable before it exists.** Everything here is cheap to change while it is still a
  sentence. A wrong Tailwind major, a scope three times bigger than the ask, a page that
  was never mentioned — all of them are a one-line edit now and a rebuild later.
- **Executable without further decisions.** The implementation phase reads this file and
  builds it. Anything left undecided here gets decided by guessing at the keyboard, which
  is why *Risks & open questions* is a real section and not a formality.

**What each section is for.** Every section exists because something specific goes wrong
without it; none of them is a summary of the others.

| Section | What it holds | Why it is there | What it feeds in the implementation phase |
|---|---|---|---|
| **Direction** | Letter, name, thesis, the option's token file path, surface kit, brand colour, accent strategy | Names *which* of the presented options was picked, unambiguously. "The blue one" is not a record. | Step 12 ports from the named CSS file — no re-deriving colours, no reopening the choice |
| **Stack** | FE framework, UI framework, styling engine, each with its major version, plus the exact scaffold and install commands on greenfield | Version is where a plan silently goes wrong: Tailwind 3 vs 4 and Chakra 2 vs 3 are different products with the same name. Writing the commands out is what lets the user veto an install *before* it runs | Step 11 runs these commands verbatim; steps 12-14 write against these majors |
| **Tokens & fonts** | Token file path, default colour mode, how the mode is toggled, each font family mapped to its token, and the load method | These are the four decisions that are painful to reverse once components exist. Default mode in particular is proposed here, not asked earlier | Steps 12-13 are this section, executed |
| **Scope** | A table: each component/page, its file path, what it contains | The single most valuable section to review. Scope is where "add a theme" becomes a fortnight, and a table makes an over-broad build visible in ten seconds. It is **proposed** by you — the user's job is to cut it | Step 14 builds exactly these rows, in this order. A component not in the table is unapproved work |
| **Out of scope** | What is deliberately not in this pass | Turns silence into a decision. Without it "no auth screens" reads as an oversight and gets built anyway | Prevents step 14 from expanding; the reviewer flags additions as findings |
| **Steps** | The running order, as a numbered list | Makes the sequence reviewable — a user can see that scaffolding happens before tokens and tokens before components | The implementation phase's actual running order |
| **Verification** | The exact commands that must pass | Defines done before work starts, so "done" is not a judgement call at the end | Step 15 runs these |
| **Risks & open questions** | Anything genuinely undecided, and any version API to confirm after install | This is the pressure valve. Without it, an uncertainty gets resolved by guessing mid-build and nobody finds out | Answered by the user at Gate 2, or verified at the step that needs it |

**What stays out**, per section — a plan that restates the code is a second copy to keep
in sync:

| Section | Keep out |
|---|---|
| Direction | The token values — they are in the option CSS |
| Stack | Alternatives already ruled out |
| Tokens & fonts | A restated token table |
| Scope | Anything the user did not ask for, padded out to look thorough |
| Steps | Prose restating the skill's checklist |
| Risks | Taste questions the option set already answered |

One page, no token dumps, no invented components, every file path concrete. If a scoped
item needs a decision you do not have, it goes in Risks — not silently resolved.

**The scope table is a proposal.** It is the section most worth the user's attention, and
they have not been asked about it before now — say so at Gate 2 so they know it is theirs
to cut.

---

````markdown
# UI Implementation Plan — <Project Name>

Status: awaiting review · written <YYYY-MM-DD>

## Direction

**Option <LETTER> — "<Name>"** · <one-line thesis>

- Tokens: `docs/design/option-tokens/<LETTER>-<name>.css` (light + dark, contrast-checked)
- Surface kit: `<flat / outlined / elevated / soft / glass / hard>` — <what it draws: border weight, shadow, blur>. Ported as the seven `--surface-*` vars; components read them instead of inventing shadows
- Brand colour: `<#hex>` — pinned as `--primary` / or: none supplied, this direction proposes `<#hex>`
- Accent strategy: <analogous / complementary / neutral-with-one-accent / …>
- Reference sites the user gave: <label + url, and which options answered them> / or: none
- Rejected directions stay on record in `docs/design/ui-options.html`

## Stack

| Layer | Choice | Version |
|---|---|---|
| FE framework | <React / Vue 3 / …> | <major> |
| UI framework | <shadcn/ui / Tailwind only / …> | <major or "copy-in source"> |
| Styling engine | <Tailwind v4 / …> | <major> |

Greenfield — the app does not exist yet, and these commands run only after this plan is approved:

```bash
npm create vite@latest <slug>-app -- --template <template> --no-interactive
# docs/ swap per references/scaffolding.md, then:
npm install <styling engine packages>
npx shadcn@latest init        # if a component library was chosen
```

Existing project — nothing is scaffolded; the majors above were read from `package.json`.

## Tokens & fonts

- Token file: `src/index.css` — both modes, ported from the option CSS (colours + `--surface-*`), **no comments**
- Default colour mode: <light / dark> — proposed, not asked; say so, toggled by <the `dark` class on `<html>`, persisted>
- Display font: `<Family>` → `--font-serif` / `--font-sans`, loaded via <Google Fonts link / @fontsource-variable / system stack>
- Body font: `<Family>` → `--font-sans`
- Mono: `<Family or "none — omit the token">`
- Motion: press 100–160ms / popovers 125–200ms / dropdowns 150–250ms / modals ≤300ms; ease-out only (no `ease-in`); `transform`+`opacity` only; no animation on keyboard/high-frequency actions; popovers origin-aware, modals centered; honour `prefers-reduced-motion`

## Scope — <N> items

Proposed, not requested. Cut or add anything.

| # | Component / page | File | Contains |
|---|---|---|---|
| 1 | <App shell> | `src/components/<path>` | <sidebar, topbar, mode toggle> |
| 2 | <Stat card> | `src/components/<path>` | <label, value, delta, icon slot> |
| … | | | |

## Out of scope this pass

- <e.g. auth screens, settings, empty/error states, real data wiring>

## Steps

1. Scaffold + install the stack above; confirm `npm run build` (greenfield only)
2. Write the token file from the option CSS — light + dark, comment-free
3. Wire the fonts and map them to the font tokens
4. Build scope items in order: <1 → 2 → …>, each verified in both modes
5. Delete the scaffold's demo content and set the real `<title>` (greenfield only)

## Verification

```bash
node "<skill-dir>/scripts/contrast-check.mjs" src/index.css
npm run build
```

Then a reviewer subagent pass against this plan (`reviewer-prompt.md`), and a closing
report in the chat naming every deviation from this file. No separate decisions document.

## Risks & open questions

- <Theming API of <library>@<major> is confirmed against `package.json` after install, not from memory>
- <anything genuinely undecided — never a taste question the option set already answered>
````
