# Traps that produce wrong maps

Read before Orientation Phase 2 / Trace (and on a tricky Locate). Confirm by name when tracing.

- **Barrel files.** `index.ts` / `__init__.py` that only re-export. The symbol lives elsewhere; follow the export to its definition before citing it.
- **Assembled route strings.** A router mounted at `/api/v1` with a handler declared as `/users` means grepping for `"/api/v1/users"` finds nothing. Search for the leaf segment, then find the mount point.
- **Same filename, different package.** In a monorepo, `service.ts` is ambiguous. Full paths always.
- **Framework magic.** File-system routing, annotation scanning, auto-registration — the "caller" doesn't exist in source. Say the convention is what wires it, and cite the convention's config.
- **Config-driven behaviour.** The answer is in a YAML file, a feature flag, or an env var, and the code just branches on it. Find the default and say where it's set.
- **Generated code that reads as hand-written.** API clients, ORM models, protobuf output. Check for a codegen config before explaining "the author's design".
- **Two implementations, one live.** A migration in progress or a flagged rewrite. Both look real; only one runs. Find the switch.
- **Tests for code that no longer runs.** A passing test suite is not proof a path is wired into the running app.
- **README feature lists.** Docs invent or omit capabilities. Phase 1 features come from routes, commands, exports, and workers you opened — not marketing copy.
- **Absence framing.** Listing what the repo is *not* crowds out what it *is*. Say the contents; leave gaps for Coverage or when the user asks what is missing.
