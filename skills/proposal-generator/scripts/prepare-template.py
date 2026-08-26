#!/usr/bin/env python3
"""Verify the bundled proposal Word template exists under assets/."""

import argparse
from pathlib import Path


def main() -> None:
    """Exit 0 if assets/proposal-template.docx is present."""
    parser = argparse.ArgumentParser(
        description="Verify bundled proposal-template.docx exists."
    )
    parser.add_argument(
        "--template",
        type=Path,
        default=Path(__file__).resolve().parents[1]
        / "assets"
        / "proposal-template.docx",
        help="Expected bundled template path",
    )
    args = parser.parse_args()
    if not args.template.is_file():
        raise SystemExit(
            f"Bundled template missing: {args.template}. "
            "Restore assets/proposal-template.docx into the skill."
        )
    print(f"Template OK: {args.template}")


if __name__ == "__main__":
    main()
