# API / Backend Performance Checklist

Load when HTTP/RPC handlers, APIs, or background jobs exist.

## Queries and data access

- [ ] N+1 / query-inside-loop
- [ ] Missing pagination; unbounded `find` / `SELECT *` result sets
- [ ] Over-fetch (wide rows, unused joins) on hot endpoints
- [ ] Missing indexes implied by filter/sort patterns (flag as “verify with EXPLAIN”)

## Request-path I/O

- [ ] Sync / blocking I/O on the request thread or event loop
- [ ] Missing timeouts and cancellation on outbound calls
- [ ] Connect-per-request instead of pooled clients
- [ ] Chatty sequential remote calls that could be batched or parallelized with a bound

## Caching

- [ ] Suggest cache only when key + invalidation are obvious from code
- [ ] Do not invent a cache layer as a first Critical fix when the root is N+1 or unbounded work

## Finding guidance

- Track: `api` for handler/query issues; `runtime` only when language-specific
- Unbounded fan-out or sync-block on every request → usually Critical
- Path Capacity symbol = handler name or route (e.g. `list_orders`)

## Example finding shape

**Issue:** Per-order item query inside `for order in orders`.  
**Why:** Latency and DB load grow with page size; collapses under modest concurrency.  
**Suggestion:** Join or batch `WHERE id IN (...)`; paginate the outer list.
