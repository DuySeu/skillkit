---
name: ui-planning
description: "Plan the UI and lock the app's directing colours before writing any web UI. Also use when a design guide already exists: build later screens against that contract, never re-decide the look."
---

# UI Style Guide: One Direction, Recorded Once

Turn a vague "make it look good" into a **design contract that outlives the conversation**: a picked direction, real tokens, and the rules that reproduce it - written to `docs/DESIGN.md` and `docs/index.css` so every later UI task builds the same product instead of a new one.

The problem this solves is drift. A theme chosen in one session and never written down gets re-decided by the next assistant, differently, and a project ends up with four card styles and three accent colours. The fix is not more taste - it is a file, in the repo, that the next assistant reads before it types.

## Two Modes - Resolve This First

| The probe says | Mode | You do | Ends with |
|---|---|---|---|
| `GUIDED` (a guide exists) | **Comply** | Read the guide, build the user's UI task to it, decide nothing it already decided | The UI change, and any gap you had to fill named in the chat |
| `GREENFIELD` / `FRESH` / `THEMED` | **Author** | Probe, two concept questions, invent 3-5 options, contrast-gate, fill preview, get a pick, write the guide | The user approving the guide. **No app code.** |

**Step 0 in both modes is the probe.** Run it before you answer anything:

```bash
python "<skill-dir>/scripts/probe-context.py"        # or a path; --json for machine output
```

Its verdict is the control flow, and its `REQUIRED NEXT STEPS` block is the instruction for the rest of the turn. Guessing the mode from the user's phrasing is how a project gets a second, contradictory guide written over the top of its first one.

### When Author mode is the wrong answer

The probe returning `FRESH` does not by itself mean a direction pick is what the user wants. If they asked for **one small thing** in a project with no guide - "add a loading spinner", "fix this button's padding" - a five-option interview is a wildly disproportionate response to a two-minute task, and running it anyway trains the user to route around this skill.

Say it in one line and let them choose:

> "There's no design guide in this project yet, so I'll match the existing components for now. Worth setting a direction properly at some point - say the word and I'll run the option pick, which takes a couple of turns and gives you a `docs/DESIGN.md` every future UI task builds from."

Then do the small thing, matched to whatever conventions the code already has. Author mode is for when the visual identity is genuinely the subject: a new project, a redesign, a theme, a design system, or a user who is tired of the UI looking inconsistent. That last one is the tell - inconsistency is the symptom this skill treats.

---

# Mode: Comply

The high-frequency path. A guide exists, the user asked for UI work, and your job is to execute inside decisions someone already made and approved.

1. **Read `docs/DESIGN.md` in full**, and `docs/index.css`. Not skim - the anti-patterns section is the one with the most leverage and it is at the bottom.
2. **Make sure the tokens are actually in the app, and wired to the styling engine.** `docs/index.css` is the record; the app's own stylesheet is what ships. If they have diverged or the app was never themed, copy `docs/index.css` into the real stylesheet **first**, comment-free, before building anything on top of it.

   **This is where the stack finally matters, and it is the one place it does.** Read the installed framework and major from `package.json` - never ask, it is written down - then follow `framework-recipes.md` for that stack. Several engines need the variables registered before any utility exists for them: Tailwind v4 wants an `@theme inline` block mapping *every* colour variable, Tailwind v3 wants `theme.extend`. **Skipping it fails silently** - no error, no styles, `bg-background` simply emits nothing. Check one utility actually renders before building on top.
3. **Build the task to the guide.** Tokens only, the guide's surface kit, its motion rules, its component recipes, both colour modes. **Place it inside the app shell in section 5** - a component with the right tokens but its own max width, its own sidebar, or a second nav bar still reads as imported from another product. The shell says what a new screen owns and what it must reuse.
4. **Where the guide is silent, choose the smallest thing consistent with its section 1** - the direction's axis and commitments are there precisely so a component nobody anticipated can be extended correctly. Then **say in the chat what you decided**, so it can be folded into the guide. A gap hit once will be hit again.
5. **Verify** with the guide's section 9 commands, then grep components for `#` and `rgb(`.

**What Comply mode never does:**

- Re-run the interview, re-author options, or present a preview. The choice is made.
- Improve the direction on its own initiative. A softer radius or a warmer grey that the guide did not ask for is drift.
- Edit the guide silently. Changing the direction is a **revision**: name the sections you would change, get a yes, then edit **in place**. Never a `DESIGN-v2.md`.
- Translate section 7 into the wrong engine's syntax without checking `package.json` first.

