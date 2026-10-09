"""Configuration settings and environment loader for the AI asset pipeline."""

import os
from pathlib import Path
from typing import Any, Dict, Union

# Default relative output directory pointing to frontend public/assets
OUTPUT_DIR: str = "../../public/assets"


def validate_output_directory(dir_path: Union[str, Path], create_if_missing: bool = True) -> Path:
    """Validate that the output directory exists or can be created, and is a directory.

    Args:
        dir_path: Path to the directory (string or Path object).
                  If relative, resolved relative to this module's directory.
        create_if_missing: Whether to create the directory if it does not exist.

    Returns:
        Path: Resolved, validated Path object.

    Raises:
        FileNotFoundError: If the directory does not exist and create_if_missing is False.
        NotADirectoryError: If the path exists but is not a directory.
    """
    path = Path(dir_path)
    if not path.is_absolute():
        path = (Path(__file__).resolve().parent / path).resolve()

    if create_if_missing and not path.exists():
        path.mkdir(parents=True, exist_ok=True)

    if not path.exists():
        raise FileNotFoundError(f"Output directory does not exist: {path}")

    if not path.is_dir():
        raise NotADirectoryError(f"Output path is not a directory: {path}")

    return path


def load_config(ensure_dir: bool = True) -> Dict[str, Any]:
    """Load configuration from environment variables and defaults.

    Validates and resolves the output directory before returning.

    Args:
        ensure_dir: Whether to automatically create output directory if missing.

    Returns:
        dict: Configuration dictionary containing API_KEY, OUTPUT_DIR, etc.
    """
    raw_output_dir = os.environ.get("PIPELINE_OUTPUT_DIR", OUTPUT_DIR)
    validated_output_dir = validate_output_directory(raw_output_dir, create_if_missing=ensure_dir)

    return {
        "API_KEY": os.environ.get("GEMINI_API_KEY"),
        "OUTPUT_DIR": str(validated_output_dir),
    }
