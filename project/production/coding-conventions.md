---
inclusion: always
---

# Coding Conventions (Python Production)

Apply when implementing production code.

## Language
- Python. Type hints are required on every public function/method.

## Style
- snake_case for functions/variables, PascalCase for classes.
- One clear responsibility per module; short, single-purpose functions.
- Docstrings for every module, class, and public function.
- No bare `except:` — catch specific exceptions; never swallow errors silently.

## Error Handling
- Fail fast on invalid input; raise exceptions with clear meaning.
- Do not use `print` for errors — use logging at the appropriate level (WARNING/ERROR).

## Logging
- Logging is configured centrally in `utils/log.py`; level read from env (`LOG_LEVEL`).
- Every module gets its own logger: `logger = logging.getLogger(__name__)`.
- Child modules must NOT call `basicConfig`.

## Testing
- All core logic must have unit tests in `tests/`.
- Do not merge code without tests for the main paths.

## Dependencies
- Pin exact versions in `requirements.txt`.
