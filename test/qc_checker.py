#!/usr/bin/env python3
"""Merchize Safezone QC Checker.

A single-rule QC checker for Merchize print-on-demand product previews.

Given a rendered preview image URL and a product_type, it looks up the
product's QC note (sc_note) and layer catalog from a local CSV, then asks
Claude 3.5 Sonnet on AWS Bedrock to judge one rule only:

    "design chính không tràn safezone"
    (the main design must not overflow the safe print area)

It prints a single JSON verdict to stdout:

    {"verdict": "pass" | "fail", "reason": "..."}

All diagnostics and errors go to stderr. On any unrecoverable error the
script prints a JSON error object to stderr and exits non-zero.
"""

from __future__ import annotations

import argparse
import base64
import csv
import json
import sys
from pathlib import Path

import boto3
import httpx

# --- Constants ---------------------------------------------------------------

MODEL_ID = "anthropic.claude-3-5-sonnet-20240620-v1:0"
REGION = "us-east-1"
DEFAULT_CSV = Path(__file__).resolve().parent / "product_type_sc_note.csv"

# The single rule this demo evaluates.
TARGET_RULE = "design chính không tràn safezone"

# httpx download safety limits (inline robustness, not a full feature).
HTTP_TIMEOUT_SECONDS = 30.0
MAX_IMAGE_BYTES = 20 * 1024 * 1024  # 20 MB

# CSV layer columns that make up the product "catalog".
CATALOG_COLUMNS = [str(i) for i in range(1, 16)]  # "1".."15"


class QCError(Exception):
    """Raised for expected, user-facing failures (bad input, fetch, model)."""


# --- Components --------------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments."""
    parser = argparse.ArgumentParser(
        description=(
            "Check whether a product design overflows the safezone "
            "(design chính không tràn safezone) using Claude on AWS Bedrock."
        )
    )
    parser.add_argument("--image-url", required=True, help="URL of the rendered preview image.")
    parser.add_argument("--product-type", required=True, help="Product type code, used as CSV lookup key.")
    parser.add_argument(
        "--csv-path",
        default=str(DEFAULT_CSV),
        help=f"Path to the product_type/sc_note CSV (default: {DEFAULT_CSV}).",
    )
    parser.add_argument(
        "--region",
        default=REGION,
        help=f"AWS region for Bedrock (default: {REGION}).",
    )
    return parser.parse_args(argv)


def lookup_product(product_type: str, csv_path: str) -> tuple[str, str]:
    """Look up sc_note and a joined catalog string for the given product_type.

    Returns (sc_note, catalog). Uses the FIRST matching row if duplicates
    exist. Raises QCError if the CSV is missing or the product_type is not found.
    """
    path = Path(csv_path)
    if not path.is_file():
        raise QCError(f"CSV file not found: {csv_path}")

    with path.open(newline="", encoding="utf-8-sig") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            if (row.get("product type") or "").strip() == product_type:
                sc_note = (row.get("sc note") or "").strip()
                catalog_parts = [
                    (row.get(col) or "").strip()
                    for col in CATALOG_COLUMNS
                    if (row.get(col) or "").strip()
                ]
                catalog = ", ".join(catalog_parts)
                return sc_note, catalog

    raise QCError(f"product_type not found in CSV: {product_type}")


def fetch_image(url: str) -> tuple[bytes, str]:
    """Download the image and return (bytes, media_type).

    Media type is detected from magic bytes (reliable), falling back to the
    HTTP Content-Type header. Raises QCError on non-200, oversize, or an
    unrecognized image format.
    """
    try:
        resp = httpx.get(url, timeout=HTTP_TIMEOUT_SECONDS, follow_redirects=True)
    except httpx.HTTPError as exc:
        raise QCError(f"failed to fetch image: {exc}") from exc

    if resp.status_code != 200:
        raise QCError(f"image fetch returned HTTP {resp.status_code}")

    data = resp.content
    if not data:
        raise QCError("image fetch returned empty body")
    if len(data) > MAX_IMAGE_BYTES:
        raise QCError(f"image exceeds max size of {MAX_IMAGE_BYTES} bytes")

    media_type = _detect_media_type(data, resp.headers.get("content-type"))
    if media_type is None:
        raise QCError("unsupported image format (expected PNG or JPEG)")
    return data, media_type


def _detect_media_type(data: bytes, content_type: str | None) -> str | None:
    """Detect image media type from magic bytes, then Content-Type header."""
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return "image/gif"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    # Fall back to the server-provided Content-Type header.
    if content_type:
        ct = content_type.split(";")[0].strip().lower()
        if ct in {"image/png", "image/jpeg", "image/gif", "image/webp"}:
            return ct
    return None


