"""Entry point — orchestrates the workflow steps in dataflow order.

Logging is configured centrally via utils.log. Each step lives in core/
and logs at its own boundaries so the log reads as the data flowing through.
"""

import logging

from utils.log import setup_logging

logger = logging.getLogger(__name__)


def main() -> None:
    setup_logging()
    logger.info("Pipeline start")

    # Wire up steps from core/ in dataflow order, e.g.:
    # from core.load_input import load_input
    # from core.transform_data import transform_data
    #
    # data = load_input(...)
    # result = transform_data(data)

    logger.info("Pipeline complete")


if __name__ == "__main__":
    main()