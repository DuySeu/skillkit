"""Central logging setup for the project.

Named log.py (NOT logging.py) so it does not shadow the stdlib `logging`
module. Call setup_logging() once from main.py; other modules only do
logging.getLogger(__name__) and must NOT call basicConfig.

- Log level is read from the LOG_LEVEL environment variable (default INFO).
- Timestamps have no milliseconds (see DATE_FORMAT).
- The source column is the file path of the log call, relative to the project
  root (the directory main.py runs from), e.g. "core/load_input.py".
- Each level is colored (only when writing to a terminal; disabled on
  redirect/pipe or when the NO_COLOR env var is set).
"""

from __future__ import annotations

import logging
import os

LOG_FORMAT = "%(asctime)s | %(relpath)s | %(levelname)s | %(message)s"
DATE_FORMAT = "%H:%M:%S"

_RESET = "\033[0m"
_LEVEL_COLORS = {
    logging.DEBUG: "\033[36m",  # cyan
    logging.INFO: "\033[32m",  # green
    logging.WARNING: "\033[33m",  # yellow
    logging.ERROR: "\033[31m",  # red
    logging.CRITICAL: "\033[1;31m",  # bold red
}


class ColorFormatter(logging.Formatter):
    """Formatter that shows the source file path relative to `root` and
    wraps each line in an ANSI color based on its level."""

    def __init__(
        self,
        fmt: str,
        datefmt: str | None = None,
        use_color: bool = True,
        root: str | None = None,
    ) -> None:
        super().__init__(fmt, datefmt)
        self.use_color = use_color
        self.root = root or os.getcwd()

    def format(self, record: logging.LogRecord) -> str:
        try:
            record.relpath = os.path.relpath(record.pathname, self.root)
        except ValueError:  # e.g. different drive on Windows
            record.relpath = record.pathname
        line = super().format(record)
        if not self.use_color:
            return line
        color = _LEVEL_COLORS.get(record.levelno, "")
        return f"{color}{line}{_RESET}" if color else line


def setup_logging(fmt: str = LOG_FORMAT, datefmt: str = DATE_FORMAT) -> None:
    """Configure root logging. Level from LOG_LEVEL env (default INFO)."""
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)

    handler = logging.StreamHandler()
    use_color = handler.stream.isatty() and os.environ.get("NO_COLOR") is None
    handler.setFormatter(
        ColorFormatter(fmt, datefmt, use_color=use_color, root=os.getcwd())
    )

    logging.basicConfig(level=level, handlers=[handler])