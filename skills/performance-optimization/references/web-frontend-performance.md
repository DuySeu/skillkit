# Web / Frontend Performance Checklist

Load when UI/web assets exist. Focus on **code patterns**, not lab Lighthouse scores.

## Bundle and imports

- [ ] Whole-library imports where tree-shakeable named imports exist
- [ ] Missing route-level code split / lazy load for large screens
- [ ] Huge static assets shipped on first paint

## Render cost

- [ ] Hot interactive trees re-rendering on unrelated state
- [ ] Large lists rendered without windowing/virtualization
- [ ] Layout thrash patterns (read/write DOM in tight loops) visible in code

## Assets and loading

- [ ] Images without lazy-load / oversized sources
- [ ] Blocking scripts/styles on critical path
- [ ] Fonts or third-party tags that stall first interaction

## Client data fetching

- [ ] Refetch storms (effect without stable deps, poll without backoff)
- [ ] Search/input handlers without debounce/throttle where fan-out is high
- [ ] Duplicate identical fetches with no shared cache

## CWV-relevant patterns (static)

- [ ] Layout injection that shifts content after paint (CLS-prone)
- [ ] Sync heavy work on the main thread (long tasks) during interaction

## Finding guidance

- Track: `web`
- Prefer Medium/Critical when the pattern is on a primary user journey
- Point Path Capacity at the route/component symbol (e.g. `OrdersPage`)

## Example finding shape

**Issue:** Importing entire `lodash` on the landing route.  
**Why:** Inflates JS parse/eval on first load.  
**Suggestion:** Named imports or per-function packages; lazy-load non-critical UI.
