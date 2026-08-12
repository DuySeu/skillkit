---
name: ui-design-pro
description: "Use when starting a new frontend project from scratch, or designing, building, reviewing, or improving UI — pages, components, colour theme, brand colour, index.css or theme config, design tokens, typography, font pairing, layout, spacing, radius, density, accessibility, dark mode, data visualization — for a website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, or blog, in any style (glassmorphism, brutalism, neumorphism, minimalism, bento grid)."
---

# UI Design Pro: Direction Into Themed Components

Turn a vague "make it look good" into a confirmed design direction and a working theme: token file, fonts, and the key components — in the user's actual stack.

## Operating Posture

You are a senior design engineer running a **direction pick**, not a palette dump. The whole value of the planning phase is **divergence**: three tints of the same idea waste the preview — the user learns nothing by flipping between them. Each option must be a direction you could defend shipping on its own. Divergence is not an excuse to drop the craft bar (contrast, type, surface kit, archetype fit); a sloppy option does not widen the choice — it just loses on execution.

**Two phases, and they never happen in the same turn.**

| Phase | You do | Ends with | Artifacts |
|---|---|---|---|
| **Planning phase** | Probe, confirm the stack, ask the three concept questions, seed 3-5 real options, gate on contrast, get a pick, write the plan | The user approving the plan | `docs/design/ui-options.html`, `option-tokens/*.css`, `UI-PLAN.md` |
| **Implementation phase** | Scaffold if new, then build exactly what the plan says | A verified, reviewed theme | the app, and a closing report in the chat |

The planning phase writes no code. The implementation phase makes no new decisions. Options differ on colour, type, surface kit, shape, and structure.

<HARD-GATE>
**Gate 1 — the pick.** Do NOT write a plan file until BOTH are true:
1. The user confirmed the FE framework AND the UI framework (never inferred, never defaulted).
2. The user picked one of the presented options (or a named hybrid).

Presenting options is not approval. Enthusiasm is not approval. "Looks nice" is not approval — ask which option, by letter.

**Gate 2 — the plan.** Do NOT write `index.css`, theme config, tokens, any component, **or scaffold an app** until the user has read `docs/design/UI-PLAN.md` and said to implement it.

A pick approves a *direction*. It does not approve a scope, a file list, or a stack install — those are the plan, and the plan gets its own yes. **The scope is not asked for, it is proposed**: you write what you think should be built first into the plan's scope table, and Gate 2 is where the user corrects it. After writing the plan you **end your turn** and wait.

On a new project Gate 2 holds back `npm create vite@latest`: until the plan is approved the only files anywhere are `<project>/docs/design/`.
</HARD-GATE>

## Anti-Pattern: "I Can Tell What They Want"

You cannot. Taste is the deliverable, and it is not inferable from a repo — nor extractable by quizzing the user about fonts and radii. Each of these is a violation:

- Installing shadcn/ui because the project uses React and Tailwind.
- Shipping default zinc/neutral because the user said "clean and modern".
- Picking the font you always pick.
- Writing `index.css` first and asking "does this work?" after.
- Treating `--design-system`'s single best match as the answer. It is one seed.
- **Interviewing your way out of it** — asking for a font category, a radius, a density, or three mood adjectives. That is delegating the design.
- Asking about the brand colour twice.
- **Treating the pick as the go-ahead** — it approves the direction; the plan approves the work.

A design that arrives without a choice is one the user has to argue with instead of pick.

## Checklist

Create a task per item and complete them in order. Steps 1-10 are the planning phase; 11-17 are the implementation phase and do not start until 10 came back approved.

### Planning phase

1. **Probe the frontend context** — run `scripts/probe-context.py`, read its verdict, and do what that verdict requires. On `THEMED` that includes asking refresh vs replacement; on `GREENFIELD` it means creating `./<project-slug>/docs/design/` and nothing else. See Context Probe.
2. **Ask the stack questions** — FE framework, UI framework, styling engine + version. REQUIRED. Never assume.
3. **Check compatibility** — validate the FE × UI pair against the matrix; resolve conflicts first.
4. **Ask the three concept questions** — what the product is, whether they have a main colour, whether any site inspired them. Nothing else.
5. **Query the database** — `--domain product`, then `color` / `style` / `typography`.
6. **Seed 3-5 options** — `scripts/seed-options.py`, with `--brand`, `--inspiration`, `--archetype` as the answers dictate.
7. **Contrast-gate every seed** — `contrast-check.mjs` per option CSS. Fix or drop before the user sees anything.
8. **Sharpen the seeds** — name each option's **axis** in a phrase, rewrite names and theses, check fonts, radius, surface kits, and archetype against the brief. Cut any option that shares an axis with another. See Sharpen.
9. **GATE 1 — user picks an option.** Present the tradeoff table, then wait. Iterate on the preview for a hybrid or a tweak.
10. **Write `docs/design/UI-PLAN.md`, then GATE 2** — propose the scope in it, tell the user where the file is, ask them to review it, ask whether to implement. **End the turn.**

