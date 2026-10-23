# Orchestrator skill templates (v2)

The orchestrator coordinates the whole team. This file provides three templates, one per execution mode, and also explains how to combine execution modes step by step.

- **Template A: workflow orchestration**, for large-scale distributed execution with a predetermined control flow, or repeated verification
- **Template B: persistent agent collaboration**, for repeated feedback, negotiation, and long-term collaboration where agents must retain earlier conversation content
- **Template C: subagent delegation**, for handing off independent tasks in parallel once each and collecting only the results
- **Mixed mode**, which combines the suitable execution mode for each step

Every template checks for existing work in Step 0. It must also include the `_workspace/` file layout rules, the error handling methods, and the test scenarios.

---

## Template A: workflow orchestration

```markdown
---
name: {domain}-orchestrator
description: "Orchestrates the {domain name} workflow. Use when the user asks with one of {initial trigger keywords}, and also for follow-up work such as modifying {domain name} results, partial re-runs, updates, supplements, re-runs, and improving previous results."
---

# {Domain} orchestrator

## Execution mode: workflow orchestration

This skill uses the Workflow tool to orchestrate work whose control flow is predetermined. When the user invokes this skill,
it is treated as consent to use Workflow. The default number of agents is limited to {N}. The number of agents is increased only when the user
asks for "thoroughly", "exhaustively", or "all".

## Agent composition

| Role | `agentType` | Skill | Deliverable (`schema` summary) |
|------|-----------|------|--------------------|
| {collector} | {custom or default} | {skill} | {findings: [...]} |
| {verifier}  | {custom or default} | {skill} | {status, reason} |

For `{custom or default}`, write the name of a user-defined type or a built-in type.

## Procedure

### Step 0: Check for existing work (handle follow-up requests)

1. Check whether `_workspace/` exists.
   - If it does not exist → run from the beginning
   - If it exists and the request is to fix only part of it → re-run only that part
   - If it exists and new input was received → move the existing `_workspace/` to `_workspace_{ts}/` and run fresh
2. If re-running only part and the `runId` of the previous run is in `_workspace/run_meta.json`, handle it as follows.
   - Modify only that step in the script, then resume with `resumeFromRunId`. `agent()` calls whose content has not changed
     immediately return the cached result, so the execution cost is low.
3. For a fresh run, receive a new `runId` and record it in `_workspace/run_meta.json`.

### Step 1: Finalize the task list (performed directly by the main agent)

Before starting the workflow, briefly look through the {file list / research axes / review targets} and organize them into an array.
Pass the organized list to the script as `args`.

### Step 2: Run the workflow

Pass the following script to the Workflow tool. See `workflow-recipes.md` in the harness skill for detailed examples.

- `meta`: `name` is '{domain}-run', `phases` is [{collect}, {verify}, {synthesize}]
- Collect: pipeline(args.items, item => agent(..., {schema: COLLECT}))
- Verify: adversarial verification for each finding found → .filter(Boolean) → pass only the items that passed verification to the next step
- Synthesize: return the structured result

After the call, wait for the completion notification. Do not presume the result before receiving the notification.

### Step 3: Organize and report the results

1. Receive the value returned by the workflow.
2. If any items were excluded or are missing, state this in the report without fail.
3. Create the final deliverable at `{output-path}/{filename}`.
4. Leave the intermediate outputs and `run_meta.json` in `_workspace/`.

## Error handling

| Situation | Response |
|------|------|
| An individual `agent()` fails (returns `null`) | Exclude it with `.filter(Boolean)` and record the number of excluded items with `log()`. State the missing items in the report as well. |
| The whole workflow fails | Check the actual return values in the `journal`, fix only the failed step, and resume with `resumeFromRunId`. |
| A failure where retrying is futile (usage limit exhausted, authentication expired, permission denied) | Do not retry or resume until the cause is resolved, because that only consumes the remaining quota. Open the `journal` and the partial deliverables directly to check how far the run actually got, record what is missing in a file under `_workspace/`, and report to the user. For a usage limit, also tell them when it will be lifted. After the cause is resolved, the run can continue with `resumeFromRunId`. The main agent fills in only the facts it has checked directly, and does not guess at the agent's judgments (for example, which material was excluded and why). |
| The result is empty | Do not wrongly judge it a success. Check the actual return value of each agent in the `journal`. |
| Conflicting data | Do not delete it; record it together with its source. |

## Test scenarios

### Normal flow
1. When the user provides {input}, the preliminary check finalizes {M} items.
2. The workflow collects the {M} items, and if {K} of them pass verification, the results are organized.
3. Expected result: `{output-path}/{filename}` is created and the run information is recorded in `run_meta.json`.

### Error flow
1. In the collect step, two items return `null`.
2. Exclude those items with `.filter(Boolean)` and announce "2 items excluded" with `log()`.
3. Write "{item name}: collection failed for 2 items" in the final report.
```

