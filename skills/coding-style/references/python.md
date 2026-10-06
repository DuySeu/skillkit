# Python style

Detect first: if the repo already uses black/poetry/pip/unittest, follow the repo. These rules fill gaps, they don't override an established project.

## Non-negotiable

- Type hints on every public function signature. `from __future__ import annotations` at the top.
- `pathlib.Path` for paths. Never string concatenation, never `os.path.join`.
- f-strings only. Not `%`, not `.format()`.
- Catch specific exceptions. Never bare `except:`, never `except Exception` unless you re-raise.
- No mutable default arguments: `def f(items: list[str] | None = None)`, then `items = items or []`.
- No wildcard imports. No import inside a function unless breaking a real cycle (say which).
- Absolute imports only. PEP 8 permits explicit relative ones, but an absolute path tells the reader which package a name comes from without resolving it in their head.
- Acquire resources with `with`, never a manual open/close or a `try/finally` pair. For a custom one, `@contextlib.contextmanager` over writing `__enter__`/`__exit__`.

## Structure

- One responsibility per module. If the filename needs "and", split it.
- `@dataclass(frozen=True)` for plain data. Reach for pydantic only if the project already has it.
- Pass dependencies in as arguments. No module-level singletons or global mutable state - constants and the module's own `logger = logging.getLogger(__name__)` are the exceptions, since neither holds application state.
- Config from environment via one typed loader, read once at startup - not `os.getenv` scattered around.
- Logging via the `logging` module through one configured logger. Never `print` for diagnostics.

## Immutability

Return a new value; never write into an argument. A function that sorts the list it was handed has a second return value its signature never mentions.

```python
# Before - sorts the caller's list in place
def top_sessions(sessions: list[Session]) -> list[Session]:
    sessions.sort(key=lambda s: s.duration, reverse=True)
    return sessions[:10]
```

```python
# After - Take the ten longest sessions
def top_sessions(sessions: Sequence[Session]) -> list[Session]:
    ordered = sorted(sessions, key=lambda s: s.duration, reverse=True)
    return ordered[:10]
```

- `sorted()` / `reversed()` / a comprehension over `.sort()` / `.reverse()` / `.append()` on a collection that came from outside.
- `dataclasses.replace(session, name=name)` for one changed field on a frozen dataclass, `session.model_copy(update={...})` on a pydantic model, `{**config, "retries": 3}` on a dict.
- Type a read-only parameter as `Sequence[T]` / `Mapping[K, V]`, not `list` / `dict`. The annotation says the function does not write, and mypy enforces it at the call site.
- The mutable default argument under Non-negotiable is the same bug one scope out: the default object is shared by every call.
- Local mutation of a value this function created is fine - building a list in a loop reads better than a nested comprehension when the loop has steps.

## File layout

Imports come first, `from __future__ import annotations` at the top of them. Then:

1. Module-level constants (`SCREAMING_SNAKE_CASE`).
2. Types: `@dataclass`, `TypedDict`, `Enum`, pydantic models.
3. Public functions and classes (no leading underscore) - the module's API.
4. Private helper functions (`_leading_underscore`) - only for genuine reuse; a helper called once or twice stays inlined in its caller.

A private *class* is still a class: put it in bucket 2 if it is a data shape, bucket 3 otherwise. The underscore decides visibility, not which bucket it belongs to.

## API endpoints

One header comment per route, directly above the decorator:

```python
# GET /v1/sessions - Get sessions
@app.get("/v1/sessions")
def list_sessions():
    ...
```

A docstring does not replace this line - a route needs the `METHOD /path` comment specifically. Verbs, paths and query parameters follow the table in SKILL.md rule 3.

### Response envelope

Every route in one project returns the same shape, declared once:

```python
# The response shape every endpoint returns
class ApiResponse[T](BaseModel):
    success: bool
    data: T | None = None
    error: str | None = None
    meta: PageMeta | None = None
```

```python
# GET /v1/sessions - Get sessions
@app.get("/v1/sessions")
def list_sessions(limit: int = 20, offset: int = 0) -> ApiResponse[list[Session]]:
    # Read one page
    rows = store.list(limit=limit, offset=offset)

    return ApiResponse(
        success=True,
        data=rows,
        meta=PageMeta(total=store.count(), limit=limit, offset=offset),
    )
```

The status code and the envelope always agree: raise `HTTPException(status_code=400, detail="Invalid query")` and register one exception handler that renders it into the same shape. Never a 200 carrying `success: False`, never a 4xx with no `error`.

PEP 695 generics (`class ApiResponse[T]`) need Python 3.12 and pydantic 2.9+. On anything older it is `Generic[T]` with a module-level `TypeVar`.

## Comments

Brief header comment above every function, short action-oriented step comments inside. A docstring counts as the header on a public function if the project already uses docstrings - pick one and stay consistent within a module.

Full Google-style docstrings (`Args:` / `Returns:` / `Raises:`) belong to a published library, where the reader gets IDE hover or generated docs instead of the source. In application code they restate the type hints and go stale - the one-line header wins.

```python
# Load a session and reject it if expired
def load_session(token: str) -> Session | None:
    # Decode the signed token
    claims = decode(token)

    # Reject expired sessions
    if claims.expires_at < now():
        return None

    return sessions.get(claims.session_id)
```

## Helpers

Don't split one operation into helpers used once. A leading underscore is not a licence to exist - `_minutes_since` reached from a single caller is one operation wearing two names.

```python
# Before - two names, one operation
def _minutes_since(started_at: datetime) -> int:
    return int((now() - started_at).total_seconds() // 60)


def session_summary(session: Session) -> str:
    return f"{session.user} active for {_minutes_since(session.started_at)}m"
```

```python
# After - Describe how long a session has been active
def session_summary(session: Session) -> str:
    minutes = int((now() - session.started_at).total_seconds() // 60)
    return f"{session.user} active for {minutes}m"
```

A comprehension or a generator expression is usually the right way to remove a `_map_row`-style helper, not a second function.

## File naming

- `snake_case.py`. A dash is not importable, so never `session-store.py`.
- The module name states the responsibility: `session_store.py`, not `utils.py`, `helpers.py`, or `common.py`.
- Tests mirror the module they cover: `tests/test_session_store.py`.
- One responsibility per module, as under Structure. If the filename needs "and", it is two modules.

## Tooling

- `uv` for envs, `ruff` for lint+format, `pytest` for tests when starting fresh.
- Line length 100. Double quotes. `ruff` defaults to 88, so set it rather than assuming it.

```toml
# pyproject.toml
[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "W", "F", "I", "B", "C4", "UP", "SIM"]
ignore = ["E501"]

[tool.ruff.format]
quote-style = "double"

[tool.mypy]
strict = true

[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false
```

`I` sorts the imports, so don't hand-maintain import groups. `B` is what catches the mutable default argument under Non-negotiable. `UP` and `SIM` rewrite dated syntax and redundant conditionals. `E501` is off because the formatter already wraps to `line-length`; leaving it on only nags about the long strings and URLs the formatter cannot split. `strict` already implies `disallow_untyped_defs`, `disallow_incomplete_defs`, `warn_return_any`, and `warn_unused_ignores` - don't list them again.