If the user explicitly asks to redo the design direction from scratch, that is Author mode over a `GUIDED` project: confirm they mean replacing the current direction, and say the existing guide will be rewritten in place.

---

# Mode: Author

## Operating Posture

You are a senior design engineer running a **direction pick**, not a palette dump. The value of this phase is **divergence**: three tints of the same idea waste the preview. Each option must be a direction you could defend shipping on its own. Divergence is not licence to drop the craft bar (contrast, type, surface kit, archetype fit).

**The deliverable is the guide, and it is not code.** Author mode ends when the guide is approved. It does not scaffold an app, does not run `npm install`, does not write the app's `index.css`. That happens later, in Comply mode, when there is an actual UI task.

<HARD-GATE>
**Gate 1 - the pick.** Do NOT write the guide until the user has picked one of the presented options (or a named hybrid). Presenting options is not approval - ask which option, by letter.

**Do not ask about the stack** in Author mode. `docs/index.css` is plain custom properties; section 7 is tokens and states. If `package.json` exists, the probe already read it - record it in the guide header as *detected* context, not as a question. The stack is wired in Comply step 2.

**Gate 2 - the guide.** After writing it, tell the user where it is, what it commits to, and ask them to read it. **End the turn.**

At no point in Author mode is app code written. On a greenfield project the only files anywhere are under `<project>/docs/`.
</HARD-GATE>

## Anti-Pattern: "I Can Tell What They Want"

You cannot. Taste is the deliverable. Violations:

- Installing shadcn/ui because the project uses React and Tailwind.
- Shipping default zinc/neutral because the user said "clean and modern".
- Picking the font you always pick; writing tokens first and asking "does this work?" after.
- Dumping three hue variants of the same idea and calling it a choice.
- Interviewing your way out of it - font category, radius, density, mood adjectives.
- Asking about brand colour / inspiration twice after they already answered question 2.
- Writing a guide full of adjectives. "Generous spacing" is unactionable; `--space-6` between sections is a rule.

## Checklist

Create a task per item and complete them in order.

1. **Probe** - `scripts/probe-context.py`, read the verdict, do what it requires. On `THEMED` ask refresh vs replacement; on `GREENFIELD` create `./<project-slug>/docs/` and nothing else.
2. **Two concept questions** - product, then colour *or* inspiration (see below). Nothing else.
3. **Author 3-5 options** - invent by hand (axis, palette, type, surface kit, light + dark) into `option-tokens/<LETTER>-<name>.css` + `manifest.json`.
4. **Contrast-gate every option** - `contrast-check.mjs` per option CSS. Fix or drop before the user sees anything.
5. **Fill the preview** - `scripts/fill-preview.py` → `ui-options.html`. Sharpen names, theses, kits; cut shared axes.
6. **GATE 1 - user picks.** Present the tradeoff table, then wait. Iterate for a hybrid or tweak.
7. **Write `docs/index.css` and `docs/DESIGN.md`** - `make-guide.py` + `references/guide-template.md` + reviewer pass. Section 7 stays tokens and states.
8. **GATE 2 - user reviews the guide.** Say where it is, ask them to read it. **End the turn.**

Loops: contrast → author (4→3); Gate 1 → preview (6→5); reviewer → guide (7); Gate 2 revises in place (8).

## Context Probe

| Verdict | Means | You must |
|---|---|---|
| `GREENFIELD` | No `package.json`, no `composer.json` | Greenfield below. Header: "Stack: not chosen yet" |
| `FRESH` | Project exists, no design tokens yet | Report detection; run the flow. Detected stack → header only |
| `THEMED` | A stylesheet already carries design decisions | **Ask refresh vs replacement** before anything else |
| `GUIDED` | `docs/DESIGN.md` exists | Comply mode. Do not author over it |

### What the probe cannot do, and you must

1. **Existing screens.** It lists page/route files; reading them for conventions worth preserving is yours. Survivors go into the guide's Layout section.
2. **Refresh vs replacement** on `THEMED` — ask the user, never infer from how bad the theme looks:
   - **refresh** - keep token *names* and component structure, change values.
   - **replacement** - new direction; discard existing values.
3. **Nothing else.** Do not chase confirmation on detected versions. Copy into the guide header and move on.

Report the probe in one short paragraph, then ask only the two concept questions.

**Conflicts get reported, not resolved.** If the probe prints `CONFLICTS`, say so in one line and note it in the guide header. Author output stays fine (`docs/index.css` is plain CSS); Comply step 2 is where wiring must be fixed.

## Greenfield: No Project Yet

```bash
mkdir -p ./<project-slug>/docs
```