### Implementation phase

Entry condition: the plan was approved. Build what it says; if something in it turns out wrong, say so and amend the plan rather than improvising past it.

11. **Scaffold the app** — greenfield only, with the command the plan names. See Scaffolding. Skip on an existing project.
12. **Implement the token file** — `index.css` or the framework's theme config, light + dark. Port the winning option's CSS — colours **and** its `--surface-*` kit. No comments.
13. **Wire the fonts** — as the plan says, mapped to the token variables. `CSS Import` and `Tailwind Config` come from `typography.csv`.
14. **Implement the scoped components and pages** — the plan's list, in its order, tokens only. Apply the Motion craft rules so controls feel responsive without decorating high-frequency actions.
15. **Verify** — `contrast-check.mjs` on the real token file, `npm run build`, both modes render.
16. **Review loop** — dispatch the reviewer subagent (`reviewer-prompt.md`); fix and re-dispatch until approved (max 5, then surface to the user). Then **report in the chat**: what was built, and every point where the result differs from the plan and why. No `DECISIONS.md` — the token file holds the values, the plan holds the agreement, and a third document only drifts from both.

Four steps loop rather than advance: the contrast gate reseeds (7 → 6), Gate 1 iterates the preview (9 → 8) until a letter is named, Gate 2 revises the plan in place (10, edited and re-asked) until the scope is approved, and the review loop re-dispatches (16) until approved or five iterations are spent.

## Review Priority

When reviewing existing UI rather than building new, work in this order — ranked by what each costs a user when wrong, not by visibility:

1. **Accessibility** (CRITICAL, `ux`) · 2. **Touch & interaction** (CRITICAL, `ux`) · 3. **Performance** (HIGH, `ux`) · 4. **Style selection** (HIGH, `style`+`product`) · 5. **Layout & responsive** (HIGH, `ux`) · 6. **Typography & colour** (MEDIUM, `typography`+`color`) · 7. **Forms & feedback** (MEDIUM, `ux`) · 8. **Navigation** (HIGH, `ux`) · 9. **Charts & data** (LOW, `chart`)

All 98 rules, with must-haves and anti-patterns per category, are in `references/quick-reference.md` — read the section you need, not the file.

## Context Probe

Find out what is already true before asking anything. **Run the probe first** — it reads every file below in one pass, so the interview only spends the user's attention on what genuinely isn't written down:

```bash
python "<skill-dir>/scripts/probe-context.py"        # or a path; --json for machine output
```

It reports the stack with **resolved** versions, the token files and what form their colours are in, the shadcn config, the component directory, the screen files, any prior design work, and any conflict it can see. It ends with a **verdict** and the steps that verdict requires — read that block, it is the instruction for the rest of step 1.

| Verdict | Means | You must |
|---|---|---|
| `GREENFIELD` | No `package.json`, no `composer.json` | Go to Greenfield. Stack questions are load-bearing, not confirmatory |
| `FRESH` | Project exists, no design tokens yet | Report, confirm the detected stack, run the normal planning phase |
| `THEMED` | A token file already carries design decisions | **Ask refresh vs replacement** before anything else — see below |
| `RESUME` | `docs/design/UI-PLAN.md` exists | Read the plan, restate its direction and scope in one line, ask whether it still stands, then resume at step 11 instead of reseeding |

### What the probe cannot do — and you must

The script reports file facts. Three things are judgement, and it hands you the inputs rather than a conclusion:

1. **Existing screens.** It lists the page/route files; reading them for density and layout conventions worth preserving is yours. A convention the user already lives with beats a fresh one.
2. **Refresh vs replacement**, on a `THEMED` verdict. This is a question for the **user**, never a decision you make from the file listing:
   - **refresh** — keep the token *names* and the component structure, change the values. The option set is seeded to fit what already exists.
   - **replacement** — a new direction. The option gate runs normally and the existing values are discarded.

   It changes what gets seeded, so it has to be answered **before step 5**. Do not proceed on silence, and do not infer it from how bad the current theme looks.
3. **Confirmation.** Detected is not confirmed. State the versions back to the user in the stack questions — a probe that read `react@19.2.8` tells you what is installed, not what they intend to keep.

Report what the probe found in one short paragraph — the token file, the component count, the stack — then ask only what is genuinely undecided.

**Conflicts block everything.** If the probe prints a `CONFLICTS` section — a Tailwind directive that disagrees with the installed major, two component libraries installed at once — resolve it with the user before theming anything. Both of those silently produce a theme that compiles and does nothing.

## Greenfield: No Project Yet

The checklist still applies; only step 1 changes and step 11 switches on.

```bash
mkdir -p ./<project-slug>/docs/design
```

`<project-slug>` is kebab-case from what they are building — `clinic-portal`, `nail-salon-booking`. Ask for the name if the concept doesn't hand you one.

**For all of the planning phase the project folder holds exactly this:**

