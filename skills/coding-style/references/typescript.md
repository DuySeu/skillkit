# TypeScript / JavaScript style

Detect first: match the repo's existing linter (biome/eslint), formatter (biome/prettier), and module system (ESM vs CJS) over anything below. These rules fill gaps, they don't override an established project.

## Non-negotiable

- Never `any`. Use `unknown` and narrow, or write the real type. `strict` is on by default in TypeScript 7 - never switch it off.
- `const` by default, `let` only when reassignment is real.
- Named exports by default. Default exports only where a framework requires them (e.g. a Next.js page) - named exports are greppable, default exports aren't.
- `import type { Session } from "./types"` for type-only imports, so nothing type-shaped survives into the bundle.
- Escape hatches, in order: `@ts-expect-error` with a one-line reason, then `@ts-ignore`, never `as any`. `@ts-expect-error` fails the build once the underlying error is fixed, so it cannot rot in place.

## Types

- `interface` for object shapes, `type` for unions, intersections, and mapped or conditional types. No `I` prefix on interface names.
- Model state as a discriminated union, not optional fields plus booleans - the union makes impossible states unrepresentable and removes the `if (data && !loading)` reading tax at every call site.
- Be accurate, not loose: `Record<string, unknown>` over `object`, a named union over a bare `string`, `unknown` over `any`.
- A union of string literals, or an `as const` object, over `enum` - `enum` emits runtime code and is not erasable syntax, so it breaks under `erasableSyntaxOnly` and Node's built-in type stripping.
- `as const satisfies Config` on config constants: `satisfies` checks the shape without widening the literals, so the keys stay autocompletable.
- Let inference work. Annotate parameters and the return type of an exported function; not a `const` its own initializer already types.
- No hand-written type predicates for a null check - `items.filter((x) => x !== null)` narrows to `string[]` on its own.

```typescript
// Before - four fields, sixteen combinations, most of them impossible
interface Result {
  loading: boolean;
  data?: Session;
  error?: Error;
}
```

```typescript
// After - three states, all of them real
type Result =
  | { status: "loading" }
  | { status: "ok"; data: Session }
  | { status: "error"; error: Error };
```

## Immutability

Build a new value; never write into one you were handed. The copying array methods exist for this and are in Node 20+ and every current browser: `toSorted`, `toReversed`, `toSpliced`, `with`.

```typescript
// Before - sorts the caller's array, and the caller never asked for that
export function topSessions(sessions: Session[]) {
  return sessions.sort((a, b) => b.duration - a.duration).slice(0, 10);
}
```

```typescript
// After - Take the ten longest sessions
export function topSessions(sessions: readonly Session[]) {
  return sessions.toSorted((a, b) => b.duration - a.duration).slice(0, 10);
}
```

- Spread to update: `{ ...session, name }` for an object, `[...items, item]` for an array. Never assign into a parameter, a prop, or anything reachable from one.
- `readonly T[]` on a parameter the function only reads, `readonly` on fields nobody should reassign. The compiler then rejects `.push` at the call site instead of a reviewer catching it later.
- `.sort()`, `.reverse()`, `.splice()`, `.push()` mutate in place. On a value that came from outside, copy first or use the `to*` twin.
- Local mutation of a value this function created is fine, and often clearer than folding it into a `reduce`. The rule is about values that arrived from elsewhere.

## File layout

1. Constants (`UPPER_SNAKE_CASE` for true constants, `camelCase` for config objects).
2. Types: `interface` / `type` aliases, and the schemas that back them (zod, or whichever the repo already has).
3. Exported functions and classes - the module's API.
4. Internal (non-exported) functions - only for genuine reuse; a helper called once or twice inside the file stays inlined in its caller.

## API endpoints

One header comment per route, directly above the handler - the pattern is the same whether it's Express, Nest, or a framework route file:

```typescript
// GET /v1/sessions - Get sessions
router.get("/v1/sessions", async (req, res) => {
  ...
});
```

Verbs, paths and query parameters follow the table in SKILL.md rule 3.

### Response envelope

Every route in one project returns the same shape, declared once and imported:

```typescript
// The response shape every endpoint returns
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: { total: number; limit: number; offset: number };
}
```

```typescript
// GET /v1/sessions - Get sessions
router.get("/v1/sessions", async (req, res) => {
  // Reject anything the query schema does not accept
  const query = listQuery.safeParse(req.query);
  if (!query.success) {
    return res.status(400).json({ success: false, error: "Invalid query" } satisfies ApiResponse<never>);
  }

  // Read one page
  const { rows, total } = await sessions.list(query.data);

  return res.json({
    success: true,
    data: rows,
    meta: { total, limit: query.data.limit, offset: query.data.offset },
  } satisfies ApiResponse<Session[]>);
});
```

The HTTP status and the envelope always agree. A client's HTTP layer branches on the status, a human reads `error` - so never a 200 carrying `success: false`, and never a 4xx with no `error` string. `satisfies ApiResponse<T>` checks the body without widening the literal, which is what catches a route that forgot `success`.

## Comments

