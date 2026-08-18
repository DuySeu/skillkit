# Scalability & Capacity Bands

Always load this file for a performance-optimization audit.

## Scale verdicts

| Verdict | Meaning |
|---------|---------|
| Scales | No inherent single-process or algorithmic ceiling found; safe to replicate behind a load balancer if external state is shared correctly |
| Limited | Works under bounded concurrency or data size; soft ceiling (in-process cache, coarse lock, large but paginated scans) |
| Won’t scale | Structural blocker under growth (unbounded work per request, global serialization, sticky in-memory state required for correctness) |

## Capacity bands (qualitative — not RPS)

| Band | Meaning |
|------|---------|
| Single-instance | Acceptable for low concurrent use; not designed for fan-out or multi-instance |
| Modest concurrent | Plausible for typical app traffic on one well-sized instance if I/O is bounded |
| Needs horizontal scale | Growth requires multi-instance / redesign; single box will not absorb it |

**Never invent precise RPS or concurrent-user counts from static review.**

## Allowed (verdict, band) pairs only

| Verdict | Allowed bands |
|---------|----------------|
| Scales | Modest concurrent |
| Limited | Single-instance, Modest concurrent |
| Won’t scale | Single-instance, Needs horizontal scale |

Forbidden examples: `Scales` + `Needs horizontal scale`; `Won’t scale` + `Modest concurrent`.

### How to choose

- Path is fine on one box under typical traffic **and** can be replicated → `Scales` + `Modest concurrent` (`Modest concurrent` is the single-instance envelope; horizontal readiness is the `Scales` verdict).
- Must stay one process but concurrency inside is OK → `Limited` + `Single-instance`.
- Soft ceiling under growth but still usable → `Limited` + `Modest concurrent`.
- Collapses under growth / needs redesign → `Won’t scale` + `Needs horizontal scale` (or `Single-instance` if only safe at trivial load).

## Path Capacity table — selection rules

Include a path if **any** of:

1. Public HTTP/RPC/handler or job entrypoint in scope.
2. Named by a Critical or Medium finding.
3. Holds process-global mutable state, a global lock, or unbounded fan-out.

**Cap:** If more than 15 paths qualify, keep all Critical-linked paths, then Medium-linked, then entrypoints by traffic centrality (auth, list/search, write APIs first). State that the table was capped.

Low-only hygiene findings do not need a row unless they are also entrypoints.

Every Critical/Medium finding that names a function/handler must appear in this table (or share a row with its parent path).

## Assumption templates

State assumptions explicitly, for example:

- Single process / single instance unless noted
- DB latency class: local-ms vs cross-region
- Cache present or absent
- No request coalescing unless code shows it
- Payload/result set size unbounded unless pagination exists

## Table shape

| Path / symbol | Verdict | Band | Assumptions |
|---------------|---------|------|-------------|
| `GET /orders` handler | Won’t scale | Needs horizontal scale | N+1 queries; no cache; single DB |
