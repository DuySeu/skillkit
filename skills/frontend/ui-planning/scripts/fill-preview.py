#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fill the preview harness from authored option CSS + a small manifest.

    python fill-preview.py docs/design/option-tokens/manifest.json \
        --out docs/design/ui-options.html

The Author writes 3-5 option CSS files by hand (palette, type, surface kit,
light + dark). This script only injects them into mockup-template.html so the
OPTIONS array cannot drift from the files contrast-check.mjs and make-guide.py
read.

Stdlib only. Exit 1 on missing files or a CSS without :root / .dark.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).parent
TEMPLATE = SCRIPT_DIR / "mockup-template.html"

ARCHETYPES = frozenset(
    {"dashboard", "chat", "landing", "ecommerce", "editorial"}
)
SURFACE_KITS = frozenset(
    {"flat", "outlined", "elevated", "soft", "glass", "hard"}
)
SURFACE_BLURB = {
    "flat": "hairline border, no shadow",
    "outlined": "2px rule, no shadow",
    "elevated": "hairline border, diffuse shadow",
    "soft": "borderless, dual soft shadow, debossed inputs",
    "glass": "translucent surfaces, backdrop blur, lit top edge",
    "hard": "3px border, hard offset shadow",
}

BLOCK_RE = re.compile(r"(:root|\.dark)\s*\{(.*?)\}", re.S)
DECL_RE = re.compile(r"--([\w-]+)\s*:\s*([^;]+);")
FONT_FAMILY_RE = re.compile(r"^['\"]?([^,'\"]+)")


def parse_blocks(css: str) -> dict[str, dict[str, str]]:
    """Pull :root and .dark into {selector: {var: value}}."""
    blocks: dict[str, dict[str, str]] = {}
    for selector, body in BLOCK_RE.findall(css):
        decls = {
            name: value.strip() for name, value in DECL_RE.findall(body)
        }
        blocks[selector] = decls
    return blocks


def load_option_css(path: Path) -> tuple[dict[str, str], dict[str, str]]:
    """Load light and dark token maps from one option CSS file."""
    text = path.read_text(encoding="utf-8")
    blocks = parse_blocks(text)
    if ":root" not in blocks:
        raise ValueError(f"{path}: missing :root block")
    if ".dark" not in blocks:
        raise ValueError(f"{path}: missing .dark block")
    return blocks[":root"], blocks[".dark"]


def font_families(options: list[dict[str, Any]]) -> list[str]:
    """Unique display/body/mono family names for the Google Fonts link."""
    names: set[str] = set()
    for option in options:
        for stack in option["fonts"].values():
            match = FONT_FAMILY_RE.match(stack.strip())
            if not match:
                continue
            family = match.group(1).strip()
            if family.lower() in {
                "ui-sans-serif", "ui-serif", "ui-monospace", "system-ui",
                "sans-serif", "serif", "monospace", "georgia", "arial",
                "helvetica", "menlo", "monaco", "courier", "courier new",
            }:
                continue
            names.add(family)
    return sorted(names)


def google_fonts_link(families: list[str]) -> str:
    """Build the preconnect + stylesheet tags, or a system-only comment."""
    if not families:
        return "<!-- FONTS: system stacks only, nothing to load -->"
    parts = "&".join(
        f"family={f.replace(' ', '+')}:wght@400;500;600;700" for f in families
    )
    url = f"https://fonts.googleapis.com/css2?{parts}&display=swap"
    return (
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        f'<link href="{url}" rel="stylesheet">'
    )


def js_options_literal(options: list[dict[str, Any]]) -> str:
    """Render the OPTIONS array. Hand-editable output, so it stays formatted."""
    out = ["const OPTIONS = ["]
    for option in options:
        out.append("  {")
        out.append(f'    id: {json.dumps(option["id"])},')
        out.append(f'    name: {json.dumps(option["name"])},')
        out.append(f'    thesis: {json.dumps(option["thesis"])},')
        out.append(f'    hue: {option["hue"]},')
        out.append(f'    density: {json.dumps(option["density"])},')
        out.append(f'    surface: {json.dumps(option["surface"])},')
        out.append(f'    surfaceNote: {json.dumps(option["surfaceNote"])},')
        if option.get("role"):
            out.append(f'    role: {json.dumps(option["role"])},')
        out.append("    fonts: {")
        for key in ("display", "body", "mono"):
            out.append(
                f'      {key}: {json.dumps(option["fonts"][key])},'
            )
        out.append("    },")
        for mode in ("light", "dark"):
            out.append(f"    {mode}: {{")
            for key, value in option[mode].items():
                js_key = (
                    key if re.fullmatch(r"[A-Za-z_$][\w$]*", key)
                    else json.dumps(key)
                )
                out.append(f"      {js_key}: {json.dumps(value)},")
            out.append("    },")
        out.append("  },")
    out.append("];")
    return "\n".join(out)


def js_inspiration_literal(refs: list[dict[str, str]]) -> str:
    """The reference sites, as the harness's INSPIRATION array."""
    if not refs:
        return "const INSPIRATION = [];"
    out = ["const INSPIRATION = ["]
    for ref in refs:
        parts = [
            f'label: {json.dumps(ref["label"])}',
            f'url: {json.dumps(ref["url"])}',
        ]
        if ref.get("note"):
            parts.append(f'note: {json.dumps(ref["note"])}')
        out.append("  { " + ", ".join(parts) + " },")
    out.append("];")
    return "\n".join(out)


