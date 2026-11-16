# Export: Excel (.xlsx) or Google Sheets

## Contents

- Pick the format
- Fill the template
- Deliver as .xlsx
- Deliver as Google Sheets
- Runtime notes
- Verify

The skill supports both formats, and both come from the same file: `assets/trip-template.xlsx`. The template uses only functions that exist in both Excel and Google Sheets (`IF`, `SUM`, `SUMIF`, `VLOOKUP`, `COUNTA`, `MOD`) and no `GOOGLEFINANCE`, so one filled workbook serves either. This skill bundles no scripts; write the few lines of fill code in the runtime's own code tool.

## Pick the format

| Situation | Deliverable |
| --- | --- |
| The user names Excel, `.xlsx` or "file" | `.xlsx` |
| The user names Google Sheets, ggsheet, gsheet or asks for a link | Google Sheets |
| No format named, and a Google Sheets or Drive tool is connected | Google Sheets |
| No format named, no such tool | `.xlsx` |

When the user wants Google Sheets and no tool here can create or upload one, deliver the `.xlsx` and tell them it opens in Google Sheets as is: upload it to Drive and choose Open with > Google Sheets, or use File > Import in a sheet.

## Fill the template

Start only after the user has approved the draft `docs/<destination>-trip-planning.md` (SKILL.md Step 8); the values come from that file. This step is the same for both formats whenever the runtime can read files and run code.

1. Copy `assets/trip-template.xlsx` to `docs/<destination>-trip.xlsx` in the user's working directory, next to the draft, for example `docs/hong-kong-trip.xlsx`. Do not write it to a temporary or scratch folder, and never edit the template itself. Only where the runtime hands files to the user from one fixed output folder (Claude.ai with code execution) does `docs/` go inside that folder.
2. Open the copy with openpyxl `load_workbook`. A new `Workbook()`, pandas `to_excel` or xlsxwriter would drop the formulas, dropdowns, colours and chart.
3. Write values into the cells listed in `output-schema.md`, and only those.
4. Merge column A over each day's rows, delete the unused slot rows, save.

```python
import shutil
import openpyxl

shutil.copy("<skill dir>/assets/trip-template.xlsx", "docs/hong-kong-trip.xlsx")
wb = openpyxl.load_workbook("docs/hong-kong-trip.xlsx")
itin, todo, spend = wb["Itinerary"], wb["Checklist"], wb["Summary"]
# trip, currencies, weather, selected_stay, itinerary, costs, expenses, summary_notes: the keys of the same name in plan.json,
# read from the approved draft as draft-template.md describes

itin["A1"] = trip["destination"].split(",")[0].upper() + " TRIP"   # place name only: HONG KONG TRIP
itin["K8"] = trip["num_people"]
home = trip.get("currency", "VND")
itin["J3"] = home                              # home currency, its rate in K3 stays 1
for r, cur in enumerate(currencies[:3], start=4):   # no rows for a domestic trip
    itin[f"J{r}"], itin[f"K{r}"] = cur["code"], cur["rate"]

row = 3
for day in itinerary:
    itin[f"A{row}"] = "\n".join(filter(None, [day["day"], day.get("date")]))
    if len(day["slots"]) > 1:                  # a one-cell merge makes Excel repair the file
        itin.merge_cells(f"A{row}:A{row + len(day['slots']) - 1}")
    for slot in day["slots"]:
        itin[f"B{row}"], itin[f"C{row}"], itin[f"D{row}"] = slot["time"], slot["activity"], slot.get("transport")
        itin[f"E{row}"], itin[f"G{row}"], itin[f"H{row}"] = slot.get("fare"), slot.get("notes"), slot.get("status")
        row += 1
first_unused = max(row, 9)                     # rows up to 8 hold the settings block
itin.delete_rows(first_unused, 82 - first_unused + 1)

stay = selected_stay                           # Thông tin chung: column L only, None when unknown
todo["L2"], todo["L3"], todo["L4"] = trip["destination"], trip.get("departure"), trip["dates"]
todo["L5"], todo["L7"], todo["L8"] = trip.get("num_nights"), trip.get("group_type"), trip.get("travel_style")
todo["L9"] = trip.get("budget_per_person")
facts = [stay.get("type"), stay.get("rating") and f'{stay["rating"]}/5', stay.get("review_count") and f'{stay["review_count"]} đánh giá']
priced = stay.get("price_per_night") and stay.get("currency")   # no currency, no price: never guess it
price = priced and f' - {stay["price_per_night"]:,} {stay["currency"]}/đêm'
todo["L12"] = stay["name"] + (f' ({", ".join(filter(None, facts))})' if any(facts) else "") + (price or "")
todo["L13"] = stay.get("booking_url")
todo["L14"] = " ".join([weather["summary"], *(weather.get("warnings") or [])])
todo["L15"] = "\n".join(summary_notes[:5])     # five notes at most, most important first

for r, cost in enumerate(costs, start=3):      # Checklist row 2 is the pre-wired transit line
    todo[f"A{r}"] = "☑" if cost.get("done") else "☐"
    todo[f"B{r}"], todo[f"C{r}"], todo[f"E{r}"] = cost["name"], cost["price_per_person"], cost["currency"]
for r, item in enumerate(expenses, start=3):      # Summary row 1 is the title, row 2 the header
    spend[f"A{r}"], spend[f"B{r}"], spend[f"C{r}"], spend[f"D{r}"] = item["name"], item["category"], item["price"], item["currency"]
wb.save("docs/hong-kong-trip.xlsx")
```

