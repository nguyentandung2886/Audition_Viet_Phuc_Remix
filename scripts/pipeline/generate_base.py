"""Generate Base Character for Pipeline V2.

This standalone script generates the canonical base character (anime style,
female, straight A-pose, full body, tight underwear/gym clothes, no background, 1024x1536)
and saves it to public/assets/base_character.png.
"""

import argparse
import logging
import sys
from pathlib import Path
from typing import Any, Optional, Union

# Ensure pipeline directory is discoverable
pipeline_dir = Path(__file__).resolve().parent
if str(pipeline_dir) not in sys.path:
    sys.path.insert(0, str(pipeline_dir))

try:
    from pipeline.generator import generate_image
except ImportError:
    from generator import generate_image  # type: ignore

logger = logging.getLogger("pipeline.generate_base")

DEFAULT_PROMPT = (
    "Full body anime style female character, standing straight in an A-pose, "
    "frontal direct view, head to toe complete full body visible without cropping, "
    "clean lines, wearing plain tight minimalist underwear gym clothes, neutral expression, "
    "isolated on solid plain white background, no background elements, no shadows, 1024x1536"
)

DEFAULT_OUTPUT_PATH = "public/assets/base_character.png"


def generate_base_character(
    output_path: Union[str, Path] = DEFAULT_OUTPUT_PATH,
    prompt: str = DEFAULT_PROMPT,
    model: Optional[str] = None,
    client: Optional[Any] = None,
) -> bool:
    """Generate the canonical base character image.

    Args:
        output_path: Destination path for base character PNG (default: public/assets/base_character.png).
        prompt: Text prompt describing the base character.
        model: Optional model identifier override.
        client: Optional pre-configured genai.Client instance.

    Returns:
        bool: True if generation succeeded, False otherwise.
    """
    logger.info("Starting base character generation...")
    logger.info("Destination: %s", output_path)
    logger.info("Prompt: %s", prompt)

    success = generate_image(
        prompt=prompt,
        output_path=output_path,
        model=model,
        client=client,
        aspect_ratio="2:3",
    )

    if success:
        logger.info("Base character generation completed successfully at: %s", output_path)
    else:
        logger.error("Base character generation failed.")

    return success


def main() -> int:
    """CLI entrypoint for generating the base character."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    parser = argparse.ArgumentParser(
        description="Generate canonical base character for Anime Viet Phuc Pipeline V2."
    )
    parser.add_argument(
        "--output",
        "-o",
        default=DEFAULT_OUTPUT_PATH,
        help=f"Target path for saving the base character (default: {DEFAULT_OUTPUT_PATH})",
    )
    parser.add_argument(
        "--prompt",
        "-p",
        default=DEFAULT_PROMPT,
        help="Custom prompt for base character generation",
    )
    parser.add_argument(
        "--model",
        "-m",
        default=None,
        help="Optional model identifier override (defaults to GEMINI_IMAGE_MODEL)",
    )

    args = parser.parse_args()

    success = generate_base_character(
        output_path=args.output,
        prompt=args.prompt,
        model=args.model,
    )
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
