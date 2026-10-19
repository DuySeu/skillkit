# Engagement context - background for the assistant only

Nothing in this file goes into the Markdown or the DOCX. It is why the document is written the way it is, not content to be written. Never state the funding purpose, the reviewer audience, or any persuasion intent inside the deliverable.

## What the document is for

An AWS Partner funding request. The primary reader is an AWS reviewer deciding whether to fund the engagement; the secondary reader is the customer. Two consequences that pull against each other, and the order between them is fixed:

1. Write at overview level. Work items are described generally, not as implementation steps.
2. Every line must survive a question. If the AWS reviewer asks how an item is actually delivered, the answer has to match the real implementation. A general sentence is fine; a general sentence that turns out to be untrue is not.

So the target is a document that reads short and defends deep.

## Altitude

- Work items get one line each: the outcome, not the API call, console path, or test procedure.
- Keep the constraint, drop the mechanism. "Encryption matches the customer's key decision, executed before any content exists in the account" rather than naming the API that verifies it.
- Prose sections run 2 to 3 paragraphs. Success criteria run 3 to 6 bullets per workstream. Table cells are noun phrases, not sentences.
- A fact worth stating lives in one place. Repeating it in criteria, scope, architecture and path-to-production is how a 3,000-word plan becomes 9,000.

## Truthfulness rules that outrank brevity

- Never describe a control the product does not have. When a customer asks for something the product cannot enforce, split the scope into three groups and label them: configured in the product, owned by the customer, and stated rather than claimed.
- Verify product facts against vendor documentation before writing them: pricing and billing units, Region and feature availability, capability names, what each log source covers, encryption scope and ordering. Say "unverified" where a check was not run.
- Where the product cannot enforce a customer policy, write the rule plus the review that stands in for it, and have the customer sign off on the model as it is. A criterion that implies prevention where only detection exists is the worst failure mode in this document, because it is the one the customer discovers in month three.
- Prefer naming the mechanism over naming the vendor feature when the feature name would date. "Administrative and API activity recorded to a customer-owned bucket" survives a product rename.

## Counts and figures

- State account and user counts once, in Assumptions, with a line saying that every threshold and estimate elsewhere derives from it. Everywhere else use named populations ("every provisioned account", "the administrator accounts") and percentages ("at least 80% of pilot users").
- The cost tables are the exception: a billing line needs the raw count.
- No invented precision. A proposed threshold is round and labelled proposed, or `(pending)`.
- Percentage columns must sum to 100 at the number of decimal places shown. A reviewer with a calculator finds this first.
- In the cost breakdown, each Description says what the service is, then how it is billed. Two short clauses.
- Drop cost lines that do not accrue. Fold the no-charge and usage-dependent components into one sentence under the table rather than listing $0 rows.
- If the funding figure is sized at production scale while the engagement is a pilot, label both in the subscription table and say which one the breakdown represents. Never let the reviewer discover the gap.
- When an effort or hours figure is not covered by the partner defaults (retained support, multi-month engagements), say in the document that it is proposed for this engagement rather than a standard figure, and show its basis.
- If the funding split no longer covers the total, state the shortfall as a number in section 5. Rounding the tables to hide it wastes the reviewer's time and ours.

## Template mechanics of the bundled DOCX

- Row capacities, silently truncated when exceeded: stakeholders 12 data rows; the three milestone tables 2 / 3 / 3; subscription assumption 2; service breakdown 6; phase hours 8; contribution split 3. Design the Markdown tables to fit, and move detail that does not fit into bullets.
- `fill_table` keeps the template's header row and discards the Markdown header, so put the unit inside the cell ("Week 1", "Months 2 to 3"), never only in the column name.
- `fill-plan.py` reads the section 5 tables from `sections["5"]`, and `parse_sections` is flat rather than nested, so the phase hours and contribution split tables go directly under `## 5`, above `### 5.1`.
- Check the frontmatter before export. A Markdown formatter reads the opening `---` as a thematic break and rewrites `slug: x` plus the closing `---` into `## slug: x`, which empties the cover page. Repair it and re-run the parse before calling `fill-plan.py`.