Write `None`, not `""` or `0`, for a missing fare or an unknown trip fact. The rules for each row of `Thông tin chung` are in `output-schema.md`.

openpyxl does not calculate. The totals appear when the file is opened in Excel or Google Sheets, so the cost figures in the chat summary come from the plan data, not from reading the saved file back. Compute them the way the sheet does, so the summary and `Checklist!L11` agree:

```python
rate = {home: 1, **{c["code"]: c["rate"] for c in currencies}}       # home: the home currency, as above
fare_currency = currencies[0]["code"] if currencies else home          # the trip currency, Itinerary!J4
per_person = sum(s.get("fare") or 0 for d in itinerary for s in d["slots"]) * rate[fare_currency]
per_person += sum(c["price_per_person"] * rate[c["currency"]] for c in costs)   # what Checklist!L11 shows
total = per_person * trip["num_people"]                                          # what Checklist!L10 shows
```

## Deliver as .xlsx

Give the user the path of the filled `docs/<destination>-trip.xlsx`. The tick boxes in `Checklist!A` are cells holding `☐` or `☑` with a dropdown of the two.

## Deliver as Google Sheets

Use the first route the runtime supports.

1. Upload with conversion. Fill the template as above, then upload the `.xlsx` to Drive as a Google Sheet (Drive API `files.create` with the target `mimeType` `application/vnd.google-apps.spreadsheet`, or the connected Drive tool's import or convert option). One upload carries the layout, formulas, dropdowns, colours and chart across in a single step; the Verify list confirms they arrived. Share the link. The `.xlsx` in `docs/` was only the upload source: delete it after the upload unless the user asked for both.
2. Build natively. When the tool can only create a blank spreadsheet and write cells, create one named `<Destination> Trip`, build the three tabs from "Rebuild without the template" in `output-schema.md`, then write the plan cells. Delete the default empty tab.
3. Fall back to `.xlsx` with the import instruction from "Pick the format".

On routes 1 and 2, when the Sheets tool can set data validation, turn `Checklist!A2:A31` into real check boxes: a `BOOLEAN` validation rule with the two condition values `☑` (checked) and `☐` (unchecked). The cells keep their values, so nothing else changes. When it cannot, leave the dropdown and tell the user the manual way: select the column, Data > Data validation > Checkbox, tick "Use custom cell values" and enter `☑` and `☐`.

## Runtime notes

| Runtime | Route |
| --- | --- |
| Claude Code, Claude.ai with code execution | Fill the template with openpyxl. Google Sheets through a connected Drive or Sheets tool, route 1 when it can upload a file, otherwise route 2. |
| Gemini Spark with the Sheets Connected App | Google Sheets, route 2. For `.xlsx`, fill the template if Spark can run code on the bundled file. |
| Amazon Quick | `.xlsx`. If Quick cannot open the bundled template, have it create the workbook from "Rebuild without the template" and then fill it. |

If it is unclear which tools are available, ask the user once which format they want.

## Verify

Run this before the chat summary and fix anything that fails, then check again.

- A `.xlsx` deliverable is at `docs/<destination>-trip.xlsx`, next to the draft
- The workbook matches the approved draft: same slots, cost lines, `Thông tin chung` values and seeded expenses
- Exactly three sheets, named `Itinerary`, `Checklist` and `Summary`
- `Itinerary!A1` is the trip title and `K8` the headcount
- One row per slot from row 3, a `Day N` label on the first row of each day
- Every `Checklist` line from row 2 down has `☐` or `☑` in column A
- `Thông tin chung` (`Checklist!K1:L16`): the labels in K are untouched, `L2` and `L4` are filled, `L5` and `L9` are numbers when present, no cell holds `N/A` or a placeholder
- The formula cells are still formulas: spot-check `Itinerary!F3`, `Checklist!G3`, `Checklist!L10`, `Checklist!L11` and `Summary!E3` (in a `.xlsx`, the value read back by openpyxl starts with `=`)
- In Google Sheets, read `Checklist!L10` and `L11` back: they are numbers and `L11` matches the cost per person in the chat summary. After an upload with conversion, also confirm the currency dropdown on `Checklist!E3` and the day colours on `Itinerary` are there; if one is missing, tell the user which
- For `.xlsx`, the per-person figure in the chat summary is the one computed from the plan data above
- No `[ĐIỂM ĐẾN]` placeholder is left
- The user has the link or the file
