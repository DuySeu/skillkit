# React style

Detect first: match the repo's existing patterns - file-per-component vs colocated folders, CSS modules vs Tailwind vs styled-components, its state library, its data layer. Read the React version in `package.json` before using anything from the version notes below. These rules fill gaps, they don't override an established project.

Scope is React 18 and up. When unsure how something is done here, search the repo for the nearest existing example and follow it rather than introducing a second way.

## Non-negotiable

- Function components with hooks. No class components in new code.
- Hooks at the top level of the component only - never inside a condition, a loop, a callback, or below an early return. The order has to be identical on every render.
- Props typed with an `interface Props` (or an inline type for a one-off) - never `any`, never an untyped `children`.
- Keys on list items are a stable id from the data, never the array index - index keys break on reorder/insert.
- No state that can be derived from props or other state. Compute it during render instead of mirroring it with `useEffect` + `useState`.

## Before writing a new component

Most "new" components already exist in the repo under a different name. Look in this order:

1. A component already in this repo - the feature folder next to the file you are editing, then the shared one (`src/components`, `components/ui`).
2. A primitive from the UI kit already in `package.json` (shadcn/ui, MUI, Mantine, Chakra - whichever is there).
3. A composition of those two.
4. A new component, and only then.

The same order applies to icons, form controls, modals, and toasts. A second `Modal` in a repo that already has one is a bug report waiting to happen, not a component.

## File layout

A component file reads top to bottom as: what it needs, then what it renders, then how it's built.

1. `"use client"` if the framework needs it - first line, above the imports.
2. Types/interfaces (`Props`, local state shapes) and constants (default values, static config).
3. The component itself - usually the default/named export, so it's the first thing after the setup a reader hits.
4. Internal helper functions and subcomponents used only by this component - only if the JSX is unreadable without splitting; a helper called once or twice stays inlined.
5. Custom hooks live in their own file (`useThing.ts`) only when reused by more than one component - a hook that exists purely to shorten one component's body is a single-use helper wearing a hook's clothes (see Helpers below).

With server components, `"use client"` belongs on the leaf that actually needs interactivity, not on a page that then drags its whole tree onto the client.

## Inside the component

The body reads in the same order every time, so a reader always knows where to look:

1. Hooks, in a fixed order: context and store selectors, then `useState`, then `useRef`, then data hooks, then `useEffect` last.
2. Derived values computed from props, state, and hook results.
3. Event handlers.
4. Early returns for loading, error, and empty.
5. One `return` with the JSX.

Effects last is the point of the order: by the time a reader reaches them, they have already seen every value the effect could touch. If steps 2 and 3 grow past what fits on a screen, that is the signal the component is two components - not a signal to extract a single-use hook.

## Props and naming

- The component, its file, and its export match: `SessionTable.tsx` exports `SessionTable`.
- A prop that takes a callback is `onThing`; the function implementing it is `handleThing`. Never the same name on both sides.
- Boolean props read as questions and default to `false`: `isDisabled`, `hasHeader`. No bare `flag`, no negatives like `isNotReady`.
- `children` over a `content` or `renderX` prop when the caller passes markup - it is the one API every React reader already knows.
- Never `{...props}` onto a DOM element to "pass anything through". List what the component accepts; a spread hides which props it actually reads and what it silently forwards.
- Six or more props means the component takes a single object, or it is two components.

## State and data

- Server state and client state are different things. Server data goes through the repo's data layer (React Query, SWR, or the framework's own loader) - not `useEffect` + `useState` + `fetch`, which re-implements caching, cancellation, deduplication, and error handling by hand at every call site.
- Read from a store through a narrow selector, never the whole store: `useSessionStore((s) => s.activeId)` re-renders on one field, `useSessionStore()` re-renders on every field.
- Model async UI as a discriminated union rather than `loading` + `data?` + `error?` (see `typescript.md`, Types). The early returns in the body then cover every real state and no impossible one.
- Lift state only as far as the nearest common consumer - not reflexively to the top. A prop threaded through three components that never read it means the state sits in the wrong place, or the middle layer should be taking `children`.

## Immutability

State is replaced, never edited. React compares by reference, so a mutated object is a re-render that silently does not happen.

```tsx
// Before - mutates state, and loses one update when both land in the same tick
function addTag(tag: string) {
  session.tags.push(tag);
  setSession(session);
  setCount(count + 1);
}
```

```tsx
// After - Add a tag to the current session
function addTag(tag: string) {
  setSession((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
  setCount((prev) => prev + 1);
}
```

