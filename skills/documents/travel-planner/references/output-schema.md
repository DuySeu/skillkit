# Plan data and workbook layout

## Contents

- Workbook: three sheets from one template
- Itinerary sheet: cells to write
- Checklist sheet: cost lines
- Checklist sheet: the Thông tin chung table
- Summary sheet: cells to write
- Cells that hold formulas
- plan.json
- Rebuild without the template
- Chat comparison table (Step 3)
- Validation before export

## Workbook: three sheets from one template

Every plan is a filled copy of `assets/trip-template.xlsx`. The layout is the same whether the deliverable is `.xlsx` or Google Sheets; only the delivery differs (see `export-by-runtime.md`). Keep the three sheets, their names, their order and their columns.

| Sheet | Holds |
| --- | --- |
| `Itinerary` | The plan: one row per time slot, plus the currency and headcount settings in `J2:K8`. |
| `Checklist` | Two tables. The cost estimate as a list of things to book or pay for, one tick box per line (columns A-G). `Thông tin chung`, the basic facts of the trip with the cost totals (columns K-L). It holds costs, not the packing list. |
| `Summary` | Log of what was actually paid (the spending log, not the chat summary of Step 10). Seeded with the bookings made before the trip, then filled in by the user on the trip. |

The template is blank and already formatted. Filling it means writing values into the cells below and nothing else: borders, number formats, dropdowns, the day colours and every total are already in the file. The day colours and the grey computed column are conditional formatting, so they appear on a row as soon as its column B has a value.

## Itinerary sheet: cells to write

| Cells | Write | From |
| --- | --- | --- |
| `A1` | `<DESTINATION> TRIP`, upper case, the place name only without its province or country: `HONG KONG TRIP`, `TAM ĐẢO TRIP` | `trip.destination` |
| `K8` | Headcount. Every per-person price in the workbook is multiplied by this cell. | `trip.num_people` |
| `J3` | Home currency code. `K3` stays `1`. | `trip.currency`, default `VND` |
| `J4:K6` | One row per foreign currency: code in J, rate in K (1 unit of it in the home currency, for example `HKD` and `3410`). Leave blank for a domestic trip. `J4` is the trip currency, the one column E is priced in. | `currencies[]` |
| `A3:A82` | `Day 1`, `Day 2`, ... on the first row of each day, with the date after a line break when dates are fixed. Merge column A over that day's rows. | `itinerary[].day`, `.date` |
| `B3:B82` | Time range, `10:00 - 12:00` | `slots[].time` |
| `C3:C82` | Activity, including meals with the restaurant name | `slots[].activity` |
| `D3:D82` | Transport used to get there: `Bus`, `MTR`, `Đi bộ (750m)`, `Máy bay` | `slots[].transport` |
| `E3:E82` | Fare per person for that leg, paid on the spot: bus, metro, ferry, taxi share. A number in the trip currency (`J4`, or `J3` when `J4` is blank); convert a fare in any other currency to it. Blank when the leg is free or is a pre-booked ticket. | `slots[].fare` |
| `G3:G82` | Note: route, address, opening hours, rain backup | `slots[].notes` |
| `H3:H82` | Status or to-do for the slot: `Mua vé trước`, `Đặt bàn trước`, `Đã đặt` | `slots[].status` |

- The sheet has room for 80 slots (rows 3-82). A plan that needs more combines short consecutive slots and does not add rows.
- After filling, delete the unused slot rows: from `max(last slot row, 8) + 1` through row 82. Rows up to 8 stay because the settings block in J:K uses them.

Three rows from a filled sheet (4 people, trip currency HKD):

| A | B | C | D | E | G | H |
| --- | --- | --- | --- | --- | --- | --- |
| Day 2 | 08:00 - 09:00 | Khởi hành đến Đỉnh The Peak | MTR + Bus | 23 | Jordan -> Admiralty Station -> Hong Kong Park | |
| | 09:00 - 11:00 | Đỉnh Núi Victoria, Peak Tram & Sky Terrace | Peak Tram | | Tránh giờ cao điểm để không phải xếp hàng lâu | Mua vé trước |
| | 11:30 - 13:00 | Ăn trưa: Tim Ho Wan (Sham Shui Po) | MTR | 31 | 9-11 Fuk Wing St | |

## Checklist sheet: cost lines

Rows 3-31, one cost line per row. Row 2 is already filled: it is the transit line, wired to the sum of the fares in `Itinerary!E`, and it keeps its preset `☐`.

