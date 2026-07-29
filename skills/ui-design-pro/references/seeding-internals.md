# What `seed-options.py` actually does

Read this when a seed looks wrong and you need to know whether the script or the query
produced it — not on every run. The command itself, the `--brand` rule, and the
contrast gate are in SKILL.md → Seeding the Options.

## Building the option set

- Pulls ranked palettes, styles, and font pairings for the query, then **extends each
  pool with the rest of the CSV**. A narrow query legitimately matches one hue family,
  and three near-identical options are not a choice. Anything drawn from beyond the
  ranked matches is reported — read those lines and confirm the direction still suits
  the brief.
- Anchors the set: one **safe** (the database's own top match), one **bolder** (highest
  complexity), one **structurally different** (opposite corner family from safe, serif-
  or mono-led type). Remaining slots are filled by `--variance`.
- Enforces distinctness on three axes at once — no repeated style, no repeated font
  pairing, and ≥40° OKLCH hue separation between primaries. One axis alone still ships
  the same design twice.
- **With `--brand`,** `primary` and `ring` are the user's colour in *every* option, so
  the hue axis is spent. Distinctness moves to the surface strategy (pure white /
  off-white / warm paper / tinted / dark, one each), the type, the shape, and the
  **accent strategy** — tonal, analogous, complementary, counter-analogous, triadic.
  Each option names which relationship it uses; that is a real design decision, and it
  is what the user is choosing between.
- Caps **dark-first pages at one** per set. Every option already carries a derived dark
  mode, so a second dark page buys nothing and costs a light option someone might have
  wanted. Put "dark" in the query to lift the cap.

## Colour maths

- Maps `colors.csv` onto shadcn token names. Colour maths runs in OKLCH; **values are
  written as hex** — `--format oklch` if a Tailwind v4 project prefers that form.
- **Derives the dark set.** `colors.csv` has no dark values — 0 of 192 rows — so every
  dark theme is computed: background lifted to 0.145–0.215 lightness depending on the
  style's own character (never pure black), cards raised above it, primary lightened
  with chroma eased back, hues carried over from light. A pinned brand colour is **not**
  re-lightened wholesale — it moves only if it fails 3:1 against the dark page, and the
  move is reported.
- Nudges foreground lightness until every WCAG text pair clears 4.5:1 in **both** modes,
  and reports each adjustment. An option that cannot be fixed is dropped, not shipped
  failing. On a pinned brand fill the *text* adapts, never the brand.
- Derives `chart-1..5` from each option's own primary, so data viz belongs to the theme
  instead of arriving as a stock rainbow.
- Leaves `border` and `input` alone at their palette values. Those are advisory at 3:1
  — a quiet divider is a legitimate choice. `ring` is pushed up, because an invisible
  focus ring is an accessibility failure, not a style.

## Why the radius often needs a human

Only 6 of 84 style rows declare a radius, so most are inferred from the style's
keywords or stepped off a ladder. The script says which, per option. A data-dense
console with 1rem corners is wrong even if the ladder produced it.
