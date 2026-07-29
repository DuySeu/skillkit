---
name: ui-design-pro
description: "Seeds 3-5 themed design directions from a local database, lets the user pick one, then implements it as real tokens and components. Use when starting a new app or frontend project from scratch, and when designing, building, reviewing, refactoring, or improving UI: pages, components, color theme, brand color, index.css or theme config, design tokens, typography, font pairing, layout, spacing, radius, density, accessibility, animation, data visualization — website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive."
---

# UI Design Pro: Direction Into Themed Components

Turn a vague "make it look good" into a confirmed design direction and a working theme: token file, fonts, and the key components — in the user's actual stack.

Read the project's existing frontend state, ask what the product is and whether it has a brand colour, seed real options from the database, show them as one tabbed preview, and only then write code.

<HARD-GATE>
Do NOT write `index.css`, theme config, design tokens, any component code, **or scaffold an app** until BOTH are true:
1. The user has confirmed the FE framework AND the UI framework (never inferred, never defaulted).
2. The user has picked one of the presented options (or a named hybrid of them).

Presenting the options is not approval. Enthusiasm is not approval. "Looks nice" on one screenshot is not approval — ask which option, by letter.

On a new project this also gates `npm create vite@latest`: before the pick the only files that exist anywhere are `<project>/docs/design/`. See Greenfield below.
</HARD-GATE>

## Anti-Pattern: "I Can Tell What They Want"

You cannot. Taste is the whole deliverable here, and taste is not inferable from a repo — nor is it extractable by quizzing the user about fonts and corner radii. Every one of these is a violation:

- Installing shadcn/ui because the project uses React and Tailwind.
- Shipping the default zinc/neutral shadcn theme because the user said "clean and modern".
- Picking a font because it is the one you always pick.
- Writing `index.css` first and asking "does this work for you?" after.
- Running `--design-system` once and treating its single best match as the answer. It is one seed, not a decision.
- **Interviewing your way out of it** — asking the user to choose a font category, a corner radius, a density, or three mood adjectives. That is not gathering taste, it is delegating the design. See Concept Questions.
- Asking about the brand colour more than once. Ask once: pin it if they have one, propose one per option if they don't.

A design that arrives without a choice is a design the user has to argue with instead of pick. A design assembled from the user's answers to eleven questions is a design they wrote and you typed.

## Checklist

You MUST create a task for each of these items and complete them in order:

1. **Read the frontend context** — `package.json` (framework + versions), existing CSS/theme files, existing components, `tailwind.config.*`, current fonts. See Context Probe below. **If there is no project yet, this step is replaced by Greenfield below**: create `./<project-slug>/docs/design/` in the current directory and nothing else.
2. **Ask the stack questions** — FE framework, UI framework, styling engine + version. REQUIRED. Never assume.
3. **Check compatibility** — validate the FE × UI framework pair against the matrix; resolve conflicts before continuing.
4. **Ask the two concept questions** — what the product is and who uses it, and whether they already have a main colour. Nothing else. See Concept Questions below.
5. **Query the database** — `--domain product` for the pattern, then `color` / `style` / `typography`. See Querying below.
6. **Seed 3-5 options** — run `scripts/seed-options.py`, with `--brand <hex>` if they gave a colour. It builds the option set, derives dark mode, and writes the preview plus one token file per option — into `<project>/docs/design/`.
7. **Run the contrast gate on every seed** — `scripts/contrast-check.mjs` on each option's CSS. Fix or drop before the user sees anything.
8. **Review and sharpen the seeds** — rewrite generated names and theses into something a human would say; sanity-check the fonts against the brief. See Sharpening below.
9. **User picks an option** — explicit approval gate. Iterate on the preview if they want a hybrid or a tweak.
10. **Scope the work** — now ask which colour mode is the default and which 3-6 components or pages to build first. These are the only questions that come after the pick, and they are about scope, not taste.
11. **Scaffold the app** — greenfield only. `npm create vite@latest` with the template the confirmed stack resolves to, then install the styling engine and UI framework. See Scaffolding below. Skip on an existing project.
12. **Implement the token file** — `index.css` or the framework's theme config, light + dark, per `framework-recipes.md`. Port the winning option's CSS; don't retype it.
13. **Wire the fonts** — loaded as agreed, mapped to the token variables. `CSS Import` and `Tailwind Config` come straight from `typography.csv`.
14. **Implement the key components and pages** — the ones scoped in step 10, using tokens only. No hardcoded colors.
15. **Motion pass** — if the motion dial is 3 or higher, pull presets with `--domain gsap` at the resolved tier. Skip entirely at 1-2.
16. **Verify** — run `contrast-check.mjs` on the real token file, confirm the app builds (`npm run build`) and both modes render.
17. **Review loop** — dispatch the reviewer subagent (see `reviewer-prompt.md`); fix and re-dispatch until approved (max 5 iterations, then surface to the user).
18. **Document** — write `docs/design/DECISIONS.md` by hand. No generator. See Documenting below.