| Column | Write | From |
| --- | --- | --- |
| A `✓` | The tick box: `☐` for every line written, `☑` only when the user said the item is already booked or paid | `costs[].done` |
| B `Chi phí` | Cost line name | `costs[].name` |
| C `Giá(/người)` | Price per person, a number | `costs[].price_per_person` |
| E `Đơn vị` | Currency code of that price, one of `Itinerary!J3:J6` | `costs[].currency` |

The tick box is a cell that holds `☐` or `☑`, with a dropdown offering the two. A real check-box control is not something the fill step can rely on: openpyxl has no support for Excel's check-box cells, and an imported `.xlsx` is not expected to arrive in Google Sheets with check boxes. In Google Sheets the same cells can be turned into real check boxes without changing their values (see `export-by-runtime.md`).

Rules that keep the totals right:

- Column C is always per person. Divide a shared cost (a room, a hire car, a private transfer) by the headcount before writing it.
- Each transport cost goes in one place only. Local legs paid on the spot go in `Itinerary!E` of their slot, and row 2 here sums them. Tickets booked ahead (flights, long-distance trains, a hire car, a transit pass) are lines here, and the slot that uses them keeps `Itinerary!E` blank. An amount entered both ways is counted twice.
- Add a `Dự phòng` line for the 10-15% buffer, per person, in the home currency.
- There is room for 29 lines (rows 3-31). A plan that needs more groups entries, for example the meals of a day into one line, and does not add rows, because the totals only cover that range.

Three lines from a filled sheet:

| A | B | C | E |
| --- | --- | --- | --- |
| ☑ | Vé máy bay | 5000000 | VND |
| ☐ | Vé Peak Tram | 561000 | VND |
| ☐ | Tim Ho Wan | 100 | HKD |

## Checklist sheet: the Thông tin chung table

`K1:L16`: labels in K, values in L. It is the one place a reader looks for the facts of the trip, so fill every row that has a known value.

| Cell | Label in K | Write in L | From |
| --- | --- | --- | --- |
| `L2` | `Điểm đến` | The place as the user named it, with the province or country: `Hong Kong`, `Tam Đảo, Vĩnh Phúc`. `trip.destination` already carries it in this form. | `trip.destination` |
| `L3` | `Xuất phát` | Departure city or point: `Hà Nội` | `trip.departure` |
| `L4` | `Ngày đi/về` | Text `dd/mm/yyyy - dd/mm/yyyy`, the full dates confirmed in Step 1. When the user gave a weekday or a day and month, resolve it to the next occurrence and confirm it there. | `trip.dates` |
| `L5` | `Số đêm` | A whole number | `trip.num_nights` |
| `L6` | `Số người` | Nothing: a formula that shows `Itinerary!K8` | |
| `L7` | `Nhóm` | Who is travelling, in a few words: `Cặp đôi`, `Gia đình có bé 4 tuổi`, `Nhóm bạn` | `trip.group_type` |
| `L8` | `Phong cách` | Travel style, in a few words: `Nghỉ dưỡng resort`, `Khám phá thành phố` | `trip.travel_style` |
| `L9` | `Budget/người` | A number in the home currency, the all-in budget per person confirmed in Step 1. No unit, no text. When the user gave a budget for the stay only, leave this empty and put that figure in `Lưu ý`, because it cannot be compared with `L11`. | `trip.budget_per_person` |
| `L10` | `Tổng chi phí dự kiến` | Nothing: a formula, the sum of the cost lines | |
| `L11` | `Chi phí/người` | Nothing: a formula, `L10` divided by the headcount | |
| `L12` | `Chỗ nghỉ` | One line: `name (type, rating/5, N đánh giá) - price currency/đêm`, for example `Caritas Bianchi Lodge (Khách sạn, 4.2/5, 310 đánh giá) - 3,700,000 VND/đêm`. Leave out any part that is unknown, and leave out the price when its currency is unknown. The words `đánh giá` and `đêm` stay as written. | `selected_stay` |
| `L13` | `Link đặt phòng` | One bare URL, the booking page of the selected stay | `selected_stay.booking_url` |
| `L14` | `Thời tiết` | The summary sentence for the travel dates, then each warning as its own full sentence | `weather` |
| `L15` | `Lưu ý` | One note per line, five at most, kept in this order of priority: a stay-only budget when `L9` is empty, the date the prices were read, the exchange rate and its date, booking deadlines, cancellation terms, anything else. `summary_notes` is already in that order. | `summary_notes[]` |
| `L16` | `Check vé tàu, bus` | Nothing: a preset link | |

