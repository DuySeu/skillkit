---
name: researching
description: Use when asked to research or explain a topic — "what is X", "explain X", "current state of X", "get me up to speed on X", "brain-dump everything about X" — especially for a beginner audience or a fast-moving field where training data may be stale. Also use when asked to recommend or compare approaches — "which should I use", "how should I do X", "what's the best way to X", "nên dùng gì" — where the answer is a decision; it clarifies unclear constraints first, then gives 2-3 different options with pros and cons.
---

# Researching Unfamiliar Topics (Beginner-First)

## Overview

Three instincts ruin topic research: answering from stale training data, equating thorough with long, and writing in the shorthand of someone who already knows the field. This skill enforces the opposite: **search first, answer short, takeaway first, and say it in words the reader actually has.**

Two kinds of question arrive here, and they get different shapes:

| The question is... | Looks like | Shape it gets |
|---|---|---|
| **Explanatory** - the reader wants to understand something | "what is X", "explain X", "current state of X" | Rule 2 |
| **Solution-seeking** - the reader wants to decide something | "nên dùng gì", "how should I do X", "which approach", "recommend a way to X", "how do I fix/design/architect X" | Rule 3 (clarify) then Rule 4 (options) |

When a question is both ("giải thích X rồi tư vấn nên dùng cái nào"), explain under Rule 2 first, then run Rules 3 and 4.

**Violating the letter of these rules is violating the spirit of these rules.**

## Rule 1: Search BEFORE writing — no exceptions

If any part of the answer *could* have changed since your training cutoff (tools, versions, market state, standards, prices, "current state of..."), run at least one web search **before writing a single sentence of the answer**.

**No exceptions:**
- Don't answer from memory and disclose your cutoff. Disclosure is not a substitute for searching.
- Don't answer from memory and *offer* to search at the end. Offering is deferring the violation to the user.
- "User said quick / off the top of your head" → they want a fast answer, not a stale one. One search takes seconds.
- Only skip searching for genuinely settled knowledge (math, historical facts, timeless fundamentals) — and if the topic mixes both, search for the fast-moving part.

## Rule 2: Mandatory answer structure (explanatory questions)

1. **The takeaway FIRST** — one plain-language definition with a familiar analogy. If the reader stops here, they got the point.
2. **3–5 core concepts** a beginner must know, each 1–3 sentences.
3. **Latest developments** — with explicit dates and linked sources for every claim.
4. **Common beginner misconceptions** — 2–3, briefly corrected.

Never put the "mental model to keep" at the end. That's the lede; lead with it.

## Rule 3: Solution-seeking questions - ask before you propose

A recommendation built on guessed constraints is a recommendation for someone else's problem. Before proposing anything, check whether the answer would **change** depending on facts you don't have. If it would, ask.

**Ask about what actually moves the decision:**

- Scale and load - how many users, how much data, how often, how fast does it need to be.
- What already exists - current stack, language, hosting, team size, what's already been tried and why it failed.
- Hard constraints - budget, deadline, compliance, must-run-offline, must-stay-in-this-cloud.
- What "done" means - a throwaway demo, an internal tool, or something that runs in production for three years. This one flips almost every recommendation.
- Priority when things conflict - cheapest, fastest to build, easiest to maintain, or most correct. Pick one to optimise.

**How to ask:**

- One round, one message. Group every question together; never drip-feed a question at a time.
- Cap at 3-4 questions. If you have more, you're asking for a spec, not for a decision input. Ask the 3 that change the answer most.
- For each question, offer 2-3 likely answers so the reader can point instead of composing an essay: "Chạy trên bao nhiêu người dùng - vài chục nội bộ, vài nghìn, hay hàng triệu?"
- Never ask what you can find out yourself. Read the repository, read `package.json`, run a search. Asking a question whose answer sits in the code the reader already gave you wastes their turn.
- Never ask about something that doesn't change your proposal. If all three options work either way, don't ask.

**When the reader won't or can't answer** ("cứ đề xuất đi", "tôi không biết"), don't stall and don't ask twice. Proceed under stated assumptions: write the assumption down explicitly next to each option ("Giả định: nhóm dưới 5 người, chạy trên một máy chủ duy nhất"), and note which option would win if that assumption is wrong.

## Rule 4: Solution-seeking questions - always 2-3 options, never one

Never hand over a single answer as if it were the only one. Give **2-3 genuinely different approaches** to the same problem, so the reader sees the shape of the trade-off and not just your conclusion.

