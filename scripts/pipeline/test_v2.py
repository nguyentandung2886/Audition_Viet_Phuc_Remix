"""Pipeline V2 End-to-End Integration and Test Run Script.

Chains the Anime Viet Phuc Pipeline V2:
1. Validates base character (or auto-generates if requested).
2. Generates dressed character using Gemini Image-to-Image with base character reference.
3. Extracts transparent garment asset by subtracting base character body features.
"""

import argparse
import logging
import sys
from pathlib import Path
from typing import Any, Optional, Union

# Ensure pipeline directory and repo root are discoverable on sys.path
pipeline_dir = Path(__file__).resolve().parent
project_root = pipeline_dir.parent.parent
if str(pipeline_dir) not in sys.path:
    sys.path.insert(0, str(pipeline_dir))
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

try:
    from pipeline.config import load_config
    from pipeline.generate_base import generate_base_character
    from pipeline.generator import generate_image
    from pipeline.processor import extract_garment
except ImportError:
    from config import load_config  # type: ignore
    from generate_base import generate_base_character  # type: ignore
    from generator import generate_image  # type: ignore
    from processor import extract_garment  # type: ignore

logger = logging.getLogger("pipeline.test_v2")

DEFAULT_PROMPT = "A traditional red Vietnamese ao dai, full body, anime style"
DEFAULT_BASE_FILENAME = "base_character.png"
DEFAULT_DRESSED_FILENAME = "temp_dressed_aodai.png"
DEFAULT_GARMENT_FILENAME = "garment_ao_dai_red.png"


def resolve_pipeline_path(path: Union[str, Path], output_dir: Path) -> Path:
    """Resolve a file path relative to output_dir, stripping public/assets prefix if present.

    Args:
        path: Target file path (absolute or relative).
        output_dir: Validated directory from config.OUTPUT_DIR.

    Returns:
        Path: Resolved, validated Path object.
    """
    p = Path(path)
    if p.is_absolute():
        return p.resolve()

    parts = p.parts
    if len(parts) >= 2 and parts[0] == "public" and parts[1] == "assets":
        rel_parts = parts[2:]
        if rel_parts:
            return (output_dir / Path(*rel_parts)).resolve()
        return output_dir.resolve()

    return (output_dir / p).resolve()