---

## Template B: persistent agent collaboration

```markdown
---
name: {domain}-orchestrator
description: "Orchestrates the collaboration of {domain name} agents. Use when the user asks with one of {initial trigger keywords}, and also for follow-up work such as modifications, partial re-runs, updates, supplements, re-runs, and improving previous results."
---

# {Domain} orchestrator

## Execution mode: persistent agent collaboration

Unlike v1, no explicit team object is created. Agents that are started with a name in the session automatically
belong to a single collaboration group. TeamCreate and TeamDelete are tools that were used only in v1.

## Agent composition

| Name | `subagent_type` | Role | Skill | Deliverable |
|------|--------------|------|------|------|
| {teammate-1} | {custom or built-in} | {role} | {skill} | {output-file} |
| {teammate-2} | {custom or built-in} | {role} | {skill} | {output-file} |

For `{custom or built-in}`, write the name of a user-defined type or a built-in type.

## Procedure

### Step 0: Check for existing work
As in Template A, check whether `_workspace/` exists and decide whether to run for the first time, re-run only part,
or run fresh. If re-running only part, put the previous deliverable paths in the agent prompt
so that the agent reads and reflects the existing results.

### Step 1: Preparation
1. Analyze the user input to determine {what is being identified}.
2. Create `_workspace/` and save the input in `_workspace/00_input/`.

### Step 2: Start agents and register tasks

1. Start the agents in parallel in one message. `name` is required and is used to specify the target in SendMessage.
   - Agent(name: "{teammate-1}", subagent_type: "{type}", prompt: "{role + task instructions + output path}")
   - Agent(name: "{teammate-2}", subagent_type: "{type}", prompt: "...")
2. Register the shared task list.
   - TaskCreate({title: "{task 1}", assignee: "{teammate-1}"})
   - TaskCreate({title: "{task 3}", depends_on: [task 1]})
   > 3~6 tasks per teammate is appropriate. State dependencies between tasks explicitly with `depends_on`.

### Step 3: Coordinate the collaboration

- Proceed while receiving the teammates' task-complete and waiting notifications. Check overall progress with TaskList.
- Request a review with SendMessage({to: "{teammate-2}"}, "Review the draft in {teammate-1}'s _workspace/01_...
  and tell me what needs to be fixed"). Pass the reply to {teammate-1} so that it makes the fix.
  Because the agent retains earlier conversation content, you can narrow the scope of an instruction, such as "only section 2 of that draft from earlier".
- If teammates need to discuss what they found, the leader relays the messages. Always leave deliverables as files.

**Deliverable storage locations:**

| Teammate | Output path |
|------|----------|
| {teammate-1} | `_workspace/{phase}_{teammate-1}_{artifact}.md` |
| {teammate-2} | `_workspace/{phase}_{teammate-2}_{artifact}.md` |

### Step 4: Freeze deliverables

A named agent still receives messages after it reports completion. If it modifies a deliverable it has already handed over while answering another teammate's late question, the next step ends up reading and working from the content before the change. Messages in which teammates cross-check each other can catch errors, so they are not blocked. Instead, freeze the deliverables each time the work passes to the next step, so that the files the next step reads do not change midway.

1. Use TaskList and the completion notifications to confirm that every teammate responsible for the previous step has reported completion.
2. Announce the freeze to those teammates with SendMessage. Example: "The {phase} deliverables are frozen. If anything needs fixing afterward, do not modify the existing files; write it as a new version file such as `{phase}_{teammate}_{artifact}_v2.md` and tell the leader."
3. Record the deliverable hashes. Example: `shasum _workspace/{phase}_* > _workspace/freeze_{phase}.sha` (`md5sum` may also be used)
4. Pass the deliverable paths and the hash file path together in the prompt of the agent responsible for the next step.

If there are multiple collaboration steps, follow the same procedure at each step boundary.

### Step 5: Integration
1. Use TaskList to confirm that all tasks are finished.
2. Read each deliverable with Read and apply the {integration/verification logic}.
3. Right before creating the final deliverable, recompute the hashes as in `shasum -c _workspace/freeze_{phase}.sha` to confirm that the frozen deliverables have not changed. If a hash differs or a new version file has appeared, check what changed and decide whether to re-run the step that read the content before the change.
4. Create the final deliverable at `{output-path}/{filename}`.

### Step 6: Wrap-up
1. Leave `_workspace/` so that the work can be verified later and the work process can be reviewed.
2. Summarize the results and report them to the user.
   There is no procedure for disbanding the team. Agents terminate automatically when their work is finished, and can be stopped with TaskStop if needed.

## Error handling

| Situation | Response |
|------|------|
| A teammate does not respond or has stopped | Check its status with SendMessage and instruct it again. If that still fails, start the same user-defined type under a new name and pass the necessary task context in the prompt. |
| The cause of the stop is usage limit exhaustion, authentication expiry, or permission denial | The result would be the same on retry, so do not instruct again or start a replacement agent. Open the partial deliverables directly to check how far the run actually got, record what is missing in a file under `_workspace/`, and report to the user. For a usage limit, also tell them when it will be lifted. The leader fills in only the facts it has checked directly, and does not guess at the agent's judgments (for example, which material was excluded and why). |
| More than half of the teammates failed | Inform the user and confirm whether to continue. |
| The time limit was exceeded | Proceed with the results received so far, and state the areas that were not finished in the report. |
| Data conflicts | Do not delete it; record it side by side with its source. |
| Task status was reflected late | Check with TaskList and then update directly with TaskUpdate. |

## Test scenarios

### Normal flow
1. When the user provides {input}, Step 2 starts {N} agents and registers {M} tasks.
2. Step 3 exchanges feedback {K} times, Step 4 freezes the deliverables, and Step 5 integrates the results.
3. Expected result: `{output-path}/{filename}` is created.

### Error flow
1. In Step 3, {teammate-2} does not respond.
2. Check its status with SendMessage and instruct it again. If that still fails, start a replacement agent under the name "{teammate-2}b" and pass it the existing deliverable paths.
3. Write "{teammate-2} area partially reworked" in the final report.
```

