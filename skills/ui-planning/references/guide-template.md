# DESIGN.md skeleton

The shape of `docs/DESIGN.md`, the one artifact the authoring flow produces. Copy it, fill every placeholder from the option the user picked, delete rows that do not apply. An unfilled `<...>` reaching the user is a defect.

## What this document is, and what that changes

`UI-PLAN.md` in a build-it-now skill is a **work order**: read once, executed once, then stale. This file is a **standing contract**: read at the start of every UI task for the life of the project, by an assistant that was not in the conversation where the direction was chosen and cannot ask.

Three consequences shape every section below:

- **No scope, no steps, no task list.** Those are properties of one build. A component list would be wrong by the second sprint, and a guide that is wrong in its first section stops being trusted in its later ones.
- **Every rule states its value, not its intent.** "Generous spacing" gives the next assistant nothing to act on; `--space-6` between sections and `--space-3` inside a card does. The reader has no way to resolve an adjective and will substitute its own taste, which is the exact failure this file exists to prevent.
- **It must survive being read in a hurry.** Assume the reader is mid-task and skimming for the one section it needs. Short sections, values in tables, the "do not" list separate and blunt.

**Length target: 150-260 lines.** Under that and the reader has to guess; much over and it gets skimmed to the point where the anti-patterns section goes unread, which is the section with the most leverage.

## What each section is for

| Section | What it holds | Why it is there |
|---|---|---|
| **Header block** | What to do with this file, in four lines | The reader may have arrived here from a one-line pointer with no other context. Without this it reads as documentation to summarize rather than a contract to comply with |
| **1 Direction** | The picked option's name, its thesis, what it commits to and what it gave up | Explains *why* the values below are what they are. A reader who knows the direction can extend it to a component nobody anticipated; one who only has hexes cannot |
| **2 Tokens** | A summary table of the dozen roles a component reaches for, and a pointer to `docs/index.css` | The full token file is the source of truth. Inlining all 35 variables here creates a second copy, and the copy that is easier to edit is the one that drifts |
| **3 Fonts** | Family per role, mapped to its token, plus the load method | The most common way a theme silently fails: the font loads and nothing changes, because no token was mapped to it |
| **4 Surface kit** | Which of the six kits, and what a container is therefore made of | This is what makes the direction visible. Without it every component becomes a flat card in the right palette, which is not what was picked |
| **5 Layout & density** | The app shell every screen sits inside, then the spacing scale, grid and what density means numerically | Two different failures. Density is the difference between a console and a brochure and is invisible in a palette, so it has to be numbers or it gets re-invented per screen. The shell is the one the reader hits first: a component built with the right tokens but the wrong skeleton - its own sidebar, its own max width, a second nav - still looks foreign next to what exists. The reader has to know what wraps their new screen before they can pick its padding |
| **6 Motion** | Durations, easing, what does *not* animate | The rules are counter-intuitive enough (high-frequency actions get no animation) that an assistant will do the opposite by default |
| **7 Component recipes** | For each recurring component: which token fills what, at which size, in which state - in tokens, never in a framework's class names | The bridge from token to code. Ten lines here save the same decision being re-made in every component, differently. Kept stack-neutral on purpose: framework syntax is the fastest-rotting thing that could go in a document meant to outlive the project's current styling engine, and `framework-recipes.md` does the translation at build time instead |
| **8 Anti-patterns** | Blunt "do not" list, project-specific | The single highest-leverage section. A reader that skips everything else and reads this one still cannot ruin the direction |
| **9 Verification** | The commands that decide whether a UI change is acceptable | Turns "looks right" into something checkable by whoever wrote the code |

## What stays out

| Would be tempting | Why it does not go in |
|---|---|
| A component/page scope table | Properties of one build, not of the design. Stale within a sprint |
| Implementation steps | This file is read *during* implementation, by someone who already knows their task |
| The full token dump | It is `docs/index.css`. Two copies means one wrong copy |
| The rejected options | They stay in `docs/design/ui-options.html`. Naming them here invites relitigating a settled choice |
| Framework tutorials, or recipes in a framework's syntax | The guide records the design, not the current build setup. `framework-recipes.md` translates at build time, when the stack is a fact rather than a guess |
| Taste adjectives with no value attached | "Clean", "modern", "premium" - the reader cannot act on any of them |

## Keeping it true

The guide is only worth reading if it matches reality, so **it is edited in place** when the direction changes: no `DESIGN-v2.md`, no dated copies. When a UI task has to decide something the guide is silent about, that decision gets reported in the chat and folded into the guide - a gap found once will be hit again.

---

````markdown
# UI Design Guide - <Project Name>

**This file is the design contract for this project. Read it fully before writing or changing any UI.**

- Tokens live in `docs/index.css`. Copy that file into the app's stylesheet - never retype the values, never add a hex to a component. `<On a project that already has one, name the real path. On one that does not exist yet, say so: the app is a later task and whoever builds it decides where the stylesheet lives.>`
- Everything below is decided. This document is not a starting point to improve on; the direction was chosen from five alternatives that are still on record in `docs/design/ui-options.html`.
- If something you need is not covered here, pick the smallest choice consistent with section 1, build it, and say in the chat what you decided so it can be added.
- Direction changes edit this file in place. There is never a second version of it.

