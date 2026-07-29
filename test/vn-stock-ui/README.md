# VNAlpha — UI prototype

A clickable front-end prototype for a Vietnamese stock-market analysis web app.
Seven screens, HTML + Tailwind, Vietnamese by default with an English toggle.

There is no backend. All numbers come from a deterministic mock dataset in
`assets/app.js`, so every reload renders identically.

## Run

Open `index.html` in a browser. No build step.

Tailwind is loaded from `cdn.tailwindcss.com` and the fonts from Google Fonts,
so the first load needs a network connection. Everything else is local.

## Screens

| File | Screen |
|---|---|
| `index.html` | Landing — hero, live index strip, ticker tape, features, AI section, sector heatmap, pricing in VND, testimonials, FAQ, footer with the required investment disclaimer |
| `login.html` | Login / Register — tabbed, Google + Zalo sign-in, password strength meter, OTP note. `login.html#register` opens the sign-up tab |
| `dashboard.html` | Market overview — index cards, VN-Index intraday chart, market breadth, sector heatmap, top movers, foreign flows, the full price board, news, AI session summary |
| `stock.html` | Ticker detail — candlestick chart, order book, key stats, peers, financials, valuation, foreign ownership, news, company profile. Accepts `?sym=FPT` |
| `portfolio.html` | Portfolio / Watchlist / Alerts. Deep links: `#watchlist`, `#alerts` |
| `chat.html` | AI assistant — conversation history, rich message blocks (ticker cards, comparison tables, citations), composer with `@` mention |
| `settings.html` | Profile, Appearance, Notifications, Price board, Trading, Security, Billing. Deep links: `#appear`, `#billing`, … |

## Design system

Tokens live in `assets/theme.css` and are mapped to Tailwind utilities in
`assets/tw-config.js`, so you write `bg-surface`, `text-muted`, `text-up`
rather than raw `var()` calls.

**Type** — Be Vietnam Pro for UI (designed for Vietnamese diacritics, so `ệ ữ ọ`
sit correctly at small sizes) and JetBrains Mono with tabular figures for every
price, so digits stay in column across a table row.

**Colour** — dark by default, since this is a screen people stare at for hours;
light mode is a full peer, not an afterthought. Both are wired to the OS
preference on first visit and then remembered.

### The price-board colour code

This is the part that makes the app read as Vietnamese rather than as a generic
trading dashboard. The HOSE/HNX/UPCOM board uses five colours, not two:

| Colour | Meaning |
|---|---|
| Purple | **Trần** — the day's ceiling price |
| Green | **Tăng** — up on the day |
| Yellow | **TC** — at the reference (previous close) |
| Red | **Giảm** — down on the day |
| Cyan | **Sàn** — the day's floor price |

Ceiling and floor outrank plain up/down, exactly as on the official board.
`pxClass()` in `app.js` implements that precedence, and the mock data is seeded
so all five states actually appear on the dashboard board.

Settings → Appearance has a working toggle for the East Asian convention
(red up, green down) for investors who prefer it — it swaps the design tokens,
so every chart, table and badge follows.

## Vietnam-specific behaviour baked in

- **Daily price limits** — ±7% HOSE, ±10% HNX, ±15% UPCOM. Ceiling and floor are
  computed, not hardcoded.
- **Tick sizes** — HOSE is tiered (10đ under 10,000đ; 50đ to 49,950đ; 100đ from
  50,000đ), HNX and UPCOM are flat 100đ. Ceilings round down to a valid tick,
  floors round up. Verified against real board values for HPG, VCB, SHB, FPT.
- **Prices in thousand VND** (`27,50` = 27,500đ), the convention every VN board uses.
- **Number formatting** follows the locale — `1.284,56` in Vietnamese,
  `1,284.56` in English — and re-renders on language switch.
- **Trading sessions** — the topbar shows ATO / continuous / lunch break / ATC.
- **Foreign flows** — net buy/sell by ticker and sector, plus remaining foreign
  room against the 49% cap, which VN investors watch closely.
- **T+ settlement status** on portfolio holdings.
- **Zalo** as a first-class sign-in and alert channel alongside email and push.

## Code layout

```
assets/
  tw-config.js   Tailwind theme — colours resolve to CSS custom properties
  theme.css      design tokens + component classes (plain CSS: the Tailwind
                 CDN cannot process @apply in a linked file)
  i18n.js        VI/EN dictionary (471 keys each) + the apply function
  app.js         theme & language, VN number/price rules, mock market data,
                 hand-rolled charts, shared renderers, shell behaviour
```

Charts are hand-written canvas and SVG — candlestick with volume and MA20,
intraday area, grouped columns, sparklines, donut, and a squarified treemap for
the heatmap. No charting library, and they redraw on theme change, resize and
tab reveal.

### Translating

Markup carries the key, not the text:

```html
<span data-i18n="dash.title">Tổng quan thị trường</span>
<input data-i18n-ph="app.search.ph">
<button data-i18n-label="chat.send">
```

`data-i18n-html`, `-ph`, `-label` and `-title` cover innerHTML, placeholder,
aria-label and title. JS-rendered content calls `window.t('key')` and re-runs
through `VN.onRender()` on `langchange`.

The dictionary carries a few keys the current screens don't use yet
(`chat.greet`, `app.session.closed`, `x.viewall` and similar) — they cover
states the prototype doesn't show, like the empty chat screen.

## Verification run

- Vietnamese ceiling/floor math checked against known board values for HOSE,
  HNX and UPCOM tick tiers — all match.
- Every one of the 42 quotes sits inside its own price band, with high/low and
  all bid/ask levels bounded correctly.
- Treemap covers 100% of its box with no overlap or overflow.
- 471 i18n keys, identical key sets in both languages, no unknown key referenced
  from any page.
- No broken internal links, no `getElementById` without a matching element.
- Every form field has a label, `aria-label` or `aria-labelledby`.
- No emoji used as icons — all icons are inline Lucide-geometry SVG at a 24×24
  viewBox. The Google mark uses its official four-colour paths.

Checked by hand rather than by script: hover states use colour transitions only,
so nothing shifts layout; every clickable element gets `cursor-pointer`;
`prefers-reduced-motion` disables animation, the marquee and the price flash;
light-mode text is slate-900/slate-600 and glass surfaces sit at 85% opacity so
they stay legible; wide tables scroll inside their own container so the page
body never scrolls sideways. Layout was built against 320 / 768 / 1024 / 1440.

**Not verified in a browser** — no browser was available in this environment, so
the checks above are static and arithmetic. Please open the pages and click
through before treating the visuals as final.

## Not built

Screener, news index, and order entry are stubbed as links. The chat composer
appends a canned reply after a short delay to show the streaming state; there is
no model behind it.
