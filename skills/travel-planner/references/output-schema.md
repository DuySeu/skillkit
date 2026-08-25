# Plan data & spreadsheet output schema

The agent assembles structured plan data, then exports via **native tools** in the current runtime (Gemini Spark → Google Sheets; Claude / Amazon Quick → `.xlsx`). See `export-by-runtime.md` for per-platform steps.

Do not invent alternate sheet names or column layouts.

## Sheets (fixed — four tabs or worksheets)

| Sheet | Purpose |
|-------|---------|
| Tổng quan | Trip meta, selected stay, weather, totals |
| Lịch trình | Day × time slot rows |
| Dự toán chi phí | Line items + formulas for sum and per-person |
| Checklist | Packing, pre-trip tasks, emergency contacts |

---

## Sheet layouts

### Tổng quan

Two columns (A = label bold, B = value):

| Row label (A) | Value (B) |
|---------------|-----------|
| Địa điểm | `trip.destination` |
| Xuất phát | `trip.departure` |
| Ngày đi/về | `trip.dates` |
| Số đêm | `trip.num_nights` |
| Số người | `trip.num_people` |
| Nhóm | `trip.group_type` |
| Phong cách | `trip.travel_style` |
| Budget/người | formatted `trip.budget_per_person` + currency |
| *(blank)* | |
| Chỗ nghỉ đã chọn | `selected_stay.name` |
| Loại | `selected_stay.type` |
| Giá/đêm | formatted `selected_stay.price_per_night` |
| Rating | `{rating}/5 ({review_count} review)` |
| Link đặt phòng | `selected_stay.booking_url` |
| Ghi chú giá | `selected_stay.notes` |
| *(blank)* | |
| Thời tiết | `weather.summary` |
| Cảnh báo | joined `weather.warnings` |
| Tổng chi phí | sum of `costs[].amount` |
| Chi phí/người | total ÷ `trip.num_people` |
| Lưu ý | each `summary_notes[]` on its own row in B |

### Lịch trình

Header row 1:

| Ngày | Ngày (date) | Khung giờ | Hoạt động | Địa điểm | Ghi chú |

One row per slot in `itinerary[].slots[]`.

### Dự toán chi phí

Header row 1:

| Hạng mục | Mô tả | Dự toán | Thực tế | Chia đều/người |

- Column C: numeric amounts from `costs[].amount`
- Column D: leave empty (user fills actuals)
- Column E: formula `=C{row}/num_people` (Excel/Sheets)
- After last data row: **TỔNG CỘNG** with `=SUM(C2:C{n})` in column C
- Next row: **Tổng/người** with `=C{total_row}/num_people`

### Checklist

Three sections, each with a bold title row then items:

| Section title | Items from |
|---------------|------------|
| Đồ cần mang | `checklist.packing[]` |
| Việc trước chuyến đi | `checklist.before_trip[]` |
| Liên hệ khẩn cấp | `checklist.emergency[]` |

Each item: column A = `☐`, column B = text.

---

## plan.json top-level keys

Use as the canonical data shape before export (file optional):

```json
{
  "trip": { },
  "weather": { },
  "selected_stay": { },
  "itinerary": [ ],
  "costs": [ ],
  "checklist": { },
  "summary_notes": [ ]
}
```

### `trip` (required fields)

| Field | Type | Notes |
|-------|------|-------|
| destination | string | |
| dates | string | Human-readable range |
| num_people | number | |
| departure | string | Optional |
| num_nights | number | Optional |
| group_type | string | Optional |
| budget_per_person | number | Optional |
| travel_style | string | Optional |
| currency | string | Default `VND` |

### `weather`

| Field | Type |
|-------|------|
| summary | string |
| warnings | string[] |

### `selected_stay`

| Field | Type |
|-------|------|
| name | string |
| type | string |
| price_per_night | number |
| rating | number |
| review_count | number |
| booking_url | string |
| notes | string — price disclaimer |

### `itinerary[]`

Each day:

```json
{
  "day": "Thứ 7",
  "date": "7/9",
  "slots": [
    {
      "time": "07:00–11:00",
      "activity": "...",
      "location": "...",
      "notes": "..."
    }
  ]
}
```

### `costs[]`

```json
{
  "category": "Phòng nghỉ",
  "description": "...",
  "amount": 3200000,
  "shared": true
}
```

Include a **Dự phòng** row for the 10–15% buffer. Amounts are **trip totals** unless you split per person in description.

### `checklist`

```json
{
  "packing": ["..."],
  "before_trip": ["..."],
  "emergency": ["..."]
}
```

### `summary_notes`

String array — booking urgency, price disclaimer, weather caveats.

## Chat comparison table (Step 3)

Minimum columns: name, price/night, rating, pros, cons, link, best for.

## Validation before export

- `trip.destination`, `trip.dates`, `trip.num_people` present
- `selected_stay.name` present
- At least one `itinerary` day with one `slot`
- At least one `costs` row
- `checklist` has all three arrays (can be empty lists)
