# Option authoring — templates & craft bar

Read at Author checklist steps 3–5 (author options, contrast gate, fill preview). For the full token vocabulary and form rules, also open `shadcn-tokens.md`.

## Required token vocabulary (hex)

shadcn names, **hex** values:

- Colours: `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `border`, `input`, `ring`, plus `sidebar` when the archetype needs it.
- Geometry: `radius`.
- Surface kit (seven vars, one of `flat` / `outlined` / `elevated` / `soft` / `glass` / `hard`): `surface-border-width`, `surface-shadow`, `surface-shadow-raised`, `surface-shadow-inset`, `surface-blur`, `surface-gradient`, `surface-wash`.
- Dark mode is **authored**, not inverted. Lift page surfaces off pure black; text pairs ≥4.5:1.

## Craft bar

- **Muted text floor (light):** `--muted-foreground` ≥ ~`#475569` on a light page.
- **Ink floor (light):** `--foreground` near slate-900 (`#0F172A`–`#12151A`).
- **Glass in light:** card/popover opacity roughly ≥80% white alpha; thin `/10` glass fails after compositing.
- **Borders:** quiet WARN is ok; `outlined`/`hard` push border toward ink.
- **Hover vs press:** hover = colour/opacity/border; `scale(0.97)` only on `:active`.
- **Motion** goes in guide section 6 (150–300ms UI; none on high-frequency/keyboard actions).

**Avoid AI-default looks:** purple-on-white / purple-indigo gradients; warm cream + terracotta serif; broadsheet hairline layouts. Kits must fit the product (no `soft` on a trading terminal).

## Option CSS shape

Write one file per option under `docs/design/option-tokens/`:

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

## manifest.json shape

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

## Contrast gate

```bash
for f in <project-slug>/docs/design/option-tokens/*.css; do node "<skill-dir>/scripts/contrast-check.mjs" "$f" || echo "FAILED: $f"; done
```

**Zero failures before showing the preview.** Hand-fix or replace; never defer. WARN on `border`/`input` may ship; WARN on `ring` may not.

## Fill preview

```bash
python "<skill-dir>/scripts/fill-preview.py" <project-slug>/docs/design/option-tokens/manifest.json \
  --out <project-slug>/docs/design/ui-options.html
```

On an existing project write to `docs/design/` at the repo root (no slug prefix).

**Axis check:** pickable name (not "Glassmorphism"); one-line thesis; fonts fit locale; radius fits density; kits vary; right archetype; if inspiration was given, one option answers it and one does not. Tab strip of "flat · flat · flat" = rewrite.

After colour/`--surface-*` edits, update option CSS and re-run `fill-preview.py`.

## Preview UX

`fill-preview.py` writes one self-contained `ui-options.html` (no server).

- One option full-size at a time (tabs); `1`-`5` / arrows switch; `d` toggles dark; letter in URL hash. Instant variant swap (no fade on stage).
- Brief + inspiration links sit above the options.
- Preview shows colour, type, **and surface kit** (popover open on purpose).
- **Archetype matches the product:** `dashboard` | `chat` | `landing` | `ecommerce` | `editorial`. Same archetype for every option.
- Both colour modes and focus states are previewable.

**Done when:** every option reachable; dark works; axes distinct; contrast clean; tradeoffs honest. Then present the tradeoff table and **stop**.

Never pre-pick a favourite. Hybrids → new option in `ui-options-v2.html`, clean pick, then guide. Offline/system fonts → strip Google Fonts `<link>` from the preview too.