def run_pipeline_v2(
    prompt: str = DEFAULT_PROMPT,
    base_image_path: Optional[Union[str, Path]] = None,
    dressed_output_path: Optional[Union[str, Path]] = None,
    garment_output_path: Optional[Union[str, Path]] = None,
    model: Optional[str] = None,
    client: Optional[Any] = None,
    tolerance: float = 30.0,
    cleanup_noise: bool = True,
    auto_generate_base: bool = False,
    session: Optional[Any] = None,
) -> bool:
    """Run the complete Pipeline V2 flow end-to-end.

    Args:
        prompt: Text prompt for garment generation.
        base_image_path: Path to canonical base character image.
        dressed_output_path: Path for saving dressed character image.
        garment_output_path: Path for saving extracted transparent garment PNG.
        model: Optional model identifier override.
        client: Optional genai.Client instance.
        tolerance: Color difference tolerance for skin/body subtraction.
        cleanup_noise: Whether to filter out isolated noise components.
        auto_generate_base: If True, generate base character if not found.
        session: Optional pre-configured rembg session.

    Returns:
        bool: True if pipeline completed successfully, False otherwise.
    """
    logger.info("Initializing Pipeline V2 test run...")

    cfg = load_config()
    output_dir_str = cfg.get("OUTPUT_DIR")
    if not output_dir_str:
        logger.error("Pipeline V2 failed: OUTPUT_DIR is not configured.")
        return False

    output_dir = Path(output_dir_str).resolve()
    logger.info("Pipeline base output directory: %s", output_dir)

    resolved_base_path = resolve_pipeline_path(
        base_image_path or DEFAULT_BASE_FILENAME, output_dir
    )
    resolved_dressed_path = resolve_pipeline_path(
        dressed_output_path or DEFAULT_DRESSED_FILENAME, output_dir
    )
    resolved_garment_path = resolve_pipeline_path(
        garment_output_path or DEFAULT_GARMENT_FILENAME, output_dir
    )

    logger.info("Base character path: %s", resolved_base_path)
    logger.info("Dressed image target: %s", resolved_dressed_path)
    logger.info("Garment output target: %s", resolved_garment_path)

    # Check for base character presence
    if not resolved_base_path.is_file():
        if auto_generate_base:
            logger.info("Base character not found. Auto-generating canonical base character...")
            base_gen_ok = generate_base_character(
                output_path=resolved_base_path,
                model=model,
                client=client,
            )
            if not base_gen_ok or not resolved_base_path.is_file():
                logger.error("Failed to auto-generate base character at %s", resolved_base_path)
                return False
            logger.info("Canonical base character created at %s", resolved_base_path)
        else:
            logger.error(
                "Base character reference does not exist at %s. "
                "Please run generate_base.py first or specify --auto-generate-base.",
                resolved_base_path,
            )
            return False

    # Step 1: Generate dressed character using base character as reference
    logger.info("Step 1/2: Generating dressed character from prompt: '%s'", prompt)
    dressed_gen_ok = generate_image(
        prompt=prompt,
        output_path=resolved_dressed_path,
        reference_image_path=resolved_base_path,
        model=model,
        client=client,
        aspect_ratio="2:3",
    )

    if not dressed_gen_ok or not resolved_dressed_path.is_file():
        logger.error("Step 1 failed: Image generation with base reference was unsuccessful.")
        return False

    logger.info("Step 1 succeeded: Dressed character image generated at %s", resolved_dressed_path)

    # Step 2: Subtract base character body and extract transparent garment
    logger.info("Step 2/2: Extracting garment layer via image subtraction...")
    extract_ok = extract_garment(
        base_image_path=resolved_base_path,
        dressed_image_path=resolved_dressed_path,
        output_path=resolved_garment_path,
        tolerance=tolerance,
        cleanup_noise=cleanup_noise,
        session=session,
    )

    if not extract_ok or not resolved_garment_path.is_file():
        logger.error("Step 2 failed: Garment extraction was unsuccessful.")
        return False

    logger.info("Step 2 succeeded: Extracted garment asset saved at %s", resolved_garment_path)
    logger.info("Pipeline V2 end-to-end integration run completed successfully!")
    return True


def main() -> int:
    """CLI entrypoint for Pipeline V2 test run."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    parser = argparse.ArgumentParser(
        description="Pipeline V2 Integration Script: Generates dressed character and extracts garment."
    )
    parser.add_argument(
        "--prompt",
        "-p",
        default=DEFAULT_PROMPT,
        help=f"Prompt for garment generation (default: '{DEFAULT_PROMPT}')",
    )
    parser.add_argument(
        "--base-image",
        "-b",
        default=None,
        help=f"Path to canonical base character image (default: {DEFAULT_BASE_FILENAME} in OUTPUT_DIR)",
    )
    parser.add_argument(
        "--dressed-output",
        "-d",
        default=None,
        help=f"Path for temporary dressed character output (default: {DEFAULT_DRESSED_FILENAME} in OUTPUT_DIR)",
    )
    parser.add_argument(
        "--garment-output",
        "-g",
        default=None,
        help=f"Path for extracted garment PNG output (default: {DEFAULT_GARMENT_FILENAME} in OUTPUT_DIR)",
    )
    parser.add_argument(
        "--model",
        "-m",
        default=None,
        help="Optional model identifier override",
    )
    parser.add_argument(
        "--tolerance",
        "-t",
        type=float,
        default=30.0,
        help="Color difference tolerance for body subtraction (default: 30.0)",
    )
    parser.add_argument(
        "--auto-generate-base",
        action="store_true",
        help="Automatically generate base character if reference image is missing",
    )
    parser.add_argument(
        "--no-cleanup-noise",
        action="store_true",
        help="Disable connected-component noise filtering",
    )

    args = parser.parse_args()

    success = run_pipeline_v2(
        prompt=args.prompt,
        base_image_path=args.base_image,
        dressed_output_path=args.dressed_output,
        garment_output_path=args.garment_output,
        model=args.model,
        tolerance=args.tolerance,
        cleanup_noise=not args.no_cleanup_noise,
        auto_generate_base=args.auto_generate_base,
    )

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
