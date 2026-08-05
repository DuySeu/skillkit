#!/usr/bin/env bash
#
# install_skills.sh — Install all skills from this repo into the current
# project's local skills folders (default), or into your global Kiro CLI /
# Claude Code skills directories with --global.
#
# Usage (the script lives in script/; skills are read from ../skills):
#   install_skills.sh                Install into ./.claude/skills (current project, Claude Code — default)
#   install_skills.sh --kiro         Install for Kiro CLI instead (./.kiro/skills)
#   install_skills.sh --claude       Install for Claude Code (same as default; cannot combine with --kiro)
#   install_skills.sh --global       Install into ~/.kiro/skills / ~/.claude/skills instead of the project
#   install_skills.sh --target DIR   Install into a custom skills directory
#   install_skills.sh --link         Symlink skills instead of copying (auto-updates with repo)
#   install_skills.sh --force        Overwrite existing skills without prompting
#   install_skills.sh --dry-run      Show what would happen without changing anything
#   install_skills.sh -h | --help    Show this help
#
set -euo pipefail

# --- Resolve the repo root (this script lives in script/) -----------------
# Follow symlinks so the script also works when linked into a bin dir on PATH.
SCRIPT_SOURCE="${BASH_SOURCE[0]}"
while [ -L "$SCRIPT_SOURCE" ]; do
  SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_SOURCE")" && pwd)"
  SCRIPT_SOURCE="$(readlink "$SCRIPT_SOURCE")"
  [[ "$SCRIPT_SOURCE" != /* ]] && SCRIPT_SOURCE="$SCRIPT_DIR/$SCRIPT_SOURCE"
done
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_SOURCE")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC_DIR="$REPO_ROOT/skills"

# --- Defaults -------------------------------------------------------------
INSTALL_KIRO=false
INSTALL_CLAUDE=false
CUSTOM_TARGETS=()
USE_SYMLINK=false
FORCE=false
DRY_RUN=false
EXPLICIT_TARGET=false
GLOBAL=false

# --- Colors (fall back to plain if not a tty) -----------------------------
if [ -t 1 ]; then
  BOLD=$'\033[1m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; BLUE=$'\033[34m'; RED=$'\033[31m'; RESET=$'\033[0m'
else
  BOLD=""; GREEN=""; YELLOW=""; BLUE=""; RED=""; RESET=""
fi

info()  { printf "%s\n" "${BLUE}==>${RESET} $*"; }
ok()    { printf "%s\n" "${GREEN}  ✓${RESET} $*"; }
warn()  { printf "%s\n" "${YELLOW}  !${RESET} $*"; }
err()   { printf "%s\n" "${RED}  ✗${RESET} $*" >&2; }

usage() {
  sed -n '2,17p' "$SCRIPT_SOURCE" | sed 's/^# \{0,1\}//'
  exit 0
}

# --- Parse arguments ------------------------------------------------------
while [ $# -gt 0 ]; do
  case "$1" in
    --kiro)    INSTALL_KIRO=true;   EXPLICIT_TARGET=true ;;
    --claude)  INSTALL_CLAUDE=true; EXPLICIT_TARGET=true ;;
    --global)  GLOBAL=true ;;
    --target)  shift; [ $# -gt 0 ] || { err "--target requires a directory"; exit 1; }
               CUSTOM_TARGETS+=("$1"); EXPLICIT_TARGET=true ;;
    --link)    USE_SYMLINK=true ;;
    --force)   FORCE=true ;;
    --dry-run) DRY_RUN=true ;;
    -h|--help) usage ;;
    *) err "Unknown option: $1"; echo "Run '$0 --help' for usage." >&2; exit 1 ;;
  esac
  shift
done

# --kiro / --claude pick exactly one assistant; default is Claude Code.
if [ "$INSTALL_KIRO" = true ] && [ "$INSTALL_CLAUDE" = true ]; then
  err "Choose only one of --kiro / --claude"
  exit 2
fi
if [ "$EXPLICIT_TARGET" = false ]; then
  INSTALL_CLAUDE=true
fi

# Default: project-local skills in the current directory; --global uses $HOME.
if [ "$GLOBAL" = true ]; then
  KIRO_DIR="$HOME/.kiro/skills"
  CLAUDE_DIR="$HOME/.claude/skills"
else
  KIRO_DIR="$PWD/.kiro/skills"
  CLAUDE_DIR="$PWD/.claude/skills"
  if [ "$PWD" = "$REPO_ROOT" ] || [ "$PWD" = "$SCRIPT_DIR" ]; then
    warn "You are inside the skills repo itself — this installs into the repo's own .kiro/.claude."
    warn "Run from your project directory, or use --global for ~/.kiro/skills and ~/.claude/skills."
  fi
fi

# --- Build the list of target directories ---------------------------------
TARGETS=()
[ "$INSTALL_KIRO" = true ]   && TARGETS+=("$KIRO_DIR")
[ "$INSTALL_CLAUDE" = true ] && TARGETS+=("$CLAUDE_DIR")
for t in "${CUSTOM_TARGETS[@]:-}"; do
  [ -n "$t" ] && TARGETS+=("$t")
done

# --- Sanity checks --------------------------------------------------------
if [ ! -d "$SRC_DIR" ]; then
  err "Skills source directory not found: $SRC_DIR"
  exit 1
fi

# Collect skill folders (any subdir of skills/ that contains a SKILL.md).
SKILLS=()
for dir in "$SRC_DIR"/*/; do
  [ -d "$dir" ] || continue
  name="$(basename "$dir")"
  if [ -f "$dir/SKILL.md" ]; then
    SKILLS+=("$name")
  else
    warn "Skipping '$name' (no SKILL.md found)"
  fi
done

if [ "${#SKILLS[@]}" -eq 0 ]; then
  err "No skills with a SKILL.md found under $SRC_DIR"
  exit 1
fi

info "Found ${BOLD}${#SKILLS[@]}${RESET} skill(s) in $SRC_DIR"
$DRY_RUN && warn "DRY RUN — no changes will be made"
$USE_SYMLINK && info "Mode: ${BOLD}symlink${RESET} (skills auto-update with the repo)" \
             || info "Mode: ${BOLD}copy${RESET}"

# --- Install into each target ---------------------------------------------
install_skill() {
  local skill="$1" target="$2"
  local src="$SRC_DIR/$skill"
  local dst="$target/$skill"

  if [ -e "$dst" ] || [ -L "$dst" ]; then
    if [ "$FORCE" = false ]; then
      printf "%s" "${YELLOW}  ?${RESET} '$skill' already exists in $target — overwrite? [y/N] "
      read -r ans </dev/tty || ans="n"
      case "$ans" in
        y|Y|yes|YES) ;;
        *) warn "Skipped '$skill'"; return ;;
      esac
    fi
    $DRY_RUN || rm -rf "$dst"
  fi

  if $DRY_RUN; then
    ok "Would install '$skill' -> $dst"
    return
  fi

  if $USE_SYMLINK; then
    ln -s "$src" "$dst"
  else
    cp -R "$src" "$dst"
  fi
  ok "Installed '$skill'"
}

for target in "${TARGETS[@]}"; do
  info "Target: ${BOLD}$target${RESET}"
  if $DRY_RUN; then
    [ -d "$target" ] || ok "Would create directory $target"
  else
    mkdir -p "$target"
  fi
  for skill in "${SKILLS[@]}"; do
    install_skill "$skill" "$target"
  done
done

echo
if $DRY_RUN; then
  info "Dry run complete. Re-run without --dry-run to apply."
else
  info "${GREEN}Done.${RESET} Installed ${#SKILLS[@]} skill(s) into ${#TARGETS[@]} location(s)."
fi