Three of those steps loop rather than advance: the contrast gate reseeds (7 → 6), the pick iterates on the preview (9 → 8) until the user names a letter, and the review loop re-dispatches (17) until approved or five iterations are spent.

## Review Priority

When reviewing existing UI rather than building new, work this order. It is ranked by how much each category costs a user when it is wrong, not by how visible it is.

| Priority | Category | Impact | Domain | Must have | Avoid |
|---|---|---|---|---|---|
| 1 | Accessibility | CRITICAL | `ux` | Contrast 4.5:1, alt text, keyboard nav, aria-labels | Removing focus rings, icon-only buttons without labels |
| 2 | Touch & interaction | CRITICAL | `ux` | Min 44×44px targets, 8px+ spacing, loading feedback | Hover-only affordances, instant (0ms) state changes |
| 3 | Performance | HIGH | `ux` | WebP/AVIF, lazy loading, reserved space (CLS < 0.1) | Layout thrashing, cumulative layout shift |
| 4 | Style selection | HIGH | `style`, `product` | Matches product type, consistent, SVG icons | Mixing flat and skeuomorphic at random, emoji as icons |
| 5 | Layout & responsive | HIGH | `ux` | Mobile-first breakpoints, viewport meta, no h-scroll | Horizontal scroll, fixed px containers, disabled zoom |
| 6 | Typography & color | MEDIUM | `typography`, `color` | Base 16px, line-height 1.5, semantic tokens | Body text < 12px, gray-on-gray, raw hex in components |
| 7 | Animation | MEDIUM | `ux`, `gsap` | 150-300ms, motion conveys meaning, spatial continuity | Decorative-only motion, animating width/height, no reduced-motion |
| 8 | Forms & feedback | MEDIUM | `ux` | Visible labels, error near field, progressive disclosure | Placeholder-as-label, errors only at top |
| 9 | Navigation | HIGH | `ux` | Predictable back, bottom nav ≤5, deep linking | Overloaded nav, broken back behaviour, no deep links |
| 10 | Charts & data | LOW | `chart` | Legends, tooltips, accessible colors | Colour as the only carrier of meaning |

Full rule text for every category — all 98 guidelines with rationale — is in `references/quick-reference.md`. Read it on demand, not every time.

## Context Probe

Before asking anything, find out what is already true. Asking about a decision the repo has already made wastes the user's turn.

| Look at | To learn |
|---|---|
| `package.json` dependencies | FE framework + major version, UI library, Tailwind v3 vs v4, font packages |
| `src/index.css`, `app.css`, `globals.css` | Existing tokens, `@import "tailwindcss"` (v4) vs `@tailwind base` (v3) |
| `tailwind.config.*` | v3 setup, existing color mapping, custom fonts |
| `components.json` | shadcn is already installed; note its `style`, `baseColor`, `cssVariables` |
| `src/components/ui/` | Which components already exist — implement into them, don't duplicate |
| `docs/design/DECISIONS.md` (or a legacy `design-system/*/MASTER.md`) | A previous run already picked a direction. Read it before proposing anything; ask refresh vs replacement |
| Existing screens | Current density and layout conventions worth preserving |