---

## Template C: subagent delegation

```markdown
---
name: {domain}-orchestrator
description: "Delegates the independent tasks of {domain name} to subagents. Use when the user asks with one of {initial trigger keywords}, and also for follow-up work such as modifying results, partial re-runs, updates, supplements, re-runs, and improving previous results."
---

## Execution mode: subagent delegation

## Procedure

### Step 0: Check for existing work
Check whether `_workspace/` exists and decide whether to run for the first time, re-run only part, or run fresh.

### Step 1: Preparation
Analyze the input and create `_workspace/`.

### Step 2: Parallel execution
Call the Agent tool N times simultaneously in one message. By default it runs in the background.

| Agent | `subagent_type` | Input | Deliverable |
|---------|--------------|------|------|
| {agent-1} | {type} | {source} | `_workspace/{phase}_{agent}_{artifact}.md` |
| {agent-2} | {type} | {source} | `_workspace/{phase}_{agent}_{artifact}.md` |

For `{type}`, write the name of a user-defined type or a built-in type.

Wait for the completion notifications. The main agent does not redo searches it has already delegated.

### Step 3: Integration
1. Gather the return values and the file deliverables, integrate them, and create the final deliverable.

### Step 4: Wrap-up
Leave `_workspace/` and summarize the results for the user.

## Error handling
- If one agent fails, retry once. If it fails again, state the missing part and continue.
- Do not retry failures where the result would be the same on retry, such as usage limit exhaustion, authentication expiry, or permission denial. Open the partial deliverables directly to check how far the run actually got, record what is missing in a file under `_workspace/`, and report to the user. For a usage limit, also tell them when it will be lifted. The main agent fills in only the facts it has checked directly, and does not guess at the agent's judgments.
- If more than half of the agents fail, inform the user and confirm whether to continue.
```

