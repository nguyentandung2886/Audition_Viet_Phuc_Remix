"""AI Image Generation Module using Google GenAI SDK.

Provides functions to generate base characters and clothing assets using
Imagen / Gemini models with robust validation, error handling, and logging.
"""

import logging
import os
from pathlib import Path
from typing import Optional, Union

from google import genai

try:
    from pipeline.config import load_config
except ImportError:
    from config import load_config  # type: ignore

logger = logging.getLogger(__name__)

# Default model for image generation
DEFAULT_MODEL: str = os.environ.get("GEMINI_IMAGE_MODEL", "imagen-3.0-generate-002")


def generate_image(
    prompt: str,
    output_path: Union[str, Path],
    model: Optional[str] = None,
    client: Optional[genai.Client] = None,
) -> bool:
    """Generate an image from a text prompt and save to the specified output path.

    Args:
        prompt: Text description of the image to generate.
        output_path: Destination file path for saving the image (must be within OUTPUT_DIR).
        model: Model name/identifier (defaults to GEMINI_IMAGE_MODEL or 'imagen-3.0-generate-002').
        client: Optional pre-configured genai.Client instance.

    Returns:
        bool: True if generation and saving succeeded, False otherwise.
    """
    if not prompt or not prompt.strip():
        logger.error("Failed to generate image: prompt cannot be empty.")
        return False

    if not output_path or not str(output_path).strip():
        logger.error("Failed to generate image: output_path cannot be empty.")
        return False

    target_model = model or DEFAULT_MODEL

    try:
        cfg = load_config()
        output_dir = cfg.get("OUTPUT_DIR")
        if not output_dir:
            logger.error("Failed to generate image: OUTPUT_DIR is not configured.")
            return False

        base_dir = Path(output_dir).resolve()
        dest_path = Path(output_path)
        if not dest_path.is_absolute():
            dest_path = (base_dir / dest_path).resolve()
        else:
            dest_path = dest_path.resolve()

        try:
            if dest_path == base_dir or not dest_path.is_relative_to(base_dir):
                logger.error(
                    "Failed to generate image: output path '%s' is outside configured OUTPUT_DIR '%s'.",
                    dest_path,
                    base_dir,
                )
                return False
        except (ValueError, AttributeError):
            logger.error(
                "Failed to generate image: output path '%s' is outside configured OUTPUT_DIR '%s'.",
                dest_path,
                base_dir,
            )
            return False

        if client is None:
            api_key = cfg.get("API_KEY")
            if not api_key:
                logger.error("Failed to generate image: GEMINI_API_KEY is not configured.")
                return False
            client = genai.Client(api_key=api_key)

        dest_path.parent.mkdir(parents=True, exist_ok=True)

        response = client.models.generate_images(
            model=target_model,
            prompt=prompt,
        )

        if not response or not response.generated_images:
            logger.error(
                "No image data returned from model '%s' for prompt: %s",
                target_model,
                prompt,
            )
            return False

        img_obj = response.generated_images[0].image
        if not img_obj or not img_obj.image_bytes:
            logger.error("Image object or image bytes missing in response.")
            return False

        dest_path.write_bytes(img_obj.image_bytes)
        logger.info("Successfully generated and saved image to %s", dest_path)
        return True

    except Exception as exc:
        logger.error(
            "Exception occurred during image generation with model '%s': %s",
            target_model,
            exc,
            exc_info=True,
        )
        return False