Direction picked <YYYY-MM-DD> · <Stack: only if a `package.json` was actually read - e.g. "React 19 · Tailwind v4 (detected)". On a greenfield project write "Stack: not chosen yet" rather than guessing; nothing below depends on it.>

## 1 Direction

**<Option Name>** - <one-line thesis: what this commits to, and who it is for>

- **Axis:** <the single dimension this direction explores, e.g. "dense console + hard borders">
- **Commits to:** <the two or three things that must stay true, e.g. "information density over breathing room; one accent, used only for state">
- **Gave up:** <the cost the user accepted, e.g. "warmth and memorability - this is a tool, not a brand moment">
- **Brand colour:** <#hex, supplied by the user and pinned as `--primary`> / or: <#hex, proposed by this direction>
- **Reference sites the user named:** <label + url + what they liked> / or: none

Extending this direction to something not covered below means asking "which choice keeps the axis and the commitments true?" - not "what looks good here?".

## 2 Tokens

<paste the output of `scripts/make-guide.py` here: the summary table, chart series, radius, and surface variables>

Rules that hold everywhere:

- Every colour, radius, and spacing value in a component is `var(--token)`. A literal hex or `rgb()` ignores the mode toggle and drifts on the first theme edit.
- Both modes ship together. A component is not done until it has been looked at in dark.
- Dark mode is `<the mechanism: `.dark` class on `<html>`, persisted to localStorage>`. Default mode: **<light / dark>**.

## 3 Fonts

| Role | Family | Token | Loaded via |
|---|---|---|---|
| Display / headings | `<Family>` | `--font-serif` / `--font-sans` | <where the file comes from: Google Fonts, self-hosted, or the system stack - not which package installs it> |
| Body | `<Family>` | `--font-sans` | <as above> |
| Mono / numerals | `<Family>` | `--font-mono` | <as above> / omit if unused |

No component names a family directly - it reads the token, so a family swap is one line. <If numerals are tabular anywhere (tables, stat cards), say so here and name the feature setting.>

## 4 Surface kit

**`<flat / outlined / elevated / soft / glass / hard>`** - <what it draws in one line: border weight, shadow, blur>

A container in this project is: <e.g. "`--card` fill, `var(--surface-border-width)` border in `--border`, `var(--surface-shadow)`, no gradient">.

- Components read `var(--surface-shadow)` / `var(--surface-border-width)` rather than inventing their own. That is what keeps twelve components looking like one system.
- Raised things (popovers, dropdowns, modals) use `var(--surface-shadow-raised)`; nothing else does.
- <Kit-specific rule, if the kit needs one: glass → `--card` is translucent on purpose and `backdrop-filter: blur(var(--surface-blur))` is required, flattening it deletes the direction. soft → the page is never pure white and cards sit at the same value as the background, separated by shadow alone. hard/outlined → borders carry the structure and shadows stay off.>

## 5 Layout & density

### The app shell

Every screen sits inside this skeleton. A new screen extends it; it does not invent its own.

```
<ASCII sketch of the dominant layout, e.g.:
┌──────────┬─────────────────────────────────┐
│ sidebar  │ top bar            56px         │
│ 240px    ├─────────────────────────────────┤
│          │ content column, max 880px       │
│ nav list │ gutter --space-4                │
│          │                                 │
└──────────┴─────────────────────────────────┘>
```

| Region | Size | Fill / edge |
|---|---|---|
| <Sidebar> | `<240px>`, hidden below `<768px>` | `<--sidebar` fill, `--border` right edge>` |
| <Top bar> | `<56px>` tall | `<--background`, `--border` bottom edge>` |
| <Content column> | max `<880px>`, gutter `<--space-4>` | `<--background>` |
| <Primary surface> | `<the recurring container: card / thread / row>` | `<per section 4>` |

- **Where a new component goes by default:** <the placement rule, e.g. "inside the content column, full width, stacked with `--space-4` between blocks - not a new panel beside the sidebar">.
- **What a new screen must reuse:** <the shell parts that are never re-cut, e.g. "the sidebar and top bar are fixed; a screen owns only the content column">.
- **Nav pattern:** <where navigation lives and what a new destination adds to, e.g. "one flat list in the sidebar; a new section is a `nav-item`, never a second nav bar">.

### Density and spacing

- **Density: <1-10>** - <what that means concretely: e.g. "table rows 32px, card padding `--space-3`, form fields 36px tall">
- **Spacing scale:** <the steps in use, and whose scale it is - a custom `--space-*` set, or the CSS framework's own. Naming a token that does not exist in `docs/index.css` is worse than naming a pixel value>. Section gaps `<--space-N>`, inside a card `<--space-N>`, between form fields `<--space-N>`.
- **Grid:** <e.g. "12-column at ≥1024px, 4-column at ≥640px, single column below">
- **Breakpoints:** <the ones actually used>
- **Conventions preserved from the existing app:** <only on a project that already had screens - the layouts worth keeping> / or: none, this is new.
- Body text stays under ~70 characters per line.

