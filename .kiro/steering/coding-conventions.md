---
inclusion: always
---

# Coding Conventions (Python Demos)

Áp dụng khi implement code từ một demo design (skill `demo-planning`).

## Language
- Python. Không dùng ngôn ngữ khác trừ khi design nêu rõ.

## Style
- snake_case cho hàm/biến, PascalCase cho class.
- Mỗi file một trách nhiệm rõ ràng; hàm ngắn, đơn nhiệm.
- Comment cho logic không hiển nhiên; giải thích WHY, không lặp lại code.

## Logging theo Dataflow
- `main.py` cấu hình `logging` (qua `utils/log.py`) và điều phối các step theo đúng thứ tự dataflow.
- Log ở ranh giới mỗi step: bắt đầu step, input nhận vào, output sinh ra, kết thúc step.
  Mục tiêu: đọc log là hình dung được luồng dữ liệu đi qua từng step.
- Mỗi module `core/` lấy logger riêng: `logger = logging.getLogger(__name__)`.
- Cấu hình logging tập trung ở `utils/log.py`; module con KHÔNG tự gọi `basicConfig`.