Report what you found in one short paragraph before the first question, then ask only what is genuinely undecided. If the project already has a theme, ask whether this is a **refresh** (keep structure, change values) or a **replacement**.

If the probe finds no `package.json` at all — or the user asked for a **new app** — there is nothing to probe. Say so in one line and go to Greenfield.

## Greenfield: No Project Yet

The whole checklist still applies. Only step 1 changes, and step 11 switches on.

**Create one folder, in the current working directory:**

```bash
mkdir -p ./<project-slug>/docs/design
```

`<project-slug>` is kebab-case, from what the user is building — `vn-stock-ui-design`, `clinic-portal`, `nail-salon-booking`. Ask for the name if the concept doesn't hand you an obvious one; don't invent a clever one.

**Before the pick, the project folder contains exactly this and nothing else:**

```
<project-slug>/
└── docs/
    └── design/
        ├── ui-options.html
        └── option-tokens/
            ├── A-<name>.css
            ├── B-<name>.css
            └── …
```

No `package.json`, no `src/`, no `node_modules/`, no framework, no `index.css` — the app is scaffolded at step 11, after the pick. Nothing goes loose in the current directory, and nothing goes in `/tmp`: the preview is a deliverable the user opens in a browser and keeps as the record of the rejected directions.

"Current working directory" means the directory this session is actually running in. If that already *is* a worktree, its root is the current path — create the project folder there, at the top level, never nested inside another `.claude/`.

**The stack questions are load-bearing here**, not confirmatory. On an existing project you read the majors out of `package.json` and state them back; on a greenfield there is nothing to read, so nothing may be inferred. Ask, then state the resolved scaffold template and the versions you are about to install back to the user before running anything.

## Stack Questions (REQUIRED)

Ask these before anything else. They are interdependent, so this group may go in one message; the concept questions that follow go one at a time.

1. **FE framework** — React, Vue 3, Nuxt 3, Svelte 5, Angular, SolidJS, Astro, Laravel/Blade, or plain HTML/CSS?
2. **UI framework** — offer only options valid for their answer to (1), from the matrix below. Include "Tailwind only, no component library" and "headless (Radix/Ark/Kobalte) + custom" as real options.
3. **Styling engine** — Tailwind v4, Tailwind v3, CSS-in-JS, CSS Modules, or plain CSS? Confirm the major version from `package.json` and state it back.

If the user has no preference, recommend one pairing with a one-line reason and get explicit confirmation. Do not proceed on silence. **There is no default stack** — a silent default misroutes every recommendation downstream.

## Compatibility Matrix

Getting this wrong wastes an entire implementation pass. shadcn/ui and Ant Design are React libraries; the other frameworks get ports with different names and different APIs.

| FE framework | Valid UI frameworks | Watch out for |
|---|---|---|
| React | shadcn/ui, Ant Design, MUI, Mantine, Chakra UI, HeroUI, Radix + Tailwind | shadcn/ui is copy-in source, not a dependency |
| Vue 3 | shadcn-vue, Ant Design Vue, Vuetify, PrimeVue, Naive UI, Element Plus | "shadcn" for Vue = shadcn-vue (Reka UI based) |
| Nuxt 3 | Nuxt UI, shadcn-vue (via module), PrimeVue, Vuetify (via module) | Nuxt UI v2 → v3 changed the theming API; confirm the installed major |
| Svelte 5 | shadcn-svelte, Skeleton, Flowbite Svelte, Melt UI + Tailwind | Svelte 4 vs 5 changes component APIs |
| Angular | Angular Material, PrimeNG, NG-ZORRO (Ant Design), Spartan | NG-ZORRO is the Angular Ant Design, not `antd` |
| SolidJS | solid-ui (shadcn port), Kobalte + Tailwind, Ark UI | Smaller ecosystem — confirm the library is maintained |
| Laravel / Blade | Tailwind + Flux, Livewire + DaisyUI, Filament | Filament ships its own theme layer; don't write tokens over it |
| Astro / plain HTML | Tailwind + DaisyUI, Preline, Flowbite, plain CSS custom properties | No component runtime — theme is pure CSS |

