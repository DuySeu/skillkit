---
name: refactor-structure
description: Method for improving code structure and readability without changing behaviour. Use when the user asks to refactor, clean up, tidy, simplify, or reorganize code; wants to split a large file, class, or function; reduce duplication; improve naming; extract a module; fix messy or tangled code; or improve separation of concerns and maintainability.
---

# Refactoring structure

## Precondition

Behaviour must not change. Before moving anything, check whether tests cover it. If they don't, say so first and either write the covering test or state the risk plainly — don't refactor blind and call it safe.

## Order of operations

1. **Rename first.** Cheapest change, highest signal, and it often reveals that the real problem was only ever a bad name.
2. **Extract along seams that already exist** — a block with a clear input and output, a loop body, a branch. Don't invent new seams.
3. **Move files last.** Moving code before you understand the boundaries just relocates the mess.

## Smells worth fixing

- A function over ~50 lines, or one that needs "and" to describe → split it.
- The same 3+ lines in 3+ places → extract. Twice is a coincidence, not a pattern.
- Nesting deeper than 3 levels → guard clauses and early returns.
- A file whose exports have nothing to do with each other → split by responsibility.
- A parameter list longer than 4 → group them into a struct or dataclass.
- A comment explaining *what* the code does → rename until the comment is redundant, then delete it.
- Boolean flag parameters that select behaviour → two functions.

## Do not

- Don't add an abstraction that has one caller. Wait for the second.
- Don't introduce a named design pattern unless it removes duplication that actually exists.
- Don't reformat lines you weren't otherwise touching — it buries the real diff.
- Don't mix a refactor with a behaviour change or a bug fix in the same commit.
- Don't "improve" code the task didn't ask about. Note it in one line instead.

## Done means

The same tests pass, unchanged. The diff is small enough to review. You can state in one sentence what is now easier to do than before — if you can't, the refactor had no point.
