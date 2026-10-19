# Export by runtime

Step 7 uses **native spreadsheet tools** in the agent's runtime. Do **not** run bundled Python scripts from this skill. Every runtime must produce the same four sheets, with the exact names and layout given in SKILL.md step 7.

## Detect runtime

| Signals | Runtime | Deliverable |
|---------|---------|-------------|
| Gemini Spark, Gemini Tasks, `/skill`, Connected Apps (Sheets) | **Gemini Spark** | Google Sheets (4 tabs) |
| Claude Code, Claude.ai with code execution / xlsx skill | **Claude** | `.xlsx` download |
| Amazon Quick chat, Quick Excel extension, Quick document creation | **Amazon Quick** | `.xlsx` download |

If unclear, ask the user once. Default to `.xlsx` only when the runtime exposes Excel or code execution; default to Google Sheets only in Gemini Spark with Sheets connected.

---

## Gemini Spark → Google Sheets

**Prerequisite:** Google Sheets Connected App enabled (Settings → Connected Apps).

1. Assemble plan data per the schema read in SKILL.md step 7 (internal draft is fine; optional `plan.json` in workspace).
2. Create a new spreadsheet named `Kế hoạch — [destination] — [dates]`.
3. Create exactly four tabs: **Tổng quan**, **Lịch trình**, **Dự toán chi phí**, **Checklist**.
4. Populate each tab using the layout table from the schema.
5. On **Dự toán chi phí**, use Sheets formulas: per-person `=C2/$num_people`, total `=SUM(C2:Cn)`, total/person `=C{total_row}/$num_people`.
6. Share the Sheets URL in chat.

**Prompt pattern (Spark task):**

> Tạo Google Sheets mới với 4 tab: Tổng quan, Lịch trình, Dự toán chi phí, Checklist. Điền theo layout kế hoạch du lịch đã lập. [paste or attach plan summary]

Do not export `.xlsx` first unless the user asks — deliver native Sheets.

---

## Claude → MS Excel (.xlsx)

Use Claude's **native xlsx / code execution** capability (Anthropic xlsx skill or equivalent sandbox). Do **not** invoke `create_travel_plan.py` or any script from this skill folder.

1. Assemble plan data per the schema read in SKILL.md step 7.
2. Generate a workbook with openpyxl (or xlsxwriter) **inside Claude's sandbox** - four sheets, layout from the schema.
3. Include formulas on the costs sheet (`SUM`, per-person division).
4. Return the downloadable `.xlsx` artifact to the user.

If openpyxl is unavailable, use xlsxwriter for a new file. Prefer formulas in column C/E on **Dự toán chi phí**; leave column D (Thực tế) empty for user fill-in.

---

## Amazon Quick → MS Excel (.xlsx)

**In Quick chat (document creation):** ask Quick to create an `.xlsx` with four worksheets matching the schema layout. Quick generates the file via its built-in document pipeline - no external script.

**In Quick Excel extension:** select or create a workbook, then prompt Quick to add four sheets and populate from the plan. Quick executes in the Excel sandbox (Office.js).

**Prompt pattern:**

> Tạo file Excel (.xlsx) kế hoạch du lịch với 4 sheet: Tổng quan, Lịch trình, Dự toán chi phí, Checklist. Layout và cột theo kế hoạch đã lập. [plan summary]

Verify the download opens with all four sheet names before closing the task.

---

## Post-export verification (all runtimes)

- [ ] Four sheets/tabs exist with exact Vietnamese names
- [ ] **Tổng quan** shows destination, dates, stay, weather, total and per-person cost
- [ ] **Lịch trình** has one row per time slot
- [ ] **Dự toán chi phí** has SUM row and per-person formulas
- [ ] **Checklist** has three sections with checkbox rows
- [ ] User receives link (Sheets) or file (`.xlsx`)

If export fails, fix data and retry with the same native tool — do not fall back to a bundled script.