If the user names an incompatible pair ("Vue with shadcn/ui"), say so plainly, name the correct port, and let them confirm before continuing.

**Three.js is not a UI framework.** A WebGL canvas has no tokens; the surrounding DOM does. Theme the overlay normally and use `--stack threejs` only for WebGL-specific guidance.

## Concept Questions — and Nothing Else

Two questions. That is the whole design interview.

1. **What is this product, and who uses it?** One or two sentences in their own words. "A booking site for a walk-in nail salon" is enough; "a patient portal where clinic staff and patients both log in" is better. This single answer is the database query, and it decides density, motion, how loud the accent can be, and which styles are even candidates.
2. **Do you have a main colour for the app?** If yes, take the hex (or the logo, and read the hex off it) and pass it as `--brand`. Every option is then built around *their* colour, and the choice becomes which treatment of it they want. If no, say so plainly — "I'll propose one in each direction, and you'll pick a colour by picking a direction" — and omit the flag.

### Do not ask about

**Fonts. Corner radius. Density. Spacing. Mood adjectives. Style names. Light vs dark.**

Asking "geometric sans or humanist sans?" or "sharp, subtle, rounded, or pill corners?" hands the work back to the person who came here to not do it. Most users have no defensible answer, so they guess — and then you have built to a guess and called it their taste. These are consequences of what the product is, and the option set is how they become visible: five directions on screen answer "do you want rounded corners" better than the question does, because the user is looking at the outcome instead of predicting it.

If they volunteer a constraint — "our brand font is Söhne", "no serifs", "must be dark" — take it and thread it through. Volunteered is not the same as extracted.

Two things genuinely do need asking, but **after** the pick, not before: which colour mode is the default (every option ships both), and which components to build first. Step 10.

### Dials come from the concept

`--density`, `--variance`, and `--motion` are properties of the product, not of the user's mood. `seed-options.py` infers all three from the query and prints what it inferred — read those lines and override with a flag only when you can say why.

| The concept | Inferred |
|---|---|
| Dashboard, admin, analytics, console, CRM, ERP, trading, monitoring | `--density 9`, `--motion 2` |
| Landing, marketing, portfolio, agency, editorial, spa, hotel, restaurant, luxury | `--density 3`, `--motion 8` |
| Bank, fintech, insurance, healthcare, government, legal, enterprise, internal | `--variance 2` |
| Creative, agency, fashion, gaming, entertainment, art, experimental | `--variance 8` |
| Anything the words don't settle | `5` — reported as "no strong signal either way" |

`--density` rewrites the `--space-*` scale. `--variance` biases which styles fill the open option slots. `--motion` selects the GSAP tier in the motion pass.

## Querying the Database

All scripts live in this skill's directory. Invoke them by full path — never assume the working directory:

```bash
python "<skill-dir>/scripts/search.py" "<query>" --domain <domain> [-n <max_results>]
```

Use `python3` if `python` is missing. Python 3.x, stdlib only.

**Query with multi-dimensional keywords.** `"healthcare SaaS dashboard data-dense"` beats `"app"`. Combine product + industry + tone + density.

`-n` defaults to 3. Pass `-n 1` when one match is all you need — the `style` domain ships full implementation checklists untruncated, so three results cost roughly four times one.

