"""Central logging setup for the project.

Usage in code:
    from utils.log import setup_logging
    setup_logging()

    import logging
    logger = logging.getLogger(__name__)
    logger.info("reading input")

Terminal output (one colored line per record):
    17:23:31 | core/load_input.py | INFO | reading input
    <time> | <file path from project root> | <LEVEL> | <message>
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

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


def fmt(obj: Any, *, pretty: bool = False) -> str:
    """Render a value for a log message.

    - dict / list / tuple -> JSON (compact, or indented when pretty=True)
    - DataFrame / Series (anything with .to_string()) -> text table on new lines
    - everything else -> str(obj)

    Usage:
        logger.info("input: %s", fmt(payload))          # JSON
        logger.info("frame:%s", fmt(df, pretty=True))    # table / indented JSON
    """
    if isinstance(obj, (dict, list, tuple)):
        return json.dumps(obj, ensure_ascii=False, default=str,
                          indent=2 if pretty else None)
    to_string = getattr(obj, "to_string", None)  # pandas DataFrame/Series, duck-typed
    if callable(to_string):
        return "\n" + to_string()
    return str(obj)
