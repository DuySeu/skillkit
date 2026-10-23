# Workflow usage examples - script skeleton and cautions

Explains the script patterns you can put in an orchestration skill when building a harness in workflow orchestration mode (mode A). Write the script in plain JavaScript and pass it through the `script` parameter of the `Workflow` tool.

---

## Table of contents

1. [Basic skeleton](#1-basic-skeleton)
2. [Distributed execution (fan-out) + adversarial verification](#2-distributed-execution-fan-out--adversarial-verification)
3. [Judge panel](#3-judge-panel)
4. [Repeat until no new items (Loop-until-dry)](#4-repeat-until-no-new-items-loop-until-dry)
5. [Token budget-linked iteration](#5-token-budget-linked-iteration)
6. [Custom types + structured output](#6-custom-types--structured-output)
7. [Cautions (checklist)](#7-cautions-checklist)

---

## 1. Basic skeleton

A complete runnable script starts with a `meta` literal. The titles used in `phase()` calls must exactly match the `title` values in `meta.phases`.

```javascript
export const meta = {
  name: 'domain-task',
  description: 'One-line description (shown in the permission dialog)',
  phases: [
    { title: 'Collect', detail: 'Investigate in parallel for each perspective' },
    { title: 'Verify', detail: 'Verify each finding by looking for evidence that refutes it' },
  ],
}

phase('Collect')
const raw = await pipeline(args.items, item =>
  agent(`...${item}...`, { label: `collect:${item}`, phase: 'Collect', schema: COLLECT_SCHEMA }))

phase('Verify')
// ...

return { result }   // The final return value is passed to the main agent
```

**Principles:**
- **Use `pipeline()` by default, and use `parallel()` only when a synchronization barrier is truly necessary.** A synchronization barrier is needed only when the next step must compare **all** the results of the previous step with each other. Deduplication, early exit when the overall result is 0 items, and a prompt that says to "compare with other findings" are examples.
- Do not write the values of the item list directly in the script. Where possible, the main agent passes the list it settled on through preliminary research as `args.items`.
- If you need a timestamp, pass it as `args.now`. `Date.now()` cannot be used.

## 2. Distributed execution (fan-out) + adversarial verification

Collect review results from each perspective, then verify the results one by one. Do not wait for the investigation of the other perspectives to finish; verify the results from a perspective as soon as that perspective's investigation finishes.

```javascript
export const meta = {
  name: 'review-fanout-verify',
  description: 'Review each perspective, then verify each finding by looking for evidence that refutes it',
  phases: [{ title: 'Review' }, { title: 'Verify' }],
}

const FINDINGS = { type: 'object', required: ['findings'], properties: {
  findings: { type: 'array', items: { type: 'object',
    required: ['title', 'file', 'evidence'], properties: {
      title: { type: 'string' }, file: { type: 'string' }, evidence: { type: 'string' } } } } } }
const VERDICT = { type: 'object', required: ['status', 'reason'], properties: {
  status: { type: 'string', enum: ['confirmed', 'refuted', 'uncertain'] },
  reason: { type: 'string' } } }

const results = await pipeline(
  args.dimensions,   // e.g. [{key:'security', prompt:'...'}, {key:'perf', prompt:'...'}]
  d => agent(d.prompt, { label: `review:${d.key}`, phase: 'Review', schema: FINDINGS }),
  review => parallel((review?.findings ?? []).map(f => () =>
    agent(`Verify the following review result. Judge it as confirmed if the evidence is sufficient, refuted if it is clearly refuted, and uncertain if it is hard to judge: ${JSON.stringify(f)}`,
      { label: `verify:${f.file}`, phase: 'Verify', schema: VERDICT })
      .then(v => ({ ...f, verdict: v }))))
)
const confirmed = results.flat().filter(Boolean)
  .filter(f => f.verdict?.status === 'confirmed')
log(`${confirmed.length} of ${results.flat().filter(Boolean).length} passed verification.`)
return { confirmed }
```

To make verification stricter, run three adversarial verification agents for each finding. Pass only the findings that at least two of them judge `confirmed` because the evidence is sufficient. If you give each agent a different verification criterion, such as correctness, security, or reproducibility, you can find a wider variety of problems than by checking repeatedly against the same criterion.

## 3. Judge panel

A pattern for design tasks with many possible solutions. Create N independent drafts, judge them in parallel, and build the final proposal from the judging results.

```javascript
export const meta = {
  name: 'design-judge-panel',
  description: 'Create N independent drafts, judge them, and write the final proposal based on the highest-scoring draft',
  phases: [{ title: 'Draft' }, { title: 'Judge' }, { title: 'Synthesize' }],
}

const angles = args.angles?.length
  ? args.angles
  : ['MVP-first', 'risk-management-first', 'user-experience-first']
const judgeCount = args.judgeCount ?? 3

phase('Draft')
const drafts = (await parallel(angles.map(a => () =>
  agent(`Write a draft independently from the ${a} perspective: ${args.brief}`,
    { label: `draft:${a}`, phase: 'Draft' }))))
  .filter(Boolean)
log(`Created ${drafts.length} of ${angles.length} drafts.`)
if (!drafts.length) return { error: 'There are no completed drafts.', drafts: [] }

phase('Judge')   // Synchronization barrier needed: all drafts must be compared with each other
const SCORE = { type: 'object', required: ['scores'], properties: {
  scores: { type: 'array', items: { type: 'object',
    required: ['index', 'score', 'strengths'], properties: {
      index: { type: 'integer' }, score: { type: 'number' }, strengths: { type: 'string' } } } } } }
const judged = (await parallel(Array.from({ length: judgeCount }, (_, j) => () =>
  agent(`Score the following ${drafts.length} drafts:\n${drafts.map((d, i) => `[${i}] ${d}`).join('\n---\n')}`,
    { label: `judge:${j}`, phase: 'Judge', schema: SCORE })))).filter(Boolean)
log(`Received results from ${judged.length} of ${judgeCount} judges.`)
if (!judged.length) return { error: 'There are no completed judging results.', drafts }

phase('Synthesize')
const ranked = drafts.map((_, i) => {
  const scores = judged.flatMap(r =>
    r.scores.filter(x => x.index === i).map(x => x.score)).filter(Number.isFinite)
  return scores.length
    ? { index: i, average: scores.reduce((sum, score) => sum + score, 0) / scores.length }
    : null
}).filter(Boolean)
if (!ranked.length) return { error: 'There are no valid scores per draft.', drafts, judged }
const winner = ranked.reduce((best, item) =>
  item.average > best.average ? item : best).index
const finalDraft = await agent(
  `Write the final proposal based on the draft that received the highest score. Also reflect the strengths of the other drafts where needed.\nHighest-scoring draft:\n${drafts[winner]}\nJudging comments:\n${JSON.stringify(judged)}`,
  { phase: 'Synthesize' })
if (!finalDraft) {
  log('Could not write the final proposal.')
  return { error: 'Could not write the final proposal.', drafts, judged, winner }
}
return finalDraft
```

## 4. Repeat until no new items (Loop-until-dry)

Use it for tasks where you cannot know in advance how many items there are to find. Repeat the search until no new items appear K times in a row.

The code in sections 4 to 6 is a code fragment to put in the basic skeleton in section 1. When using it as a complete script, put `meta` at the very top and define the phase titles and schemas you use along with it.

```javascript
const finders = args.finders ?? []
const dryLimit = args.dryRuns ?? 2
const findingKey = finding => JSON.stringify([
  finding.file ?? '', finding.title ?? '', finding.evidence ?? ''
])
const seen = new Set(), confirmed = []
if (!finders.length) return { confirmed, error: 'There are no search criteria.' }
let dry = 0
while (dry < dryLimit) {
  const found = (await parallel(finders.map(f => () =>
    agent(f.prompt, { phase: 'Search', schema: FINDINGS })))).filter(Boolean).flatMap(r => r.findings)
  const fresh = found.filter(b => !seen.has(findingKey(b)))   // Judge duplicates against seen. Do not use confirmed as the basis.
  if (!fresh.length) { dry++; continue }
  dry = 0
  fresh.forEach(b => seen.add(findingKey(b)))
  const judged = await parallel(fresh.map(b => () =>
    agent(`Verify the following review result. Judge it as confirmed if the evidence is sufficient, refuted if it is clearly refuted, and uncertain if it is hard to judge: ${JSON.stringify(b)}`,
      { phase: 'Verify', schema: VERDICT })
      .then(v => ({ b, ok: v?.status === 'confirmed' }))))
  confirmed.push(...judged.filter(Boolean).filter(x => x.ok).map(x => x.b))
  log(`${confirmed.length} items confirmed so far, and ${fresh.length} new items found in this iteration.`)
}
return { confirmed }
```

If you deduplicate against `confirmed`, items rejected in verification reappear every round, so the loop never ends. Deduplicate against `seen`, which holds every item that has been found even once.

## 5. Token budget-linked iteration

In a session where the user has specified a token budget such as "+500k", you can adjust the search scope automatically according to the remaining budget. In an unlimited session with no `budget.total`, `remaining()` returns `Infinity`, so always check in the condition that `budget.total` exists first.

```javascript
const findings = []
while (budget.total && budget.remaining() > 50_000) {
  const r = await agent('Carry out the following search task.', { schema: FINDINGS })
  if (r) findings.push(...r.findings)
  log(`Found ${findings.length} items so far, and the remaining token budget is ${Math.round(budget.remaining() / 1000)}k.`)
}
// Deciding the scale of work in advance: const FLEET = budget.total ? Math.floor(budget.total / 100_000) : 3
```

## 6. Custom types + structured output

Use the `.claude/agents/{name}.md` definitions created by the harness in a workflow as they are.

```javascript
const r = await agent(
  `Verify the file _workspace/02_draft.md and return the items you find`,
  { agentType: 'qa-inspector',      // .claude/agents/qa-inspector.md
    schema: FINDINGS,               // Even a custom type returns only results that match the specified schema
    effort: 'high' })               // It is good to raise the reasoning effort in the verification step
```

- If you omit `agentType`, the default workflow subagent is used.
- Choose `model` according to the nature of each step's work. Use `sonnet` for repetitive collection and transformation steps, `opus` for in-depth verification, judging, and design steps, and `fable` for overall planning and long-running steps. For detailed criteria, see `model-selection-guide.md`.
- If multiple agents might edit files at the same time and conflict, specify `isolation: 'worktree'`. Preparing the working environment has a cost, so use it only when a conflict is actually likely.

## 7. Cautions (checklist)

When verifying a workflow script in Step 6-2 of the harness, check the list below.

| Caution | Problem that appears | Prevention |
|------|------|------|
| Using variables or operations in `meta` | The script cannot be parsed. | Put only literals in `meta`. |
| Using TypeScript syntax (`: string[]`, etc.) | The script cannot be parsed. | Write in plain JavaScript. |
| Using `Date.now()` / `Math.random()` / `new Date()` | An error occurs because of the resume protection feature. | Pass timestamps and seeds through `args`, and if you need randomness, write the prompt differently according to the index. |
| Missing `.filter(Boolean)` | The next step stops because of the `null` returned by a failed agent. | Apply `.filter(Boolean)` before using the results of `parallel()` or `pipeline()`. |
| Unnecessary synchronization barrier | Agents that finish early wait for slow agents, so the total run time increases. | If there is no need to compare all the results with each other, rewrite it with `pipeline()`. |
| `phase` title mismatch | Progress is not displayed in the intended groups. | Make the `phase()` call and the `title` in `meta.phases` match. |
| Calling the global `phase()` inside a parallel step | The groups used to display progress conflict with each other. | Specify `opts.phase` explicitly inside a step. |
| Deduplicating against `confirmed` | Rejected items reappear and the loop never ends. | Deduplicate against the `seen` set. |
| Missing `budget.total` check in a token-budget loop | In an unlimited session, `agent()` calls keep running until the per-workflow call limit is reached. | Use the `while (budget.total && ...)` condition. |
| Processing only part of the scope without saying so | Only the top N are processed, yet it reports "all done". | State the number of unprocessed items in `log()`. |
| Not checking the execution log (`journal`) when diagnosing results | An empty result taken from the cache is wrongly judged a success. | Before diagnosing a completed workflow, check the `journal` in the execution history (`transcript`) directory. |
| Writing the script to a file first | You go through an unnecessary step. | Pass the script content directly in `script`. The file is preserved automatically when you call it, and when editing repeatedly, `Edit` the preserved file and call again with `scriptPath`. |
