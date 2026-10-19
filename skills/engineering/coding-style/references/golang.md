# Go style

Detect first: match the existing package's conventions over anything below.

Written against Go 1.26. A few rules need a recent toolchain (`WaitGroup.Go` is 1.25, `t.Context` and `b.Loop` are 1.24) - check the `go` directive in `go.mod` before reaching for one.

## Non-negotiable

- `gofmt` is the formatting, not a preference. `goimports` maintains the import groups - don't hand-sort them.
- Check every error. `_` on an error only with a comment saying why it cannot matter.
- Wrap with context and `%w`: `fmt.Errorf("load config: %w", err)`. Lowercase, no trailing punctuation. `%v` breaks the chain.
- `defer` goes *after* the error check. `defer f.Close()` above `if err != nil` closes a nil file.
- Compare errors with `errors.Is` / `errors.As`. Never `strings.Contains(err.Error(), "not found")`.
- `ctx context.Context` is the first parameter, never a struct field. Every `context.WithX` gets `defer cancel()` on the next line.
- Return errors. `panic` only for programmer bugs and init-time failure, never for an expected one.
- Pre-size slices and maps when the length is known: `make(map[string]Item, len(items))`.

## Don't write these anymore

The toolchain moved; a lot of Go still circulating on the web has not. Delete these on sight:

| Outdated | Write instead | Since |
|---|---|---|
| `interface{}` | `any` | 1.18 |
| `io/ioutil.ReadFile` / `ReadAll` / `TempDir` | `os.ReadFile`, `io.ReadAll`, `os.MkdirTemp` | 1.16 |
| `for i := 0; i < n; i++` over a plain count | `for i := range n` | 1.22 |
| `item := item` shim, `go func(i Item){...}(item)` | `go func(){ ... item ... }()` - the loop variable is per-iteration now | 1.22 |
| Hand-written `contains` / `sort.Slice` / `index of` | `slices.Contains`, `slices.Sort`, `slices.SortFunc`, `slices.Index` | 1.21 |
| Loop to collect map keys, then `sort.Strings` | `slices.Sorted(maps.Keys(m))` - `maps.Keys` yields an iterator, not a slice | 1.23 |
| Loop to blank a map or a slice | `clear(m)` | 1.21 |
| Ternary-ish `if a < b { ... }` to pick one | `min(a, b)` / `max(a, b)` builtins | 1.21 |
| `rand.Seed`, `rand.Intn` from `math/rand` | `math/rand/v2` - auto-seeded, `rand.IntN` | 1.22 |
| `wg.Add(1)` + `go func(){ defer wg.Done(); ... }()` | `wg.Go(func(){ ... })` | 1.25 |
| `sync.Once` + a package-level var | `sync.OnceValue(func() T { ... })` | 1.21 |
| `timer.Reset` dance to avoid a `time.After` leak in a `select` loop | plain `time.After` - unreferenced timers are collected now | 1.23 |
| `// +build` alongside `//go:build` | `//go:build` alone | 1.18 |
| A `tools.go` with blank imports | `go get -tool`, which writes a `tool` directive into `go.mod` | 1.24 |
| `errors.New` + manual concatenation of several failures | `errors.Join` | 1.20 |
| `github.com/pkg/errors` | `fmt.Errorf` with `%w`, `errors.Is` / `errors.As` | 1.13 |

Generics are for removing duplication that already exists across two or more concrete types. Reach for `slices` / `maps` first - most of what people write type parameters for is already in there.

## Naming

- MixedCaps, never underscores. Acronyms keep their case: `userID`, `ServeHTTP`, `parseURL` - not `userId`.
- No `Get` prefix on an accessor: `a.Balance()`, not `a.GetBalance()`. The setter keeps `SetBalance`.
- A one-method interface takes the `-er` name: `Reader`, `sessionLoader`. No `I` prefix, no `Impl` suffix.
- Package names are singular, lowercase, no underscores. No `util`, `common`, `helpers`, `base`.
- The package name is part of every call site: `session.New()`, not `session.NewSession()`.
- Sentinel errors are `ErrNotFound` exported, `errNotFound` unexported.
- Short names for short scopes - `i`, `r`, `w`, `err` inside a five-line body; full words for anything package-level.

## Errors

- Sentinel errors as `var ErrNotFound = errors.New("not found")`; compare with `errors.Is`.
- A custom error type when the caller needs the fields. Pointer receiver on `Error()`, otherwise `errors.As` won't match.
- Handle an error once: log it or return it, never both. A wrapped return already carries what the log line would have said.
- `errors.Join` for independent failures collected in one pass (validation, fan-out) instead of hand-rolling `[]error`.

## Types and packages

- Accept interfaces, return structs.
- Define an interface where it is *consumed*, not where it is implemented.
- Interfaces stay small - 1 to 3 methods. A 6-method interface is a struct in disguise.
- Write the interface when a second implementation or a test double exists. One implementation and no test needs none.
- Embedding promotes every method of the embedded type into your API. In an exported type, hold the dependency in a field and delegate the one method you meant to expose.
- Zero value should be usable where it can be. Avoid constructors that only set defaults.