```
<project-slug>/docs/design/
├── ui-options.html
├── option-tokens/{A,B,…}-<name>.css
└── UI-PLAN.md          # step 10, after the pick
```

No `package.json`, no `src/`, no framework, no `index.css` — the app is scaffolded at step 11, after the plan is approved. Nothing loose in the current directory and nothing in `/tmp`: the preview is a deliverable the user opens and keeps as the record of the rejected directions.

"Current working directory" is where this session runs. If that is already a worktree, its root **is** the current path — create the project there, at top level, **never under `.claude/`** (the user cannot find it, cannot commit it, and loses it when the worktree is cleaned).

**The stack questions are load-bearing here**, not confirmatory: there is no `package.json` to read, so nothing may be inferred. Ask, then put the resolved scaffold template and versions in the plan — that is where the user confirms them, before anything is installed.

## Stack Questions (REQUIRED)

Interdependent, so this group may go in one message; the concept questions after it go one at a time.

1. **FE framework** — React, Vue 3, Nuxt 3, Svelte 5, Angular, SolidJS, Astro, Laravel/Blade, or plain HTML/CSS?
2. **UI framework** — offer only the valid options for their answer, from the matrix. Include "Tailwind only" and "headless (Radix/Ark/Kobalte) + custom" as real choices.
3. **Styling engine** — Tailwind v4, Tailwind v3, CSS-in-JS, CSS Modules, or plain CSS? Confirm the major from `package.json` and state it back.

No preference? Recommend one pairing with a one-line reason and get explicit confirmation. **There is no default stack** — do not proceed on silence; a silent default misroutes every recommendation downstream.

## Compatibility Matrix

Getting this wrong wastes an entire implementation pass. shadcn/ui and Ant Design are React libraries; other frameworks get ports with different names and APIs.

| FE framework | Valid UI frameworks | Watch out for |
|---|---|---|
| React | shadcn/ui, Ant Design, MUI, Mantine, Chakra, HeroUI, Radix + Tailwind | shadcn/ui is copy-in source, not a dependency |
| Vue 3 | shadcn-vue, Ant Design Vue, Vuetify, PrimeVue, Naive UI, Element Plus | "shadcn" for Vue = shadcn-vue (Reka UI) |
| Nuxt 3 | Nuxt UI, shadcn-vue, PrimeVue, Vuetify (via modules) | Nuxt UI v2 → v3 moved the theming API |
| Svelte 5 | shadcn-svelte, Skeleton, Flowbite Svelte, Melt UI + Tailwind | Svelte 4 vs 5 changes component APIs |
| Angular | Angular Material, PrimeNG, NG-ZORRO, Spartan | NG-ZORRO is the Angular Ant Design, not `antd` |
| SolidJS | solid-ui, Kobalte + Tailwind, Ark UI | Small ecosystem — confirm it is maintained |
| Laravel / Blade | Tailwind + Flux, Livewire + DaisyUI, Filament | Filament ships its own theme layer |
| Astro / plain HTML | Tailwind + DaisyUI, Preline, Flowbite, plain CSS vars | No component runtime — theme is pure CSS |

Named an incompatible pair ("Vue with shadcn/ui")? Say so, name the correct port, let them confirm.

**Three.js is not a UI framework.** A WebGL canvas has no tokens; the surrounding DOM does. Theme the overlay normally; `--stack threejs` is for WebGL-specific guidance.

## Concept Questions — and Nothing Else

Three questions, asked one at a time. Every one of them changes what gets seeded; nothing else does.

1. **What is this product, and who uses it?** One or two sentences in their words. "A patient portal where clinic staff and patients both log in" is better than "a healthcare app". This answer *is* the database query, and it decides density, accent loudness, which styles are candidates, and **which product the preview renders as** (`--archetype`).
2. **Do you have a main colour?** If yes, take the hex (or read it off the logo) and pass `--brand`. Every option then pins *their* colour and the choice becomes which treatment of it they want. If no, say "I'll propose one per direction — you'll pick a colour by picking a direction" and omit the flag.
3. **Is there a site whose look you want to borrow from?** Ask them to paste the links into the chat — as many as they have, and one line each on *what* they like about it ("the density", "the type", "the surfaces"). Then:
   - **Fetch each one** and read what is actually there — the type pairing, the surface treatment, the density. A link the user pasted and you never opened is worse than no link, because they will assume it landed.
   - Turn it into seeding input, not into a copy: the style keywords go into the query, a sampled brand colour can become `--brand`, and the links go through `--inspiration "Label=url=what they liked"` so they sit above the options in the preview.
   - **At least one option must visibly answer the reference**, and at least one must not — a reference is a data point about taste, not a specification. Say which is which when you present the set.
   - Cannot reach the site (offline, login wall, blocked)? Say so in one line and ask them to describe it instead. Never invent what a page you could not open looks like.
   - No reference? Fine — that is the common case, and the option set is what generates the taste signal instead.

### Do not ask about

**Fonts. Corner radius. Density. Spacing. Mood adjectives. Style names. Light vs dark. Which components come first.**

