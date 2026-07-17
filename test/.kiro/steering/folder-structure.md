---
inclusion: always
---

# Folder Structure (Python Demos)

Apply when implementing code from a demo design (skill `demo-planning`).

```
project/
  main.py         # entry point — runs the whole dataflow
  core/           # core logic: EACH .py file = ONE step in the design's Workflow
  utils/          # shared helper functions
```

Rules:
- Each step in the design's **Workflow** section → its own file in `core/`.
  Name the file after the step's logic (e.g. `load_input.py`, `transform_data.py`),
  not something generic (`step1.py`).
- Reusable / supporting code (I/O, formatting, config...) goes in `utils/`.
- `core/` must NOT contain helpers; `utils/` must NOT contain step business logic.
- `main.py` only orchestrates the steps in `core/` in dataflow order.