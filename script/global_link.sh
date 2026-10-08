#!/usr/bin/env bash
#
# Symlink each agent's user-level config (~/.claude, ~/.cursor, ...) into
# global/<agent>/ at the repo root, so it can be edited from this workspace.
#
# Only the hand-authored entries listed below are linked, never auth files,
# history, or caches. An entry is linked only if it exists in the home dir.
# global/ contents are gitignored (absolute, machine-specific paths).
#
# Usage: script/global_link.sh        (safe to re-run)

set -euo pipefail

GLOBAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/global"

# <agent>:<entry> <entry> ...   (agent "claude" maps to ~/.claude)
MAP=(
  "claude:CLAUDE.md settings.json skills agents commands rules"
  "cursor:skills rules agents mcp.json"
  "kiro:skills steering agents settings powers"
  "codex:AGENTS.md config.toml skills"
  "gemini:GEMINI.md settings.json"
)

for row in "${MAP[@]}"; do
  agent="${row%%:*}"
  src_root="$HOME/.$agent"
  [[ -d "$src_root" ]] || { echo "skip  $agent (no $src_root)"; continue; }

  mkdir -p "$GLOBAL_DIR/$agent"
  for entry in ${row#*:}; do
    src="$src_root/$entry"
    dst="$GLOBAL_DIR/$agent/$entry"
    [[ -e "$src" ]] || continue
    if [[ -e "$dst" && ! -L "$dst" ]]; then
      echo "keep  $agent/$entry (real file exists, not a symlink)"
      continue
    fi
    ln -sfn "$src" "$dst"
    echo "link  $agent/$entry -> $src"
  done
done