`<project-slug>` is kebab-case from what they are building. Ask for the name if the concept doesn't hand you one.

**Author mode leaves exactly this:**

```
<project-slug>/docs/
├── DESIGN.md
├── index.css
└── design/
    ├── ui-options.html
    └── option-tokens/
        ├── manifest.json
        └── {A,B,...}-<name>.css
```

Create at the session cwd root, **never under `.claude/`**. No `package.json`, no `src/`. Header later: "Stack: not chosen yet".

## Concept Questions - and Nothing Else

Two questions, one at a time. Every answer changes what gets authored; nothing else does.

1. **What is this product, and who uses it?** One or two sentences in their words. Decides density, accent loudness, and **archetype** for the preview.

2. **How should we anchor the look — pick one:**
   - **Brand colour** — send a hex (or logo). **Pin `primary` to that hex in every option**; distinctness shifts to surface + kit + type.
   - **Inspiration site** — paste link(s) plus one line each on *what* they like (density, type, surfaces). Then:
     - **Fetch each one** and read what is there. Never invent a page you could not open.
     - Turn into authoring input, not a copy. Put links in `manifest.json` `inspiration`.
     - **At least one option must visibly answer the reference**, and at least one must not. Say which is which.
   - **Neither** — propose a colour per direction; the option set carries the taste signal.

Do **not** ask colour and then separately ask for a site. One choice among the three branches above.

### Do not ask about

**Fonts. Corner radius. Density. Spacing. Mood adjectives. Style names. Light vs dark. Which components matter most. The stack.**

Volunteered constraints ("our brand font is Söhne", "must be dark", "it's Next.js") - take them and thread them through; do not open a follow-up interview.

Default colour mode and component recipes: **propose** in the guide; user corrects at Gate 2.

### Dials come from the concept

Infer density, variance and archetype from the product; state what you inferred in one line.

| The concept | Inferred |
|---|---|
| Chatbot, AI assistant, copilot, conversational, messaging, support widget | archetype `chat` |
| Dashboard, admin, analytics, console, CRM, ERP, trading, monitoring | density 9, archetype `dashboard` |
| Landing, marketing, portfolio, agency, spa, hotel, luxury | density 3, archetype `landing` |
| Shop, storefront, catalog, checkout, retail, fashion, marketplace | archetype `ecommerce` |
| Blog, magazine, editorial, publication, docs, knowledge base | density 3, archetype `editorial` |
| Bank, fintech, insurance, healthcare, government, legal, enterprise | variance 2 (restrained) |
| Creative, agency, fashion, gaming, entertainment, art, experimental | variance 8 (bolder) |
| Anything the words don't settle | density/variance mid; archetype `landing` |

The inferred density becomes guide section 5 - it has to be a number you can defend.

### Industry craft

Map the product to kit bias and type personality before picking hues:

| Industry / product cue | Kit bias (vary across the set) | Type personality | Notes |
|---|---|---|---|
| Bank, fintech, insurance, legal, gov | `flat` / `outlined` / `hard` / `elevated` — avoid candy `glass` | Institutional sans (IBM Plex, Public Sans, Source Sans) | Restrained chroma; navy / forest / charcoal |
| Healthcare, education, onboarding, F0/learner | `soft` / `elevated` / `outlined` | Hyperlegible or calm humanist (Atkinson, Source Sans) | Trust > playful |
| SaaS console, admin, ops | `hard` / `outlined` / `flat` | Neutral geometric (Geist, Plus Jakarta) | Density first; modest radius |
| Consumer chat, support widget | `elevated` / `outlined` / `soft` | Friendly but adult (DM Sans, Plus Jakarta) | No sticker UI |
| Landing, marketing, luxury | `elevated` / `glass` / `soft` | Expressive display + quiet body | Density 3; still contrast-gate |
| Creative, gaming, experimental | any kit | Distinct display face | Variance 8; no emoji-as-icon |

**Fonts:** match display/body when trust/clarity is the pitch; split families when type *is* the axis. Mono for code/tickers/tabular figures only.

## Authoring the Options

Invent 3-5 named directions by hand. Each is a complete light + dark token set with identical variable names. Craft bar still applies: contrast, type, surface kit, archetype fit - not three tints of indigo.

**Each option needs an axis** before tokens ("editorial type + soft surfaces", "dense console + hard borders"). No two share an axis. Hue-only variants are one direction - cut one.

**Required token vocabulary** (shadcn names, **hex** - see `shadcn-tokens.md`):