Rules for this table:

- Write column L only. The labels in K, the row order and the number of rows are fixed; a fact with no row of its own goes into `Lưu ý`.
- An unknown value stays empty. Do not write `N/A`, `-` or a guess, and do not copy the label into the value.
- `L5` and `L9` are numbers, so that `L9` can be compared with `L11`. Everything else is text in the language the user writes in.
- Values are copied from the approved draft (`draft-template.md`). A plan change is made in the draft first, then here.
- Keep each value short. The column is narrow and wraps; a paragraph belongs in the chat summary.
- When `L9` is filled, compare the cost per person with it, using the `per_person` figure computed in `export-by-runtime.md` (the number `L11` shows once the file is opened). When it is above the budget, state the gap in the chat summary; above 30% over, also offer cuts as Step 6 says.

## Summary sheet: cells to write

Row 1 is the title and row 2 the header. Rows 3-102, one expense per row:

| Column | Write |
| --- | --- |
| A `Chi tiêu` | What was paid for |
| B `Danh mục` | One of `Đi lại`, `Lưu trú`, `Ăn uống`, `Mua sắm`, `Dịch vụ`, `Thăm quan` |
| C `Giá` | Amount paid for the whole group, a number. Not per person. |
| D `Tiền tệ` | Currency code, one of `Itinerary!J3:J6` |

Seed it from `expenses[]`: the items booked or paid before the trip (stay, flights or train tickets, visa, eSIM, attraction tickets bought ahead), each with its estimated total. Leave the remaining rows empty; the user corrects the seeded amounts and logs the rest during the trip. Category guide: stay is `Lưu trú`; flights, trains, transit cards and booked transfers are `Đi lại`; entrance tickets are `Thăm quan`; visa, eSIM and insurance are `Dịch vụ`.

## Cells that hold formulas

Never write a value into these; a number typed over one of them silently freezes a total.

| Sheet | Cells |
| --- | --- |
| `Itinerary` | `E2`, `F2`, `F3:F82`, `K2` |
| `Checklist` | `D1`, `C2`, `E2`, `D2:D31`, `F2:F31`, `G2:G31`, `L6`, `L10`, `L11` |
| `Summary` | `E3:E102`, `G3`, `H6:H11` |

The numbers to read back after export: `Checklist!L10` is the estimated total in the home currency and `L11` the total per person.

## plan.json

The data shape to assemble from the approved draft (`draft-template.md`) before export. It is working data, not a file to write. `packing` is the one part that is not in the draft: it feeds the chat summary only.

```json
{
  "trip": { "destination": "Hong Kong", "dates": "15/11/2026 - 18/11/2026", "num_people": 4, "num_nights": 3, "departure": "Hà Nội", "group_type": "Nhóm bạn", "travel_style": "Khám phá thành phố", "budget_per_person": 15000000, "currency": "VND" },
  "currencies": [ { "code": "HKD", "rate": 3410 } ],
  "weather": { "summary": "...", "warnings": ["..."] },
  "selected_stay": { "name": "...", "type": "...", "price_per_night": 3700000, "currency": "VND", "rating": 4.2, "review_count": 310, "booking_url": "https://...", "notes": "giá tham khảo tại 13/11" },
  "itinerary": [
    { "day": "Day 1", "date": "15/11", "slots": [ { "time": "10:00 - 12:00", "activity": "Bay đến Hong Kong, nhập cảnh", "transport": "Máy bay", "fare": null, "notes": "...", "status": "" }, { "time": "12:00 - 13:00", "activity": "Về khách sạn", "transport": "Bus", "fare": 35, "notes": "...", "status": "" } ] }
  ],
  "costs": [ { "name": "Vé máy bay", "price_per_person": 5000000, "currency": "VND", "done": false } ],
  "expenses": [ { "name": "Khách sạn", "category": "Lưu trú", "price": 14900000, "currency": "VND" } ],
  "packing": { "items": ["..."], "before_trip": ["..."], "emergency": ["..."] },
  "summary_notes": ["..."]
}
```

`trip.destination`, `trip.dates` and `trip.num_people` are required; the other `trip` fields are optional and leave their `Thông tin chung` row empty when unknown. `currencies` is empty for a domestic trip. `packing` has no cell in the workbook and lives in the chat summary (Step 10) only; a pre-trip task tied to one slot also goes into that slot's column H. The cost lines of the `Checklist` sheet are filled from `costs`, not from `packing`.

