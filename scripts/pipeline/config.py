"""Configuration settings and environment loader for the AI asset pipeline."""

import os
from typing import Any, Dict

OUTPUT_DIR: str = "../../public/assets"


def load_config() -> Dict[str, Any]:
    """Load configuration from environment variables and defaults.

    Returns:
        dict: Configuration dictionary containing API_KEY, OUTPUT_DIR, etc.
    """
    return {
        "API_KEY": os.environ.get("GEMINI_API_KEY"),
        "OUTPUT_DIR": os.environ.get("PIPELINE_OUTPUT_DIR", OUTPUT_DIR),
    }