Asking "sharp or rounded corners?" hands the work back to the person who came here to avoid it. Most users have no defensible answer, so they guess — and then you have built to a guess and called it taste. These are consequences of what the product is, and the option set makes them visible: five screens answer "do you want rounded corners" better than the question does.

Scope and default colour mode are the same: you **propose** them in the plan and the user corrects them at Gate 2. A scope question asked before the plan exists gets answered without the plan's context, which is how a five-component ask becomes a fifteen-component build.

Volunteered constraints ("our brand font is Söhne", "must be dark") are different — take them and thread them through.

### Dials come from the concept

`--density`, `--variance`, and `--archetype` are properties of the product, not the user's mood. `seed-options.py` infers density and variance and prints what it inferred — read those lines; override only when you can say why.

| The concept | Inferred |
|---|---|
| Dashboard, admin, analytics, console, CRM, ERP, trading, monitoring | `--density 9`, `--archetype dashboard` |
| Landing, marketing, portfolio, agency, spa, hotel, luxury | `--density 3`, `--archetype landing` |
| Shop, storefront, catalog, checkout, retail, fashion, marketplace | `--archetype ecommerce` |
| Blog, magazine, editorial, publication, docs, knowledge base | `--density 3`, `--archetype editorial` |
| Bank, fintech, insurance, healthcare, government, legal, enterprise | `--variance 2` |
| Creative, agency, fashion, gaming, entertainment, art, experimental | `--variance 8` |
| Anything the words don't settle | dials `5`; archetype `landing` |

`--density` rewrites the `--space-*` scale, `--variance` biases which styles fill open slots, `--archetype` decides which miniature product every option is demonstrated on.

## Querying the Database

Invoke by full path — never assume the working directory. Python 3, stdlib only (`python3` if `python` is missing).

```bash
python "<skill-dir>/scripts/search.py" "<query>" --domain <domain> [-n 3]
```

**Query with multi-dimensional keywords.** `"healthcare SaaS dashboard data-dense"` beats `"app"` — product + industry + tone + density. `-n 1` when one match is enough: the `style` domain ships untruncated checklists, so three results cost ~4× one.

| Need | Domain |
|---|---|
| Product-type pattern, landing structure, dashboard style | `product` |
| Style guides — colours, effects, framework fit, complexity | `style` |
| Palettes by product type (shadcn token columns) | `color` |
| Font pairings + Google Fonts URL, CSS import, Tailwind config | `typography` |
| Individual families, variable axes, popularity | `google-fonts` |
| Page structure and CTA strategy | `landing` |
| Chart type, library, accessibility grade | `chart` |
| UX rules, do/don't, severity | `ux` |
| Icon names with import code | `icons` |
| React/Next render and bundle issues that cause visible jank | `react` |
| Per-stack guidelines | `--stack <name>` |

Stacks: `react`, `nextjs`, `vue`, `nuxtjs`, `nuxt-ui`, `svelte`, `astro`, `angular`, `laravel`, `html-tailwind`, `shadcn`, `threejs`.

Domain is auto-detected when omitted, but overlapping terms misroute ("font" hits both `typography` and `google-fonts`) — pass it when results look off.

**0 results:** retry once with broader keywords (product and style separately). Still empty? Say so out loud — "no palette match for X, falling back to general SaaS defaults" — and use the Review Priority order. Never present an empty search as data.

## Seeding the Options

**3-5 named directions**, each a complete light + dark token set with identical variable names, so the winner ports by copy.

```bash
python "<skill-dir>/scripts/seed-options.py" "<what the product is, in the user's words>" \
  --count 5 --brand "#4F46E5" --project "<Project Name>" \
  --inspiration "Linear=https://linear.app=the density and the calm" \
  --out <project-slug>/docs/design/ui-options.html \
  --token-dir <project-slug>/docs/design/option-tokens
```

Paths are relative to the current directory; the script creates missing parents. On an existing project drop the `<project-slug>/` prefix and write to `docs/design/` at the repo root.

| Answer | Flag |
|---|---|
| They gave a brand colour | `--brand "#hex"` — omit when they did not |
| They pasted reference sites | `--inspiration "Label=url=why"`, repeated per link |
| The concept's product type was misread | `--archetype dashboard\|landing\|ecommerce\|editorial` |
| A dial is wrong and you can say why | `--density` / `--variance` |

Each option is a distinct direction, not a hue variant: no repeated style, no repeated font pairing, ≥40° OKLCH hue separation, a different **surface kit** per slot where the query allows, then a **derived** dark theme (`colors.csv` has no dark values) with every WCAG text pair nudged clear of 4.5:1 in both modes. It reports every fallback and adjustment — read those lines. With `--brand` the hue axis is spent, so distinctness moves to surface, type, shape, and accent strategy.

`glass`, `soft` and `hard`/`outlined` also adjust the palette itself and report each adjustment. Mechanics for all of it: `references/seeding-internals.md` — read it when a seed looks wrong.

