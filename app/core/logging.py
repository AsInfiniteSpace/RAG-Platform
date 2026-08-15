import sys
from loguru import logger
from app.core.config import settings


def setup_logging():
    logger.remove()  # remove loguru's default handler so we control the format

    # Console output — human-readable, for you while developing
    logger.add(
        sys.stdout,
        level=settings.log_level,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | {name}:{function}:{line} - {message}",
    )

    # File output — rotates automatically, keeps things tidy
    logger.add(
        "logs/app.log",
        level=settings.log_level,
        rotation="10 MB",      # start a new file once the current one hits 10 MB
        retention="7 days",    # delete log files older than 7 days
        compression="zip",     # old logs get zipped instead of piling up raw
    )

    return logger