## 6 Motion

- **Frequency decides whether to animate at all.** Keyboard-triggered and high-frequency actions (shortcuts, command palette, list navigation) get **none**. Occasional UI (modals, drawers, toasts) may. Rare, first-time moments may add delight.
- **Durations:** press feedback 100-160ms · tooltips and small popovers 125-200ms · dropdowns 150-250ms · modals and drawers 200-300ms. Nothing in UI over ~300ms.
- **Easing:** ease-out on enter and on feedback. Never `ease-in` on UI - it withholds the first frame the user is watching. Exit may be ~60-70% of enter, still ease-out.
- **Animate `transform` and `opacity` only.** Name the properties: `transition: transform 160ms ease-out`, never `transition: all`.
- **Press:** `:active { transform: scale(0.97) }` on pressables, and it must not reflow a sibling.
- **Enter from `scale(0.95)`**, never `scale(0)`. Popovers scale from their trigger; modals stay `transform-origin: center`.
- Gate hover motion behind `@media (hover: hover) and (pointer: fine)`, and honour `prefers-reduced-motion: reduce`.
- **Hover feedback** is colour, opacity, or border — not a layout-shifting scale. Press may use `:active { transform: scale(0.97) }` on the control only.

## 7 Component recipes

**Written in tokens and states, not in any framework's syntax.** Each row says which token fills what, at which size, in which state. Translating that into Tailwind classes, CSS Modules, styled-components or a theme object is the build step's job, and `framework-recipes.md` in this skill carries the per-stack form. A recipe written as `bg-primary rounded-lg` is a recipe that stops being true the day the project changes styling engine - and this file is meant to outlive that.

These are the recurring decisions; anything not here follows section 1.

| Component | Fill | Border / radius | Size | States |
|---|---|---|---|---|
| Button, primary | `--primary`, text `--primary-foreground` | none, `--radius` | height `<N>`, padding `<N>`/`<N>` | hover `<...>` · active `scale(0.97)` · focus-visible 2px `--ring` at 2px offset · disabled `<...>` |
| Button, secondary | `<...>` | `<...>` | `<...>` | `<...>` |
| Card / panel | `--card`, text `--card-foreground` | `--surface-border-width` in `--border`, `--radius` | padding `<N>` | `<hover only if it is clickable>` |
| Input | `--background` | `--input`, `calc(var(--radius) * <N>)` | height `<N>` | focus ring · error `--destructive` border + message · disabled `<...>` |
| Table row | `<--background / zebra>` | `--border` divider | height `<N>` | hover `--muted` · `<selected>` |
| Badge / status | `<which token per state>` | `<...>` | `<...>` | - |
| `<Project-specific: stat card, chart container, empty state, nav item>` | `<...>` | `<...>` | `<...>` | `<...>` |

- **Focus is visible on every interactive element** - 2px `--ring` at 2px offset. Removing an outline without replacing it is the most common accessibility regression in a themed app.
- Icons from `<one library>` only, `<N>`px, `<N>`px stroke. Never emoji as an icon.
- **Porting note for whoever wires this up:** `docs/index.css` is plain custom properties and drops into any stack unchanged, but several styling engines need the variables registered before utilities exist for them - Tailwind v4 needs an `@theme inline` block mapping every colour variable, Tailwind v3 needs `theme.extend`. Skipping that step is silent: no error, no styles. `framework-recipes.md` has the exact form per stack.

## 8 Do not

- Do not add a colour that is not a token. If a state needs a colour the palette lacks, that is a guide change, not a component change.
- Do not hardcode `border-radius`, a shadow, or a font family - `--radius`, `--surface-shadow*`, `--font-*` exist for it.
- Do not write comments in the token file. It is machine-read and regenerated; reasoning belongs here or in the chat.
- Do not ship a component that only works in light mode.
- Do not animate a high-frequency or keyboard-triggered action, use `transition: all`, `ease-in`, or a `scale(0)` entrance.
- Do not introduce a second UI library, icon set, or type scale alongside the one above.
- Do not use pure `#000` as text or `#fff` as a dark-mode surface - the palette's near-black and lifted greys are deliberate.
- <Project-specific bans, from the direction's own logic: e.g. "no gradients - this direction is flat by decision, not by omission", "no serif anywhere - this is a dashboard", "no more than one accent colour per screen">

## 9 Verification

A UI change is acceptable when these pass:

```bash
node "<skill-dir>/scripts/contrast-check.mjs" <real path to the app stylesheet>
<the project's own build or typecheck command, if it has one yet - omit this line on a project with no app>
```

- Contrast: every text pair ≥ 4.5:1 in **both** modes. A `ring` below 3:1 is a failure, not a warning - an invisible focus indicator is an accessibility bug wearing a different name.
- Grep before declaring done: components for `#` and `rgb(`, the token file for `/*`. All three should return nothing.
- Both modes rendered and looked at, not assumed.
````
