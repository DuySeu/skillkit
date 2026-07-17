# test

## Overview
Mô tả ngắn gọn demo này làm gì.

## Structure
```
main.py       # entry point — chạy toàn bộ dataflow
core/         # core logic: mỗi file = một step trong workflow
utils/        # helper dùng chung
utils/log.py  # setup logging tập trung (setup_logging)
```

## Setup
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run
```bash
python main.py
```