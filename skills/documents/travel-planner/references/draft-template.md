# Draft for review: docs/<destination>-trip-planning.md

The draft is the plan in markdown, laid out like the workbook, so the user can read and correct it before any spreadsheet exists. Once approved, it is the source the workbook is filled from: every value in the workbook comes from this file, and nothing is added or changed on the way.

## File

- Path: `docs/<destination>-trip-planning.md` in the user's working directory, for example `docs/hong-kong-trip-planning.md` or `docs/tam-dao-trip-planning.md`. The destination is the place name only, lower case, without accents, words joined by hyphens. Create `docs/` when it does not exist.
- One file per trip, edited in place. When the user asks for changes, update this file; do not write `-v2` or dated copies.
- In a runtime with no file system, post the same markdown in chat as the draft.

## Template

Use these sections, in this order. They mirror the workbook: `Thông tin chung` and `Checklist` are the two tables of the `Checklist` sheet, `Tiền tệ` is the settings block of `Itinerary`, `Summary` is the seed of the `Summary` sheet. Section names and row labels stay as written; the column headers are for reading and need not match the workbook's character for character. The content follows the language the user writes in.

```markdown
# Hong Kong trip planning

Bản nháp để review. Khi chốt, nội dung này được đưa vào file Google Sheets hoặc Excel.

## Thông tin chung

| Mục | Nội dung |
| --- | --- |
| Điểm đến | Hong Kong |
| Xuất phát | Hà Nội |
| Ngày đi/về | 15/11/2026 - 18/11/2026 |
| Số đêm | 3 |
| Số người | 4 |
| Nhóm | Nhóm bạn |
| Phong cách | Khám phá thành phố |
| Budget/người | 15,000,000 VND |
| Tổng chi phí dự kiến | 44,161,400 VND |
| Chi phí/người | 11,040,350 VND |
| Chỗ nghỉ | Caritas Bianchi Lodge (Khách sạn, 4.2/5, 310 đánh giá) - 3,700,000 VND/đêm |
| Link đặt phòng | https://... |
| Thời tiết | Mát, 18-22 độ. Có thể mưa nhỏ buổi chiều. |
| Lưu ý | Giá tham khảo ngày 13/11/2026<br>Tỷ giá 1 HKD = 3,410 VND ngày 13/11/2026 |

## Tiền tệ

| Tiền tệ | Tỷ giá => VND |
| --- | --- |
| VND | 1 |
| HKD | 3,410 |

## Itinerary

### Day 1 - 15/11

| Time | Itinerary | Phương tiện | Giá (HKD/người) | Note | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| 10:00 - 12:00 | Bay đến Hong Kong, nhập cảnh | Máy bay | | | |
| 12:00 - 13:00 | Về khách sạn, nhận phòng | Bus | 35 | A21 -> Nathan Road | |

### Day 2 - 16/11

| Time | Itinerary | Phương tiện | Giá (HKD/người) | Note | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| 09:00 - 11:00 | Đỉnh Núi Victoria, Peak Tram & Sky Terrace | Peak Tram | | Tránh giờ cao điểm | Mua vé trước |

## Checklist

| ✓ | Chi phí | Giá(/người) | Đơn vị | Thành tiền (VND) |
| --- | --- | --- | --- | --- |
| ☐ | Di chuyển/Đi lại | 35 | HKD | 477,400 |
| ☐ | Vé máy bay | 5,000,000 | VND | 20,000,000 |
| ☐ | Khách sạn (3 đêm) | 2,775,000 | VND | 11,100,000 |
| ☐ | Ăn uống | 600 | HKD | 8,184,000 |
| ☐ | Dự phòng | 1,100,000 | VND | 4,400,000 |

## Summary

Các khoản đặt hoặc trả trước chuyến đi, dùng để khởi tạo sheet Summary.

| Chi tiêu | Danh mục | Giá | Tiền tệ |
| --- | --- | --- | --- |
| Khách sạn | Lưu trú | 11,100,000 | VND |
```

## Rules

- Every value follows the rules of its workbook cell in `output-schema.md`: per-person prices in `Checklist`, group totals in `Summary`, one place only for each transport cost, the fixed rows and formats of `Thông tin chung`. A row whose value is unknown keeps its label and an empty value.
- The draft shows the numbers the workbook will compute, so the user can judge the budget before export: `Thành tiền` is price x headcount x rate, `Tổng chi phí dự kiến` is the sum of `Thành tiền`, `Chi phí/người` is that total divided by the headcount. Work them out from the plan data and make sure they add up; in the workbook they are formulas and are not written.
- The first `Checklist` line, `Di chuyển/Đi lại`, is the sum of the itinerary fares. It is the workbook's preset row 2, so it is shown here and skipped when the cost lines are written.
- In `Tiền tệ`, the first row is the home currency and the second the trip currency, the one the `Giá` header of the itinerary tables names. A domestic trip has the home currency only.
- No section beyond these. Packing and pre-trip preparation stay in the chat summary, the stay comparison stays in chat.

## From the approved draft to the workbook

- A day heading `### Day 1 - 15/11` gives the day label and its date.
- Numeric cells (`Số đêm`, `Budget/người`, fares, `Giá(/người)`, `Giá`, rates) go in as plain numbers: drop the thousands separators and the currency unit.
- `Chỗ nghỉ`, `Link đặt phòng`, `Thời tiết` and `Lưu ý` are copied as written, not rebuilt. A `<br>` in `Lưu ý` becomes a line break in the cell.
- `Số người`, `Tổng chi phí dự kiến`, `Chi phí/người` and `Thành tiền` are not written: the headcount goes to `Itinerary!K8` and the rest are formulas.
