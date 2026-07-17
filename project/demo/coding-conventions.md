---
inclusion: always
---

# Coding Conventions (Python Demos)

Apply when implementing code from a demo design (skill `demo-planning`).

## Language
- Python. Do not use another language unless the design says so explicitly.

## Style
- snake_case for functions/variables, PascalCase for classes.
- One clear responsibility per file; short, single-purpose functions.
- Comment non-obvious logic; explain WHY, do not restate the code.

## Logging by Dataflow
- `main.py` configures `logging` (via `utils/log.py`) and orchestrates the steps in dataflow order.
- Log at each step boundary: step start, input received, output produced, step end.
  Goal: reading the log lets you follow the data moving through each step.
- Every `core/` module gets its own logger: `logger = logging.getLogger(__name__)`.
- Logging is configured centrally in `utils/log.py`; child modules must NOT call `basicConfig`.
