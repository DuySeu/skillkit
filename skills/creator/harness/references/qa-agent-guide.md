# QA agent design guide

Guidelines to consult when including a QA agent in a build harness. Based on bugs found in real projects and their causes, this guide explains how to find the defects that QA agents tend to miss.

---

## Table of contents

1. [Defect patterns that QA agents miss](#1-defect-patterns-that-qa-agents-miss)
2. [Integration coherence verification](#2-integration-coherence-verification)
3. [QA agent design principles](#3-qa-agent-design-principles)
4. [QA performed as a workflow (v2)](#4-qa-performed-as-a-workflow-v2)
5. [Verification checklist template](#5-verification-checklist-template)
6. [QA agent definition template](#6-qa-agent-definition-template)

---

## 1. Defect patterns that QA agents miss

### 1-1. Contract mismatch at component boundaries (Boundary Mismatch)

This is the most frequent defect. Each of two components is implemented correctly when viewed alone, but they follow different contracts at the point where they connect.

| Connection point | Example of mismatch | Why it is missed |
|--------|-----------|-----------|
| API response → frontend hook | The API returns `{ projects: [...] }` but the hook expects `Project[]`. | Each component is verified separately and they are not compared with each other. |
| API response field names → type definition | The API uses `thumbnailUrl` (camelCase) and the type uses `thumbnail_url` (snake_case). | When a type is asserted through a generic, the compiler cannot detect it. |
| File path → link `href` | The page is at `/dashboard/create` but the link points to `/create`. | The file structure and the `href` are not compared with each other. |
| State transition map → actual `status` update | The map defines the transition but the code lacks the handling that changes the state. | Only the existence of the map is checked, and the actual update code is not traced. |
| API endpoint → frontend hook | The API exists but no hook calls it. | The API list and the hook list are not matched one to one. |
| Immediate response → async processing result | The API immediately returns `{ status }` but the frontend accesses the final result field. | Only the types are checked, without distinguishing the immediate response from the final response. |

### 1-2. Why it is hard to find with static code review alone

- **Limits of generic types**: With code like `fetchJson<Project[]>()`, it passes compilation even if the actual response is `{ projects: [...] }`.
- **Why a successful build does not guarantee correct behavior**: Code that uses type assertions, `any`, or generics can build successfully and still fail at runtime.
- **Whether an API exists and its response contract are different verification targets**: Checking "Does the API exist?" and checking "Does the API response match what the caller expects?" are entirely different tasks.

<a id="2-integration-coherence-verification"></a>

## 2. Integration coherence verification

The QA agent must include **verification that cross-checks components against each other**. The examples below are based on Next.js, but this principle applies to any technology stack. Open the producer code and the consumer code together and compare the contracts on both sides.

### 2-1. Cross-check the API response against the frontend hook type

```
1. Extract the response structure from the API route's response serialization point (such as NextResponse.json()).
2. Check the type that the corresponding hook or client expects (such as the T of fetchJson<T>).
3. Compare the response structure with T. If the API returns { data: [...] }, also check that the hook extracts .data.
```

In particular, check for cases where a response wrapped for pagination is wrongly received as an array, where the conversion between snake_case and camelCase is missing, and where the immediate response (202) and the final response have different structures.

### 2-2. Cross-check file paths against link and router paths

```
1. Extract the URL patterns from the routing file structure. Remove (group) and treat [param] as a dynamic segment.
2. Collect every href=, router.push(, and redirect( value in the code.
3. Check that each link matches a path that actually exists.
```

### 2-3. Trace whether state transitions are fully implemented

```
1. Extract the list of allowed transitions from the state transition map.
2. Search for all the code that updates status.
3. Check that the transitions that occur in the code are defined in the map. There must be no disallowed transitions.
4. Find the transitions that are in the map but never executed in the code. There must be no unused transitions.
5. In particular, check whether the handling that moves from an intermediate state to the final state is missing.
```

### 2-4. Match API endpoints to frontend hooks one to one

```
1. Extract the list of endpoints for each HTTP method.
2. Extract the list of fetch call URLs in the client.
3. For an endpoint that is not called, judge whether it is an admin API that the client does not call directly or whether the calling code is missing.
```

## 3. QA agent design principles

### 3-1. Choose an agent type that can use all tools

If the QA agent is of type `Explore`, it can only read files. To perform QA properly, it must be able to find patterns with `Grep`, run scripts to cross-check results automatically, and modify code when needed. Choose `general-purpose` or a user-defined type that can use all tools, and state the "verify → report → request fix" procedure in the agent definition.

### 3-2. Put cross-check results in the checklist, not just existence

| Simple checklist | Cross-check-centered checklist |
|---------------|---------------|
| Does the API endpoint exist? | Does the API response structure match the type of the corresponding hook? |
| Is the state transition map defined? | Does all the code that updates `status` match the transition map? |
| Does the page file exist? | Does every link in the code point to a page that actually exists? |
| Is strict mode used? | Is there anywhere that bypasses type safety with a generic type assertion? |

### 3-3. Read the code on both sides of a connection together

To find bugs that arise at connection points, reading the code on only one side is not enough. Read together the API route and the corresponding hook, the state transition map and the actual update code, and the file structure and the link paths. State this principle clearly in the agent definition as well.

### 3-4. Run QA each time a module is completed, not after all modules are built

If QA is run only after the entire implementation is finished, bugs pile up, the cost of fixing grows, and contract mismatches that arose early spread to later modules. We recommend **incremental QA**, which immediately cross-checks each API with its corresponding hook every time one API endpoint is completed.

<a id="4-qa-performed-as-a-workflow-v2"></a>

## 4. QA performed as a workflow (v2)

If the connection points to verify can be made into a list, the QA process can also be organized as a workflow.

```javascript
// Split the connection points and inspect them → re-verify each finding from the opposite perspective
const FINDINGS = { type: 'object', required: ['findings'], properties: {
  findings: { type: 'array', items: { type: 'object',
    required: ['title', 'file', 'evidence'], properties: {
      title: { type: 'string' }, file: { type: 'string' }, evidence: { type: 'string' } } } } } }
const VERDICT = { type: 'object', required: ['status', 'reason'], properties: {
  status: { type: 'string', enum: ['confirmed', 'refuted', 'uncertain'] },
  reason: { type: 'string' } } }
const boundaries = args.boundaries  // extracted by preliminary research: [{api: '...', consumer: '...'}, ...]
const found = await pipeline(
  boundaries,
  b => agent(`Read both sides together and find contract mismatches: ${b.api} ↔ ${b.consumer}`,
    { agentType: 'qa-inspector', phase: 'inspect', schema: FINDINGS }),
  r => parallel((r?.findings ?? []).map(f => () =>
    agent(`Verify from the opposite perspective whether this mismatch actually causes a runtime error: ${JSON.stringify(f)}`,
      { phase: 're-verify', schema: VERDICT }).then(verdict => ({ ...f, verdict }))))
)
const confirmed = found.flat().filter(Boolean)
  .filter(f => f.verdict?.status === 'confirmed')
return { confirmed }
```

If you re-verify each finding from the opposite perspective and keep only the `confirmed` verdicts, you can filter out findings that look plausible but are not actually problems. As a result, the findings in the final QA report are more trustworthy.

## 5. Verification checklist template

Include the integration coherence checklist below in the definition of a QA agent that inspects a web application.

```markdown
### Integration coherence verification (web app)

#### API and frontend connection
- [ ] Check that the response structure of every API route matches the generic type of the corresponding hook.
- [ ] Check that the hook extracts the actual data value from a response wrapped in an object ({ items: [...] }).
- [ ] Check that the conversion between snake_case and camelCase is applied consistently.
- [ ] Check that the frontend distinguishes the structure of the immediate response (202) from the final response.
- [ ] Check that every API endpoint has a corresponding frontend hook and that it is actually called.

#### Routing coherence
- [ ] Check that every href/router.push value in the code matches an actual page file path.
- [ ] Verify paths while accounting for the fact that (group) used in a route group is dropped from the URL.
- [ ] Check that the correct parameter values go into dynamic segments ([id]).

#### State machine coherence
- [ ] Check that every defined state transition is executed in the code (there must be no unused transitions).
- [ ] Check that every status update in the code is defined in the transition map (there must be no disallowed transitions).
- [ ] Check that the handling that moves from an intermediate state to the final state is not missing.
- [ ] Check that the X in the frontend's state-based branches (if status === "X") is a state that can actually be reached.

#### Data flow coherence
- [ ] Check that the correspondence between DB schema field names and API response field names is consistent.
- [ ] Check that the frontend type definitions and the API response field names match.
- [ ] Check that both sides handle the null/undefined values of optional fields consistently.
```

## 6. QA agent definition template

```markdown
---
name: qa-inspector
description: "A QA agent that verifies spec compliance, integration coherence, and design quality."
---

# QA agent

## Main role
Check that the implementation matches the spec and verify the **integration coherence between modules**.

## Verification priorities
1. **Integration coherence** (highest) - A contract mismatch at a connection point is a major cause of runtime errors.
2. **Functional spec compliance** - Check the API, the state machine, and the data model.
3. **Design quality** - Check colors, fonts, and responsive behavior.
4. **Code quality** - Check unused code and naming conventions.

## Verification method: read the code on both sides of a connection together
| Verification target | Producer | Consumer |
|----------|-------|-------|
| API response structure | Response serialization point | Type the client expects |
| Routing | Routing file structure | href, router.push values |
| State transitions | Transition map | status update code |
| DB → API → UI | DB table column names | API response fields → type definition |

## Reporting and fix request procedure
- When you find a problem, immediately request a specific fix from the responsible agent (file:line number + how to fix).
- If a problem arose at a connection point, notify the responsible agents on both sides.
- Send the leader a verification report that distinguishes passed, failed, and unverified items.
```

---

## Real cases: bugs found and their causes

| Bug | Connection point | Cause |
|------|----------|------|
| `projects?.filter is not a function` | API → hook | The API returns `{projects:[]}` but the hook expects an array. |
| 404 on every link in the dashboard | File path → `href` | The `/dashboard/` prefix is missing. |
| Thumbnail images are not shown | API → UI component | `thumbnailUrl` and `thumbnail_url` do not match. |
| The selected value is not saved | API → hook | The API exists but there is no corresponding hook. |
| The create page stays in the waiting state | State transition → code | The code that changes to the final state is missing. |
| Crash when accessing `data.failedIndices` | Immediate response → frontend | The frontend accesses the background processing result from the immediate response. |
| 404 when opening the detail page after completion | File path → `href` | The route prefixes do not match. |
