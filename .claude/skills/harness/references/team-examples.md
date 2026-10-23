# Practical team composition examples

Each example shows the criteria for choosing the execution mode that fits the task, and the basic form of Harness v2 syntax. For the definition of each mode, see `execution-modes.md`; for how to write workflow scripts, see `workflow-recipes.md`.

---

## Example 1: Comprehensive research team - workflow orchestration

**Composition:** fan-out/fan-in + adversarial verification

**Why this choice:** the perspectives to research can be listed in advance, and the procedure for verifying each claim can be fixed in code.

```
[Main] Preliminary research: fix the research perspectives (official sources, press, community, background)
     → Workflow(script, args: {axes, topic, ws})
         phase 'Research': pipeline(axes, axis => agent(..., {schema: FINDINGS}))
         phase 'Verification': run adversarial verifier agents for each claim → pass only claims that a majority judged as confirmed
         phase 'Synthesis': run 1 omission reviewer → if a perspective is missing, do additional research
     → Main writes the comprehensive report from the returned structured results
```

The research principles and the structured output format are defined in `.claude/agents/researcher.md`, and the verification principle of prioritizing refutation is defined in `.claude/agents/fact-checker.md`. In the workflow, the two agents are specified with `agentType`.

Do not arbitrarily discard one side of conflicting information. Put it in the return schema together with its source.

## Example 2: Sci-fi novel writing team - mixed mode centered on persistent agents

**Composition:** pipeline + generate-verify

**Why this choice:** the worldbuilding, characters, and plot must be adjusted in real time so they do not contradict one another, so each expert must remember the earlier conversation context. The reviewers, on the other hand, only need to deliver results from independent perspectives, so subagents are enough.

```
Step 1 (persistent agents): run Agent(name: "worldbuilder") + Agent(name: "character-designer")
               + Agent(name: "plot-architect") in parallel
               → TaskCreate(worldbuilding, characters, plot, stating their dependencies on each other)
               → The leader relays: worldbuilder fixes the social structure
                 → pass it to character-designer with SendMessage
                 → if a character's occupation group conflicts with the worldbuilding, ask
                   worldbuilder for an adjustment with SendMessage
                 Because the earlier context remains, you can instruct a partial fix such as
                 "in the class structure we set earlier, change only the merchant class."
Step 2 (subagent): call prose-stylist once → read the three outputs saved in _workspace/ and write the draft
Step 3 (subagents in parallel): science-consultant + continuity-manager each review
Step 4 (persistent agent): you cannot send SendMessage to a prose-stylist that was called only once.
                 If it was run with a name in Step 2, you can instruct it to reflect the review results.
                 If revisions are expected to repeat, give it a name from the start.
```

Give a `name` from the first run to any agent that may be sent revision requests again. An agent called only once cannot continue using the earlier conversation context.

## Example 3: Comprehensive code review - workflow orchestration

**Composition:** fan-out/fan-in + adversarial verification

**Why this choice:** the review perspectives such as security, performance, structure, and tests can be decided in advance, and the procedure of re-verifying each item found can also be expressed in code.

```javascript
// Review by perspective → adversarial verification for each item found
// Do not wait for the whole review. When the security review finishes, verify the problems
// found in the security area right away, even while the performance review is still running.
const FINDINGS = { type: 'object', required: ['findings'], properties: {
  findings: { type: 'array', items: { type: 'object',
    required: ['title', 'file', 'evidence'], properties: {
      title: { type: 'string' }, file: { type: 'string' }, evidence: { type: 'string' } } } } } }
const VERDICT = { type: 'object', required: ['status', 'reason'], properties: {
  status: { type: 'string', enum: ['confirmed', 'refuted', 'uncertain'] },
  reason: { type: 'string' } } }
const results = await pipeline(
  [
    { key: 'security', prompt: 'Review from a security perspective.' },
    { key: 'perf', prompt: 'Review from a performance perspective.' },
    { key: 'arch', prompt: 'Review from a structure perspective.' },
    { key: 'test', prompt: 'Review from a testing perspective.' },
  ],
  d => agent(d.prompt, { phase: 'Review', schema: FINDINGS }),
  r => parallel((r?.findings ?? []).map(f => () =>
    agent(`Verify the following finding. If the evidence is sufficient, judge it confirmed; if it is clearly refuted, judge it refuted; if it is hard to decide, judge it uncertain: ${JSON.stringify(f)}`,
      { phase: 'Verify', schema: VERDICT })
      .then(verdict => ({ ...f, verdict }))))
)
const confirmed = results.flat().filter(Boolean)
  .filter(f => f.verdict?.status === 'confirmed')
```

