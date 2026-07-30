/** Minimal class joiner — enough for this app, no dependency needed.
 *  Takes unknown so `someReactNode && "class"` guards type-check: anything
 *  that isn't a non-empty string is simply dropped. */
export const cn = (...parts: unknown[]) =>
  parts.filter((p): p is string => typeof p === "string" && p !== "").join(" ");
