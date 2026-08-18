# Go Performance Checklist

Load when Go is in scope.

## Concurrency

- [ ] Goroutine per request/item without bound or worker pool
- [ ] Missing `context` cancellation on outbound calls / fan-out
- [ ] Goroutine leaks (started work that never exits on cancel)
- [ ] Global `sync.Mutex` serializing the entire request path

## Memory / alloc

- [ ] Frequent large copies or string building on hot paths
- [ ] Unbounded buffers / maps growing per request without eviction
- [ ] Suggest sync.Pool only when the path is clearly allocation-hot

## I/O and data

- [ ] Query-in-loop / missing pagination (cross-check API checklist)
- [ ] Dial per request instead of pooled clients
- [ ] Holding locks across slow I/O

## Measure next (optional)

`go test -bench`, `pprof` (cpu/heap/block), `-race` — appendix only, not a gate.

## Finding guidance

- Track: `runtime` for goroutine/lock/alloc; `api` for handler/query shape
- Unbounded goroutine fan-out on a public handler → usually Critical + Won’t scale
