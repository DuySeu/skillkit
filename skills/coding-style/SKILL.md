---
name: coding-style
description: This developer's mandatory code conventions for Python, TypeScript/JavaScript, Go, and React. Read this BEFORE writing, adding, editing, refactoring, cleaning up, or reviewing implementation code in any of those languages - including single functions and small edits, and even when the user never says the word "style". Covers file-level declaration order (constants → types → exported/public functions → internal functions), comment policy (a brief header comment on every function, short step comments inside, and a mandatory `METHOD /api/path - description` line above every API endpoint handler), immutability, REST path conventions with a shared response envelope, file naming, and the code smells worth refusing to write.
---

# Coding Style

Three rules, four principles, and one list of smells. Detect the project's existing conventions first - an established codebase's own patterns win over anything here. If something here conflicts with a convention already in place, say so in one line and follow the existing convention.

## Principles

- **KISS.** The simplest thing that works. Cleverness a reader has to decode is a cost paid on every future read, by someone who did not enjoy writing it.
- **DRY, at two real call sites.** Extract when the same logic already exists in two or more places, never in anticipation of a second one. The extracted function lands in bucket 4 of rule 1. One caller is not duplication - it is one operation wearing two names, and each language reference has a Helpers section showing the inlined form.
- **YAGNI.** Build what was asked for. A config flag, a hook, or a type parameter with a single caller is weight every later reader carries for a case that never arrived.
- **Immutability by default.** Return a new value instead of editing the one you were handed. A function that mutates its argument has a second return value its signature never mentions. Each language reference has an Immutability section with that language's form.

## 1. Order every file the same way

Within a single file, group declarations in this order:

1. Constants
2. Types (structs, interfaces, type aliases, dataclasses, schemas - however the language expresses "shape")
3. Exported / public functions - the file's actual API, what other files call
4. Internal / unexported functions - helpers used only within this file

Why: opening a file for the first time should show "what this file offers" before "how it's built." A reader shouldn't have to scroll past three private helpers to find the one function anyone else calls.

See the matching reference below for what each of these four buckets looks like in that language's own syntax - "types" means something different in Go (`struct`) than in Python (`@dataclass` / `TypedDict`).

## 2. Keep comments concise and step-focused

Always include a brief comment directly above a function to explain what it does. Inside the function, use short, single-line comments to outline the major steps. Never use comments to explain why a step was created or justify the logic behind it within the function. Let well-named variables do the heavy lifting, and keep step descriptions strictly action-oriented.

```typescript
// Validate the session token and load the user
export async function loadUser(token: string) {
  // Decode and verify signature
  const claims = verifyJwt(token);

  // Reject expired sessions
  if (claims.exp < Date.now()) return null;

  // Fetch the user record
  return db.user.findUnique({ where: { id: claims.sub } });
}
```

Rule 3 is the one deliberate exception to the header format.

Where the language has docstrings, a docstring counts as the header on a public function if the project already uses them - pick one form and stay consistent within a module. Route handlers are the exception: they need the rule 3 line specifically, and a docstring does not replace it.

## 3. Every API endpoint handler gets a header comment

Immediately above the function (and above any decorator/attribute) that implements an HTTP endpoint, add exactly one comment line:

`METHOD /api/path - What this api does`

Example: `GET /v1/sessions - Get sessions`

This is the fastest way to grep "where does this route live" without opening a router file. It replaces the plain header comment from rule 2 rather than joining it, and it applies to inline handlers too - an anonymous `router.post("/v1/sessions", async (req, res) => ...)` needs the line above the `router.post` call.

### The paths the line describes

| Verb | Path | Meaning |
|---|---|---|
| GET | `/v1/sessions` | List |
| GET | `/v1/sessions/{id}` | Read one |
| POST | `/v1/sessions` | Create |
| PUT | `/v1/sessions/{id}` | Replace whole |
| PATCH | `/v1/sessions/{id}` | Update part |
| DELETE | `/v1/sessions/{id}` | Delete |

Plural nouns, no verbs in the path - `POST /v1/sessions`, never `/v1/createSession`. Filtering, paging and sorting are query parameters on the list route (`?status=active&limit=10&offset=0`), not extra path segments and not a second endpoint. Every route in one project returns the same envelope shape, so a client writes the unwrapping once; the envelope and its error path are in each language reference under API endpoints.

## Code smells

Four things to notice while writing, not only while reviewing:

- **Deep nesting.** Three levels of `if` is a chain of guard clauses waiting to be written. Invert each condition and return early; the happy path then reads down the left margin.
- **Magic values.** A literal the reader has to decode, or one that appears twice, is a named constant in bucket 1.
- **A function doing two things.** Split by responsibility, not by line count. A 60-line function that does one thing stays; a 20-line one that validates *and* saves is two functions with one name.
- **A mutated argument.** See the Immutability principle. This is the smell that produces bugs rather than merely reading badly.

## Applying this to existing code

When asked to refactor or clean up code to this style, do the declaration order first - those moves are mechanical and behaviour-preserving - then add the missing header comments and route lines. Behaviour stays identical throughout; report what you changed.

## Language references

Read the file(s) matching the task before writing code - each carries that language's concrete realization of the three rules, plus its error handling, testing, and tooling conventions.

| Language | Reference |
|---|---|
| Python | `references/python.md` |
| TypeScript / JavaScript | `references/typescript.md` |
| Go | `references/golang.md` |
| React | `references/react.md` |

A task spanning more than one - e.g. a TypeScript API behind a React frontend - needs both files read; React's file layout differs from plain TypeScript's because a component's render output has to read before its helpers, not just its exports.