| Need | Domain |
|---|---|
| Product-type pattern, landing structure, dashboard style | `product` |
| Style guides — colors, effects, framework fit, complexity | `style` |
| Palettes by product type (shadcn token columns) | `color` |
| Font pairings with Google Fonts URL, CSS import, Tailwind config | `typography` |
| Individual font families, variable axes, popularity | `google-fonts` |
| Page structure and CTA strategy | `landing` |
| Chart type, library, accessibility grade | `chart` |
| UX rules, do/don't, code examples, severity | `ux` |
| Icon names with import code | `icons` |
| GSAP presets by intensity tier | `gsap` |
| React/Next render and bundle issues that cause visible jank | `react` |
| Per-stack implementation guidelines | `--stack <name>` |

Stacks: `react`, `nextjs`, `vue`, `nuxtjs`, `nuxt-ui`, `svelte`, `astro`, `angular`, `laravel`, `html-tailwind`, `shadcn`, `threejs`.

Domain is auto-detected when `--domain` is omitted, but overlapping terms misroute ("font" matches both `typography` and `google-fonts`). Pass it explicitly when results look off-topic.

**If a search returns 0 results:** retry once with broader or differently-worded keywords (product and style separately, not combined). If still empty, say so out loud — "no palette match for X, falling back to general SaaS defaults" — and use the Review Priority table above. Never present an empty search as if it returned data.

## Seeding the Options

Produce **3-5 named directions**, each a complete token set for light and dark, same variable names across all of them so the winner ports to code by copy.

```bash
python "<skill-dir>/scripts/seed-options.py" "<what the product is, in the user's words>" \
  --count 5 --brand "#4F46E5" \
  --project "<Project Name>" \
  --out <project-slug>/docs/design/ui-options.html \
  --token-dir <project-slug>/docs/design/option-tokens
```

Both paths are relative to the current working directory. On a **new project** they are the only files that exist yet, and `<project-slug>/` is the folder created in Greenfield — the script creates missing parents itself, so a bare `mkdir` beforehand is optional. On an **existing project** drop the prefix and write to `docs/design/` at the repo root.

Drop `--brand` when the project has no colour of its own. Dials are inferred from the query; pass `--density` / `--variance` / `--motion` only to override.

Each option is a distinct direction, not a hue variant: the script enforces no repeated style, no repeated font pairing, and ≥40° OKLCH hue separation between primaries, then **derives** every dark theme (`colors.csv` has no dark values) and nudges foregrounds until all WCAG text pairs clear 4.5:1 in both modes. It reports every fallback and adjustment it made — read those lines. With `--brand` the hue axis is spent, so distinctness moves to surface, type, shape, and the named accent strategy.

`references/seeding-internals.md` has the full mechanics — read it when a seed looks wrong and you need to know whether the script or the query produced it.

Then gate every seed before the user sees it:

```bash
for f in <project-slug>/docs/design/option-tokens/*.css; do node "<skill-dir>/scripts/contrast-check.mjs" "$f" || echo "FAILED: $f"; done
```

Any FAIL means reseed or hand-fix. Zero failures is the entry condition for showing the preview.

### Sharpening the seeds

The script produces mechanical names and theses. Rewrite them before showing anything:

- **Name** — the style category verbatim ("Neumorphism", "Minimalism") describes a technique, not a direction. Give it a character: "Editorial Warm", "Signal", "Slate Precision".
- **Thesis** — one line on what this option commits to and who it is for. "Serif headings, paper background, ink text; reads like a print magazine" tells the user something. A comma-joined keyword dump does not.
- **Fonts** — the ranked pairing is sometimes a poor fit (a CJK family for an English spa site). Check each one and re-pick with `--domain typography` if it does not match the brief.
- **Radius** — mostly inferred rather than declared by the style row, and the script says which per option. A data-dense console with 1rem corners is wrong even if the ladder produced it.

