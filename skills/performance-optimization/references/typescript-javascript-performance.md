# TypeScript / JavaScript Performance Checklist

Load when TS/JS is in scope. For pure UI/CWV patterns, also load `web-frontend-performance.md` and avoid duplicating that full list here.

## Event loop / Node

- [ ] Sync CPU or huge `JSON.parse`/`stringify` on the request path
- [ ] Sync `fs` in handlers
- [ ] Unbounded `Promise.all` over user-controlled lists (no concurrency limit)
- [ ] Missing backpressure on streams / queue consumers

## React / UI (hot paths only)

- [ ] State updates that re-render large trees on every keystroke without isolation
- [ ] Effect dependency mistakes causing refetch loops (when clearly hot)
- [ ] Unmemoized expensive derived data in render of a primary screen

## Bundle (FE TS)

- [ ] Fat default imports; missing dynamic `import()` for heavy routes
- [ ] Cross-check web checklist for CLS / asset issues

## Measure next (optional)

Chrome Performance panel, React Profiler, `clinic`/`0x` for Node — optional appendix only.

## Finding guidance

- Track: `runtime` or `web` as appropriate; API handlers → prefer `api`
- Path Capacity: component, route, or handler symbol
