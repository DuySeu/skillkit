# Human tone - the AI-writing tells to remove before approval

The reader is a customer or an AWS partner reviewer. If the document reads as model output, the content stops being read as a commitment. Tell list adapted from Wikipedia, [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), filtered to what actually appears in a proposal or a project plan.

A tell is not a grammar error. It is a pattern readers have learned to recognise, so one of them in the opening paragraph costs more trust than five typos further down. Run the whole pass before showing the Markdown for approval.

## 1. Vocabulary to delete

| Avoid (EN) | Write instead |
|------------|---------------|
| leverage, utilize | use |
| seamless, robust, cutting-edge, state-of-the-art, world-class, best-in-class | the actual property, with a number |
| delve into, navigate (as metaphor), embark, journey, unlock, realm, myriad | the plain verb |
| landscape, tapestry, testament, ecosystem (as filler) | name the thing |
| pivotal, crucial, vital, critical (as intensifier) | drop it, or say what breaks without it |
| underscore, highlight, showcase, emphasize, demonstrate (about your own text) | state the fact |
| foster, cultivate, empower, drive value, unlock value | the concrete action |
| boasts, features, offers, serves as, stands as, represents, functions as | is, has, does |
| comprehensive, holistic, end-to-end, synergy (as filler) | the scope, listed |
| groundbreaking, renowned, unparalleled, game-changer | delete |
| valuable insights, diverse array, rich, vibrant | the specific output |
| ensure / ensuring (where it means "we hope") | the measurable check |

| Avoid (VN) | Write instead |
|------------|---------------|
| đóng vai trò then chốt / quan trọng | bỏ, hoặc nói rõ hệ quả nếu thiếu |
| nhấn mạnh rằng, thể hiện rõ, cho thấy rõ | nêu thẳng dữ kiện |
| góp phần, đảm bảo rằng, hướng tới việc | động từ trực tiếp + số đo |
| toàn diện, mạnh mẽ, vượt trội, tối ưu, linh hoạt (làm từ đệm) | phạm vi cụ thể, liệt kê ra |
| đột phá, hàng đầu, tiên phong, đẳng cấp | bỏ |
| bức tranh toàn cảnh, hành trình chuyển đổi, mở ra cơ hội | bỏ |
| tận dụng sức mạnh của, khai phá tiềm năng | dùng, chạy trên |
| không chỉ ... mà còn | một câu khẳng định |
| đáp ứng mọi nhu cầu, giải pháp tối ưu | cái hệ thống làm được, đúng phạm vi |
| trong bối cảnh ... ngày càng | tình huống thật của khách hàng |

## 2. Sentence-shape tells

- **Trailing "-ing" significance clause.** "..., ensuring scalability and reliability" / "..., đảm bảo tính mở rộng và ổn định". Delete it, or convert it into a row in the measurement column.
- **Negative parallelism.** "not just X, but Y", "not X, but Y", "X rather than Y" where both are true; VN "không chỉ X mà còn Y". Say the one thing that is true.
- **Rule of three.** Three adjectives, or three parallel bullets, where the content supports one or two. Cut to what you can defend.
- **Avoiding "is".** serves as, stands as, marks, represents, functions as, boasts. The template never needs them.
- **Vague attribution.** "industry reports show", "experts agree", "các nghiên cứu cho thấy", with nothing behind it. Cite the source or drop the claim.
- **Closing recap.** "In summary, ...", "Như vậy, có thể thấy ...". A section ends at its last fact.
- **Symmetry.** Every bullet the same length, every cell one clause, every week row the same shape. Real documents are uneven because the work is uneven.
- **Puffery about the customer or about TechX** in a sentence that carries no fact.

## 3. Formatting tells

- `-` only, never an em dash or en dash. Straight `"` and `'`. Three dots for an ellipsis. (Same as the repo-wide rule.)
- No emoji, no check marks, no decorative arrows. `->` inside a flow description is fine.
- Bold only where the template asks for it (the lead sentence of a goal cell). Not for emphasis inside prose.
- Sentence case in headings, and keep the template's heading text verbatim - the DOCX fill matches on it.
- No heading-level skips (`##` then `####`), no horizontal rules between sections, no heading whose body is only more headings.
- No invented sections. "Challenges and Future Outlook", "Awards and Recognition", "Key Takeaways" are AI section names; the template's section list is fixed.
- No inline-header vertical lists where prose was asked for: `**Scalability:** the system scales.` is wrong in a prose subsection, fine inside a bullet list the template defines.
- No model artifacts anywhere: `oai_citation`, `contentReference`, `attributableIndex`, `[cite: 1]`, `turn0search0`, lenticular brackets `【 】`.

## 4. Content tells specific to these documents

- **Speculative value instead of a commitment.** "opens the door to ...", "mở ra cơ hội ...". Replace with a measurable line, or move it to the path-to-production / next-phase section where it is a plan, not a promise.
- **Restating the requirement as the solution.** "Requirement: extraction accuracy. Solution: an extraction component ensuring accuracy." The solution cell names the services and the mechanism.
- **Universal filler assumptions and risks.** "timelines may shift", "data quality affects results". An assumption is one this engagement actually depends on: this region, this subscription tier, this SME, this sample set.
- **Precision theatre.** 94.7% invented to look measured. A proposed threshold is round and labelled proposed, or `(pending)`.
- **Narrating the document.** "this proposal will now describe", "we can see that", "let's look at". Also: any knowledge-cutoff or capability disclaimer.
- **Same paragraph, any customer.** If the opening paragraph survives a find-and-replace of the customer name, it has not been written yet.

## 5. Pre-approval grep

From the repo root, on the drafted Markdown:

```bash
rg -n -i --pcre2 'leverage|utili[sz]e|seamless|robust|cutting.edge|state.of.the.art|world.class|best.in.class|delve|tapestry|testament|pivotal|underscor|showcas|foster|boast|holistic|synergy|empower|game.chang|myriad|realm|embark|unlock|valuable insight|diverse array|not (only|just)|ensuring|highlighting|emphasizing|serves as|stands as|in (summary|conclusion)|then chốt|góp phần|đảm bảo rằng|không chỉ.{0,40}mà còn|toàn diện|vượt trội|đột phá|hàng đầu|bức tranh|hành trình|tận dụng|mở ra cơ hội|nhấn mạnh|thể hiện rõ|—|–|’|‘|“|”|…|oai_citation|contentReference|\[cite:|turn0search|【' docs/<slug>-*.md
```

Every hit is either removed or defended out loud in the approval message. A word the customer's own brief uses is a legitimate hit to keep; report it as such instead of silently leaving it.
