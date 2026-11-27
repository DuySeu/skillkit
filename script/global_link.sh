#!/usr/bin/env bash
#
# Symlink each agent's user-level config (~/.claude, ~/.cursor, ...) into
# global/<agent>/ at the repo root, so it can be edited from this workspace.
#
# Only the hand-authored entries listed below are linked, never auth files,
# history, or caches. An entry is linked only if it exists in the home dir.
# global/ contents are gitignored (absolute, machine-specific paths).
#
# Usage: bash script/global_link.sh   (safe to re-run; macOS, Linux, Windows Git Bash)

set -euo pipefail

# Windows Git Bash: by default `ln -s` silently COPIES instead of linking.
# Force real symlinks so a missing permission fails loudly. No-op on macOS/Linux.
export MSYS=winsymlinks:nativestrict

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
    if ! ln -sfn "$src" "$dst"; then
      echo "error: cannot create symlink $dst" >&2
      echo "       On Windows, turn on Developer Mode (Settings > System > For developers)" >&2
      echo "       or run Git Bash as Administrator, then re-run." >&2
      exit 1
    fi
    echo "link  $agent/$entry -> $src"
  done
done