---

## Combining execution modes by step (mixed mode)

Use the suitable execution mode for each step. Write `**Execution mode:**` at the top of each step.

```markdown
## Execution mode: mixed

| Step | Execution mode | Reason for choice |
|------|----------|-----------|
| Step 1 (preliminary check) | Performed directly by the main agent, or delegated to a subagent | The task list must be finalized. |
| Step 2 (bulk collection and verification) | Workflow orchestration | A predetermined list must be processed in a distributed way and adversarial verification must be performed. |
| Step 3 (consensus and integration) | Persistent agent collaboration | Conflicting data must be discussed and agreed upon. |
| Step 4 (independent verification) | Subagent delegation | A single agent in charge of quality verification can verify independently. |
```

**Execution mode switching rules:**
- Workflow orchestration → persistent agent collaboration: Save the structured data returned by the workflow in `_workspace/`, and write the file paths in the persistent agents' prompts.
- Persistent agent collaboration → workflow orchestration: After freezing the team deliverables (Step 4 of Template B), put the list of file paths into the script as `args`.
- At every point where the execution mode changes, write the data transfer path so that the results of the previous step are never lost.

---

## Writing principles that apply to all templates

1. **State the execution mode at the top of the document.** For mixed mode, organize the execution mode for each step in a table.
2. **In workflow orchestration mode, describe the script structure in detail.** State `phases`, the `schema` summary, and the items to put in `args` without omission.
3. **In persistent agent collaboration mode, describe the use of `name`, SendMessage, and TaskCreate in detail.** Include the list of agents to start, the communication rules, the dependencies between tasks, and the procedure for freezing deliverables at step boundaries.
4. **In subagent delegation mode, write out the Agent parameters without omission.** State that it is a one-off run with no `name` specified, and specify `subagent_type`, `prompt`, and the output path.
5. **State file paths clearly.** Write paths relative to `_workspace/`, and name files following the `{phase}_{agent}_{artifact}.{ext}` rule.
6. **State the dependencies between steps.** At points where the execution mode changes, describe in particular how the data is passed on.
7. **Prepare for errors that can actually occur.** Do not assume every task succeeds; define how to handle each situation.
8. **Always include test scenarios.** Write one normal scenario and at least one error scenario.
9. **Do not include items that were used only in v1.** If you referenced TeamCreate, TeamDelete, `team_name`, broadcast, or experimental flags, it was written incorrectly.

## Follow-up request phrasing to put in `description`

Include the following phrasing so that this skill is selected not only for the first run but also when fixing or re-running results.

- re-run, run again, update, modify, supplement
- "only the {part} of {domain name} again"
- "based on the previous results", "improve the results"
- Request phrasing commonly used in the domain (for example, for a launch strategy harness: "launch", "promotion", "trending")

Without follow-up request phrasing, this harness may not be selected again after the first run.
