---
name: skill-workshop
description: Runs the author, check and review loop for changes inside the usefull-skills repo itself. Use when writing, editing or renaming a skill under skills/, editing script/project_setup.sh or project/ templates, or when asked to review, re-check or re-run the review of such a change, or to verify the repo's skills still load. Only for this repo's own authoring workflow. For the writing technique itself use skill-creator, which this skill calls.
---

# Skill workshop

Wraps `skill-creator` with the checks this repo needs. `skill-creator` writes the skill; this skill makes sure the result loads, is discoverable and does not collide with the other skills, then stops. It never commits (see `CLAUDE.md`, "Never Commit or Push").

**Execution mode:** subagent delegation. One `skill-reviewer` call per round, because the reviewer reports once and needs no back-and-forth.

## Step 0: what kind of change is this

| Situation | Do |
| --- | --- |
| New skill | Steps 1 to 5 |
| Edit to an existing skill | Skip the symlink in step 2 |
| Edit to `script/` or `project/` | Skip steps 1 and 2; run 3 to 5 |
| "Re-check", "review again", "run the review on X" | Skip to step 3 on the paths named, or on `git status --short` if none |

## Steps

1. **Author.** Invoke `skill-creator` for the change. Put a new skill in the matching category folder under `skills/` (`creator`, `documents`, `engineering`, `frontend`).
2. **Dogfood link (new skill only).** From the repo root: `ln -sfn "../../skills/<category>/<name>" ".claude/skills/<name>"`, and the same under `.kiro/skills/` when that directory exists. `CLAUDE.md` still shows the old flat path `skills/<name>`; the category form is the one that resolves today.
3. **Check.** Run `.claude/skills/skill-workshop/scripts/check-skills.sh <changed skill dir>`. It validates that skill, then checks the installer count, dangling symlinks and `bash -n` for the whole repo. A `FAIL` on the installer count means a skill is being silently skipped, usually an unquoted `: ` in a description.
4. **Review.** Call `Agent` with `subagent_type: "skill-reviewer"`, naming the changed paths and the check output. Do not paste your own opinion of the change into the prompt; the point is a read that is not anchored on yours.
5. **Fix and report.** Fix blockers and should-fix items, then re-run steps 3 and 4 once. Stop there and report: what changed and where, the check output, the remaining findings. Do not commit, push or offer to.

## Error handling

- `npx` offline: the count check prints `skip`. Say so in the report; do not call the skill verified.
- Reviewer returns nothing or an error: retry once, then report the review as not done.
- The same finding survives two rounds: stop and tell the user what blocks it, instead of a third pass.
- Pre-existing `FAIL` lines on skills you did not touch: list them in one line, do not fix them.

## Test scenarios

Normal: "add a skill for reviewing SQL migrations" runs steps 1 to 5. The check output shows the new skill as `ok`, the installer count rises by one, and the reviewer returns findings that are fixed in one round.

Error: a new skill whose `description` contains `Use when: ...` unquoted. The validator reports invalid YAML and the installer count is one short. Quote the value, re-run step 3, and the count matches.
