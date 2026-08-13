#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Turn the winning option's CSS into the two things the guide needs.

    python make-guide.py docs/design/option-tokens/B-signal.css \
        --css-out docs/index.css

Writes `docs/index.css` -- the real, copy-paste token file -- and prints a
markdown token summary on stdout for section 2 of the guide.

WHY THIS IS A SCRIPT AND NOT A PARAGRAPH OF INSTRUCTIONS
--------------------------------------------------------
Both halves are mechanical and both are easy to get subtly wrong by hand:

  * The CSS has to lose its provenance comment. `index.css` ships zero
    comments -- they go stale on the first value change and the file is
    machine-read -- so the option CSS `/* Option B ... */` header has to come off
    on the way out. Doing that by retyping the file is how a token gets dropped.
  * The summary is a lossy view of ~35 variables and the lossiness is the point:
    the guide is read before every UI task, so it carries the dozen roles a
    component author actually reaches for, side by side in both modes, and
    points at index.css for the rest. Hand-building that table means hand-
    pairing light and dark hexes, which is exactly the kind of transcription
    that silently swaps two rows.

The summary deliberately does NOT reproduce every token. A guide that inlines
the whole token file has two copies of the same values, and the copy that is
easier to edit is the one that drifts.

Stdlib only. Exit 1 if the input has no `:root` block -- a summary of nothing
would read as "this option has no colours".
"""

import argparse
import re
import sys
from pathlib import Path

# The roles a component author reaches for often enough that having to open
# index.css to see them would make the guide feel incomplete. Everything else
# is still IN index.css -- it is just not worth a row here.
KEY_ROLES = [
    ("background", "page"),
    ("foreground", "body text"),
    ("card", "raised container fill"),
    ("card-foreground", "text on card"),
    ("primary", "primary action"),
    ("primary-foreground", "text on primary"),
    ("secondary", "secondary action"),
    ("muted", "quiet fill"),
    ("muted-foreground", "secondary text"),
    ("accent", "accent / highlight"),
    ("destructive", "danger"),
    ("border", "hairlines, dividers"),
    ("ring", "focus indicator"),
]

SURFACE_VARS = [
    "surface-border-width", "surface-shadow", "surface-shadow-raised",
    "surface-shadow-inset", "surface-blur", "surface-gradient", "surface-wash",
]

BLOCK_RE = re.compile(r"(:root|\.dark)\s*\{(.*?)\}", re.S)
DECL_RE = re.compile(r"--([\w-]+)\s*:\s*([^;]+);")
COMMENT_RE = re.compile(r"/\*.*?\*/", re.S)


def parse_blocks(css):
    """Pull `:root` and `.dark` into {selector: {var: value}}."""
    blocks = {}
    for selector, body in BLOCK_RE.findall(css):
        decls = {}
        for name, value in DECL_RE.findall(body):
            decls[name] = value.strip()
        blocks[selector] = decls
    return blocks


def strip_comments(css):
    """Remove every comment and the blank lines they leave behind.

    The no-comments rule covers the token file the project ships, which is what
    this writes. Reasoning about a nudged lightness belongs in the guide's prose
    or in the chat, not in a file that gets regenerated.
    """
    out = COMMENT_RE.sub("", css)
    out = re.sub(r"\n{3,}", "\n\n", out)
    return out.strip() + "\n"


def read_provenance(css):
    """Option CSS provenance header -- for reporting what was ported, never for output."""
    match = COMMENT_RE.search(css)
    if not match:
        return None
    lines = [ln.strip(" *\t") for ln in match.group(0).strip("/*").strip("*/").splitlines()]
    return [ln for ln in lines if ln]


def fmt_summary(blocks, source):
    """The markdown for the guide's Tokens section: key roles, both modes."""
    light = blocks.get(":root", {})
    dark = blocks.get(".dark", {})
    rows = []
    for name, role in KEY_ROLES:
        if name not in light and name not in dark:
            continue
        rows.append(f"| `--{name}` | `{light.get(name, '-')}` | `{dark.get(name, '-')}` | {role} |")

    out = []
    out.append(f"Full values, both modes, live in `docs/index.css` -- copy that file, do not retype it. "
               f"Ported from `{source}`.")
    out.append("")
    out.append("| Token | Light | Dark | Role |")
    out.append("|---|---|---|---|")
    out.extend(rows)
    out.append("")

    charts = [f"`{light[f'chart-{i}']}`" for i in range(1, 6) if f"chart-{i}" in light]
    if charts:
        out.append(f"Chart series (light): {' · '.join(charts)} -- categorical, in this order, "
                   f"never re-ordered per chart.")
        out.append("")

    if "radius" in light:
        out.append(f"Radius: `--radius: {light['radius']}`. Every corner derives from it "
                   f"(`calc(var(--radius) - 2px)` and friends) -- no literal `border-radius` in a component.")
        out.append("")

    surface = [(v, light[v]) for v in SURFACE_VARS if v in light]
    if surface:
        out.append("Surface kit variables -- these carry the visual style, so a component reads them "
                   "instead of inventing its own shadow or border:")
        out.append("")
        out.append("| Variable | Light |")
        out.append("|---|---|")
        for name, value in surface:
            out.append(f"| `--{name}` | `{value}` |")
        out.append("")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser(
        description="Write the guide's token file and print its summary table.")
    ap.add_argument("option_css", help="the winning option's CSS, from option-tokens/")
    ap.add_argument("--css-out", "-o", default="docs/index.css",
                    help="where the comment-free token file goes (default: docs/index.css)")
    ap.add_argument("--summary-out", "-s", default=None,
                    help="write the markdown summary here instead of stdout")
    args = ap.parse_args()

    src = Path(args.option_css)
    if not src.exists():
        print(f"error: {src} does not exist", file=sys.stderr)
        return 1

    css = src.read_text(encoding="utf-8")
    blocks = parse_blocks(css)
    if ":root" not in blocks:
        print(f"error: {src} has no :root block -- is this an option token file?", file=sys.stderr)
        return 1
    if ".dark" not in blocks:
        print(f"warning: {src} has no .dark block. A guide with one mode is a guide that "
              f"gets dark mode invented later.", file=sys.stderr)

    out_css = Path(args.css_out)
    out_css.parent.mkdir(parents=True, exist_ok=True)
    out_css.write_text(strip_comments(css), encoding="utf-8")

    summary = fmt_summary(blocks, src.as_posix())
    if args.summary_out:
        Path(args.summary_out).write_text(summary + "\n", encoding="utf-8")
    else:
        print(summary)

    provenance = read_provenance(css)
    print(f"\nwrote {out_css}  ({len(blocks.get(':root', {}))} light / "
          f"{len(blocks.get('.dark', {}))} dark vars, comments stripped)", file=sys.stderr)
    if provenance:
        print("ported from: " + " | ".join(provenance[:3]), file=sys.stderr)
    print(f"next: node contrast-check.mjs {out_css}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
