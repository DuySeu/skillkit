# Skill testing and iterative improvement guide

Explains how to verify the quality of a skill built with the harness and improve it over several iterations. A reference that supplements Step 6 of `SKILL.md`.

---

## Table of contents

1. [Testing approach overview](#1-testing-approach-overview)
2. [How to write test prompts](#2-how-to-write-test-prompts)
3. [Comparing the skill-applied run (With-skill) and the baseline run (Baseline)](#3-comparing-the-skill-applied-run-with-skill-and-the-baseline-run-baseline)
4. [Running an A/B test with a workflow (v2)](#4-running-an-ab-test-with-a-workflow-v2)
5. [Quantitative evaluation with assertions](#5-quantitative-evaluation-with-assertions)
6. [Using specialized agents](#6-using-specialized-agents)
7. [Iterative improvement procedure](#7-iterative-improvement-procedure)
8. [Verifying `description` trigger conditions](#8-verifying-description-trigger-conditions)
9. [Test working directory structure](#9-test-working-directory-structure)

---

<a id="1-testing-approach-overview"></a>

## 1. Testing approach overview

Check a skill's quality using both **qualitative evaluation, where a person judges the deliverable** and **quantitative evaluation, where assertions are used for grading**.

| Evaluation method | How | Suitable skills |
|----------|------|-----------|
| **Qualitative evaluation** | The user reviews the deliverable directly. | Skills where judging quality needs human evaluation, such as writing style, design, and creative work |
| **Quantitative evaluation** | Grade automatically according to assertions. | Skills whose results can be checked objectively, such as file creation, data extraction, and code generation |

Proceed in the order **write → run tests → evaluate → improve → test again**.

## 2. How to write test prompts

### Writing principles

Write test prompts as **concrete, natural sentences that a real user would plausibly type**. With abstract or deliberately contrived prompts, it is hard to tell whether the skill works well in real usage.

**Bad examples:** `"Process the PDF"`, `"Extract the data"`

**Good example:**

```
"Using column C (revenue) and column D (cost) in 'Q4_revenue_final_v2.xlsx' in my downloads folder,
add a profit margin (%) column. Then sort in descending order by profit margin."
```

### How to vary the prompts

- Mix formal and casual tones.
- Mix requests that state the intent directly with requests where the intent has to be inferred from context. For example, include both cases where the file format is stated directly and cases where it must be inferred from context.
- Mix simple and complex tasks, and put abbreviations, typos, and everyday expressions in some prompts.

### Scope of use cases to include

Start with two or three prompts. Always include one core use case and one edge case, and add one case that requests multiple tasks at once if needed.

<a id="3-comparing-the-skill-applied-run-with-skill-and-the-baseline-run-baseline"></a>

## 3. Comparing the skill-applied run (With-skill) and the baseline run (Baseline)

### 3-1. How to compare the two runs

For each test prompt, launch two subagents **at the same time** in one message.

- **Skill-applied run (With-skill)**: Reads the skill, then does the task and saves the result to `_workspace/iteration-N/eval-{id}/with_skill/outputs/`.
- **Baseline run (Baseline)**: Handles the same prompt without the skill and saves the result to `_workspace/iteration-N/eval-{id}/without_skill/outputs/`.

### 3-2. How to decide the baseline run

| Situation | Baseline run |
|------|----------|
| Building a new skill | Run the same prompt without the skill. |
| Improving an existing skill | Preserve the pre-edit skill as a separate copy and use it. |

### 3-3. Recording run time and token usage

When a subagent's completion notification arrives, save `total_tokens` and `duration_ms` **immediately**. These two values can only be checked at the moment the completion notification is received and cannot be recovered later.

<a id="4-running-an-ab-test-with-a-workflow-v2"></a>

## 4. Running an A/B test with a workflow (v2)

If there are three or more test cases, or the verification has to be repeated several times, turn the A/B test itself into a workflow script. Use it only when the user has agreed to run the test.

```javascript
export const meta = {
  name: 'skill-ab-test',
  description: 'Finish the with-skill run and the baseline run, then grade anonymously',
  phases: [{ title: 'Run' }, { title: 'Grade' }],
}
const RUN_RESULT = { type: 'object', required: ['saved', 'files'], properties: {
  saved: { type: 'boolean' },
  files: { type: 'array', minItems: 2, items: { type: 'string', minLength: 1 } } } }
const SLOT_GRADE = { type: 'object', required: ['expectations', 'summary'], properties: {
  expectations: { type: 'array', items: { type: 'object',
    required: ['text', 'passed', 'evidence'], properties: {
      text: { type: 'string' }, passed: { type: 'boolean' }, evidence: { type: 'string' } } } },
  summary: { type: 'object', required: ['passed', 'failed', 'total', 'pass_rate'], properties: {
    passed: { type: 'integer' }, failed: { type: 'integer' }, total: { type: 'integer' },
    pass_rate: { type: 'number' } } } } }
const GRADE = { type: 'object', required: ['A', 'B', 'comparison'], properties: {
  A: SLOT_GRADE,
  B: SLOT_GRADE,
  comparison: { type: 'object', required: ['preferred', 'reason'], properties: {
    preferred: { type: 'string', enum: ['A', 'B', 'tie'] },
    reason: { type: 'string' } } } } }

const results = await pipeline(
  args.evals,   // [{id, prompt, assertions, skillPath, withSkillSlot: 'A' | 'B'}]
  e => {
    const withSkillSlot = e.withSkillSlot === 'B' ? 'B' : 'A'
    const baselineSlot = withSkillSlot === 'A' ? 'B' : 'A'
    return parallel([
      () => agent(
        `${e.prompt}\n\nFirst read and follow ${e.skillPath}. Save the deliverables to ${args.ws}/${e.id}/with_skill/outputs/, and also save the same files to ${args.ws}/${e.id}/blind/${withSkillSlot}/outputs/. Return all the file paths you saved.`,
        { label: `with-skill:${e.id}`, phase: 'Run', schema: RUN_RESULT }),
      () => agent(
        `${e.prompt}\n\nSave the deliverables to ${args.ws}/${e.id}/without_skill/outputs/, and also save the same files to ${args.ws}/${e.id}/blind/${baselineSlot}/outputs/. Return all the file paths you saved.`,
        { label: `baseline:${e.id}`, phase: 'Run', schema: RUN_RESULT }),
    ])
  },
  (runs, e) => {
    const completed = (runs ?? []).filter(Boolean)
    if (completed.length !== 2 || completed.some(r => !r.saved || r.files.length < 2)) {
      log(`${e.id}: The deliverables of the with-skill run and the baseline run are not both ready, so grading is skipped.`)
      return null
    }
    return agent(
      `First check that deliverables exist in both ${args.ws}/${e.id}/blind/A/outputs/ and ${args.ws}/${e.id}/blind/B/outputs/. If either path is empty, do not grade; report the reason for the failure. If both deliverables exist, grade A and B separately and judge the better one as one of A, B, or tie. To preserve anonymity, do not open eval_metadata.json, with_skill/, or without_skill/. Assertions: ${JSON.stringify(e.assertions)}`,
      { label: `grade:${e.id}`, phase: 'Grade', schema: GRADE })
      .then(grade => {
        if (!grade) log(`${e.id}: No anonymous grading result was received, so this case is skipped.`)
        return grade
      })
  }
)
const mapped = results.map((grade, index) => {
  if (!grade) return null
  const e = args.evals[index]
  const withSkillSlot = e.withSkillSlot === 'B' ? 'B' : 'A'
  const baselineSlot = withSkillSlot === 'A' ? 'B' : 'A'
  return {
    evalId: e.id,
    withSkill: grade[withSkillSlot],
    baseline: grade[baselineSlot],
    comparison: {
      preferred: grade.comparison.preferred === 'tie'
        ? 'tie'
        : grade.comparison.preferred === withSkillSlot ? 'with_skill' : 'baseline',
      reason: grade.comparison.reason,
    },
  }
}).filter(Boolean)
return { results: mapped }
```

The main agent assigns `withSkillSlot` to A and B alternately for each test case. The grader reads only the neutral `blind/A/` and `blind/B/` paths, so it cannot tell which side had the skill applied. Only cases where the deliverables of both runs are ready are graded, and once grading finishes, the main agent maps the A/B results back to the with-skill run and the baseline run. The mapped results are saved to `grading.json` in each run directory. Grading starts as soon as a single test case finishes, so there is also no need to wait until all cases are done. If you modify the skill and rerun with `resumeFromRunId`, cases that did not change are skipped using cached results.

<a id="5-quantitative-evaluation-with-assertions"></a>

## 5. Quantitative evaluation with assertions

### 5-1. How to write assertions

A **good assertion** can be judged true or false objectively, tells you what it checks from its wording alone, and measures a result that should improve when the skill is applied. An assertion that always passes even without the skill (for example, "the output exists") or one that needs a person's subjective judgment (for example, "it is well written") is not good.

### 5-2. Assertions that can be checked with code

Write assertions that can be verified in code as scripts. This is faster than checking by eye, the results are more reliable, and the same script can be reused when the iteration changes.

### 5-3. Watch out for assertions with no discriminating power

An assertion that passes 100% in both the with-skill run and the baseline run cannot measure the difference that using the skill makes. If you find such an assertion, delete it or replace it with one demanding enough to reveal the difference between the two runs.

### 5-4. Grading result schema

Follow the `grading.json` format defined in `skill-writing-guide.md` (`text`/`passed`/`evidence` and `summary`).

## 6. Using specialized agents

| Role | What it does | When to use |
|------|--------|------------|
| **Grader** | Records whether each assertion passed and the evidence, cross-checks the factual claims in the deliverable, and also checks the quality of the assertions themselves. | Every iteration |
| **Blind comparator (Comparator)** | Hides whether the skill was applied to the two deliverables, shuffles the A/B order, then compares their quality. | When you need to verify rigorously that a new version is actually better |
| **Analyzer** | Analyzes statistical patterns such as assertions with no discriminating power, evaluation cases with high variance in results, and the trade-off between time and token usage. | After three or more iteration results have accumulated |

<a id="7-iterative-improvement-procedure"></a>

## 7. Iterative improvement procedure

### 7-1. Improvement principles

1. **Generalize the feedback.** Fixing only for a single test case causes overfitting. Fix it with a principle that also applies to other cases.
2. **Delete instructions that do not help.** Read the agent's work log, and if the skill is making the agent do unnecessary work, remove that instruction.
3. **Explain the reason.** Even for brief feedback, work out why it matters, then revise the skill so that the reason shows.
4. **Add the tools that repeated work needs in advance.** If every test creates the same helper script anew, put that script in `scripts/`.

### 7-2. Iteration order

```
1. Modify the skill.
2. Rerun all test cases in a new `iteration-{N+1}/` directory.
3. Present the results compared with the previous iteration to the user.
4. Receive feedback, modify again, and repeat the same order.
```

**Stopping condition:** Stop when the user is satisfied, when there is no feedback left to apply, or when no further meaningful improvement is possible.

### 7-3. Re-review the draft from a fresh perspective

When revising a skill, first make a draft. Then reread and fix it from the beginning as if you were a reviewer reading the draft for the first time. Do not try to write it perfectly from the start.

<a id="8-verifying-description-trigger-conditions"></a>

## 8. Verifying `description` trigger conditions

### 8-1. Writing the requests to evaluate triggering

Create 20 evaluation requests. They consist of 10 `should-trigger` requests where the skill should run and 10 `should-NOT-trigger` requests where it should not.

**Criteria for writing evaluation requests:**

- Write them as concrete, natural sentences that a real user would plausibly type.
- Include concrete information such as file paths, the user's situation, column names, and company names.
- Focus on **edge cases** where it is hard to judge whether the skill applies, rather than cases where the answer is obvious.

**`should-trigger`:** Include requests that express the same intent in different ways, requests that do not state the file type but clearly need this skill, uncommon use cases, and requests that overlap with other skills but should choose this skill.

**`should-NOT-trigger`:** **Near misses, edge cases that are similar in wording but do not apply, are what matter.** Include requests that use similar words but are better suited to another tool or skill. Requests that are clearly unrelated are not worth testing.

### 8-2. Checking for conflicts with existing skills

1. Collect the `description` of every existing skill.
2. Check that the new skill's `should-trigger` requests do not wrongly trigger an existing skill.
3. If a conflict arises, state the scope of application and the exclusion conditions more clearly in `description`.

### 8-3. Automatic optimization (optional, advanced feature)

1. Split the 20 evaluation requests into 60% for training (Train) and 40% for testing (Test).
2. Measure the trigger accuracy of the current `description`.
3. Analyze the failed cases and improve `description`.
4. Pick the `description` with the best performance based on the results on the **test set**. Picking based on the training results causes overfitting.
5. Repeat this process up to five times.

> Check with a script that automates the headless mode (`claude -p`), which runs without a screen. It uses many tokens, so run it as the last step, after the skill has become stable enough.

<a id="9-test-working-directory-structure"></a>

## 9. Test working directory structure

```
_workspace/
├── iteration-1/
│   ├── eval-descriptive-name/
│   │   ├── eval_metadata.json
│   │   ├── with_skill/    (outputs/ + timing.json + grading.json)
│   │   ├── without_skill/ (outputs/ + timing.json + grading.json)
│   │   └── blind/         (A/outputs/ + B/outputs/)
│   └── benchmark.json
├── iteration-2/
└── evals/evals.json
```

**Retention rules:**

- Give `eval` directories names that show the content instead of numbers (for example, `eval-multi-page-table-extraction`).
- Create an independent directory for each iteration, and do not overwrite the previous `iteration` directory.
- Do not delete `_workspace/`, because it is needed for after-the-fact verification and tracking change history.