### Step 7 — the contrast gate

```bash
for f in <project-slug>/docs/design/option-tokens/*.css; do node "<skill-dir>/scripts/contrast-check.mjs" "$f" || echo "FAILED: $f"; done
```

**Zero failures is the entry condition for showing the preview.** A failing option is not an option: the user cannot be allowed to pick it, and fixing it after the pick means the colour they picked is not the colour they get. Reseed or hand-fix — never defer to the implementation phase, and never "it looks fine to me" past it. 4.5:1 is the one part of this phase that is arithmetic rather than taste, which is why it is settled before the judgement starts.

WARNs on `border`/`input` are advisory and can ship; a WARN on `ring` cannot — an invisible focus indicator is an accessibility failure wearing a different name.

### Step 8 — sharpen the seeds

The seeder does the mechanical half (contrast, hue separation, dark derivation, kit selection) and none of the editorial half. Ship it unsharpened and the set reads as machine output, which the user rejects wholesale instead of picking from.

**Axis first.** Before editing names, state each option's axis in a short phrase — the single dimension it explores (e.g. "editorial type + soft surfaces", "dense console + hard borders", "brand-loud glass"). **Completion criterion:** every option has a name and an axis, and no two options share an axis position. If two would differ only in accent hue or copy, they are one direction — replace one with a real alternative (different kit, type, density, or accent strategy). If two converged while you sharpened them, **cut one and say so**: a set of two truly distinct directions beats a padded three.

Wrong by construction until you fix it:

- **Name** — named after the style row, so it ships "Neumorphism". A user cannot pick between techniques; give each a name someone can say out loud in a meeting ("Editorial Warm", "Signal").
- **Thesis** — a keyword join that reads as a tag list. One line: what the option commits to, and who it is for.
- **Fonts** — ranked by text similarity, so a CJK family can land on an English spa site. Re-pick with `--domain typography`.
- **Radius** — usually stepped off a ladder, and the script says which. 1rem corners on a data-dense console is wrong even though the ladder produced it.
- **Surface kit** — must suit the brief (`soft` on a trading terminal is wrong) *and* vary across the set. 32 of 84 style rows declare no technique, so the script reports which kits were stepped.
- **Archetype and references** — the right product is being previewed, one option visibly answers the sites the user pasted, and one deliberately does not.

Check the set *as a set*: a tab strip reading "flat · flat · flat", or five theses all saying "modern and clean", means the seeder produced hue variants and the choice is fake.

Edit `ui-options.html` directly — the `OPTIONS` array is formatted for hand-editing. Change names, theses, fonts, and kits; if you change a colour or a `--surface-*` value, change the matching `option-tokens/*.css` too, so the file the gate reads stays the file the preview shows.

## Rendering the Preview

`seed-options.py` writes `ui-options.html` filled in — one self-contained file, no server, no build, no app needed to view it.

- **One option on screen at a time, full size, switched by a tab bar.** A stacked page answers "how do these differ"; the question that decides a pick is "does *this* screen work", and that needs the screen undivided. Tabs carry letter, name, kit, radius and a swatch strip; arrows and `1`–`5` switch, `d` toggles dark, and the active letter is in the URL hash so an option can be linked or reopened.
- **Variant swap is instant.** Flipping is a high-frequency action — no fade or crossfade between options. Tab chrome may transition; the stage content switches with no transition.
- **The brief sits above the options** — the concept sentence and the reference links the user pasted, because "is this right?" needs the "for what" in the same viewport.
- **A direction is three things and the preview shows all three.** Colour and type are expected; the third is what stops this being a palette picker. **Surface kit** (`flat`/`outlined`/`elevated`/`soft`/`glass`/`hard`) is seven `--surface-*` variables in the same token file as the colours, so what is picked is what gets ported — the popover is open on purpose, since elevation and blur only show over content. Mechanics: `references/seeding-internals.md` (surface kit sections only).
- **The preview renders the user's product, not a generic screen** — **dashboard** (sidebar, stat cards, chart, table, form), **landing** (nav, hero, logo strip, features, pricing, CTA), **ecommerce** (chips, filter rail, product grid, open cart), **editorial** (masthead, article, pull quote, figure, newsletter). A sidebar and a data table say "admin console" far louder than a palette says anything, so previewing a storefront as a dashboard makes the user judge the wrong screen. Every option renders the *same* archetype so the comparison stays fair; the three non-dashboard ones append a component rail (buttons, badges, input, open popover, chart colours) to keep token coverage identical.
- **Both modes and focus states ship, so both are previewable.**

**Done when (before asking for a letter):** every option is reachable from the tabs; dark mode toggles on each; no two share an axis; contrast gate was clean; you can name each option's tradeoff honestly.

Then present a short tradeoff table and **stop — the choice belongs to the user**:

| # | Option | Axis | When it's the right choice | Its cost |
|---|---|---|---|---|
| A | Signal | Dense + hard surfaces | Daily-use console, info density first | Least memorable, colder |
| B | Editorial Warm | Soft + generous type | Marketing or calm brand moment | Eats space, softer hierarchy |

