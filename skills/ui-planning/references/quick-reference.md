# Quick Reference — Web UX Rules

Load a **section** when writing or reviewing the guide (§5–8), not the whole file up front. Web-only: native iOS/Android affordances are omitted.

## 1. Accessibility (CRITICAL)

- `color-contrast` - Normal text ≥4.5:1; large text ≥3:1
- `focus-states` - Visible focus rings on interactive elements (2–4px `--ring`)
- `alt-text` - Descriptive alt for meaningful images
- `aria-labels` - `aria-label` for icon-only buttons
- `keyboard-nav` - Tab order matches visual order; full keyboard support
- `form-labels` - Use `<label for>`
- `skip-links` - Skip to main content
- `heading-hierarchy` - Sequential h1→h6, no level skip
- `color-not-only` - Don't convey info by colour alone (add icon/text)
- `text-resize` - Prefer `rem`; avoid truncation as text scales
- `reduced-motion` - Honour `prefers-reduced-motion`; keep short opacity/colour fades that aid comprehension
- `screen-reader` - Logical reading order; meaningful names/hints via ARIA
- `escape-routes` - Cancel/back in modals and multi-step flows
- `keyboard-shortcuts` - Preserve browser/a11y shortcuts; offer keyboard alternatives for drag-and-drop

## 2. Touch & Interaction (CRITICAL)

- `touch-target-size` - Min ~44×44px hit area; extend beyond visual bounds if needed
- `touch-spacing` - ≥8px gap between targets
- `hover-vs-tap` - Don't rely on hover alone for primary actions
- `loading-buttons` - Disable during async; show progress
- `error-feedback` - Clear errors near the problem
- `cursor-pointer` - Pointer cursor on clickable elements
- `gesture-conflicts` - Prefer vertical scroll; avoid trapping horizontal swipe on main content
- `tap-delay` - `touch-action: manipulation` where appropriate
- `press-feedback` - Colour/opacity/shadow/border and/or `:active` scale ~0.97 on the control only (no sibling reflow)
- `gesture-alternative` - Visible controls for critical actions; don't rely on gesture-only
- `edge-targets` - Keep primary targets clear of browser chrome / home-indicator insets (`env(safe-area-inset-*)`)
- `no-precision-required` - Avoid pixel-perfect taps on tiny icons
- `drag-threshold` - Movement threshold before drag starts

## 3. Performance (HIGH)

- `image-optimization` - WebP/AVIF, `srcset`/`sizes`, lazy-load non-critical
- `image-dimension` - width/height or `aspect-ratio` to prevent CLS
- `font-loading` - `font-display: swap`/`optional`; reserve space
- `font-preload` - Preload only critical faces
- `lazy-loading` - Route/feature split non-hero UI
- `third-party-scripts` - async/defer; audit unused
- `content-jumping` - Reserve space for async content
- `virtualize-lists` - Lists with 50+ items
- `progressive-loading` - Skeleton/shimmer for >1s waits
- `debounce-throttle` - High-frequency scroll/resize/input
- `offline-support` - Offline messaging when relevant (PWA)

## 4. Style Selection (HIGH)

- `style-match` - Match product via SKILL.md *Industry craft* + dials; invent options by hand
- `consistency` - Same style across pages
- `no-emoji-icons` - SVG icons (Heroicons/Lucide), never emoji
- `color-palette-from-product` - Industry by hand; pin brand hex when given
- `effects-match-style` - Shadows/blur/radius follow the surface kit
- `glass-light-opacity` - Glass cards in light ≈≥80% white alpha
- `hover-no-layout-shift` - Hover = colour/opacity/border; scale only on `:active`
- `state-clarity` - Hover/pressed/disabled visually distinct
- `elevation-consistent` - One shadow scale for cards/sheets/modals
- `dark-mode-pairing` - Author light and dark together
- `icon-style-consistent` - One icon set (stroke/corner)
- `blur-purpose` - Blur for dismissal (modals), not decoration
- `primary-action` - One primary CTA per screen

## 5. Layout & Responsive (HIGH)

- `viewport-meta` - `width=device-width, initial-scale=1` (never disable zoom)
- `mobile-first` - Design mobile-first
- `breakpoint-consistency` - Systematic breakpoints (e.g. 375 / 768 / 1024 / 1440)
- `readable-font-size` - ≥16px body on mobile
- `line-length-control` - ~35–60 chars mobile; ~60–75 desktop
- `horizontal-scroll` - No horizontal scroll on mobile
- `spacing-scale` - 4/8px spacing system
- `container-width` - Consistent max-width on desktop
- `z-index-management` - Layered scale (e.g. 0 / 10 / 20 / 40 / 100 / 1000)
- `fixed-element-offset` - Fixed nav reserves space for content below
- `viewport-units` - Prefer `min-h-dvh` over `100vh` on mobile
- `content-priority` - Core content first on small screens
- `visual-hierarchy` - Size, spacing, contrast — not colour alone

## 6. Typography & Color (MEDIUM)