## Structure

- Dependencies arrive as constructor arguments stored on the struct, or as parameters. No package-level mutable state - constants and `Err` sentinels are the exception, since neither holds application state.
- Config from the environment through one typed loader read at startup, not `os.Getenv` scattered across packages.
- Logging via `log/slog` with one configured handler. Pass key-value pairs (`slog.String("path", r.URL.Path)`) rather than formatting them into the message, and never `fmt.Println` for diagnostics.
- Anything that isn't the module's API goes under `internal/`.
- Templates, migrations and static assets ship inside the binary via `//go:embed`, not read from a path at runtime - a relative path is one working directory away from breaking, and one deploy away from missing.

## Immutability

A slice or a map parameter is a window onto the caller's memory. Writing through it changes their data with nothing in the signature to warn them.

```go
// Before - sorts the caller's slice, and panics on fewer than ten
func TopSessions(sessions []Session) []Session {
	slices.SortFunc(sessions, func(a, b Session) int { return cmp.Compare(b.Duration, a.Duration) })
	return sessions[:10]
}
```

```go
// After - TopSessions returns the ten longest sessions.
func TopSessions(sessions []Session) []Session {
	ordered := slices.Clone(sessions)
	slices.SortFunc(ordered, func(a, b Session) int { return cmp.Compare(b.Duration, a.Duration) })
	return ordered[:min(10, len(ordered))]
}
```

- `slices.Clone` / `maps.Clone` before sorting, filtering or reordering something you did not create.
- Value receivers on methods that only read. A pointer receiver announces "this mutates", and a type mixing both makes the reader check every method to find out which.
- A struct returned by value is copied, but a slice or map field inside it is not. Clone those fields if the caller must not see later writes.
- `append` can write into the caller's backing array when there is spare capacity. `slices.Concat(prefix, []T{x})`, or clone first, when `prefix` is not yours.
- Local mutation of a slice this function allocated is idiomatic Go - `make([]T, 0, n)` then append is the normal shape, not a smell.

## File layout

1. `const` / `var` blocks.
2. Type and struct declarations.
3. Exported functions and methods (PascalCase) - the package's API.
4. Unexported functions (lowercase) - only for genuine reuse; a helper called once or twice inside the file stays inlined in its caller.

Methods stay grouped with their receiver type, constructor first. That grouping wins over the exported/unexported split within buckets 3 and 4 - a reader following `*Store` shouldn't have to jump the file to find `store.get`.

## API endpoints

One header comment per handler, directly above the function:

```go
// GET /v1/sessions - Get sessions
func (h *Handler) ListSessions(w http.ResponseWriter, r *http.Request) {
    ...
}
```

Verbs, paths and query parameters follow the table in SKILL.md rule 3. With `net/http` 1.22+ routing, the method belongs in the pattern itself - `mux.HandleFunc("GET /v1/sessions/{id}", h.GetSession)` - so the comment and the registration say the same thing.

### Response envelope

Every route in one project returns the same shape, encoded in one place:

```go
// APIResponse is the shape every endpoint returns.
type APIResponse[T any] struct {
	Success bool   `json:"success"`
	Data    T      `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
	Meta    *Page  `json:"meta,omitempty"`
}
```

```go
// GET /v1/sessions - Get sessions
func (h *Handler) ListSessions(w http.ResponseWriter, r *http.Request) {
	// Read one page
	sessions, err := h.store.List(r.Context(), pageFrom(r))
	if err != nil {
		h.log.Error("list sessions", slog.Any("err", err))
		writeJSON(w, http.StatusInternalServerError, APIResponse[any]{Error: "cannot list sessions"})
		return
	}

	writeJSON(w, http.StatusOK, APIResponse[[]Session]{Success: true, Data: sessions})
}
```

`writeJSON` is the single place that sets the content type and encodes, so no handler hand-rolls `w.Write`. The status code and the envelope always agree - never 200 with `Success: false`. The logged error keeps the wrapped chain; the response carries a message safe for a client, never `err.Error()`.

## Comments

Brief header comment above every function, short action-oriented step comments inside. Exported identifiers keep the godoc convention of starting with the name; unexported ones don't need to. One file per package carries the `// Package session ...` doc comment.

```go
// ListSessions returns every session created after the cursor.
func ListSessions(ctx context.Context, cursor string) ([]Session, error) {
	// Build the cursor predicate
	query := "SELECT * FROM sessions WHERE id > $1"

	// Run it
	rows, err := db.QueryContext(ctx, query, cursor)
	if err != nil {
		return nil, fmt.Errorf("list sessions: %w", err)
	}

	return scanSessions(rows)
}
```

## Helpers

Don't split one operation into helpers used once - but in Go the scope is the **package**, not the file, since unexported names are visible to every file in the package. Check the whole directory before deciding a helper is single-use.

```go
// Before - two names, one operation
func minutesSince(startedAt time.Time) int {
	return int(time.Since(startedAt).Minutes())
}

func SessionSummary(s Session) string {
	return fmt.Sprintf("%s active for %dm", s.User, minutesSince(s.StartedAt))
}
```