Close with the path and the keys (`1`–`5`, arrows, `d`):

> "Five directions are in `<project-slug>/docs/design/ui-options.html` — click through the tabs and toggle dark on each. B and D lean on the Linear reference you sent; A deliberately doesn't. Tell me which letter, or which parts to combine. Nothing else is created yet; once you've picked I'll write the implementation plan for you to review."

Never pre-pick a favorite in the table. If the user asks which you'd choose, answer from the product's personality and frequency of use, not aesthetics alone.

Offline or a system-font stack? Remove the Google Fonts `<link>` from the preview too.

**Iterate before advancing.** Hybrids are the common outcome ("B's colours, D's typography"). Build the hybrid as a new option in `ui-options-v2.html` and get a clean pick on it. Never plan around a hybrid you have not shown.

## The Plan File

Step 10 — the last thing the planning phase produces and the thing the implementation phase executes. Written **by hand** to `docs/design/UI-PLAN.md`.

It does two jobs at once. It is the **review surface** — a wrong stack version, a missing page or an over-broad scope is cheap to catch while it is still a sentence and expensive to catch in a diff. And it is the **work order** — the implementation phase makes no new decisions, it reads this file and builds it, which is why anything genuinely undecided goes in *Risks & open questions* instead of being resolved silently at the keyboard.

**Copy the skeleton in `references/plan-template.md`** rather than inventing a layout. It carries the section list, what each section holds and feeds, and what must stay *out* of each one.

### Gate 2 — asking for the plan review

Say where it is, what it commits to in two or three lines, and ask both questions. Then **end the turn.**

> "The plan is in `docs/design/UI-PLAN.md` — direction **B "Signal"**, React + Vite + Tailwind v4 + shadcn/ui, dark by default, and five components to start with: app shell, stat card, data table, form row, button set.
>
> The scope is my proposal, not your request — have a read and cut or add. Nothing is generated yet; say the word and I'll scaffold the Vite app and build from the plan."

- **Revisions edit the plan in place.** Restate what changed, ask again. One copy — never a `UI-PLAN-v2.md`.
- **A comment is not an approval.** "Looks good, though maybe fewer components" is a revision request.
- **A direction change loops further back** — "actually, C's typography" reopens Gate 1. Rebuild the option, get a clean pick, rewrite the plan.
- **Nothing in the implementation phase starts in the plan's turn.** Not the scaffold, not `npm install`, not the token file.

## Scaffolding the App

Step 11, **greenfield only** — skip entirely when a `package.json` exists. First action of the implementation phase, so only after the plan is approved, using the command the plan names.

**Read `references/scaffolding.md` first** — per-framework commands, the Vite swap dance that preserves `docs/design/`, the styling-engine install. Three rules that do not wait for that file:

- **Always the non-interactive flag** (`--no-interactive` or its equivalent). A TTY prompt hangs the turn.
- **Never `--overwrite`.** It deletes `docs/design/` — the preview and token files the pick was made from.
- **Never scaffold into the folder that holds the design docs.** Vite prints `Operation cancelled`, creates nothing, and exits 0 — a silent no-op that reads as success.

Confirm `npm run build` passes before touching the theme. Then `src/index.css` is the token file.

## Implementing

The implementation phase, after the plan was approved and (on a new project) after the app exists. The plan's Steps section is the running order; this is how each step is done. File locations and syntax per framework: `framework-recipes.md`. Token reference: `shadcn-tokens.md`.