- Colours: `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `border`, `input`, `ring`, plus `sidebar` when the archetype needs it.
- Geometry: `radius`.
- Surface kit (seven vars, one of `flat` / `outlined` / `elevated` / `soft` / `glass` / `hard`): `surface-border-width`, `surface-shadow`, `surface-shadow-raised`, `surface-shadow-inset`, `surface-blur`, `surface-gradient`, `surface-wash`.
- Dark mode is **authored**, not inverted. Lift page surfaces off pure black; text pairs ≥4.5:1.

**Craft bar:**

- **Muted text floor (light):** `--muted-foreground` ≥ ~`#475569` on a light page.
- **Ink floor (light):** `--foreground` near slate-900 (`#0F172A`–`#12151A`).
- **Glass in light:** card/popover opacity roughly ≥80% white alpha; thin `/10` glass fails after compositing.
- **Borders:** quiet WARN is ok; `outlined`/`hard` push border toward ink.
- **Hover vs press:** hover = colour/opacity/border; `scale(0.97)` only on `:active`.
- **Motion** goes in guide section 6 (150–300ms UI; none on high-frequency/keyboard actions).

**Avoid AI-default looks:** purple-on-white / purple-indigo gradients; warm cream + terracotta serif; broadsheet hairline layouts. Kits must fit the product (no `soft` on a trading terminal).

Write one CSS file per option under `docs/design/option-tokens/`:

```css
/* Option A - Signal
   Dense console with hard surfaces for daily operators.
   Fonts: display Geist, body Geist
   Surface: hard -- the --surface-* vars below carry it */

:root {
  --radius: 0.375rem;
  --background: #F4F6F8;
  --foreground: #12151A;
  /* ... full light set including --surface-* ... */
}

.dark {
  --radius: 0.375rem;
  --background: #0B0D10;
  --foreground: #F2F4F7;
  /* ... full dark set including --surface-* ... */
}
```

Then `docs/design/option-tokens/manifest.json`:

```json
{
  "project": "Clinic Portal",
  "concept": "A patient portal where clinic staff and patients both log in",
  "archetype": "dashboard",
  "inspiration": [
    { "label": "Linear", "url": "https://linear.app", "note": "the density" }
  ],
  "options": [
    {
      "file": "A-signal.css",
      "id": "signal",
      "name": "Signal",
      "thesis": "Dense console, hard surfaces, for operators all day.",
      "hue": 220,
      "density": "compact",
      "surface": "hard",
      "fonts": {
        "display": "'Geist', ui-sans-serif, system-ui, sans-serif",
        "body": "'Geist', ui-sans-serif, system-ui, sans-serif",
        "mono": "'JetBrains Mono', ui-monospace, monospace"
      }
    }
  ]
}
```

`density`: `compact` / `comfortable` / `spacious`. `hue`: chart accents when `chart-*` absent. `surfaceNote` optional.

### Step 4 - the contrast gate

```bash
for f in <project-slug>/docs/design/option-tokens/*.css; do node "<skill-dir>/scripts/contrast-check.mjs" "$f" || echo "FAILED: $f"; done
```

**Zero failures before showing the preview.** Hand-fix or replace; never defer. WARN on `border`/`input` may ship; WARN on `ring` may not.

### Step 5 - fill preview and sharpen

```bash
python "<skill-dir>/scripts/fill-preview.py" <project-slug>/docs/design/option-tokens/manifest.json \
  --out <project-slug>/docs/design/ui-options.html
```

On an existing project write to `docs/design/` at the repo root (no slug prefix).

**Axis check:** pickable name (not "Glassmorphism"); one-line thesis; fonts fit locale; radius fits density; kits vary; right archetype; if inspiration was given, one option answers it and one does not. Tab strip of "flat · flat · flat" = rewrite.

After colour/`--surface-*` edits, update option CSS and re-run `fill-preview.py`.

## Rendering the Preview

`fill-preview.py` writes one self-contained `ui-options.html` (no server).

- One option full-size at a time (tabs); `1`-`5` / arrows switch; `d` toggles dark; letter in URL hash. Instant variant swap (no fade on stage).
- Brief + inspiration links sit above the options.
- Preview shows colour, type, **and surface kit** (popover open on purpose).
- **Archetype matches the product:** `dashboard` | `chat` | `landing` | `ecommerce` | `editorial`. Same archetype for every option. **Chatbot trap:** console vocabulary does not mean `dashboard` - use `chat`.
- Both colour modes and focus states are previewable.

**Done when:** every option reachable; dark works; axes distinct; contrast clean; tradeoffs honest. Then the table and **stop**:

