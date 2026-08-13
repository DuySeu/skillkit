# Guide Reviewer Prompt Template

Use this when dispatching the reviewer subagent at step 10, **before** the user sees the guide.

**Purpose:** Verify `docs/DESIGN.md` is complete, internally consistent, and actionable by an assistant that was not in the conversation where the direction was chosen.

**Why it is worth a turn:** every defect this catches is silent. An adjective with no value attached breaks nothing today - it just gets resolved differently by every session that reads the file, which is the exact drift the guide exists to prevent. A wrong rule here is not one wrong line of code; it is one wrong line of code repeated for the life of the project.

**Dispatch after:** `make-guide.py` has written `docs/index.css`, the contrast gate passed on it, and the guide has been written from the template.

```
Task tool (general-purpose):
  description: "Review the project design guide"
  prompt: |
    You are reviewing a design contract, not code. This file will be read by
    assistants who were not present when the design direction was chosen and who
    cannot ask follow-up questions. Your job is to find every place where such a
    reader would have to guess.

    **Guide:** [PATH_TO_docs/DESIGN.md]
    **Token file:** [PATH_TO_docs/index.css]
    **Winning option CSS:** [PATH_TO_option-tokens/<LETTER>-<name>.css]
    **Chosen direction:** [OPTION_NAME] - [ONE_LINE_THESIS]
    **Surface kit:** [flat|outlined|elevated|soft|glass|hard]
    **Detected stack (context only, may be "not chosen yet"):** [FROM_PROBE_OR_NONE]
    **Brand colour:** [HEX_OR_"none - the direction proposed its own"]
    **Contrast gate output:** [PASTE_OUTPUT]

    Read all three files. Verify every claim against what is written - do not
    assume a section is fine because its heading is present.

    ## Blocking defects

    | Category | What to look for |
    |---|---|
    | Unfilled placeholders | Any `<...>` left from the template. A placeholder reaching the user is a defect, no exceptions |
    | Unactionable rules | A rule whose only content is an adjective - "generous spacing", "clean type", "subtle shadows", "premium feel". Every rule must name a token, a number, or a concrete treatment. This is the most common and most damaging defect |
    | Token disagreement | Any hex in the guide's section 2 summary that differs from the same variable in `docs/index.css`. The summary is a view of that file, so a mismatch means one of them is wrong and the reader cannot tell which |
    | Token file comments | Any `/* ... */` in `docs/index.css`. Expect zero hits. Includes a ported `/* Option X ... */` header |
    | Missing dark values | A variable present in `:root` and absent from `.dark`, or vice versa. Also flag a guide that describes only one colour mode |
    | Framework syntax in section 7 | Section 7 must be token-and-state rows (`--primary` fill, height 44px, focus 2px `--ring`), never a framework's class names or API. Flag any `bg-*`/`text-*` utility, `className`, `sx=`, `@apply`, `styled.`, or a named component library. The guide outlives the project's current styling engine; `framework-recipes.md` translates at build time |
    | Contradictions between sections | Section 1 commits to density and section 5 gives airy numbers; section 4 names `glass` and section 7 gives opaque card fills; the header names a stack the recipes ignore. Any two sections that cannot both be followed |
    | Full token dump | Section 2 reproducing all ~35 variables instead of summarizing and pointing at `docs/index.css`. Two copies of the same values means one will drift |
    | Build-specific content | A component/page **scope table**, an implementation **step list**, or a task checklist. Those describe one build and are stale within a sprint; their presence makes the whole file read as a plan that has expired |
    | Focus states missing | Section 7 without a visible focus rule using `--ring` on interactive elements |
    | Contrast | Any text pair below 4.5:1 in either mode, or `ring` below 3:1 against its surface. `border`/`input` below 3:1 is ADVISORY - a quiet divider is the convention, not a defect |
    | Brand infidelity | If a brand colour was supplied, light-mode `--primary` must be exactly that hex. Dark mode may lighten it; the hue must not move |

    ## Quality findings (report, do not block on alone)

    | Category | What to look for |
    |---|---|
    | Direction not extensible | Section 1 without an axis, without stated commitments, or without what was given up. A reader who only has hexes cannot extend the direction to a component nobody anticipated - that is the section's whole job |
| App shell missing or generic | Section 5 without the shell: no region sizes, no statement of where a new component goes by default, no statement of what a new screen must reuse. A guide that describes colour and spacing but not the skeleton lets the next assistant give its component its own sidebar or its own max width, which is the drift this file exists to stop. Also flag a shell that contradicts the archetype the options were rendered as |
    | Generic anti-patterns | Section 8 containing only universal advice ("don't use pure black") and nothing specific to THIS direction. It should carry the bans that follow from this option's own logic |
    | Length | Under ~150 lines means the reader will have to guess; well over ~250 means section 8 gets skimmed, and section 8 has the most leverage |
    | Density not numeric | Section 5 describing density as a word rather than as row heights, paddings and field heights |
    | Font token mapping | Section 3 naming families without mapping each to `--font-sans` / `--font-serif` / `--font-mono`. A loaded font with no token mapping is the most common way a theme silently does nothing |
    | Surface kit not operationalized | Section 4 naming a kit without saying what a container is therefore made of, or without the kit-specific rule that a variable cannot express (glass needs `backdrop-filter` and a translucent `--card` readable in light ≈≥80% opacity; soft needs borderless surfaces; hard needs the border on controls too) |
    | Motion / hover vague | Section 6 missing duration budgets, or prescribing hover `scale` that would shift layout instead of colour/opacity/border (press `:active` scale is fine) |
    | Emoji-as-icon allowed | Section 7 or 8 silent on icons — must name one SVG library and ban emoji icons |
    | Relitigating the choice | The rejected options described or argued about in the guide. They belong in `docs/design/ui-options.html`; naming them here invites reopening a settled decision |
    | Verification not runnable | Section 9 without a concrete contrast command and the project's actual build command |
    | Missing preserved conventions | On a project that already had screens: section 5 silent about the layout conventions that were kept |

    ## CRITICAL - check these explicitly

    - grep the guide for `<` followed by `...` or a capitalized placeholder word
    - grep `docs/index.css` for `/*` - expect zero
    - diff every hex in the guide's section 2 table against `docs/index.css`
    - confirm every `--surface-*` variable named in section 4 exists in both blocks of `docs/index.css`
- confirm every `--space-*` or spacing token named in section 5 actually exists in `docs/index.css`; a rule citing a token that was never defined emits nothing and fails silently
- read section 5 and ask: could a reader build a new screen from it without inventing a layout? If not, the shell is incomplete
    - confirm section 7 contains no framework class names, and that the header claims a stack only if a `package.json` was actually read
    - read section 8 and ask: could a reader who read ONLY this section still ruin the direction? If yes, it is incomplete

    ## Output Format

    ## Design Guide Review

    **Status:** ✅ Approved | ❌ Issues Found

    **Blocking (if any):**
    - [section / line]: [the defect] - [what a reader would do wrong because of it]

    For unactionable-rule findings, use a table (required when any exist):

    | Section | As written | Should be | Why |
    | --- | --- | --- | --- |
    | 5 Layout | "generous section spacing" | "`--space-6` between sections" | An adjective is resolved by the reader's own taste |

    **Quality findings (advisory):**
    - [suggestions that don't block]
```

**Reviewer returns:** Status, Blocking issues, Quality findings. Unactionable-rule findings must include the Section / As written / Should be / Why table.

Fix and re-dispatch until clean, max 3 rounds - then surface what is left to the user at Gate 2 rather than looping further. A reviewer that keeps finding the same class of defect after two rounds is telling you the guide needs rewriting from the template, not patching.
