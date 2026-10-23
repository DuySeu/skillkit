---
name: evolve
description: "Harness evolution skill. Collects and generalizes feedback on the execution results of a harness in use, applies it to the agents/skills/orchestrator, captures the delta against the initial configuration, and updates the change history. Always use this skill for improvement requests based on the execution experience of an existing harness, such as 'harness retrospective', 'harness evolution', 'apply feedback to the harness', 'improve the harness', 'the result was disappointing, fix the harness', 'apply this feedback to the harness', 'summarize harness lessons'. Building a new harness, redesigning its structure, and adding agents are handled by the harness skill."
---

# Harness Evolve - Harness Evolution Mechanism

A harness is not a fixed object but an evolving system. This skill captures the delta of "what worked and what didn't" and feeds it back into the harness, so that the next run measurably improves.

```
Initial harness ──▶ Use on a real project ──▶ Current harness
                                        │
                                        ▼ (capture the delta with evolve)
                                  Generalize feedback → apply to agents, skills, orchestrator
                                        │
                                        ▼
                                  Update change history → the next run starts from a better draft
```

## Workflow

### Phase 1: Collect the delta

1. Read `.claude/agents/`, `.claude/skills/`, and `CLAUDE.md` (the change history table)
2. If it is a git repository, look up the change history of the harness files (`git log --oneline -- .claude/ CLAUDE.md`) - find out what changed, when, and why, relative to the initial configuration
3. If `_workspace/` exists, skim the intermediate outputs of recent runs to confirm the actual traces of execution:
   - Are the outputs actually at the paths the orchestrator defined (if not, the workflow was bypassed or is dead code)
   - Does the output quality follow the format/criteria the skill specifies
4. Ask the user for feedback (skip if they have already given it):
   - "Is there anything to improve in the results?"
   - "Is there anything you want to change in the agent configuration or workflow?"
   - Do not force feedback if there is none. However, if the observation signals below are present, proactively propose improvements

**Observation-based evolution signals (propose even without feedback):**
- Traces of the same type of revision request being repeated 2 or more times
- A pattern of an agent repeatedly failing/retrying
- Traces of the user bypassing the orchestrator and working manually (suspected orchestrator trigger failure → candidate for expanding the description)
- v1 leftovers (TeamCreate/TeamDelete/experimental flags) remain in the orchestrator → guide to the migration procedure of the harness skill

### Phase 2: Classify the feedback type and map to the modification target

| Feedback type | Modification target | Example |
|-----------|----------|------|
| Output quality | The skill of the relevant agent | "The analysis is too superficial" → add a depth criterion to the skill |
| Agent role | Agent definition `.md` | "Security review is also needed" → guide to adding an agent via the harness skill |
| Workflow order | Orchestrator skill | "Verification should come first" → change the Phase order |
| Team composition | Orchestrator + agents | "These two could be merged" → merge the agents |
| Missing trigger | Skill description | "It doesn't work with this phrasing" → expand the description |
| Unsuitable execution mode | Orchestrator | "It's the same fan-out every time and it's slow" → switch to workflow mode |
| Scale/cost | Orchestrator | "It uses too many tokens" → reduce the default scale, add budget linkage |

**Scope judgment:** If adding/removing agents or redesigning the architecture is needed, do not do it directly in this skill; guide to the harness skill (the existing-configuration extension procedure in Step 0). evolve focuses on **adjusting the existing configuration**.

### Phase 3: Generalize and apply

1. **Generalize the feedback** - a narrow fix that fits only a specific case is overfitting. For "the introduction was long in this report", do not make it "keep the introduction within 10% of the total"; instead find why it became long (the skill lacks a length allocation criterion) and fix it at the level of the principle
2. **Record the Why together** - attach the reason to the revised instruction. If the agent knows the reason, it judges correctly even in edge cases
3. Apply changes one at a time, and run Phase 4 right after each change
4. **Regression prevention:** If a fix goes in the direction of reverting an earlier fix in the change history, tell the user about the conflict and get confirmation (if it was shortened in the past for "too long" and now it is "too short", the right answer is to find a criterion that satisfies both)
5. **Keep the language of the existing files** - write the sentences applied to agents, skills, the orchestrator, and `CLAUDE.md` in the language already used in the file being modified. Do not mix English sentences into a harness written in another language just because this skill document is in English

### Phase 4: Update the change history and verify

1. Record it in the **change history** table of CLAUDE.md:

```markdown
**Change history:**
| Date | Change | Target | Reason |
|------|----------|------|------|
| 2026-07-19 | Added tone guide | skills/content-creator | "Too stiff" feedback |
```

2. Verify the structure of the modified files (frontmatter, reference consistency)
3. If the description was modified, verify triggers (at least 3 each of should-trigger + near-miss)
4. Final check that CLAUDE.md matches the actual files

### Phase 5: Evolution report

Report to the user:
- Summary of the captured delta (initial configuration → current)
- The changes applied this time and the generalization rationale
- Feedback decided not to apply, and the reason (if any)
- Expected improvements in the next run

## Principles

- **The delta is an asset** - the more the change history accumulates, the more the next harness build in the same domain starts from a "draft closer to release state". Do not erase the history
- **No applying without generalizing** - adding one rule per case 1:1 turns the skill into a pile of rules. Compress into principles
- **One at a time** - applying several changes at once makes it impossible to know which change was effective