In v1, a persistent team was used in which reviewers shared findings with each other through `SendMessage`. As in the example above, if a single finding alone is enough to verify it, put that item's evidence into the prompt in full and verify it right away. If it must be compared with findings from other perspectives, collect all review results and then verify after a synchronization barrier. Use persistent agents only when real-time conversation is truly necessary, such as when a design direction must be debated.

## Example 4: Large-scale code migration - persistent supervisor collaboration or workflow orchestration

**Composition:** fan-out/fan-in if the work can be split in advance, supervisor if it must be re-split during execution

**Selection criterion:** choose the execution mode depending on whether the work batches can be split in advance.

If the work batches can be decided in advance, use a workflow.

```javascript
const MIGRATION_RESULT = { type: 'object', required: ['worktreePath', 'changedFiles'], properties: {
  worktreePath: { type: 'string', minLength: 1 },
  changedFiles: { type: 'array', minItems: 1, uniqueItems: true,
    items: { type: 'string', minLength: 1 } } } }
const MIGRATION_VERDICT = { type: 'object', required: ['status', 'reason'], properties: {
  status: { type: 'string', enum: ['confirmed', 'refuted', 'uncertain'] },
  reason: { type: 'string' } } }
const migrated = await pipeline(args.batches,   // estimate complexity with preliminary research, then fix the work batches
  b => agent(`Migrate the following work batch, and return the absolute path of the isolated worktree and the list of files actually changed: ${b.files.join(', ')}`,
    { agentType: 'migrator', isolation: 'worktree', schema: MIGRATION_RESULT }),
  (r, b) => r && agent(
    `In the isolated worktree ${r.worktreePath}, compare the migration targets against the files actually changed, and verify omissions and errors. Original targets: ${b.files.join(', ')}. Actual changes: ${r.changedFiles.join(', ')}`,
    { agentType: 'qa-inspector', schema: MIGRATION_VERDICT })
    .then(verdict => ({ ...r, verdict })))
const confirmed = migrated.filter(Boolean)
  .filter(r => r.verdict?.status === 'confirmed')
return { confirmed }
```

Always pass the adversarial verifier agent the path of the isolated worktree that holds the migration result. When the workflow ends, the main agent checks the `worktreePath` of each `confirmed` result one by one and merges the changes into the base branch or selectively applies only the needed commits. If a conflict arises, resolve it before merging the next worktree, and apply the next change only after the integration tests pass. Do not merge `refuted` or `uncertain` results; report the reason they were left out.

If the work must be re-split according to progress, use persistent agents.

```
The leader registers work batches with TaskCreate (including depends_on)
→ run Agent(name: "migrator-1"), Agent(name: "migrator-2"), Agent(name: "migrator-3") in parallel
→ check the result each time a completion notification arrives
→ for a failed task, find out the cause with SendMessage, then reassign it with TaskUpdate
→ when all are done, run the integration tests
```

## Example 5: Webtoon production - persistent generator and one-shot reviewer

**Composition:** generate-verify

**Why this choice:** only one generator and one reviewer are needed. The review result only needs to be sent back to the generator at most twice, so a light mixed mode is enough.

```
Step 1: Agent(name: "artist") → generate panels → _workspace/panels/
Step 2: call Agent(subagent_type: "webtoon-reviewer", prompt: "Review the panels.") once → PASS/FIX/REDO verdict
       → _workspace/review_report.md
Step 3: only for panels that received a REDO verdict, instruct regeneration with SendMessage({to: "artist"})
       Repeat at most twice. Because artist remembers the earlier context,
       you can narrow the scope of the instruction, such as "fix only the composition of panel 3."
Retry policy: if a panel still does not pass after two fixes, tell the user the unresolved state and the cause.
             If 50% or more of all panels are REDO, suggest that the user revise the prompt.
```

---

## How to save outputs

- **Agent definition:** create it at `project/.claude/agents/{name}.md`. Always write the core roles, working principles, input and output rules, how to call it again, error handling, and how it collaborates. Add communication rules for persistent agents, and a structured output format for agents used in workflows.
- **Skill:** create it at `project/.claude/skills/{name}/SKILL.md`, and add `references/` and `scripts/` if needed.
- **Orchestrator:** always state the execution mode. Use the template in `orchestrator-template.md`.
- **Intermediate outputs:** save them in the form `_workspace/{phase}_{agent}_{artifact}.{ext}` and keep them even after verification is finished.