- Any update derived from the current value takes the functional form. Reading the state variable directly is stale inside an async callback, and inside two updates in one handler.
- Sorting or reversing a prop array copies first: `[...sessions].sort(...)` or `sessions.toSorted(...)`. `sessions.sort()` reorders the parent's array during render.
- Props are read-only. A component that needs to change one takes an `onChange`-style callback instead.
- The same applies inside a store action: build the next state, don't edit the current one, unless the store is built on a draft API (Immer, Zustand's `produce`) that hands you a proxy for exactly that.

## Effects

`useEffect` is for syncing with something outside React: a subscription, a DOM API, a non-React library, a browser event. Three effects that should not exist, and what replaces each:

- **Deriving state from props or other state.** Compute it during render - no state, no effect.
- **Reacting to a user action.** Do the work in the event handler where the action happened.
- **Resetting state when a prop changes.** Give the component a `key` and let React remount it.

```tsx
// Wrong - state mirrored from props, always one render behind
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${first} ${last}`);
}, [first, last]);
```

```tsx
// Correct - derived during render
const fullName = `${first} ${last}`;
```

An effect that subscribes returns a cleanup function. One that fetches handles being called twice in development under StrictMode, and aborts on unmount via `AbortSignal`.

## Rendering

- Conditional rendering via early return or a ternary for two branches; a lookup object or an early-return chain once there are three or more.
- `count && <Badge />` renders `0` on the page when `count` is `0`. Write `count > 0 && ...`, or use a ternary.
- Semantic elements before ARIA: `<button>` for anything clickable, `<a>` for navigation, `<ul>`/`<li>` for a list, `<form>` for a form. A clickable `<div>` needs a role, a tabindex, and two key handlers to reach what `<button>` gives for free.
- Every input has a label bound to it, every meaningful image an `alt`, every icon-only button an accessible name.
- Loading, error, and empty are three separate states, not one `if (!data) return null`. An empty list is a message, not a blank panel.

## Styling

The styling choice is made once per project, not once per component - use what the repo uses. Within it:

- Static styles live in the styling system (Tailwind classes, a CSS module, a styled component). Never a hardcoded hex or px value that the design tokens already name.
- The inline `style` attribute is for a value computed at runtime only - a progress width, a drag offset, a measured height. Anything static there is a token the next reader has to go hunting for.
- Conditional classes go through the repo's helper (`clsx`, `cn`), not template-literal concatenation.
- No `!important`, and no reaching into another component's internals with a descendant selector.

## Comments

Brief header comment above every component and hook, short action-oriented step comments for the major steps in the body. Inside JSX, skip them - the markup already shows its own structure, so a comment there only earns its place for something invisible in the code (a CSS workaround, a browser quirk, an accessibility requirement).

```tsx
// Render the session table with the newest first
export function SessionTable({ sessions }: Props) {
  // Sort newest first
  const ordered = [...sessions].sort((a, b) => b.createdAt - a.createdAt);

  // Cap the visible rows
  const visible = ordered.slice(0, MAX_ROWS);

  return (
    <ul>
      {visible.map((session) => (
        <li key={session.id}>{session.id}</li>
      ))}
    </ul>
  );
}
```

## Helpers

Don't split one operation into helpers used once - in React this bites hardest on two specific reflexes:

- **A subcomponent used once.** `<SessionRow />` rendered in exactly one `.map()` inside one parent is a JSX fragment, not a component. Inline it unless it takes its own state, is memoized for a measured reason, or a second parent renders it.
- **A hook that wraps one component's body.** `useSessionTable()` called only by `SessionTable` is that component's body with an extra file to open. Custom hooks earn their place when two or more components share the logic.

```tsx
// Before - a component nobody else renders
function SessionRow({ session }: { session: Session }) {
  return <li>{session.id}</li>;
}

export function SessionTable({ sessions }: Props) {
  return <ul>{sessions.map((s) => <SessionRow key={s.id} session={s} />)}</ul>;
}
```

```tsx
// After - Render the session table
export function SessionTable({ sessions }: Props) {
  return <ul>{sessions.map((session) => <li key={session.id}>{session.id}</li>)}</ul>;
}
```

## Memoization

- Without the React Compiler: memoize (`useMemo`/`useCallback`/`memo`) only after a measured re-render cost. Premature memoization adds a dependency array to keep correct for a benefit nobody observed.
- With the compiler enabled: write new code with no manual memoization and let it do the work. Leave memoization that is already there alone - React's own guidance is that removing it can change the compiled output, so it goes only with testing behind it.
- `memo` on a component whose call site passes a fresh object or arrow function literal does nothing. Fix the call site or drop the `memo`.

## Structure

- One component's concern per file. A component needing "and" in its name (`UserListAndFilters`) is two components.
- A component you have to scroll twice to read is a file boundary the reader is asking for. Split it by concern, not to hit a line count.

The default shape when the repo has none of its own, App Router flavoured:

```
src/
  app/            # routes; api/ for route handlers, (group)/ for layout groups
  components/     # ui/ primitives, forms/, layouts/
  hooks/          # shared hooks only - a one-component hook stays in that component's file
  lib/            # api clients, utils, constants
  types/          # types shared across features
  styles/