Edit `<project-slug>/docs/design/ui-options.html` directly — the `OPTIONS` array is formatted to be hand-edited. Keep the token values; change names, theses, and fonts. Edit the matching `option-tokens/*.css` too if you change a colour, so the file the contrast gate reads stays the file the preview shows.

## Rendering the Preview

`seed-options.py` writes `<project-slug>/docs/design/ui-options.html` already filled in. Single self-contained file — no server, no build, and on a new project no app needed to view it.

**One option on screen at a time, switched by a tab bar.** Each tab carries its letter, name, role, accent strategy, and a five-swatch strip, so the set stays comparable at a glance while the screen itself is judged full size. Arrow keys and `1`–`5` switch tabs; `d` toggles dark mode. A stacked page answers "how do these differ from each other" — the question that decides a pick is "does *this* screen work", and that needs the screen undivided.

Every option renders against the *same* miniature app (sidebar, topbar, stat cards, chart, data table, form row, buttons, badges) so the comparison is fair, with a light/dark toggle and a focus-state toggle because both modes and keyboard states ship.

Tell the user the path and end your turn:

> "Five directions are in `<project-slug>/docs/design/ui-options.html` — open it and click through the tabs, and toggle dark on each. Tell me which letter you want, or which parts of which options to combine. Nothing else is created yet; the app gets scaffolded once you've picked."

If the user chose a system-font stack or is offline, remove the Google Fonts `<link>` from the preview too.

**Iterate before advancing.** Hybrids are the common outcome ("B's colors, D's typography"). Build the hybrid as a new option in a new file (`ui-options-v2.html`) and get a clean pick on it. Do not start implementing a hybrid you have not shown.

## Scaffolding the App

Step 11, **greenfield only** — skip it entirely on a project that already has a `package.json`. It runs after step 10 has settled the default colour mode and the component scope, and never before an option is picked.

**Read `references/scaffolding.md` before running anything** — it has the per-framework commands, the Vite swap dance that preserves `docs/design/`, and the styling-engine install. Three rules that do not wait for that file:

- **Always the non-interactive flag** (`--no-interactive` and its equivalents). A TTY prompt in an agent session hangs the turn.
- **Never `--overwrite`.** It deletes `docs/design/` — the preview and token files the pick was made from.
- **Never scaffold into the folder that already holds the design docs.** Vite prints `Operation cancelled`, creates nothing, and exits 0 — a silent no-op that reads as success.

Confirm `npm run build` passes before touching the theme. Then `src/index.css` is the token file and step 12 continues normally.

## Implementing

Only after an explicit pick — and on a new project, only after the app exists (Scaffolding above). Per-framework file locations and syntax: `framework-recipes.md`. Token reference and OKLCH conventions: `shadcn-tokens.md`.

