# Design decisions — VN Stock Analytics (VNAlpha)

The token file is the source of truth for every value. This file records what the
code cannot say: what was chosen, and why.

## The direction

**Option B — "Night Desk."** Cinematic dark: layered surfaces, a soft glow behind
the primary action, 12px corners. The premium, calmer end of the option set —
built for long evening sessions rather than for the open.

Picked from five seeded directions on 2026-07-30. The rejected four are still in
`ui-options.html` with their own token files under `option-tokens/` — open that
file to see what was turned down and why the set looked the way it did.

- **Audience:** active traders and semi-professional investors in Vietnam.
- **Default colour mode:** dark. Light is a full peer, not an afterthought, and
  the choice persists in `localStorage` under `vnsa.theme`.
- **Language:** Vietnamese only. No i18n layer — strings are inline. Adding a
  second language means extracting them first.

## Colour

**No brand colour was supplied.** Each seeded option proposed its own, so picking
the direction *was* picking the colour. Night Desk's teal is therefore a design
output, not a brand constraint — it can be revisited without breaking a promise
to anyone.

`--primary` is teal; the accent is a colder professional blue. Dark-mode primary
is lightened off the light-mode value for legibility, hue unchanged.

### The price-board scale is not the brand scale

This is the load-bearing decision in the whole theme, and the easiest to undo by
accident.

The HOSE/HNX/UPCOM board is a **five**-colour code, not two:

| Token | Meaning |
|---|---|
| `--px-ceil` | **trần** — the day's ceiling price (tím) |
| `--px-up` | **tăng** — up on the day (xanh) |
| `--px-ref` | **TC** — at the reference / previous close (vàng) |
| `--px-down` | **giảm** — down on the day (đỏ) |
| `--px-floor` | **sàn** — the day's floor price (xanh lơ) |

Ceiling and floor **outrank** plain up/down: a stock at its ceiling is purple, never
green. That precedence lives in `pxState()` in `src/lib/format.ts`, and the mock
data is seeded so all five states actually appear on the board.

Night Desk's teal sits near sàn cyan — this was flagged as the option's cost at the
point of choosing it. It is resolved by **role separation, not by hue**:

> `--primary` may never appear inside a price cell, and the five `--px-*` colours
> may never be used as decoration. They never occupy the same visual slot, so the
> teal brand cannot be misread as a price meaning.

Keep that rule and the two scales stay legible together. Break it and the board
becomes ambiguous, which on a trading product is a correctness bug, not a style one.

All five `--px-*` values clear 4.5:1 against both `--background` and `--card` in
both modes — they are text colours, so that threshold is the binding one.

Colour is never the only carrier of meaning: price cells ship a `+`/`−` sign and an
`sr-only` Vietnamese label (`PX_LABEL`) alongside the colour.

## Type

**Fira Sans** for everything, **Fira Code** for numerals only.

The seeder originally ranked Fira Code as the *heading* font. It has **no Vietnamese
subset** — headings would have fallen back mid-word on `ệ ữ ọ`. It is mono-only here
because tickers and digits are ASCII, so Vietnamese text never lands in it. Any future
font swap must be checked for a Vietnamese subset before anything else; that
constraint outranks how the pairing looks.

Prices use `.num` (tabular figures) so digits stay in column down a table row.

## Shape and motion

Radius is **0.75rem**, not the 1rem the seeder's ladder produced — 16px corners read
as too soft for a trading product. Motion dial resolved to **5**, implemented as the
database's "Subtle" tier presets (scroll reveal, 30ms stagger) in CSS +
IntersectionObserver rather than GSAP: two subtle effects don't justify a ~70KB
animation dependency. `prefers-reduced-motion` is honoured globally and per-component.

## Stack

Scaffolded 2026-07-30 with:

```bash
npm create vite@latest vn-stock-analytics-app -- --template react-ts --no-interactive
npm install tailwindcss @tailwindcss/vite
```

Installed majors — React **19.2**, Vite **8.1**, Tailwind **4.3**, TypeScript **6.0**.

Tailwind **v4**, so the theme is CSS-first: tokens live in `src/index.css` under
`@theme inline`, and there is no `tailwind.config.js`. A v3 recipe will not apply here.

**No component library** was chosen deliberately, so `src/components/ui/` is
hand-built — including the ARIA and keyboard behaviour a library would have supplied
(`Tabs` implements arrow/Home/End; the composer implements Enter-to-send with
Shift+Enter for a newline).

Two things are hand-rolled that a growing app will outgrow, both flagged rather than
hidden:

- **Routing** — `src/lib/router.ts` is a ~40-line hash router. Three pages didn't
  justify a dependency. Swap for react-router when real nested routes appear.
- **Icons** — `src/components/icons.tsx` inlines Lucide geometry at a single stroke
  width. Swap for `lucide-react` if the icon count grows past a couple of dozen.

There is **no backend**. All figures come from a deterministic mock in
`src/lib/mock.ts`, so every reload renders identically, and the AI reply is canned —
the chat screen says so on its face rather than implying a live model.

## What was built

| Area | Files |
|---|---|
| Tokens, base layer, utilities | `src/index.css` |
| Primitives | `src/components/ui/` — `Button`, `Card`, `Badge`/`Eyebrow`, `Field`, `Tabs` |
| Shell | `Navbar`, `Footer`, `Logo`, `ThemeToggle`, `TickerTape`, `PriceCell`, `Reveal`, `icons` |
| Pages | `src/pages/` — `Landing`, `Auth`, `Chat` |
| Logic | `src/lib/` — `format` (vi-VN + board precedence), `mock`, `router`, `theme`, `cn` |

## Usage rules

1. **No hardcoded colours in components.** Every colour, radius and font goes through
   a token. A `#hex` or `rgb()` in a component ignores the mode toggle and drifts —
   `grep -rE "#[0-9A-Fa-f]{3,8}|rgb\(|hsl\(" src/components src/pages` must stay empty.
2. **`--primary` never in a price cell; `--px-*` never as decoration.** See above.
3. **Never name a font family in a component.** Use `font-sans` / `font-mono`, or
   `.num` for figures.
4. **Both modes, every component**, before moving to the next one.
5. **Never remove a focus indicator.** If an element drops its own outline, its
   wrapper must carry the ring — as the chat composer does.
6. Re-run the gate after touching the token file:
   `node <skill>/scripts/contrast-check.mjs src/index.css` — currently **0 failing**,
   4 advisory (border/input, which is the intended quiet-divider convention).

## Prior art

`test/vn-stock-ui/` is an earlier standalone HTML prototype of the same product. It
is **not** an ancestor of this app — this run deliberately re-seeded from scratch
rather than inheriting it. It remains useful as a reference for screens not built
here (dashboard, ticker detail, portfolio, settings), and its price-board colour
research is the origin of the `--px-*` scale.
