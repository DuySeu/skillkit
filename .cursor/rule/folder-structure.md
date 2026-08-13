---
inclusion: always
---

# Folder Structure (Python Demos)

Áp dụng khi implement code từ một demo design (skill `demo-planning`).

```
project/
  main.py         # entry point — chạy toàn bộ dataflow
  core/           # core logic: MỖI file .py = MỘT step trong Workflow của design
  utils/          # helper functions dùng chung
```

Quy tắc:
- Mỗi step trong section **Workflow** của design → một file riêng trong `core/`.
  Đặt tên file theo logic của step (vd: `load_input.py`, `transform_data.py`),
  không đặt tên chung chung (`step1.py`).
- Code tái sử dụng / phụ trợ (I/O, format, config...) đặt trong `utils/`.
- `core/` KHÔNG chứa helper; `utils/` KHÔNG chứa business logic của step.
- `main.py` chỉ điều phối các step trong `core/` theo thứ tự dataflow.