```

A feature owning several files gets its own folder with its components, hooks and types beside each other. Four top-level directories to touch for one feature is a structure that fights the work.

## File naming

- `SessionTable.tsx` - PascalCase, matching the component and its export exactly.
- `useSessionList.ts` - camelCase with the `use` prefix, one hook per file, and only once a second component uses it.
- `formatDuration.ts` - camelCase for utilities, named for what it does.
- `session.types.ts` for types shared across features; `SessionTable.test.tsx` beside the component it tests.

## API endpoints

React itself has no endpoint handlers, but a framework route handler colocated in the same project (Next.js `route.ts`, Remix/React Router action) gets the header comment from `typescript.md`:

```typescript
// GET /v1/sessions - Get sessions
export async function GET(req: Request) {
  ...
}
```

The response envelope is the same one, imported rather than re-declared per route:

```typescript
// POST /v1/sessions - Create a session
export async function POST(req: Request) {
  // Reject a body the schema does not accept
  const body = createSession.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }

  const session = await sessions.create(body.data);

  return NextResponse.json({ success: true, data: session }, { status: 201 });
}
```

A server action is not a route: it takes the header comment from rule 2, not a `METHOD /path` line, because there is no path to grep for.

## Version notes

React 18 and 19 are both in scope. Everything below is 19-only unless marked - check `package.json` before reaching for it.

- `ref` is a normal prop on function components, so new components need no `forwardRef`; React plans to deprecate and remove it. On 18, `forwardRef` is still the only way.
- `<Context value={...}>` renders as the provider directly. `<Context.Provider>` still works and is what 18 requires.
- `use(promise)` and `use(Context)` read a resource during render, including after an early return - which no 18 hook can do.
- Forms: `useActionState` for submit state plus errors, `useFormStatus` (from `react-dom`) for a nested submit button, `useOptimistic` for pending UI. These replace the hand-rolled `isSubmitting` boolean. On 18, `useTransition` plus a `useState` error field is the equivalent, and it is more code.
- `useTransition` accepts an async function in 19; on 18 the callback must be synchronous.
- Cleanup functions can be returned from a `ref` callback.
- `useEffectEvent` (19.2, stable) reads the latest props and state inside an Effect without listing them as dependencies. It is the sanctioned answer to a dependency you were about to silence with a lint comment.
- `<Activity mode="hidden">` (19.2) keeps a subtree mounted but inert instead of unmounting and losing its state.

## Testing

- React Testing Library, queried the way a user finds things. Its own priority order: role and label first (`getByRole`, `getByLabelText`), then text, then `getByTestId` as a last resort for something with no accessible handle.
- Assert on what the user sees, not on state, props, or render counts.
- `userEvent` over `fireEvent` - it dispatches the whole sequence a real interaction produces (pointer, focus, keydown), where `fireEvent` dispatches one synthetic event.
- `await findBy*` rather than wrapping a `getBy*` in `waitFor`.
- No whole-component snapshots. They fail on every change and assert nothing a reader can name.

## Tooling

- `eslint-plugin-react-hooks` at `@latest` with its flat config recommended preset - it carries `rules-of-hooks` and `exhaustive-deps`, and current versions also surface the React Compiler diagnostics. Never silence `exhaustive-deps` with a comment: a dependency you want to omit is a design problem in the Effect (on 19.2, `useEffectEvent` is the fix).
- `eslint-plugin-jsx-a11y` for the accessibility rules under Rendering.
- React Compiler (1.0 and up) if the project is on 19. It also supports 18 via `target: '18'` in its config plus the `react-compiler-runtime` package - useful before a 19 upgrade, not instead of one.
- Vitest plus React Testing Library for a new project; match the repo otherwise.
- `"jsx": "react-jsx"` in `tsconfig.json`, and the rest of the TypeScript setup from `typescript.md`.