1. **Tokens first, in one file** — complete light and dark blocks before any component. The winning option's CSS exists at `docs/design/option-tokens/<letter>-*.css`; port it, don't retype it. On a fresh Vite app, replace `src/index.css` outright — its demo styles are not a starting point.
2. **Port the whole option, `--surface-*` included.** The kit carries the visual style; colours alone ship a flat app in the right palette, which is not what the user picked. Components read `var(--surface-shadow)` / `var(--surface-border-width)` instead of inventing their own, the kit name goes on the app root for the few per-kit rules (`framework-recipes.md` → *Porting the surface kit*), and a translucent `card` stays translucent — flattening it deletes a glass direction.
3. **No comments in the token file.** `index.css` (and `app.css` / `globals.css` / `styles.css`) ships zero `/* … */` — not the seeder's `/* Option B … */` header, not section banners, not a note on a nudged lightness. Comments there go stale on the first value change, and the file is machine-read. Reasoning goes in the closing report, not the file. CSS token files only: JS theme objects and components keep the project's normal conventions.
4. **Fonts second** — mapped to `--font-sans` / `--font-serif` / `--font-mono` (or the framework's equivalent) so no component names a family directly.
5. **Components and pages last, tokens only** — every colour, radius, and spacing value references a token. A hex in a component ignores the mode toggle and drifts. Wire Motion craft (below) on every interactive control as you build it — do not leave "we'll polish motion later".
6. **Both modes, every component**, before starting the next.
7. **Only what the plan scopes.** An extra page you thought would help is unapproved scope. If the build genuinely needs something unlisted, add it to the plan and say so.
8. **Verify version-sensitive APIs** — Tailwind 3→4, Chakra 2→3, PrimeVue 3→4, Nuxt UI 2→3, Angular Material 17→18→20 all moved theming. Read `package.json`, never memory.
9. **Icons from one family** — `--domain icons` gives names with import code. One library, one stroke width, one size scale. Never emoji.
10. **Delete the scaffold's demo content** — `App.css`, the logo assets in `src/assets/` and `public/`, the counter markup. Set the real `<title>` in `index.html`.

### Motion craft

These are the invisible details that keep a correct theme from feeling unfinished. Apply while building components — not as a separate pass after review.

- **Frequency first.** Keyboard-triggered and high-frequency actions (shortcuts, command palette, list keyboard nav) get **no animation**. Occasional UI (modals, drawers, toasts) may animate; rare/first-time moments may add delight. If the user will see it tens or hundreds of times a day, remove or cut to near-zero.
- **Name the properties.** `transition: transform 160ms …`, never `transition: all`. Animate **only** `transform` and `opacity` — not `width`/`height`/`padding`/`top`.
- **Timing.** Press feedback 100–160ms; tooltips/small popovers 125–200ms; dropdowns 150–250ms; modals/drawers 200–300ms. Stay under ~300ms for UI. Instant (0ms) on a hover/press control reads as broken; over 500ms reads as sluggish.
- **Easing.** Enter and UI feedback use **ease-out** (or a strong custom ease-out). Never `ease-in` on UI — it delays the first frame the user is watching. Exit may be shorter than enter (~60–70%), still ease-out.
- **Press.** Buttons and other pressables get `:active { transform: scale(0.97) }` (range 0.95–0.98). That is transform-on-self — it must not shift siblings or reflow layout. Colour/opacity/shadow/border remain valid press signals too.
- **Enter scale.** Never animate from `scale(0)`. Start at `scale(0.95)` (or higher) with `opacity: 0`.
- **Origins.** Popovers/tooltips/menus scale from their **trigger** (`transform-origin` toward the trigger, or the library's `--transform-origin`). **Modals stay centered** — `transform-origin: center`.
- **Hover on touch.** Gate hover-only motion behind `@media (hover: hover) and (pointer: fine)` so a tap does not stick a hover scale.
- **Reduced motion.** Honour `prefers-reduced-motion: reduce` — drop movement/position animations; keep short opacity/colour fades that aid comprehension.

Then the gate on the real token file:

```bash
node "<skill-dir>/scripts/contrast-check.mjs" src/index.css
```

- **FAIL** — a text pair below 4.5:1. Blocking, exits 1. Fix by adjusting lightness, not by lowering the bar.
- **WARN** — a non-text pair (`border`, `input`, `ring`) below 3:1. Advisory: fine for a divider, not for a focus `ring`.

Stock shadcn trips one FAIL out of the box (`muted-foreground on muted`, 4.34:1). Your options should not — the seeder already fixed that pair.

Before declaring done, grep: components for `#` and `rgb(` (hardcoded colours), and the token file for `/*` (comments). Both should return nothing.

## Closing Report — in the chat, not in a file

The last thing the implementation phase does is **say what happened**, in the conversation. No `DECISIONS.md`, no design-system doc: the token file already holds every value, `UI-PLAN.md` already holds what was agreed, and a third document restating both starts drifting from both on the first edit.

Keep it short and put the deviations first — that is the part the user cannot get anywhere else:

- **Where the result differs from the plan, and why.** Every difference: a component that turned out to need a sibling, a version whose theming API was not what the plan assumed, a token deliberately off the seeded value. None? Say "built as planned" in one line.
- **What was built and where** — the file paths, so the next message can point at one.
- **Anything a lightness nudge or a fallback changed** about the direction the user picked — if their brand colour had to move in dark mode, they need to hear it from you, not notice it later.
- **What is still out of scope**, one line, from the plan's own list.

Then stop. Do not restate the palette, the spacing scale, or the plan's step list back to someone who just read it.

If the project already carries a `DECISIONS.md` from an older run — or a legacy `design-system/*/MASTER.md` — **update it** rather than leaving it stale, and say you did. Prior decisions are not yours to discard. Just do not create one where none exists.

## Situations → What To Do

Rules stated once above are not repeated here. These are the judgement calls that live nowhere else.

| Situation | Do this |
|---|---|
| Fewer than 3 options feel worth showing, or the seeder returns 2 | Broaden the query and rerun. Show three anyway — the choice *is* the deliverable, and two is not a choice. Two *after* cutting a converged pair is fine if both axes are real — say you cut the third. |
| The options differ only in hue, or all share one surface kit | Not a choice. Vary structure, type, density, and surface — check the tab strip. If the query only ranked one style family, broaden it or hand-swap a kit. If two share an axis after sharpening, cut one. |
| User wants "exactly like site X" | That is a build request, not a direction — say so. Seed the set anyway with X's style keywords in the query; the closest option becomes the starting point and the others show what was given up. |
| Seeder reports "taken from the widened pool" | Check that direction against the brief by hand before showing it. |
| User has a brand colour | Never hand-edit an option's `primary` after seeding — it breaks the "one colour, five ways" premise. Reseed with `--brand` instead. |
| User picks an option and says "go ahead" in the same message | Still the planning phase. Write the plan, show it, ask. "Go ahead" came before the scope existed to agree to. |
| User skips the preview: "just implement something reasonable" | The options are the deliverable, not a formality. Offer the fast path: seed 3, pick in one turn — then plan, then build. |
| Project already has shadcn installed | The probe reports `style`, `baseColor` and `cssVariables` from `components.json`. Keep the token names, replace values only. |
| Probe says `THEMED` and the user just says "make it better" | That is not an answer to refresh-vs-replacement. Ask again with the two options named — the choice decides whether the existing token names survive. |
| Probe reports a token file with comments in it | Note it; the no-comments rule applies to the file you write. Do not clean up an existing file that is out of scope. |
| Probe finds no FE framework but a `package.json` exists | A backend-only or tooling repo. Say so and ask what the frontend actually is — never guess from a lockfile. |
| Target is a component library with its own tokens | Design in shadcn vocabulary, map at implementation time via `framework-recipes.md`. |
| Dark mode looks muddy | You inverted lightness instead of deriving it. `references/quick-reference.md` §6; check the background is lifted off pure black. |
| Font is loaded but text looks unchanged | The `<link>` is not the wiring — map it to `--font-sans` / `--font-serif` / `--font-mono`. |
| User is offline or privacy-constrained | System font stack, no CDN link — in the preview too. |

## Red Flags — STOP

- About to run a scaffolder, `npm install`, `npx shadcn init`, or write `index.css` — before the plan was approved, or before the UI framework was confirmed
- Starting the implementation phase in the plan's turn on the strength of an earlier "go ahead", or ending the plan turn without asking whether to implement — the ask is the gate
- About to write `UI-PLAN.md` before the user named an option by letter
- Building a component that is not in the plan's scope table
- About to pass `--overwrite` to a scaffolder, or run one without its non-interactive flag
- About to create a project folder, or any file, under `.claude/`
- About to present options that all render as the same flat card in different hues, or two options that share an axis
- About to ask "rounded or sharp corners?", ask for a brand colour a second time, or ask which components come first — the option set answers the first, and the plan proposes the third
- About to seed options against a reference link you were given and never opened, or design around a brand colour you never got
- About to preview a storefront or an article as a dashboard because the archetype was never checked
- About to reseed over a project the probe called `THEMED` without asking refresh vs replacement
- Treating the probe's detected versions as confirmed instead of stating them back
- About to present a 0-result search as data instead of naming the fallback
- About to write a `/* comment */` into a CSS token file
- About to port an option's colours and leave its `--surface-*` variables behind
- Thinking "the default theme is fine for now" or "dark mode can come later"
- Leaving a Vite logo or counter demo next to a themed app
- About to write a `DECISIONS.md` instead of reporting the deviations in the chat
- About to ask for a letter before the tradeoff table and the done-when checks above
- About to ship `transition: all`, `ease-in` on UI, `scale(0)` entrances, or animate a keyboard/high-frequency action

**All of these mean: stop, back up to the checklist, get the missing confirmation.**

## Supporting Files

Read on demand, at the step that needs them — never up front:

| File | For | Step |
|---|---|---|
| `framework-recipes.md` | where the theme lives, what to write, porting the surface kit | 10, 12 |
| `shadcn-tokens.md` | token reference, `--surface-*` family, v4/v3 forms, OKLCH | 12 |
| `references/plan-template.md` | the `UI-PLAN.md` skeleton, and what each section holds, feeds and keeps out | 10 |
| `references/scaffolding.md` | scaffold commands, the Vite swap dance, stack install | 11 (skim at 10) |
| `references/seeding-internals.md` | how an option is built and derived | 8, when a seed looks wrong |
| `references/quick-reference.md` | all 98 UX rules by category | review passes |
| `reviewer-prompt.md` | reviewer subagent prompt | 16 |

Run, don't read — these never enter context:

- `scripts/probe-context.py` — step 1: the project's frontend state, a verdict, and what that verdict requires
- `scripts/seed-options.py` — database → preview-ready options with derived dark mode, surface kits, and the archetype
- `scripts/search.py` — database search, `--design-system`, dials (`design_system.py` is its generator)
- `scripts/contrast-check.mjs` — WCAG gate for a token file
- `scripts/mockup-template.html` — the tabbed preview harness the seeder fills in: four archetypes, the concept banner
- `scripts/validate_data.py` — data integrity; run after editing any CSV
- `data/` — 12 domain CSVs + 12 web stack CSVs
