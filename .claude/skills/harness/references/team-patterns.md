# Team composition patterns - 6 basic patterns, quality verification, agent definitions

This document supplements Step 2-2 and Step 3 of `SKILL.md`. For each pattern, it describes the execution mode that v2 recommends. Details are in `execution-modes.md`.

---

## Table of contents

1. [The 6 basic patterns](#1-the-6-basic-patterns)
2. [Quality verification patterns (added in v2)](#2-quality-verification-patterns-added-in-v2)
3. [Composite patterns](#3-composite-patterns)
4. [Choosing an agent type](#4-choosing-an-agent-type)
5. [Agent definition structure](#5-agent-definition-structure)
6. [Criteria for splitting agents](#6-criteria-for-splitting-agents)
7. [Designing for agent reuse](#7-designing-for-agent-reuse)
8. [Skills vs agents](#8-skills-vs-agents)

---

## 1. The 6 basic patterns

### 1-1. Pipeline

Tasks are chained in a fixed order. The output of the previous agent becomes the input of the next agent.

```
[Analyze] → [Design] → [Implement] → [Verify]
```

**Fits when:** each step depends heavily on the output of the previous step

**Example:** writing a novel: worldbuilding → characters → plot → drafting → editing

**Caution:** if one step is delayed, the whole job is delayed. Design each step to be as independent as possible.

**Execution mode recommended in v2:** if the steps and items can be listed in advance, **workflow orchestration** is recommended, using `pipeline()`. Each item moves on to the next step as soon as the previous step finishes with it. There is no need to wait for every item in a step to finish, so total run time is also shorter. If a person must review the output between steps, call subagents one after another.

### 1-2. Fan-out/fan-in

Independent tasks are handled at the same time, and then the results are merged into one.

```
          ┌→ [Expert A] ─┐
[Split] → ├→ [Expert B] ─┼→ [Merge]
          └→ [Expert C] ─┘
```

**Fits when:** the same input must be analyzed separately from several perspectives or domains

**Example:** comprehensive research: investigate official sources, press, community, and background at the same time, then compile one report

**Caution:** how the results are merged determines overall quality.

**Execution mode recommended in v2:** consider **workflow orchestration** first. Define the list of perspectives as an array and send it through `pipeline()`, receive results that match the `schema`, then merge them in code. Use `parallel()` only when duplicates must be removed after collecting all results. In that case, the next step starts only after all parallel calls have finished. For research with 2 to 4 people where the researchers must share findings in real time, persistent agent collaboration is also suitable.

### 1-3. Expert Pool

Only the experts that fit the input and situation are selected and called.

```
[Classifier] → { Expert A | Expert B | Expert C }
```

**Fits when:** each input type needs a different way of being handled

**Example:** code review: of the security, performance, and architecture experts, call only the expert for the relevant area

**Caution:** if the classifier agent misclassifies the input, the right expert cannot be selected.

**Execution mode recommended in v2:** use **subagent delegation** and call only the needed experts, once each. If you need to continue the conversation with the same expert, give it a `name` and switch to persistent agent collaboration.

### 1-4. Producer-Reviewer (generate-verify)

A generator agent and a verifier agent work as a pair.

```
[Generate] → [Verify] → (if a problem is found) → rerun [Generate]
```

**Fits when:** the quality of the output must be verified, and objective criteria for the verdict can be set

**Caution:** to avoid endless verify-and-fix loops, set the maximum number of retries to 2 to 3.

**Execution mode recommended in v2:** if the verification criteria can be expressed in code, use **workflow orchestration**. Run parallel verification for each item found by the adversarial verification pattern below. If subjective judgment must be coordinated, run the generator and verifier as **a pair of persistent agents** with names, and exchange feedback through SendMessage. The generator keeps the earlier conversation, so it can fix exactly what was pointed out.

### 1-5. Supervisor

A central agent manages task state and splits work according to progress.

```
              ┌→ [Worker A]
[Supervisor] ─┼→ [Worker B]    ← distributed according to progress
              └→ [Worker C]
```

**Fits when:** the workload keeps changing, or how to split the work must be decided during execution

**Difference from fan-out execution:** fan-out execution decides the allocation before the work starts. The supervisor watches progress and reallocates the work.

**Caution:** if the work is split too finely, the supervisor has to reallocate often and becomes a bottleneck.

**Execution mode recommended in v2:** use **persistent agent collaboration**. The main agent, as leader, registers tasks with `TaskCreate`, receives completion notifications from workers, and then reallocates work with `SendMessage` and `TaskUpdate`. If the task list can be fixed in advance and the allocation procedure can also be written in code, switch to workflow orchestration. In that case the supervisor has no separate judgment to make.

### 1-6. Hierarchical Delegation

A delegated agent in turn hands work to lower-level agents. This is the approach to use when a complex problem is divided into several levels.

```
[Overseer] → [Team lead A] → [Workers A1, A2]
           → [Team lead B] → [Worker B1]
```

**Fits when:** the problem divides naturally into higher-level and lower-level tasks

**Caution:** beyond three levels deep, execution slows down and the content of earlier work may not be passed along properly. **Two levels or fewer is recommended.**

**Execution mode recommended in v2:** orchestrate by nesting workflows. A parent workflow calls a child workflow with `workflow(nameOrRef, args)`. Nested calls are supported only one level deep, which keeps the hierarchy from getting too deep. Alternatively, remove the hierarchy and restructure it as `phase()` calls in a single workflow.

## 2. Quality verification patterns (added in v2)

These are workflow verification patterns to add to harnesses where the accuracy of the output matters. Their purpose is to filter out results that look right at first glance but are actually wrong.

| Pattern | Structure | When to use |
|------|------|------|
| **Adversarial verification** | For each item found, run N independent adversarial verifier agents. Pass only the items that more than half of the N agents judge as `confirmed`, meaning the evidence is sufficient. | When the findings or claims must be trustworthy (review, audit, research) |
| **Perspective-split verification** | Do not give the N adversarial verifier agents the same prompt. Assign them different perspectives such as correctness, security, and reproducibility. | When errors can arise in several types. Splitting the verification criteria finds errors that repeating the same verification would miss. |
| **Jury panel** | Judge N drafts made with different approaches in parallel. Based on the highest-rated draft, write the final version, also reflecting the strengths of the other drafts where needed. | Design or planning with many possible solutions. Comparing several drafts is better than revising one draft over and over. |
| **Loop-until-dry** | Repeat the search until the number of newly found items is 0 for K runs in a row. Also record rejected items in `seen` so the same item is not proposed again and again. | Searches where you cannot know how many problems there are (bugs, issues, edge cases). If you fix the number of runs in advance, you may miss problems that would have been found later. |
| **Search by multiple criteria** | Run agents in parallel that search by different criteria such as container, content, entity, and time. | When a single search criterion cannot find everything |
| **Omission review** | At the end, have one agent that only checks: "Which search criteria were not used? Which claims were not verified? Which materials were not read?" | Right before merging results. Put any newly found omissions into the next search task. |
| **Disclose the number of excluded items** | If you limit the scope of checking with `top-N` or sampling, always record the number of excluded items with `log()`. | All fan-out execution. If the excluded number is not disclosed, the user wrongly understands that everything was checked. |

**Scaling principle:** set the scale according to the scope of investigation the user requested. For "see if there are bugs", use a small number of searchers and one adversarial verifier agent. For "audit this thoroughly", increase the searchers, have 3 to 5 adversarial verifier agents verify each item found, and then go through a synthesis step. If the scope of the request is hard to judge, do research, review, and audit carefully, and run quick checks at a small scale.

> Implementation examples are in `workflow-recipes.md`.

## 3. Composite patterns

In real work, several patterns are combined.

| Composite pattern | Composition | Example |
|----------|------|------|
| **Fan-out/fan-in + generate-verify** | Create several drafts at the same time, then verify each | Multilingual translation: translate into four languages in parallel, then a native-speaker reviewer for each language inspects it |
| **Pipeline + fan-out/fan-in** | Some of the sequential steps are processed in parallel | Analysis (sequential) → implementation (parallel) → integration test (sequential) |
| **Supervisor + expert pool** | The supervisor calls the expert that fits the situation | Handling customer inquiries: the supervisor classifies the inquiry and then assigns it to the right expert |
| **Search + adversarial verification + synthesis** | Search by multiple criteria → verify each item found → omission review → write the report | Comprehensive code audit, in-depth research |

In a composite pattern, choose the execution mode that fits each step. This kind of composition is called a mixed mode. The selection criterion is whether the control flow of that step can be fixed in code in advance.

## 4. Choosing an agent type

When calling an agent, specify the type with the `subagent_type` parameter of the Agent tool or the `agentType` parameter of Workflow.

### Built-in types

| Type | Tools available | Suitable use |
|------|----------|-----------|
| `general-purpose` | All (including WebSearch, WebFetch) | Web research, general tasks, file edits |
| `Explore` | Read-only (no Edit, Write) | Finding where code is in a codebase. Do not use it for review or audit. |
| `Plan` | Read-only (no Edit, Write) | Architecture design, writing implementation plans |

### Custom types

Define a type in `.claude/agents/{name}.md`. When calling, specify `subagent_type: "{name}"` or `agentType: "{name}"`. The tools and model to use are set in the YAML frontmatter (the header).

### Selection criteria

| Situation | Recommended | Reason |
|------|------|------|
| The role is complex and reused across several sessions | **Custom type** | The expert role and working principles are managed consistently in a file. |
| Simple one-off research or collection, and a detailed prompt alone is enough | `general-purpose` + detailed prompt | Use the built-in type directly, without a separate definition file. |
| Only searching for where code is | `Explore` | It has no file-editing tools, so there is no risk of editing by mistake. |
| Only writing a design or plan | `Plan` | It focuses on analysis, without changing code. |
| Simple one-off file edit | `general-purpose` + detailed prompt | Handle it right away with the built-in type. |
| Implementation that is reused or needs specialized rules | **Custom type** | Allow all the tools needed and apply specialized instructions. |
| Editing several files in parallel | Custom type + `isolation: 'worktree'` | Prevents file-edit conflicts between agents. Creating a worktree has a cost, so use it only when editing in parallel. |

**Principle:** create an expert role to be reused across several sessions as a custom type in `.claude/agents/{name}.md`. Do not create a separate definition file for one-off work that uses a built-in type as it is.

**Model policy:** choose the model tier based on task complexity, expected task duration, the range of decisions the agent must make on its own, and the response speed needed. **fable** is for the highest-difficulty work that must be planned and run autonomously over a long time, and for agent orchestration. **opus** is for design and architecture, code generation, complex analysis, cross-verification, and creative work. **sonnet** is for structured work with little to decide, such as log analysis, format conversion, static file inspection, running deployment scripts, and simple collection. If you cannot decide, choose sonnet. Do not assign the same model to every agent without a reason, and leave the reason for the choice as a comment. Detailed criteria are in `model-selection-guide.md`.

## 5. Agent definition structure

```markdown
---
name: agent-name
description: "Describe the role in one or two sentences and list the phrases that act as trigger conditions."
# tools: Read, Grep, Glob, Bash        ← optional: specify when limiting the tools to use (read-only reviewers, etc.)
#                                         for agents that edit the output, include Edit along with Write
# model: sonnet                         ← choose to fit the task (model-selection-guide.md), record the reason for the choice as a comment
---

# Agent Name - one-line role summary

You are a [role] expert in [domain].

## Core roles
1. Role 1
2. Role 2

## Working principles
- Principle 1 (also write the reason. That way the same standard applies to judgments in exceptional situations.)
- Principle 2

## Input and output rules
- Input: [what is received from where - file path, args, output of the previous step]
- Output: [what is written where - _workspace/ path or structured return value]
- Format: [file format, structure, schema]

## Communication rules (persistent agent collaboration)
- First report: tell the leader the list of tools you can actually use (to check whether a tool listed in `tools` is missing)
- Receiving messages: [what messages are received from whom]
- Sending messages: [what messages are sent to whom]
- Shared tasks: [what types of tasks are registered or requested]

## When called again
- If there is a previous output, read it and reflect the improvements.
- If you receive user feedback, edit only that part.

## Error handling
- [what to do on failure]
- [what to do when the input is missing or ambiguous]

## Collaboration
- Relationship with other agents
```

**Workflow-only agents:** put a "Structured output" section in place of "Communication rules". State the JSON structure to return, and write that the final text is **return data**, not a message to the user.

**Cautions when limiting `tools`:**

- For an agent that edits the output, give Edit along with Write. If it has only Write, it has to rewrite the whole file even to fix one line. If the output is large, the agent gives up on editing and works around it by writing to a different file, so the original output is left unfixed.
- Deferred-loading tools such as `TaskCreate` and `TaskUpdate` have been cases where they were not provided at run time even when listed in `tools` (observed in Claude Code 2.1.226, and may differ by environment). `SendMessage`, which is also a deferred-loading tool, was provided, so the boundary of which tools go missing is not clear. Have persistent agents report the list of tools they can actually use in their first report. If a tool is missing, the orchestrator handles that work on its behalf (for example, the leader updates task state with `TaskUpdate`) or you lift the `tools` restriction in the definition file.

## 6. Criteria for splitting agents

| Criterion | Split | Merge |
|------|------|------|
| Expertise | Split if the areas of responsibility differ | Merge if the areas of responsibility overlap |
| Parallelism | Split if they can run independently of each other | Consider merging if they must be handled in order |
| Information needed | Split if one agent would have to handle a lot of information | Merge if the information needed is small and the work is short |
| Reusability | Split if other teams could reuse it | Consider merging if only this team uses it |

## 7. Designing for agent reuse

Before creating a new agent, compare its role with the existing agents in `.claude/agents/`. If you build or extend harnesses several times, agents with the same role can pile up under different names.

| Relationship to existing agents | Action |
|------|------|
| An existing agent fully covers the new role | Do not create a new one; call the existing agent. |
| Only partly overlaps, and generalizing the existing agent lets it take on the new role too | Generalize and extend the existing agent. |
| Partly overlaps, but the domain was deliberately specialized | Create a new, separate agent. |
| The role scope is completely different | Create a new one. |

**Principle:** the more an agent focuses on a single role, the easier it is to reuse and the less duplication there is. If the extended result has two or more roles, first consider whether it can be split.

**When extending an existing agent:** the behavior of the orchestrators that call that agent may also change. Before extending, check which orchestrators call this agent, and reflect the broadened role in its `description`. After extending, confirm with a dry run (Step 6-5 of `SKILL.md`) that the existing flow still works as before.

## 8. Skills vs agents

| Category | Skill | Agent |
|------|-------------|-----------------|
| Definition | A collection of work procedures and tools | An expert role and behavior principles |
| Location | `.claude/skills/` | `.claude/agents/` |
| Run condition | When the user request matches the applicability conditions written in `description` | When called directly with the Agent or Workflow tool |
| Purpose | "How it is done" | "Who does it" |

### Ways to connect skills and agents

| Method | Implementation | Fits when |
|------|------|-----------|
| **Call through the Skill tool** | State `Call /skill-name with the Skill tool` in the agent prompt | The skill is a standalone workflow and the user may also call it directly |
| **Include directly in the prompt** | Write the skill content directly in the agent definition | The skill is short, 50 lines or fewer, and only that agent uses it |
| **Load a reference file** | Read the skill's `references/` file with `Read` only when needed | The skill content is large and is needed only under specific conditions |

Call a skill that several agents share through the Skill tool. Put a short skill that only a specific agent uses directly into the prompt, and if its content is large, load only the reference files needed.
