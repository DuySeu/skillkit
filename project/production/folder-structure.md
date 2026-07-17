---
inclusion: always
---

# Folder Structure (Python Production)

Apply when implementing production code.

```
project/
  main.py         # entry point — orchestrate the pipeline in dataflow order
  core/           # business logic: one module per step / business unit
  utils/          # shared helpers (I/O, config, logging...)
  tests/          # unit tests, mirroring the core/ and utils/ layout
  config/         # configuration (settings, env schema)
```

Rules:
- `core/` holds business logic; each module is single-purpose with a matching test in `tests/`.
- `utils/` holds reusable code, not business logic.
- `tests/` mirrors the `core/`/`utils/` layout (e.g. `tests/core/test_<module>.py`).
- Keep config out of code; load it via `config/` and environment variables.
- `main.py` only orchestrates; it holds no detailed business logic.
