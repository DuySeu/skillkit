# Python Performance Checklist

Load when Python is in scope. Checklist, not a profiling tutorial.

## Hot-path anti-patterns

- [ ] Repeated work inside loops that could be hoisted or batched
- [ ] List/`in` scans where a set/dict lookup belongs
- [ ] String concatenation in loops (`+`) instead of `join`
- [ ] Loading entire files/tables into memory when an iterator/generator suffices

## Concurrency model

- [ ] Sync blocking calls inside async frameworks (FastAPI/Starlette/asyncio)
- [ ] CPU-heavy work on request workers (GIL) without offload
- [ ] Unbounded `ThreadPoolExecutor` / task fan-out

## Database

- [ ] Per-row `commit` / execute instead of `executemany` / batch
- [ ] ORM lazy loads causing N+1 (cross-check API checklist)

## Measure next (optional appendix)

Recommend when useful: `cProfile` / `py-spy` for CPU, `tracemalloc` for memory, `EXPLAIN` for SQL. Not required to finish the audit.

## Finding guidance

- Track: `runtime` for language idioms; `api` when it is clearly a handler/query shape
- Path Capacity uses the function/handler name