def build_prompt(sc_note: str, catalog: str) -> str:
    """Build the focused instruction for the vision model.

    Pure function: evaluates ONLY the safezone-overflow rule and requests
    strict JSON output.
    """
    sc_note_block = sc_note if sc_note else "(no sc_note provided)"
    catalog_block = catalog if catalog else "(no catalog provided)"
    return (
        "Bạn là nhân viên QC cho sản phẩm print-on-demand của Merchize.\n"
        "Bạn nhìn vào ảnh preview của sản phẩm và CHỈ đánh giá DUY NHẤT một quy tắc:\n"
        f'  "{TARGET_RULE}"\n'
        "Nghĩa là: phần design chính có bị tràn ra ngoài vùng in an toàn (safezone) hay không.\n"
        "Safezone thường được thể hiện bằng đường viền nét đứt trong ảnh. Nếu chi tiết "
        "của design chính (chữ, hình) bị cắt ở mép hoặc vượt ra ngoài đường safezone thì "
        "coi là TRÀN (fail). Nếu design nằm gọn bên trong safezone thì đạt (pass).\n\n"
        "Bỏ qua tất cả các quy tắc QC khác. KHÔNG đánh giá lỗ treo, màu sắc, nét mảnh, "
        "chi tiết rời, hay bất cứ điều gì khác ngoài việc tràn safezone.\n\n"
        "Thông tin tham khảo cho loại sản phẩm này:\n"
        f"- Ghi chú SC (sc_note):\n{sc_note_block}\n"
        f"- Các lớp/catalog: {catalog_block}\n\n"
        "Trả lời DUY NHẤT bằng một object JSON hợp lệ, không thêm chữ nào khác, theo dạng:\n"
        '{"verdict": "pass" hoặc "fail", "reason": "giải thích ngắn gọn"}\n'
        'Trong đó "verdict" là "pass" nếu design KHÔNG tràn safezone, "fail" nếu design TRÀN safezone.'
    )


def invoke_model(image_bytes: bytes, media_type: str, prompt: str, region: str) -> str:
    """Send the vision request to Claude 3.5 Sonnet on Bedrock.

    Uses an assistant-turn prefill ("{") plus low temperature to make JSON
    output reliable. Returns the raw completion text (with the "{" prefix
    prepended back so the result is a complete JSON string).
    """
    client = boto3.client("bedrock-runtime", region_name=region)
    encoded = base64.standard_b64encode(image_bytes).decode("ascii")

    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 512,
        "temperature": 0.0,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": encoded,
                        },
                    },
                    {"type": "text", "text": prompt},
                ],
            },
            # Prefill the assistant turn with an opening brace to force JSON.
            {"role": "assistant", "content": "{"},
        ],
    }

    try:
        resp = client.invoke_model(modelId=MODEL_ID, body=json.dumps(body))
        payload = json.loads(resp["body"].read())
    except Exception as exc:  # boto/client errors surface here
        raise QCError(f"Bedrock invoke_model failed: {exc}") from exc

    try:
        text = payload["content"][0]["text"]
    except (KeyError, IndexError, TypeError) as exc:
        raise QCError(f"unexpected Bedrock response shape: {payload!r}") from exc

    # Re-attach the prefilled opening brace so we have a full JSON object.
    return "{" + text


def parse_verdict(raw: str) -> dict:
    """Parse the model output into {"verdict", "reason"}.

    Tries a direct JSON parse first, then falls back to extracting the first
    balanced JSON object from the text. Normalizes verdict to "pass"/"fail".
    Raises QCError if no usable verdict can be extracted.
    """
    obj = _load_json_loose(raw)
    if obj is None or not isinstance(obj, dict):
        raise QCError(f"could not parse JSON verdict from model output: {raw!r}")

    verdict = str(obj.get("verdict", "")).strip().lower()
    reason = str(obj.get("reason", "")).strip()

    if verdict not in {"pass", "fail"}:
        # Best-effort normalization from common variants.
        if verdict in {"passed", "ok", "true", "đạt"}:
            verdict = "pass"
        elif verdict in {"failed", "false", "tràn", "khong dat", "không đạt"}:
            verdict = "fail"
        else:
            raise QCError(f"model returned an unrecognized verdict: {obj!r}")

    return {"verdict": verdict, "reason": reason}


def _load_json_loose(raw: str) -> object | None:
    """Parse JSON directly, or extract the first {...} object if needed."""
    raw = raw.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    start = raw.find("{")
    if start == -1:
        return None
    depth = 0
    for i in range(start, len(raw)):
        ch = raw[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                candidate = raw[start : i + 1]
                try:
                    return json.loads(candidate)
                except json.JSONDecodeError:
                    return None
    return None


# --- Orchestration -----------------------------------------------------------

def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        sc_note, catalog = lookup_product(args.product_type, args.csv_path)
        print(f"[info] loaded sc_note ({len(sc_note)} chars), catalog: {catalog!r}", file=sys.stderr)

        image_bytes, media_type = fetch_image(args.image_url)
        print(f"[info] fetched image: {len(image_bytes)} bytes, {media_type}", file=sys.stderr)

        prompt = build_prompt(sc_note, catalog)
        raw = invoke_model(image_bytes, media_type, prompt, args.region)
        verdict = parse_verdict(raw)
    except QCError as exc:
        json.dump({"error": str(exc)}, sys.stderr, ensure_ascii=False)
        sys.stderr.write("\n")
        return 1

    json.dump(verdict, sys.stdout, ensure_ascii=False)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