```go
// After - SessionSummary describes how long a session has been active.
func SessionSummary(s Session) string {
	minutes := int(time.Since(s.StartedAt).Minutes())
	return fmt.Sprintf("%s active for %dm", s.User, minutes)
}
```

## File naming

- Lowercase, no underscores, no MixedCaps: `store.go`, `sessionstore.go`. `_test.go` is the one underscore the toolchain expects, alongside build-constraint suffixes (`_linux.go`, `_amd64.go`).
- The package name is already part of the path, so don't repeat it: `session/store.go`, not `session/session_store.go`.
- `doc.go` when the `// Package session ...` comment needs a home of its own.
- No `utils.go`, `helpers.go`, `common.go`, or `misc.go` - the same rule as the package names under Naming.

## Concurrency

- Every goroutine has an owner and a guaranteed exit path. If you can't name who stops it, don't start it.
- `wg.Go(func(){ ... })` over the `Add(1)` / `defer Done()` pair - the pair exists to be mismatched.
- `errgroup` over a hand-rolled `WaitGroup` + error channel. `errgroup.WithContext` cancels the siblings on the first failure, and `SetLimit` bounds the fan-out without a semaphore channel.
- Only the sender closes a channel. Closing from a receiver, closing twice, or sending on a closed channel all panic.
- An unbuffered send with no receiver left is a leaked goroutine. Buffer it, or make the receive guaranteed.
- Guard shared state with a mutex held for the shortest span possible, or don't share it. `RWMutex` only when reads dominate writes by an order of magnitude.
- `atomic.Int64` for a counter or a flag; a mutex around one `++` is noise.
- `defer` runs at function exit, not iteration exit. Unlock inline inside a loop, or move the body into its own function.
- A plain map + `sync.Mutex` beats `sync.Map` in almost every case; `sync.Map` targets caches with keys written once and read from many goroutines.
- Shut down gracefully: `signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)` for the signal, then `srv.Shutdown(ctx)` under its own timeout so in-flight requests finish. A bare `os.Exit` in `main` cuts them mid-response.

## Tests

- Table-driven, one `t.Run(tt.name, ...)` per case. The name states the case: `"rejects expired session"`, not `"case 2"`.
- `t.Helper()` in every assertion helper so the failure points at the caller. `t.Cleanup` over `defer` in setup helpers, and `t.Chdir` over saving and restoring the working directory by hand.
- `t.Context()` for anything taking a context - it's cancelled as the test finishes, so no `defer cancel()` and no leaked worker.
- `t.Parallel()` on tests with no shared state.
- Standard `testing` first. Use testify only where the repo already has it - then `require` for preconditions, `assert` for the checks.
- Assert on values, with got/want in the message: `t.Errorf("Add(%d, %d) = %d; want %d", a, b, got, want)`.
- Benchmarks loop with `for b.Loop()`, not `for i := 0; i < b.N; i++` - it keeps the setup out of the timed region and stops the compiler optimizing the call away.
- Concurrent code goes inside `synctest.Test(t, func(t *testing.T){ ... })` (`testing/synctest`, stable since 1.25). The bubble gives it a fake clock that only advances once every goroutine is blocked, so a timeout, a retry backoff or a ticker is tested in microseconds and deterministically. A `time.Sleep` in a test is a flake waiting for CI to be slow.
- Anything parsing untrusted input gets a `func FuzzParse(f *testing.F)` with `f.Add` seeds and `f.Fuzz`. Native since 1.18 - no property-testing library needed.
- Integration tests behind `//go:build integration`, plus a `testing.Short()` skip.
- `go test -race ./...` is part of "the tests pass", not an extra step.

## Tooling

`go vet ./...` before calling the work done, and `golangci-lint run`, which wraps `staticcheck` along with the rest.

```yaml
# .golangci.yml (schema v2 - the v1 layout does not parse)
version: "2"

linters:
  enable:
    - errcheck
    - govet
    - staticcheck
    - unused
    - revive
    - gosec
    - errorlint
  settings:
    errcheck:
      check-type-assertions: true
  exclusions:
    rules:
      - path: _test\.go
        linters: [errcheck, gosec]

formatters:
  enable:
    - gofmt
    - goimports
```

Measure before optimizing anything: `go test -bench . -benchmem` for the number, `-cpuprofile` / `-memprofile` then `go tool pprof` for where it goes, `go tool trace` when the answer is scheduling rather than code. A benchmark that got faster is the only evidence an optimization worked; keep it in the package as the regression guard.

`errorlint` is what catches `%v` where `%w` belongs and `==` against a wrapped error. `unused` replaces the old `deadcode` / `structcheck` / `varcheck` trio - don't list those. `gosec` is noisy in tests (hardcoded credentials, weak RNG), hence the exclusion. Formatters live in their own top-level block since v2; enabling `gofmt` under `linters` is the v1 layout and fails to load.

## References

- [Effective Go](https://go.dev/doc/effective_go)
- [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments)
