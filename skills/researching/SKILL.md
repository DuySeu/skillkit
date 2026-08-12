---
name: researching
description: Use when asked to research or explain a topic — "what is X", "explain X", "current state of X", "get me up to speed on X", "brain-dump everything about X" — especially for a beginner audience or a fast-moving field where training data may be stale.
---

# Researching Unfamiliar Topics (Beginner-First)

## Overview

Three instincts ruin topic research: answering from stale training data, equating thorough with long, and writing in the shorthand of someone who already knows the field. This skill enforces the opposite: **search first, answer short, takeaway first, and say it in words the reader actually has.**

**Violating the letter of these rules is violating the spirit of these rules.**

## Rule 1: Search BEFORE writing — no exceptions

If any part of the answer *could* have changed since your training cutoff (tools, versions, market state, standards, prices, "current state of..."), run at least one web search **before writing a single sentence of the answer**.

**No exceptions:**
- Don't answer from memory and disclose your cutoff. Disclosure is not a substitute for searching.
- Don't answer from memory and *offer* to search at the end. Offering is deferring the violation to the user.
- "User said quick / off the top of your head" → they want a fast answer, not a stale one. One search takes seconds.
- Only skip searching for genuinely settled knowledge (math, historical facts, timeless fundamentals) — and if the topic mixes both, search for the fast-moving part.

## Rule 2: Mandatory answer structure

1. **The takeaway FIRST** — one plain-language definition with a familiar analogy. If the reader stops here, they got the point.
2. **3–5 core concepts** a beginner must know, each 1–3 sentences.
3. **Latest developments** — with explicit dates and linked sources for every claim.
4. **Common beginner misconceptions** — 2–3, briefly corrected.

Never put the "mental model to keep" at the end. That's the lede; lead with it.

## Rule 3: ~500-word cap on the overview

"Be thorough", "comprehensive", "brain-dump everything" are NOT licenses for length. Thorough = well-chosen 500 words + an offer to drill into specific parts. A 1,500-word wall serves the writer, not the beginner. If material won't fit, it becomes the drill-down menu at the end, not extra sections.

## Rule 4: Zero unexplained jargon, zero unexpanded abbreviations

Every technical term gets a plain-language gloss on first use. If a term isn't worth glossing, it isn't worth including.

**Every abbreviation, acronym, or initialism gets its full form in parentheses on first use, then the gloss.** Shape: `ABBR (Full Words Behind It - what it actually does in plain language)`.

- `KEM (Key Encapsulation Mechanism - cách hai bên thống nhất một khoá bí mật chung)`
- `RAG (Retrieval-Augmented Generation - mô hình tra cứu tài liệu trước rồi mới trả lời)`
- `TTFT (Time To First Token - thời gian từ lúc gửi câu hỏi tới lúc chữ đầu tiên hiện ra)`

This applies even to abbreviations you consider common knowledge (API, LLM, SDK, CI, JWT). "Everyone knows this one" is the exact assumption that loses a beginner. After the first expansion, use the short form freely - expand once, not every time.

An abbreviation inside a quoted product name, a command, a flag, or a file path stays verbatim: expand it in the prose around it, never rewrite the literal string.

## Rule 5: Separate stable from fast-changing

Label which parts are timeless fundamentals (safe to remember for years) and which are current-state (true as of the cited date, will drift). Every fast-changing claim carries a date and a source; fundamentals don't need citations.

## Rule 6: One language per answer

Answer entirely in the language the user asked in. A Vietnamese question gets a Vietnamese answer - not Vietnamese scaffolding with English clauses dropped in, and not an English paragraph with Vietnamese connectors.

Half-and-half sentences are the failure mode to kill:

| Bad | Good |
|---|---|
| "Model này handle được long context tốt hơn" | "Mô hình này xử lý ngữ cảnh dài tốt hơn" |
| "Bạn cần deploy nó lên production trước khi test performance" | "Bạn cần triển khai lên môi trường thật trước khi đo hiệu năng" |
| "Nó improve accuracy nhưng tăng latency" | "Nó tăng độ chính xác nhưng chậm hơn (độ trễ cao hơn)" |

An English term survives untranslated only when it is genuinely a name, not a word:

- Proper nouns and product names: Claude Code, PostgreSQL, Kubernetes.
- Literal code: identifiers, flags, commands, file paths, config keys.
- Terms of art with no settled Vietnamese equivalent, where translating would make it *harder* to search or discuss with other engineers: `transformer`, `embedding`, `container`, `token`. Keep the English word, and gloss it in Vietnamese once: "embedding (vector số biểu diễn ý nghĩa của một đoạn văn bản)".

When in doubt, translate. If a term needs to stay in English, keep it in English every time it appears - don't alternate between "độ trễ" and "latency" for the same idea in one answer.

## Rationalizations — all of them mean STOP

| Excuse | Reality |
|---|---|
| "I flagged my knowledge cutoff" | Flagging staleness ≠ fixing it. Search. |
| "I offered to search if they want" | You made the user do your verification. Search first. |
| "They said quick / off the top of your head" | Quick means fast, not stale. One search is fast. |
| "They asked for a thorough brain-dump" | Thorough = right 500 words + drill-down offers, not 1,700 words. |
| "The topic is technical, jargon is unavoidable" | Then gloss it. Unexplained jargon = failed answer for a beginner. |
| "My summary paragraph is at the end" | The takeaway goes first. Move it. |
| "API / LLM / SDK is universally known" | Expand it anyway, once. You don't know what this reader knows. |
| "The English word is shorter / more precise" | Shorter for you, opaque for them. Translate it, or gloss it and stay consistent. |
| "Devs here talk half-English anyway" | Casual speech isn't a written explanation for a beginner. Pick one language. |

## Red Flags — if you notice these, start over

- You started writing the answer before any search ran
- Your draft is over ~500 words
- A "one-paragraph version to keep" appears at the bottom
- A time-sensitive claim has no date or source
- A beginner would need to look up a term you used
- An acronym appears anywhere in the draft without its full form given once
- Any sentence mixes two languages, or the same concept appears under both its English and its translated name
