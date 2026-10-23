#!/usr/bin/env bash
#
# Checks that the skills in this repo parse and that the installer can see all of them.
#
# Usage: check-skills.sh [skill-dir ...]    (default: every SKILL.md under skills/ and .claude/skills/)
#
# Exit 1 when any check fails. A check that cannot run (no network for npx) is reported as skip.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
VALIDATE="$ROOT/skills/creator/skill-creator/scripts/quick_validate.py"
fail=0

# --- 1. frontmatter and size rules, via skill-creator's validator ---
if (($#)); then
  dirs=("$@")
else
  dirs=()
  while IFS= read -r d; do dirs+=("$d"); done < <(
    find "$ROOT/skills" "$ROOT/.claude/skills" -name SKILL.md -exec dirname {} \; | sort
  )
fi

for d in "${dirs[@]}"; do
  if out="$(python3 "$VALIDATE" "$d" 2>&1)"; then
    echo "ok    validate ${d#"$ROOT"/}"
  else
    echo "FAIL  validate ${d#"$ROOT"/}: ${out##*$'\n'}"
    fail=1
  fi
done

# --- 2. installer count must equal the SKILL.md count (a silently skipped skill shows up here) ---
expected="$(find "$ROOT/skills" "$ROOT/.claude/skills" -name SKILL.md | wc -l | tr -d ' ')"
listing="$(cd "$ROOT" && npx skills add . -l 2>&1 | sed $'s/\x1b\\[[0-9;?]*[a-zA-Z]//g')"
found="$(sed -n 's/.*Found \([0-9]*\) skills.*/\1/p' <<<"$listing" | head -1)"
if [[ -z "$found" ]]; then
  echo "skip  installer count (npx skills add . -l gave no 'Found N skills' line)"
elif [[ "$found" == "$expected" ]]; then
  echo "ok    installer sees $found of $expected skills"
else
  echo "FAIL  installer sees $found skills, $expected SKILL.md files exist: a skill is being skipped"
  fail=1
fi

# --- 3. dangling dogfood symlinks ---
dangling="$(find -L "$ROOT/.claude/skills" "$ROOT/.kiro/skills" -type l 2>/dev/null)"
if [[ -n "$dangling" ]]; then
  echo "FAIL  dangling symlinks:"
  sed 's/^/        /' <<<"$dangling"
  fail=1
else
  echo "ok    no dangling symlinks"
fi

# --- 4. shell syntax of the scaffold scripts ---
for s in "$ROOT"/script/*.sh; do
  if bash -n "$s"; then
    echo "ok    bash -n ${s#"$ROOT"/}"
  else
    echo "FAIL  bash -n ${s#"$ROOT"/}"
    fail=1
  fi
done

exit "$fail"