def build_options(
    manifest: dict[str, Any],
    token_dir: Path,
) -> list[dict[str, Any]]:
    """Merge manifest metadata with token maps from each CSS file."""
    raw_options = manifest.get("options")
    if not isinstance(raw_options, list) or not raw_options:
        raise ValueError("manifest.options must be a non-empty list")
    if not 3 <= len(raw_options) <= 5:
        raise ValueError("manifest.options must have 3-5 entries")

    built: list[dict[str, Any]] = []
    for entry in raw_options:
        if not isinstance(entry, dict):
            raise ValueError("each options[] entry must be an object")
        for required in (
            "file", "id", "name", "thesis", "hue", "density", "surface",
            "fonts",
        ):
            if required not in entry:
                raise ValueError(f"option missing {required!r}")

        surface = entry["surface"]
        if surface not in SURFACE_KITS:
            raise ValueError(
                f"surface {surface!r} must be one of {sorted(SURFACE_KITS)}"
            )
        fonts = entry["fonts"]
        for key in ("display", "body", "mono"):
            if key not in fonts:
                raise ValueError(f"option {entry['id']!r} fonts missing {key}")

        css_path = token_dir / entry["file"]
        if not css_path.is_file():
            raise ValueError(f"option CSS not found: {css_path}")
        light, dark = load_option_css(css_path)

        surface_note = entry.get("surfaceNote") or SURFACE_BLURB[surface]
        built.append({
            "id": entry["id"],
            "name": entry["name"],
            "thesis": entry["thesis"],
            "hue": int(entry["hue"]),
            "density": entry["density"],
            "surface": surface,
            "surfaceNote": surface_note,
            "role": entry.get("role", ""),
            "fonts": {
                "display": fonts["display"],
                "body": fonts["body"],
                "mono": fonts["mono"],
            },
            "light": light,
            "dark": dark,
        })
    return built


def render_html(
    options: list[dict[str, Any]],
    project: str,
    concept: str,
    archetype: str,
    inspiration: list[dict[str, str]],
) -> str:
    """Inject OPTIONS, brief, fonts, and archetype into the template."""
    template = TEMPLATE.read_text(encoding="utf-8")

    start = template.index("const OPTIONS = [")
    end = template.index("\n];", start) + len("\n];")
    html = template[:start] + js_options_literal(options) + template[end:]

    link = google_fonts_link(font_families(options))
    html = re.sub(
        r'<link rel="preconnect" href="https://fonts\.googleapis\.com">'
        r'.*?rel="stylesheet">',
        lambda _m: link,
        html,
        count=1,
        flags=re.S,
    )

    html = re.sub(
        r'const PROJECT\s*=\s*"[^"]*"',
        lambda _m: f"const PROJECT = {json.dumps(project)}",
        html,
        count=1,
    )
    html = re.sub(
        r'const CONCEPT\s*=\s*"[^"]*";',
        lambda _m: f"const CONCEPT = {json.dumps(concept)};",
        html,
        count=1,
    )
    html = re.sub(
        r'const ARCHETYPE\s*=\s*"[^"]*";',
        lambda _m: f"const ARCHETYPE = {json.dumps(archetype)};",
        html,
        count=1,
    )
    html = re.sub(
        r"const INSPIRATION = \[.*?\n\];",
        lambda _m: js_inspiration_literal(inspiration),
        html,
        count=1,
        flags=re.S,
    )
    return html


def load_manifest(path: Path) -> dict[str, Any]:
    """Read and lightly validate the top-level manifest fields."""
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("manifest must be a JSON object")
    archetype = data.get("archetype", "landing")
    if archetype not in ARCHETYPES:
        raise ValueError(
            f"archetype {archetype!r} must be one of {sorted(ARCHETYPES)}"
        )
    data["archetype"] = archetype
    inspiration = data.get("inspiration") or []
    if not isinstance(inspiration, list):
        raise ValueError("inspiration must be a list")
    data["inspiration"] = inspiration
    return data


def main() -> int:
    """CLI: manifest path in, filled preview HTML out."""
    parser = argparse.ArgumentParser(
        description=(
            "Fill mockup-template.html from authored option CSS + manifest.json"
        ),
    )
    parser.add_argument(
        "manifest",
        help="path to manifest.json (usually under option-tokens/)",
    )
    parser.add_argument(
        "--out",
        "-o",
        default="docs/design/ui-options.html",
        help="preview HTML path (default: docs/design/ui-options.html)",
    )
    parser.add_argument(
        "--token-dir",
        "-t",
        default=None,
        help="directory of option CSS files (default: manifest's parent)",
    )
    args = parser.parse_args()

    manifest_path = Path(args.manifest)
    if not manifest_path.is_file():
        print(f"error: manifest not found: {manifest_path}", file=sys.stderr)
        return 1

    try:
        manifest = load_manifest(manifest_path)
        token_dir = (
            Path(args.token_dir) if args.token_dir
            else manifest_path.parent
        )
        options = build_options(manifest, token_dir)
        archetype = manifest["archetype"]
        html = render_html(
            options,
            project=manifest.get("project") or "Project",
            concept=manifest.get("concept") or "",
            archetype=archetype,
            inspiration=manifest["inspiration"],
        )
    except (OSError, ValueError, json.JSONDecodeError, KeyError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(html, encoding="utf-8")
    print(
        f"wrote {out_path} ({len(options)} options, archetype={archetype})",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