- `line-height` - 1.5–1.75 body
- `line-length` - ~65–75 characters
- `font-pairing` - Heading/body personalities match the axis
- `font-scale` - Consistent scale (e.g. 12 14 16 18 24 32)
- `contrast-readability` - Near slate-900 on light pages; muted ≥ ~`#475569`
- `weight-hierarchy` - Bold headings, regular body, medium labels
- `color-semantic` - Tokens in components, not raw hex
- `color-dark-mode` - Derived tones, not inverted; contrast-check both modes
- `color-accessible-pairs` - Text pairs ≥4.5:1
- `color-not-decorative-only` - Error/success need icon or text too
- `truncation-strategy` - Prefer wrap; ellipsis + full text via tooltip/expand
- `number-tabular` - Tabular figures for data columns/prices/timers
- `whitespace-balance` - Group related items; avoid clutter

## 7. Animation (MEDIUM)

- `duration-timing` - Press 100–160ms; micro 150–300ms; modals/drawers ≤300ms; avoid >500ms UI; none on keyboard/high-frequency actions
- `transform-performance` - Animate `transform`/`opacity` only
- `loading-states` - Skeleton/progress when wait >300ms
- `excessive-motion` - 1–2 key motions per view
- `easing` - Ease-out on enter/feedback; never ease-in on UI; exit ~60–70% of enter
- `motion-meaning` - Cause-effect, not decoration
- `state-transition` - Smooth state changes
- `exit-faster-than-enter` - Shorter exits
- `scale-feedback` - `:active` ~0.97 on the control only
- `modal-motion` - Modals centered; popovers scale from trigger
- `no-high-frequency-motion` - No animation on shortcuts/command palette/list nav
- `layout-shift-avoid` - No CLS from animation
- `reduced-motion` - Honour `prefers-reduced-motion` (see §1)

## 8. Forms & Feedback (MEDIUM)

- `input-labels` - Visible label (not placeholder-only)
- `error-placement` - Error below the field
- `submit-feedback` - Loading then success/error
- `required-indicators` - Mark required fields
- `empty-states` - Helpful message + action
- `toast-dismiss` - Auto-dismiss 3–5s; `aria-live="polite"`; don't steal focus
- `confirmation-dialogs` - Confirm destructive actions
- `input-helper-text` - Persistent helper under complex inputs
- `disabled-states` - Reduced opacity + cursor + disabled attribute
- `inline-validation` - Validate on blur
- `input-type-keyboard` - Semantic `type` / `inputmode`
- `password-toggle` - Show/hide control
- `autofill-support` - Correct `autocomplete`
- `undo-support` - Undo for destructive/bulk where feasible
- `error-recovery` - Cause + how to fix
- `multi-step-progress` - Step indicator; allow back
- `focus-management` - Focus first invalid field after submit error
- `error-summary` - Multi-error summary with anchors
- `touch-friendly-input` - Input height ≥44px on mobile
- `destructive-emphasis` - Danger colour, separated from primary
- `aria-live-errors` - `aria-live` or `role="alert"` for errors
- `timeout-feedback` - Timeout + retry

## 9. Navigation Patterns (HIGH)

- `drawer-usage` - Drawer/sidebar for secondary nav
- `back-behavior` - Predictable back; preserve scroll/state
- `deep-linking` - Key screens reachable by URL
- `nav-label-icon` - Icon + text on nav items
- `nav-state-active` - Current location highlighted
- `nav-hierarchy` - Primary vs secondary clearly separated
- `modal-escape` - Clear dismiss; Escape works
- `search-accessible` - Easy to reach; recent/suggested when useful
- `breadcrumb-web` - Breadcrumbs for 3+ level depth
- `adaptive-navigation` - ≥1024px prefer sidebar; small screens top/bottom nav
- `navigation-consistency` - Placement stable across pages
- `avoid-mixed-patterns` - Don't mix tab + sidebar + bottom nav at the same level
- `modal-vs-navigation` - Don't use modals for primary nav flows
- `focus-on-route-change` - Move focus to main content after navigation
- `persistent-nav` - Core nav reachable from deep pages
- `destructive-nav-separation` - Logout/delete separated from normal items
- `empty-nav-state` - Explain unavailable destinations

## 10. Charts & Data (LOW)

- `chart-type` - Trend→line, comparison→bar, proportion→pie/donut
- `color-guidance` - Accessible palette; don't rely on red/green alone
- `data-table` - Table alternative for a11y
- `pattern-texture` - Patterns/shapes beyond colour
- `legend-visible` - Near the chart
- `tooltip-on-interact` - Hover/tap values; keyboard-reachable
- `axis-labels` - Units + readable scale
- `responsive-chart` - Simplify on small screens
- `empty-data-state` / `error-state-chart` - Guidance or retry, not a blank frame
- `loading-chart` - Skeleton while loading
- `animation-optional` - Honour reduced-motion; data readable immediately
- `no-pie-overuse` - Avoid pie for >5 categories
- `contrast-data` - Marks ≥3:1 vs background; labels ≥4.5:1
- `sortable-table` - Sorting with `aria-sort`
- `screen-reader-summary` - Text summary / aria-label of key insight
- `number-formatting` - Locale-aware numbers/dates/currencies