## Rebuild without the template

Only for a runtime that cannot open a bundled file (see `export-by-runtime.md`). Create three sheets named exactly `Itinerary`, `Checklist` and `Summary`, in that order, then put these in place before writing the plan. `{r}` is the row number.

`Itinerary`:

| Cells | Content |
| --- | --- |
| `A1:G1` | Merged title, bold, centred |
| `A2:D2` | `Date`, `Time`, `Itinerary`, `Phương tiện` |
| `E2` | `="Giá("&IF($J$4="",$J$3,$J$4)&"/người)"` |
| `F2` | `="x"&$K$8` |
| `G2:H2` | `Note`, `Trạng thái` |
| `F{r}`, rows 3-82 | `=IF(E{r}="","",E{r}*$K$8)` |
| `J2`, `K2` | `Tiền tệ`, `="Tỷ giá => "&$J$3` |
| `J3`, `K3` | Home currency code, `1` |
| `J8`, `K8` | `Số người`, the headcount |

Add when the tool supports it: a fill per day on `A:E` and `G` of the used rows, cycling yellow `#FFFF00`, green `#00FF00`, cyan `#00FFFF`, orange `#FF9900`; grey `#D9D9D9` on column F; wrapped text in C and G.

`Checklist`:

| Cells | Content |
| --- | --- |
| `A1:C1` | `✓`, `Chi phí`, `Giá(/người)` |
| `D1` | `="x"&Itinerary!$K$8` |
| `E1:G1` | `Đơn vị`, `Quy đổi`, `Thành Tiền` |
| `A2`, `B2` | `☐`, `Di chuyển/Đi lại` |
| `C2`, `E2` | `=SUM(Itinerary!E3:E82)`, `=IF(Itinerary!$J$4="",Itinerary!$J$3,Itinerary!$J$4)` |
| `D{r}`, rows 2-31 | `=IF(C{r}="","",C{r}*Itinerary!$K$8)` |
| `F{r}`, rows 2-31 | `=IF(B{r}="","",Itinerary!$J$3)` |
| `G{r}`, rows 2-31 | `=IF(D{r}="","",D{r}*IF(E{r}="",1,VLOOKUP(E{r},Itinerary!$J$3:$K$6,2,FALSE)))` |
| `K1` | `Thông tin chung` |
| `K2:K16` | The fifteen labels of the Thông tin chung table, in the order listed above |
| `L6`, `L10`, `L11` | `=Itinerary!$K$8`, `=SUM($G$2:$G$31)`, `=L10/Itinerary!$K$8` |
| `L16` | `https://www.rome2rio.com/map/` |

Add when the tool supports it: check boxes on `A2:A31` with the checked value `☑` and the unchecked value `☐` (a dropdown of the two otherwise), and a dropdown on `E3:E31` from `Itinerary!J3:J6`.

`Summary`:

| Cells | Content |
| --- | --- |
| `A1:E1` | Merged title `TỔNG KẾT CHI TIÊU`, bold, centred |
| `A2:E2` | `Chi tiêu`, `Danh mục`, `Giá`, `Tiền tệ`, `Thành tiền` |
| `E{r}`, rows 3-102 | `=IF(C{r}="","",C{r}*IF(D{r}="",1,VLOOKUP(D{r},Itinerary!$J$3:$K$6,2,FALSE)))` |
| `G2`, `G3` | `Tổng`, `=SUM(E3:E102)` |
| `G5`, `H5` | `Danh mục`, `Thành tiền` |
| `G6:G11` | The six categories, in the order listed above |
| `H{r}`, rows 6-11 | `=SUMIF($B$3:$B$102,G{r},$E$3:$E$102)` |

Add when the tool supports it: a dropdown on `B3:B102` from `G6:G11`, a dropdown on `D3:D102` from `Itinerary!J3:J6`, and a pie chart of `G6:H11`.

## Chat comparison table (Step 3)

Minimum columns: name, price/night, rating, pros, cons, link, best for.

## Validation before export

- `trip.destination`, `trip.dates`, `trip.num_people` present
- `selected_stay.name` present, and `selected_stay.currency` present whenever `price_per_night` is
- `weather.summary` present
- At least one `itinerary` day with one slot, and every slot has `time` and `activity`
- At least one `costs` line, plus the `Dự phòng` line
- Every currency used in `costs`, `expenses` or as the trip currency is the home currency or has a row in `currencies` with a rate
- No more than 80 slots, 29 cost lines, 100 expenses
