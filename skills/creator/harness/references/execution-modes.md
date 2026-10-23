# Execution modes in detail - the three modes of harness v2

This document describes the main features, constraints, and selection criteria of the three execution modes that harness v2 provides. It supplements Step 2-1 of `SKILL.md`.

---

## Table of contents

1. [Mode A: workflow orchestration](#1-mode-a-workflow-orchestration)
2. [Mode B: persistent agent collaboration](#2-mode-b-persistent-agent-collaboration)
3. [Mode C: subagent delegation](#3-mode-c-subagent-delegation)
4. [Decision tree for choosing an execution mode](#4-decision-tree-for-choosing-an-execution-mode)
5. [Migrating from v1 to v2](#5-migrating-from-v1-to-v2)

---

## 1. Mode A: workflow orchestration

Runs an orchestration script with the `Workflow` tool. Control flow such as distributed execution (fan-out), iteration, and conditional branching is decided by **code**, not judged by the model on the fly. So the same input is easy to reproduce with the same structure, and it also suits running many agents in parallel.

```
[Main agent] → Workflow(script)
           ├── phase('Explore'): pipeline(items, item => agent(...))
           ├── phase('Verify'): for each finding, look for evidence that refutes it and verify (parallel)
           └── return { confirmed }   ← structured final result
```

**Main features:**
- `agent(prompt, opts)`: Runs a subagent. If you set a JSON Schema in `opts.schema`, it returns a structured object that has already passed schema validation. No separate parsing is needed, and it retries automatically if the output does not match the schema. If you set `opts.agentType`, you can use a custom type defined in `.claude/agents/`. `opts.effort` adjusts reasoning effort, and `opts.isolation: 'worktree'` isolates file changes.
- `pipeline(items, stage1, stage2, ...)`: Each item passes through several stages independently. There is no synchronization barrier between stages, so **use it by default for multi-stage work.**
- `parallel(thunks)`: A synchronization barrier that waits until all tasks finish. Use it only when the next stage needs **all** of the previous stage's results. Deduplication and early termination based on the total count are examples.
- `phase(title)` / `log(msg)`: Groups progress for display and tells the user what is currently being worked on.
- `budget`: Ties in with the token budget the user specified (for example "+500k"). Use `budget.total` and `budget.remaining()` to adjust the scale of the work dynamically.
- `workflow(nameOrRef, args)`: Runs another workflow nested up to one level. Use it to delegate work hierarchically.

**Characteristics:**
- Because code decides the control flow, the same input follows the same execution structure.
- Because it uses structured output (`schema`), data that matches the schema can be passed between stages.
- `resumeFromRunId` lets you continue an interrupted run. An unchanged `agent()` call returns its cached result immediately, so re-running only part of the work costs little.
- It runs in the background and sends a notification when the work finishes.

**Constraints:**
- **The user must ask first.** It can be used only when the user directly asked for a workflow or for orchestration of several agents, or when a skill that explicitly calls `Workflow` was run. An orchestration skill made by the harness falls under the second case. Even so, keep the default number of agents low, and use large-scale distributed execution only when the user explicitly asks for it.
- Scripts may use only plain JavaScript; TypeScript syntax is not allowed. `Date.now()`, `Math.random()`, and `new Date()` without arguments interfere with resuming a run, so they cannot be used. Pass timestamps through `args`.
- The `meta` block may contain only literals. Variables, function calls, and spread syntax are not allowed.
- There is an upper limit on the number of agents that can run at the same time per session. Work beyond the limit is queued automatically. The total number of agents that can be called while one workflow runs is also limited, to prevent excessive execution.
- An `agent()` that failed or was skipped returns `null`. `parallel()` does not throw an exception even when a call fails, so always apply `.filter(Boolean)` to the results.
- The `parallel()` barrier only aligns when the tasks finish; it does not prevent edits after they finish. In mixed mode, a named agent woken with `SendMessage` after a workflow stage ends can edit that stage's output files, so freeze the outputs at the boundary where the mode changes (Step 4 of Template B in `orchestrator-template.md`).

**Well-suited work:** Distributed execution where the list can be fixed in advance, such as N files or M perspectives; repeating until no new items remain (Loop-until-dry) and adversarial verification; large-scale migrations and audits; generating structured reports

**Poorly suited work:** Work where the list cannot be fixed in advance because the targets have to be found while the conversation continues; work that needs frequent consultation with the user midway

> For concrete script skeletons and points to watch out for, see `workflow-recipes.md`.

## 2. Mode B: persistent agent collaboration

Runs named agents and coordinates them with a shared task list and `SendMessage`. It replaces the "agent team" mode of v1.

**Biggest difference from v1:** `TeamCreate` and `TeamDelete` no longer exist. An explicit team object is not created as in v1; agents that you run with a name in the session automatically belong to a single collaboration group.

```
[Main agent (leader)]
    ├── Agent(name: "researcher", subagent_type: "...", prompt: ...)   ← runs in parallel
    ├── Agent(name: "critic", ...)
    ├── TaskCreate(task + dependencies) → shared task list
    ├── SendMessage({to: "researcher"}, ...)  ← further instructions while keeping the conversation context
    └── Receive completion notifications → collect results → final wrap-up
```

**Main features:**
- `Agent(name: ..., subagent_type: ..., model: ..., prompt: ...)`: If you set `name`, it becomes a persistent agent that can be called again with `SendMessage`. It runs in the background by default and sends a notification when it completes. If you must wait until the work finishes, set `run_in_background: false`.
- `SendMessage({to: name})`: Lets a previously started agent continue its work **while keeping the conversation context**. Needed when results are exchanged and revised repeatedly.
- `TaskCreate` / `TaskUpdate` / `TaskList` / `TaskGet`: Share the task list. They manage dependencies between tasks and their progress status, and are used when a supervisor assigns tasks as progress unfolds.
- `TaskStop`: Stops background tasks that are running excessively or are no longer needed.

**Characteristics:**
- Because agents remember the earlier conversation and work history, they can handle follow-up requests such as "fix only section 2 of the draft you made earlier in this session".
- Agents can share what they find, discuss differing opinions, and adjust the direction of the work immediately.
- The same specialist agent can keep being used for as long as the session lasts.

**Constraints:**
- The main agent (leader) coordinates directly, so the more agents there are, the more work piles up on the leader. 3 to 5 agents is a suitable number.
- Deeply nested delegation slows responses and makes the conversation context easy to lose. Delegating within two levels is recommended.
- It uses more tokens than calling a subagent only once.
- A named agent still receives messages after it reports completion, so while answering another agent's late question it may edit an output it has already handed over. If the next stage reads that output, freeze the output at the stage boundary. The freezing procedure is in Step 4 of Template B in `orchestrator-template.md`.

**Well-suited work:** Work where a writer and a verifier exchange results and revise repeatedly; work where inconsistent data is discussed and merged into one; work where a supervisor assigns tasks as progress unfolds; work that needs specialist agents throughout the session

**Poorly suited work:** One-off work where only the result is needed; large-scale distributed execution where the task list can be fixed in advance

## 3. Mode C: subagent delegation

Hands work to a subagent with a single call of the `Agent` tool. Only the result returns to the main agent, and the agents do not communicate with each other.

```
[Main agent] → Agent(sub A) ─┐
             → Agent(sub B) ─┼→ (parallel, background execution by default) → receive completion notifications → collect results
             → Agent(sub C) ─┘
```

**Characteristics:**
- Low execution overhead and fast. The main agent receives summarized results.
- Independent calls **bundled into one message** run at the same time.
- It runs in the background by default. If you need the result right away, set `run_in_background: false`.
- The main agent waits for the results instead of redoing a search it has already delegated.

**Constraints:**
- Agents cannot communicate with each other, and the conversation context does not continue after a call ends. To start fresh as a new task, call without `name`.
- The main agent handles all coordination.

**Well-suited work:** One-shot research and collection; work where you pick the experts you need and receive only the results; a single independent verification

**Poorly suited work:** Work that requires exchanging results and revising repeatedly; large-scale distributed work whose execution flow can be fixed in advance

## 4. Decision tree for choosing an execution mode

```
Can the task list, verification criteria, and iteration conditions be expressed as code in advance?
├── Yes → workflow orchestration (Mode A)
│        Code decides the control flow instead of the model judging it.
│        However, keep the condition that the user must ask first, and do not increase the number of agents more than necessary.
│
└── No → Does quality improve only if results are exchanged repeatedly and the conversation context continues?
          ├── Yes → persistent agent collaboration (Mode B)
          │
          └── No → Are there two or more agents?
                    ├── Yes → parallel subagent delegation (Mode C)
                    └── No → single subagent call (Mode C)
```

**Choosing a mixed mode:** If the answer to the questions above differs by stage, mix the execution modes. The following combinations are the ones mainly used.

| Combination | Structure | Example |
|------|------|------|
| Workflow collection → persistent integration | A → B | Split and collect materials in bulk, then the team discusses inconsistent data and reaches agreement |
| Persistent generation → workflow verification | B → A | After the team produces a draft, run adversarial verification in a distributed way for each finding |
| Subagent preliminary research → workflow main work | C → A | The main agent or a subagent first identifies the task list, then passes that list to the workflow through `args` |

**Principle of checking the list before orchestrating:** Before starting a workflow, take a quick look at the file list, review targets, and research items to fix the task list. Understanding the shape of the work before running it makes the script simpler and reduces unnecessary work.

## 5. Migrating from v1 to v2

If you find an orchestration skill or agent definition made by an existing v1 harness, propose converting it to the v2 format according to the table below.

| v1 element | Status | v2 replacement |
|---------|------|---------|
| `TeamCreate(team_name, members)` | **Removed** | Run `Agent(name: ...)` in parallel in one message. Named agents belong to the collaboration group that is formed automatically in the session, so there is no need to create a team object separately. |
| `TeamDelete` / "team cleanup" step | **Removed** | Delete that step. Agents end naturally when they finish their work, and you can stop them with `TaskStop` if needed. |
| "Only one team active per session" constraint | **Form changed** | Since the explicit team object is gone, the v1 constraint does not apply. Named agents work together in the collaboration group that is formed automatically in the session. |
| `SendMessage({to: "all"})` broadcast | Changed | Send `SendMessage` individually only to the recipients who need it. |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` | **Not needed** | Remove it from both documents and scripts. |
| Forcing `model: "opus"` on every agent | Policy abandoned | Choose a model for each agent according to the nature of its work. If the judgment is ambiguous, use `sonnet`, and keep model inheritance only when it is chosen deliberately. |
| Building large-scale distributed execution as a team | Improved | Move it to a `Workflow` script. Code decides the control flow, structured output is used, and the run can be resumed. |
| "Step 0: check conversation context" in the orchestration skill | Kept | Keep the existing procedure, but add the `resumeFromRunId` option to the workflow orchestration mode. |
| `_workspace/` file writing rules | Kept | Use as is. |
| `CLAUDE.md` location guidance and change history | Kept | Use as is. |

**Migration procedure:**
1. In the existing orchestration skill, remove references to `TeamCreate`, `TeamDelete`, broadcasting, and the experimental flag.
2. Find the sections for distributed execution and repeated verification. If the execution flow can be fixed in advance as code, switch to the workflow orchestration mode.
3. Rewrite the remaining collaboration sections in the persistent agent collaboration syntax (`Agent(name:)` + `SendMessage` + `TaskCreate` / `TaskUpdate`).
4. Remove the blanket `model: "opus"` setting from agent definitions, and keep only the settings that have a rationale.
5. Redo the verification in Step 6 (structure verification and trial run) and record it in the `CLAUDE.md` change history.
