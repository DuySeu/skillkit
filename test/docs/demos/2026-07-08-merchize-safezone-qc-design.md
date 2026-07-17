# Merchize Safezone QC Checker — Demo Design

Date: 2026-07-08

## Purpose

This demo is a command-line QC checker for Merchize print-on-demand product previews. Given a rendered preview image and a `product_type`, it uses a vision-capable LLM (Claude 3.5 Sonnet on AWS Bedrock) to judge a single quality rule: **"design chính không tràn safezone"** — whether the main design overflows the safe print area.

It is a proof-of-concept for QC reviewers and the print-ops team, showing that a vision LLM can automate a check that is currently done manually by eye. The demo deliberately evaluates only the safezone-overflow rule (pulling the product's `sc_note`/catalog from the CSV for context), rather than the full QC ruleset.

**Success criteria:** on a set of sample preview URLs (some clean, some overflowing), the demo returns the correct `pass`/`fail` verdict with a sensible short reason.

## Input

The demo consumes two CLI arguments plus one data file:

- **`--image-url`** (string, required): a URL to the rendered product preview image (PNG/JPEG). The image is downloaded at runtime and base64-encoded into the Bedrock request.
- **`--product-type`** (string, required): the product type code, e.g. `LWALLET_CARD_0500D5TM`. Used as the lookup key into the CSV.
- **`--csv-path`** (string, optional): path to the CSV. Defaults to the local `product_type_sc_note.csv`.
- **CSV file** (`product_type_sc_note.csv`, local): columns are `product type`, `sc note`, and numbered layer columns `1`–`15`. For the given `product_type`, the demo reads:
  - **`sc note`** → the Vietnamese QC rules text, passed to the model as context.
  - **columns `1`–`15`** → the product's layer catalog (e.g. `file in front`, `file in back`), joined into a short "catalog" string for context.

Edge cases handled inline: if the `product_type` is not found in the CSV, or the image URL cannot be fetched, the demo exits with a clear error message rather than calling the model.

## Output

The demo prints a single JSON object to stdout:

```json
{
  "verdict": "pass",
  "reason": "Thiết kế chính nằm gọn trong safezone, không có chi tiết bị cắt ở mép."
}
```

- **`verdict`**: either `"pass"` (design stays within the safezone) or `"fail"` (design overflows the safe print area).
- **`reason`**: a short human-readable explanation from the model. It will tend to follow the language of the sc_note (Vietnamese), which is fine for the reviewer audience.

The JSON is the only thing written to stdout, so it can be piped or parsed by another tool. Any diagnostics, progress, or error messages go to stderr to keep stdout clean. On an unrecoverable error (product_type not found, image fetch failure, model/parse failure), the demo prints a JSON error object to stderr and exits with a non-zero status.

## Tech Stack

Confirmed with the user:

- **Language:** Python 3.10+
- **LLM:** Anthropic Claude 3.5 Sonnet on **AWS Bedrock** — model id `anthropic.claude-3-5-sonnet-20240620-v1:0`, vision-enabled
- **AWS SDK:** `boto3` — Bedrock Runtime `invoke_model`, using the default credential chain/profile; region `us-east-1`
- **Image fetch:** `httpx` — download the image URL, then base64-encode for the request
- **CSV parsing:** Python stdlib `csv` (no pandas)
- **CLI:** stdlib `argparse` — args `--image-url`, `--product-type`, optional `--csv-path`
- **JSON:** stdlib `json`

**Dependencies** (pinned in `requirements.txt`): `boto3`, `httpx`. Everything else is stdlib. Requires valid AWS credentials with Bedrock `InvokeModel` permission for the Claude 3.5 Sonnet model in `us-east-1`.

## Architecture

A single linear CLI pipeline — no services, no persistence. One process runs start to finish:

```
CLI args ─▶ [CSV lookup] ─▶ [Image fetch + encode] ─▶ [Prompt build] ─▶ [Bedrock invoke] ─▶ [Parse] ─▶ stdout JSON
                 │                    │                                        │
           product_type_        image bytes                            Claude 3.5 Sonnet
           sc_note.csv          (base64)                               (vision, us-east-1)
```

The design is a set of small, single-purpose functions orchestrated by a `main()` entry point. Data flows one direction: arguments in, JSON verdict out. The only external boundaries are (1) the local CSV file, (2) the image URL over HTTP, and (3) the Bedrock API over the AWS SDK. There is no shared state, no config beyond CLI args and AWS credentials, and no framework — just a script. This keeps the demo easy to read top-to-bottom and easy to run with one command.

## Components

All in a single module (`qc_checker.py`), each function small and single-purpose:

- **`parse_args()`** — defines/parses `--image-url`, `--product-type`, optional `--csv-path`. Depends on `argparse`.
- **`lookup_product(product_type, csv_path) -> (sc_note, catalog)`** — reads the CSV with stdlib `csv`, finds the row matching `product_type`, returns the `sc note` text and a joined catalog string from columns `1`–`15`. Raises a clear error if not found.
- **`fetch_image(url) -> (bytes, media_type)`** — downloads the image with `httpx`, returns raw bytes and the detected media type (`image/png` or `image/jpeg`). Raises on non-200 or unreadable content.
- **`build_prompt(sc_note, catalog) -> str`** — constructs the focused instruction: evaluate *only* "design chính không tràn safezone," using sc_note/catalog as context, and return strict JSON. Pure function, no dependencies.
- **`invoke_model(image_bytes, media_type, prompt) -> str`** — base64-encodes the image, assembles the Bedrock messages payload (image block + text block, plus an assistant prefill `{` and low temperature), calls `invoke_model`, returns the raw completion text. Depends on `boto3`, `base64`, `json`.
- **`parse_verdict(raw) -> dict`** — parses the model output into `{"verdict", "reason"}`, with a fallback that extracts the first JSON object if the text has stray tokens. Normalizes verdict to `pass`/`fail`.
- **`main()`** — orchestrates the above in order, prints the JSON to stdout, routes errors to stderr with a non-zero exit.

## Workflow

End-to-end flow when a reviewer runs the demo:

1. **Invoke:** the user runs
   ```
   python qc_checker.py --image-url "https://…/preview.png" --product-type LWALLET_CARD_0500D5TM
   ```
2. **Parse args:** `main()` calls `parse_args()` to read the image URL, product type, and optional CSV path.
3. **Lookup:** `lookup_product()` opens the CSV, finds the row for the product_type, and returns its `sc_note` and joined `catalog`. If not found → error to stderr, non-zero exit.
4. **Fetch image:** `fetch_image()` downloads the preview via `httpx` and returns bytes + media type. If the fetch fails → error to stderr, non-zero exit.
5. **Build prompt:** `build_prompt()` assembles the focused instruction (evaluate only safezone overflow; sc_note + catalog as context; return strict JSON).
6. **Invoke model:** `invoke_model()` base64-encodes the image, sends the vision request to Claude 3.5 Sonnet on Bedrock with a `{` assistant prefill and low temperature, and returns the raw completion.
7. **Parse verdict:** `parse_verdict()` turns the completion into `{"verdict", "reason"}`, applying the JSON-extraction fallback if needed.
8. **Output:** `main()` prints the JSON verdict to stdout (exit 0). Any failure along the way prints a JSON error to stderr with a non-zero exit.

A reviewer can run it per image, or script a loop over many URLs and collect the stdout JSON.