**Genuinely different means different in kind, not different in configuration.** "PostgreSQL vs PostgreSQL with an index" is one option. "A managed database vs a file on disk vs an in-memory cache with periodic flushing" is three. If two of your options share the same failure mode, the same cost driver, and the same amount of work, they are one option wearing two names - go find a real alternative.

**Per option, in this order:**

1. **A name and one line** - what it is, in the reader's words. "Phương án A - Dùng dịch vụ có sẵn (managed service)".
2. **How it works** - 2-3 sentences. Enough to picture it, not a tutorial.
3. **Ưu điểm** - 2-4 bullets, concrete. "Rẻ" is not a pro; "khoảng 5 USD/tháng ở quy mô này" is.
4. **Nhược điểm** - 2-4 bullets, and they must be real. An option with no downside means you didn't look. Include the cost that shows up in month six, not just at setup.
5. **Chọn khi nào** - the one situation where this option is clearly the right one.

**Then a comparison table** across the 3-4 axes that actually decide it for this reader - effort to build, monthly cost, who maintains it, how it fails, how hard it is to move off later. Not a generic feature grid.

**Then one recommendation.** Options are for showing the trade-off; ending in a menu leaves the work with the reader. Close with: which one you'd pick, in one sentence why, and **what fact would flip it** ("nếu lượng người dùng vượt ~10.000 thì chuyển sang phương án B").

**Budget:** ~700 words for a solution answer, roughly 150 per option. Same discipline as Rule 5, slightly larger box. Depth goes into the drill-down offer, not into a fourth option.

## Rule 5: ~500-word cap on the overview

"Be thorough", "comprehensive", "brain-dump everything" are NOT licenses for length. Thorough = well-chosen 500 words + an offer to drill into specific parts. A 1,500-word wall serves the writer, not the beginner. If material won't fit, it becomes the drill-down menu at the end, not extra sections.

Solution answers under Rule 4 use their own ~700-word budget. Every other rule in this skill applies to them unchanged - search first, no unexplained jargon, one language, dates and sources on anything that drifts.

## Rule 6: Zero unexplained jargon, zero unexpanded abbreviations

Every technical term gets a plain-language gloss on first use. If a term isn't worth glossing, it isn't worth including.

**Every abbreviation, acronym, or initialism gets its full form in parentheses on first use, then the gloss.** Shape: `ABBR (Full Words Behind It - what it actually does in plain language)`.

- `KEM (Key Encapsulation Mechanism - cách hai bên thống nhất một khoá bí mật chung)`
- `RAG (Retrieval-Augmented Generation - mô hình tra cứu tài liệu trước rồi mới trả lời)`
- `TTFT (Time To First Token - thời gian từ lúc gửi câu hỏi tới lúc chữ đầu tiên hiện ra)`

This applies even to abbreviations you consider common knowledge (API, LLM, SDK, CI, JWT). "Everyone knows this one" is the exact assumption that loses a beginner. After the first expansion, use the short form freely - expand once, not every time.

An abbreviation inside a quoted product name, a command, a flag, or a file path stays verbatim: expand it in the prose around it, never rewrite the literal string.

## Rule 7: Separate stable from fast-changing

Label which parts are timeless fundamentals (safe to remember for years) and which are current-state (true as of the cited date, will drift). Every fast-changing claim carries a date and a source; fundamentals don't need citations.

## Rule 8: One language per answer

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
| "There's really only one sane approach here" | Then the other two options are the honest runners-up and why they lose. Show them. |
| "Asking questions slows them down" | Proposing the wrong solution costs them a day. Three questions cost them a minute. |
| "I'll ask the follow-up questions as they come up" | One round, one message. Drip-feeding turns a decision into an interrogation. |
| "The second option is the first one but with X" | That's a configuration, not an alternative. Find an approach that fails differently. |
| "I listed the options, they can choose" | A menu with no recommendation hands the work back. Pick one and say what would flip it. |
| "I couldn't list a downside for my favourite" | Every option costs something. If you can't name it, you haven't looked past setup day. |
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
- A solution answer proposes exactly one approach, or four
- Two of your options would fail the same way, cost the same, and take the same effort
- An option has an empty or hand-waved "nhược điểm" section
- You proposed a solution while a constraint that would change it was still unknown and unasked
- You asked a question whose answer is in the code, the repository, or a search you could have run
- Questions arrived in several messages instead of one, or there were more than four
- The answer ends on the comparison table with no recommendation and no flip condition