Brief header comment above every function, short action-oriented step comments inside. Plain `//`, not JSDoc, unless the file already carries JSDoc for a published API.

```typescript
// Load a session and reject it if expired
export async function loadSession(token: string) {
  // Decode the signed token
  const claims = decodeJwt(token);

  // Reject expired sessions
  if (claims.exp < Date.now()) return null;

  return sessions.get(claims.sub);
}
```

## Helpers

Don't split one operation into helpers used once. Non-exported does not mean free - it means nothing outside this file can even reach it, so its only justification is reuse *inside* the file.

```typescript
// Before - two names, one operation
function minutesSince(startedAt: Date) {
  return Math.floor((Date.now() - startedAt.getTime()) / 60_000);
}

export function sessionSummary(session: Session) {
  return `${session.user} active for ${minutesSince(session.startedAt)}m`;
}
```

```typescript
// After - Describe how long a session has been active
export function sessionSummary(session: Session) {
  const minutes = Math.floor((Date.now() - session.startedAt.getTime()) / 60_000);
  return `${session.user} active for ${minutes}m`;
}
```

An inline `.map()` / `.filter()` chain usually replaces a one-off `formatRow`-style helper better than a second function does.

## Naming and values

- PascalCase for types and components, camelCase for values and functions, `UPPER_SNAKE_CASE` only for true constants.
- Booleans read as questions: `isExpired`, `hasAccess`, `shouldRetry`.
- No magic values. A number or string a reader has to decode, or one that appears twice, becomes a named constant in bucket 1.
- Call `Date.now()` once per operation into a `const now` and reuse it - two calls in one function can straddle a millisecond and disagree.

## Async

- `await`, never a dangling unhandled promise, and no `.then()` chain where `await` reads cleaner.
- The async API over its `*Sync` twin: `import { readFile } from "node:fs/promises"`.
- Independent awaits go through `Promise.all`. An `await` inside a loop is one serial round trip per item, so keep the loop only when each step needs the previous one's result.
- `Promise.allSettled` when one failure must not cancel the rest, `AbortSignal` for anything cancellable.

## Errors

- Throw `Error` subclasses with a message, never a bare string or object literal.
- Keep the original: `throw new AppError("Cannot load session", { cause: err })`. Never replace a caught error with a new message and drop what caused it.
- A caught error is `unknown`. Narrow with `instanceof Error` before touching `.message`.
- Catch only where you can act on it - log-and-rethrow is rarely better than letting it propagate.
- Validate anything crossing a trust boundary (request body, query params, env vars) with a schema, not manual `if` checks.

## Logging

- Never log a token, an API key, or a request body carrying credentials. Log the id, not the payload.
- One configured logger, not `console.log` scattered through the code. `console.error` inside a catch is fine in a script or CLI.

## Style

- One export's worth of concern per file. If the filename needs "and", split it.
- Prefer composition (functions taking functions, small modules importing each other) over class hierarchies.
- `for...of` over an index-based `for`, and `.map()` / `.filter()` / `.reduce()` when the loop is really a transform.
- Destructure in the parameter list when the body uses three or more fields of an object. Don't destructure only to rename.
- Reach for the platform before a utility dependency: `Object.groupBy`, `toSorted` / `toReversed`, `findLast`, `at`, `structuredClone`, `Promise.withResolvers`.
- No barrel-file (`index.ts` re-export) unless the repo already uses that pattern - it hides where things actually live.

## File naming

- camelCase for modules and utilities, named for the responsibility: `sessionStore.ts`, `loadSession.ts`. Never `utils.ts`, `helpers.ts`, or `misc.ts` - those are folders for things nobody named.
- PascalCase only where the main export is a component or a type-like construct: `SessionTable.tsx` (see `react.md`).
- Types shared across modules go in `session.types.ts`; a type used by one module stays in that module's bucket 2.
- Tests sit beside their source: `sessionStore.test.ts`. Fixtures under `__fixtures__/`, not a `.test.ts` file that exports data.
- The filename and the module's main export match. If the filename needs "and", it is two files.

## Tooling

- `pnpm` unless the repo's lockfile says otherwise. Don't introduce a second package manager.
- One formatter and one linter, and let them own formatting - don't hand-fix what a formatter rewrites. Biome does both in a single tool for a new project; a repo already on Prettier plus ESLint flat config (`eslint.config.js`) keeps them.
- Start from what `tsc --init` emits on TypeScript 7, then add the two checks it leaves off:

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "target": "esnext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "erasableSyntaxOnly": true,
    "skipLibCheck": true
  }
}
```

`noUncheckedIndexedAccess` is the one that catches real bugs: `arr[0]` types as `T | undefined` instead of `T`. `verbatimModuleSyntax` enforces the `import type` rule above. `erasableSyntaxOnly` is the compiler half of "no `enum`", and keeps the source runnable by anything that only strips types. `strict` already implies `noImplicitAny`, `strictNullChecks`, and `useUnknownInCatchVariables` - don't list them again. Drop `module` to `bundler` (its default when the target isn't Node) for a bundled frontend, and add `"jsx": "react-jsx"` there.