1. **Tokens first, in one file** — complete light and dark blocks, before touching any component. The winning option's CSS already exists at `<project-slug>/docs/design/option-tokens/<letter>-*.css`; port it, don't retype it. On a fresh Vite app that means replacing the template's `src/index.css` outright — its demo styles are not a starting point to edit around.
2. **Fonts second** — loaded the way the user chose, and mapped to `--font-sans` / `--font-serif` / `--font-mono` (or the framework's equivalent) so no component ever names a family directly. `typography.csv` carries a ready `CSS Import` and `Tailwind Config` for the pairing.
3. **Components and pages last, tokens only** — every colour, radius, and spacing value references a token. A hex code in a component file is a bug: it ignores the dark mode toggle and it drifts.
4. **Both modes, every component**, before moving to the next one.
5. **Verify version-sensitive APIs** — Tailwind 3→4, Chakra 2→3, PrimeVue 3→4, Nuxt UI 2→3, Angular Material 17→18→20 all changed theming. Read the installed version from `package.json` first.
6. **Icons from one family** — `--domain icons` gives names with import code. One library, one stroke width, one size scale. Never emoji.
7. **Delete the scaffold's demo content** — on a fresh Vite app, `App.tsx`/`App.vue`, `App.css`, the logo assets in `src/assets/` and `public/`, and the counter markup are template filler. Replace them with the scoped components and pages; do not leave a Vite logo and a themed dashboard on the same screen. Set the real `<title>` in `index.html` too.

Run the contrast gate on the real token file (`<project-slug>/src/index.css` on a new project):

```bash
node "<skill-dir>/scripts/contrast-check.mjs" src/index.css
```

- **FAIL** — a text pair below 4.5:1. Blocking. Exits 1. Fix by adjusting lightness, not by lowering the bar.
- **WARN** — a non-text pair (`border`, `input`, `ring` vs their surface) below 3:1. Advisory: fine for a decorative divider, not fine for a focus `ring`.

Stock shadcn trips one FAIL out of the box — `muted-foreground on muted` at 4.34:1. Your options should not; the seeder already fixed that pair.

## Documenting

Write `<project-slug>/docs/design/DECISIONS.md` **by hand**. There is no generator for this, deliberately: the token file is the source of truth for every value, and a generated copy of it only ever drifts out of date. Keep this short and keep it to what the code cannot say:

- The chosen option's **letter, name, and thesis** — the direction, in the words the user picked it by.
- The **brand colour** if one was supplied, and the **accent relationship** the option uses. The next person adding a component needs to know whether `primary` is negotiable.
- **Component inventory** — what was built, and where it lives.
- **Usage rules** — which token for which purpose, plus the no-hardcoded-colors rule.
- A pointer to `docs/design/ui-options.html`, so the rejected directions stay on record.
- On a new project: the **scaffold command and template** that produced the app, and the installed majors. Tailwind v3 vs v4 changes how the token file is written.

Do **not** restate the token values, the spacing scale, or the component specs. Those are in `src/index.css` and in the components, and a second copy is a second thing to keep in sync.

If a `DECISIONS.md` already exists — or a legacy `design-system/*/MASTER.md` from an earlier version of this skill — read it first and update it. Prior decisions are not yours to discard.

## Situations → What To Do

Every rule in this skill is stated once. This table is the lookup; the Red Flags below are the pre-flight check.

| Situation | Do this |
|---|---|
| User says "just make it look good" | Ask the two concept questions and go. That is already the short path — there is nothing left to trim. |
| User wants a **new app** — nothing exists yet | `mkdir -p ./<project-slug>/docs/design` in the current directory. Seed into it. Scaffold at step 11, after the pick. |
| Session is running inside a worktree | Its root **is** the current path — create the project folder there. Never write the project under `.claude/`: the user cannot find it, cannot commit it, and loses it when the worktree is cleaned. |
| Tempted to scaffold early "so there's somewhere to put the CSS" | There already is: `docs/design/option-tokens/`. Scaffolding early commits to a stack and a direction nobody chose. |
| Scaffolder refuses: "Operation cancelled" | Target directory is non-empty. Scaffold to `<slug>-app`, move `docs/` in, swap the names. Never `--overwrite` — it deletes `docs/design/`. |
| Fresh Vite app still shows the counter demo | Not done. Delete `App.css`, the logo assets, and the template markup; set the real `<title>`. |
| Only one option feels worth showing | Show three anyway. The choice *is* the deliverable; one option is a proposal the user has to argue with. |
| The options differ only in hue | Not a choice — vary structure, type, and density too, or you shipped one design five times. |
| Only 2 options survive the seeder | Broaden the query and rerun. Two is not a choice. |
| Seeder reports "taken from the widened pool" | Check that direction against the brief by hand before showing it. |
| User has a brand colour | `--brand "#hex"`. Every option pins it; they differ in surface, accent relationship, type, and shape. Never hand-edit an option's `primary` afterwards — that silently breaks the "one colour, five ways" premise. |
| User has no brand colour | Omit `--brand` and say so. The options each propose one, and picking a direction is how the colour gets discovered — that is what they are for. |
| User asks *you* which font / radius / density they should choose | Don't answer, and don't ask back. Seed the options and let the screens answer it. |
| User volunteers a constraint (brand font, "no serifs", "must be dark") | Take it. Thread it into the query, or hand-edit the affected options after seeding. |
| User picks a hybrid | New option, new preview file, fresh explicit pick. |
| Project already has shadcn installed | Read `components.json`, keep the token names, replace values only. |
| Target is a component library with its own tokens | Design in shadcn token vocabulary, map at implementation time via `framework-recipes.md`. |
| Contrast check FAILs on `muted-foreground` | Darken it in light mode / lighten in dark. Never below 4.5:1 for body text, and never "it looks fine" your way past the gate. |
| Dark mode looks muddy | You inverted lightness instead of deriving it. `references/quick-reference.md` §6 — and check the background is lifted off pure black. |
| Animation feels wrong | `references/quick-reference.md` §7, then `--domain gsap` at the right tier. |
| A component has a `#hex` or `rgb()` in it | A bug, not a shortcut: it ignores the mode toggle and it drifts. Grep components for `#` and `rgb(` before declaring done. |
| Font is loaded but text looks unchanged | The `<link>` is not the wiring — map it to `--font-sans` / `--font-serif` / `--font-mono`. |
| About to write framework theme code | Read the installed major from `package.json` first. Tailwind 3→4, Chakra 2→3, PrimeVue 3→4, Nuxt UI 2→3 all moved theming. Never from memory. |
| User is offline or privacy-constrained | System font stack, no CDN link. Remove the Google Fonts `<link>` from the preview too. |

## Red Flags — STOP

- About to run `npx shadcn init` before the user confirmed the UI framework
- About to run `npm create vite@latest` — or any scaffolder — before an option was picked
- About to create a project folder, or any file, anywhere under `.claude/`
- About to pass `--overwrite` to a scaffolder because the target directory is not empty
- About to run a scaffolder without its non-interactive flag — it waits on a TTY that never comes and the turn hangs
- About to write `index.css` before an option was picked
- Thinking "the default theme is fine for now", or "dark mode can come later"
- About to ask "do you prefer rounded or sharp corners?" — that is what the options are for
- About to ask for a brand colour a second time, or to design around one you were never given
- Presenting options and immediately starting implementation in the same turn
- About to present a 0-result search as data, instead of saying it missed and naming the fallback

**All of these mean: stop, back up to the checklist, and get the missing confirmation.**

## Supporting Files

Read on demand, at the step that needs them — never all of them, never up front:

- `framework-recipes.md` — where the theme lives and what to write, per FE × UI framework (step 12)
- `shadcn-tokens.md` — full token reference, Tailwind v4 and v3 forms, OKLCH conventions (step 12)
- `references/scaffolding.md` — per-framework scaffold commands, the Vite swap dance, stack install (step 11, greenfield only)
- `references/seeding-internals.md` — how `seed-options.py` builds and derives an option (step 8, when a seed looks wrong)
- `references/quick-reference.md` — all 98 UX rules, by priority category (review passes)
- `reviewer-prompt.md` — reviewer subagent prompt (step 17)

Run, don't read — these never need to enter context:

- `scripts/seed-options.py` — database → 3-5 preview-ready options: hex tokens, derived dark mode, optional pinned brand colour
- `scripts/search.py` — database search, `--design-system`, dials
- `scripts/design_system.py` — the `--design-system` generator behind `search.py`
- `scripts/contrast-check.mjs` — WCAG contrast gate for a token file
- `scripts/mockup-template.html` — the tabbed option preview harness (`seed-options.py` fills it in)
- `scripts/validate_data.py` — data integrity check; run after editing any CSV
- `data/` — 12 domain CSVs (11 searchable + `ui-reasoning.csv`) + 12 web stack CSVs
