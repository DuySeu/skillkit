#!/usr/bin/env bash
#
# Setup a Python demo project structure.
#
# Two sources of content:
#   1. Real skeleton files with editable content live flat under TEMPLATE_DIR
#      and are copied to their destinations (see copy_template calls).
#   2. Trivial placeholder files (main.py, .gitignore, __init__.py, README.md,
#      requirements.txt) are hardcoded inline in this script.
#
# The folder layout of the generated project (core/, utils/, .kiro/steering/)
# is hardcoded here.
#
# Usage:
#   ./project_setup.sh [--demo | --production] [--kiro | --claude] [--force]
#
# Files are created in the CURRENT directory (no new folder is created).
# The README title uses the current directory name.
#
# Mode (optional, default: demo):
#   --demo       : use conventions from project/demo/ (default)
#   --production : use conventions from project/production/
#
# CLI target (optional, default: kiro) — where conventions are written so the
# assistant auto-loads them:
#   --kiro   : .kiro/steering/coding-conventions.md + folder-structure.md
#   --claude : CLAUDE.md at the project root (Claude Code auto-loads it)
#
# --force : overwrite files that already exist in this folder.
# (no flag): existing files at the same path are left untouched (skipped);
#            only missing files are created.

set -euo pipefail

# --- Locate template dir (this script lives in script/, templates in ../project)
# Follow symlinks so the script also works when linked into a bin dir on PATH.
SCRIPT_SOURCE="${BASH_SOURCE[0]}"
while [ -L "$SCRIPT_SOURCE" ]; do
  SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_SOURCE")" && pwd)"
  SCRIPT_SOURCE="$(readlink "$SCRIPT_SOURCE")"
  [[ "$SCRIPT_SOURCE" != /* ]] && SCRIPT_SOURCE="$SCRIPT_DIR/$SCRIPT_SOURCE"
done
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_SOURCE")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMPLATE_DIR="$REPO_ROOT/project"

# --- Parse args -------------------------------------------------------------
FORCE=0
MODE=""
CLI=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --demo)
      [[ -n "$MODE" ]] && { echo "Choose only one of --demo / --production" >&2; exit 2; }
      MODE="demo"; shift ;;
    --production)
      [[ -n "$MODE" ]] && { echo "Choose only one of --demo / --production" >&2; exit 2; }
      MODE="production"; shift ;;
    --kiro)
      [[ -n "$CLI" ]] && { echo "Choose only one of --kiro / --claude" >&2; exit 2; }
      CLI="kiro"; shift ;;
    --claude)
      [[ -n "$CLI" ]] && { echo "Choose only one of --kiro / --claude" >&2; exit 2; }
      CLI="claude"; shift ;;
    --force) FORCE=1; shift ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

# Defaults when not specified.
[[ -z "$MODE" ]] && MODE="demo"
[[ -z "$CLI" ]] && CLI="kiro"

# Convention files for the selected mode (log.py is shared, see below).
MODE_DIR="$TEMPLATE_DIR/$MODE"
[[ -d "$MODE_DIR" ]] || { echo "Mode template dir not found: $MODE_DIR" >&2; exit 1; }

# Always scaffold into the current directory; README name = its basename.
TARGET="$(pwd)"
NAME="$(basename "$TARGET")"

# --- Helpers ----------------------------------------------------------------
render() {  # replace {{PROJECT_NAME}} on stdin
  local content; content="$(cat)"
  printf '%s' "${content//\{\{PROJECT_NAME\}\}/$NAME}"
}

write_file() {  # write_file <dest-rel> <<< content-on-stdin
  local dst="$TARGET/$1"
  if [[ -e "$dst" && $FORCE -ne 1 ]]; then
    echo "skip (exists): $dst"; cat >/dev/null; return
  fi
  mkdir -p "$(dirname "$dst")"
  render > "$dst"
  echo "created: $dst"
}

copy_template() {  # copy_template <base-dir> <template-file> <dest-rel>
  local src="$1/$2" dst="$TARGET/$3"
  [[ -f "$src" ]] || { echo "Template file missing: $src" >&2; exit 1; }
  if [[ -e "$dst" && $FORCE -ne 1 ]]; then
    echo "skip (exists): $dst"; return
  fi
  mkdir -p "$(dirname "$dst")"
  render < "$src" > "$dst"
  echo "created: $dst"
}

strip_frontmatter() {  # drop a leading --- ... --- YAML block from stdin
  awk 'NR==1 && $0=="---"{f=1; next} f && $0=="---"{f=0; next} !f'
}

write_claude_md() {  # build CLAUDE.md from the mode's conventions (no frontmatter)
  local dst="$TARGET/CLAUDE.md"
  local fs="$MODE_DIR/folder-structure.md" cc="$MODE_DIR/coding-conventions.md"
  [[ -f "$fs" && -f "$cc" ]] || { echo "Convention files missing in $MODE_DIR" >&2; exit 1; }
  if [[ -e "$dst" && $FORCE -ne 1 ]]; then
    echo "skip (exists): $dst"; return
  fi
  {
    echo "# $NAME — Project Conventions"
    echo
    echo "> Auto-loaded by Claude Code at session start. Follow these when implementing."
    echo
    strip_frontmatter < "$fs"
    echo
    strip_frontmatter < "$cc"
  } > "$dst"
  echo "created: $dst"
}

echo "Scaffolding project at $TARGET (mode: $MODE, cli: $CLI, from $MODE_DIR)"

# --- Real skeleton files ----------------------------------------------------
# log.py is shared across modes/CLIs (lives at project/ root).
copy_template "$TEMPLATE_DIR" "log.py" "utils/log.py"

# Conventions are mode-specific and written where the target CLI auto-loads them.
case "$CLI" in
  kiro)
    copy_template "$MODE_DIR" "coding-conventions.md" ".kiro/steering/coding-conventions.md"
    copy_template "$MODE_DIR" "folder-structure.md"   ".kiro/steering/folder-structure.md"
    ;;
  claude)
    write_claude_md
    ;;
esac

# --- Inline placeholder files -----------------------------------------------
write_file "main.py" <<'EOF'
"""Entry point — orchestrates the workflow steps in dataflow order.

Logging is configured centrally via utils.log. Each step lives in core/
and logs at its own boundaries so the log reads as the data flowing through.
"""

import logging

from utils.log import setup_logging

logger = logging.getLogger(__name__)


def main() -> None:
    setup_logging()
    logger.info("Pipeline start")

    # Wire up steps from core/ in dataflow order, e.g.:
    # from core.load_input import load_input
    # from core.transform_data import transform_data
    #
    # data = load_input(...)
    # result = transform_data(data)

    logger.info("Pipeline complete")


if __name__ == "__main__":
    main()
EOF

write_file ".gitignore" <<'EOF'
# Python
__pycache__/
*.py[cod]
*.egg-info/
.eggs/
build/
dist/

# Virtual environments
.venv/
venv/
env/

# Tooling / IDE
.mypy_cache/
.pytest_cache/
.ruff_cache/
.idea/
.vscode/

# OS
.DS_Store

# Logs
*.log
EOF

write_file "core/__init__.py" <<'EOF'
"""Package placeholder — replace with a real module docstring."""
EOF

write_file "utils/__init__.py" <<'EOF'
"""Package placeholder — replace with a real module docstring."""
EOF

write_file "README.md" <<'EOF'
# {{PROJECT_NAME}}

## Overview
Mô tả ngắn gọn demo này làm gì.

## Structure
```
main.py       # entry point — chạy toàn bộ dataflow
core/         # core logic: mỗi file = một step trong workflow
utils/        # helper dùng chung
utils/log.py  # setup logging tập trung (setup_logging)
```

## Setup
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run
```bash
python main.py
```
EOF

write_file "requirements.txt" <<'EOF'
# Add project dependencies here, pinned to exact versions.
# Example:
# requests==2.32.3
EOF

echo "Done."