| # | Option | Axis | When it's the right choice | Its cost |
|---|---|---|---|---|
| A | Signal | Dense + hard surfaces | Daily-use console | Least memorable, colder |
| B | Editorial Warm | Soft + generous type | Calm brand moment | Eats space |

> "Five directions are in `<project-slug>/docs/design/ui-options.html` - tabs + `d` for dark. Tell me which letter, or which parts to combine. Once you've picked I'll write the design guide."

Never pre-pick a favourite. Hybrids → new option in `ui-options-v2.html`, clean pick, then guide. Offline/system fonts → strip Google Fonts `<link>` from the preview too.

## Writing the Guide

`docs/index.css` = values; `docs/DESIGN.md` = everything values cannot express.

```bash
python "<skill-dir>/scripts/make-guide.py" <project-slug>/docs/design/option-tokens/<LETTER>-<name>.css \
  --css-out <project-slug>/docs/index.css
node "<skill-dir>/scripts/contrast-check.mjs" <project-slug>/docs/index.css
```

Write the guide from `references/guide-template.md`. Judgement-heavy: sections 1, 5, 7, 8. **Section 5 app shell is required** - derive from archetype (+ probe screen list on existing apps); real numbers + ASCII sketch.

- Every rule carries a value (token or number), not an adjective alone.
- No scope table, no implementation step list.
- Section 8: project-specific bans from *this* direction's logic.
- Length ~150-250 lines.

### Reviewer pass

Dispatch a subagent with `reviewer-prompt.md` before the user sees the guide. Fix until clean (max 3), then surface leftovers.

### Gate 2

Say where it is, what it commits to, ask them to read especially §5 and §8. **End the turn.** Revisions edit in place. A comment with a change request is not approval. Direction change → Gate 1 again. No scaffolding in this turn.

## Situations → What To Do

| Situation | Do this |
|---|---|
| Small UI tweak, no guide yet | Match existing components; offer Author later (see *When Author mode is the wrong answer*) |
| Guide exists, "make it nicer" | Comply; ask what feels off; fix *within* the direction |
| Guide exists, whole new look | Confirm replacement; Author; rewrite guide in place |
| Guide exists, app never themed | Comply step 2 first (copy + wire tokens) |
| `THEMED` + "make it better" | Not refresh-vs-replacement - ask again with both named |
| Brand colour chosen in Q2 | Pin `primary` in every option before contrast-check |
| Inspiration site in Q2 | Fetch it; ≥1 option answers it, ≥1 does not |
| "Exactly like site X" | Direction pick with X as one axis, not a blind copy |
| "Just pick something" / skip preview | Fast path: 3 options, pick in one turn, then guide |
| Pick + "go build it" | Write and show the guide first; build is a later Comply task |
| Hue-only or same-kit options | Not a choice - rewrite axes |
| shadcn already installed | Keep token names; replace values; record probe `components.json` fields |
| Offline / privacy | System fonts, no CDN - preview and guide §3 |
| Stack volunteered unprompted | Record in header; do not interview further |
| Muddy dark mode | Authored lightness, not invert; page off pure black |

## Red Flags - STOP

- Scaffolding / `npm install` / writing the app's `index.css` in Author mode
- Re-authoring on `GUIDED`; second guide or `DESIGN-v2.md`
- Guide before a letter pick; preview before a clean contrast gate; hue-only option set
- Asking stack / fonts / radius / density / mood; asking Q2 twice
- Authoring from an unopened inspiration URL, or a brand hex you never received
- Wrong archetype (especially chatbot as dashboard)
- `THEMED` without refresh vs replacement
- Adjective-only guide rules, unfilled `<...>`, full token dump in the guide, comments in `docs/index.css`
- Section 7 in framework class names; changing direction in Comply because it "looks better"
- Ending Author without asking the user to read the guide

**Stop, back up to the checklist, get the missing confirmation.**

## Supporting Files

Read on demand, at the step that needs them - never up front:

| File | For | Step |
|---|---|---|
| `references/guide-template.md` | guide skeleton and section rationale | 7 |
| `framework-recipes.md` | wire tokens into the styling engine | **Comply step 2 only** |
| `shadcn-tokens.md` | token + `--surface-*` reference | 3, 7 |
| `references/quick-reference.md` | web UX rules by category - read the section, not the whole file | guide §5-8, reviews |
| `reviewer-prompt.md` | reviewer subagent prompt | 7 |

Run, don't read:

- `scripts/probe-context.py` · `scripts/fill-preview.py` · `scripts/make-guide.py` · `scripts/contrast-check.mjs` · `scripts/mockup-template.html`
