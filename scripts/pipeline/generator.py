"""AI Image Generation Module using Google GenAI SDK.

Provides functions to generate base characters and clothing assets using
Gemini / Imagen models with robust error handling and logging.
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
        output_path: Destination file path for saving the image.
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
        if client is None:
            cfg = load_config()
            api_key = cfg.get("API_KEY")
            if not api_key:
                logger.error("Failed to generate image: GEMINI_API_KEY is not configured.")
                return False
            client = genai.Client(api_key=api_key)

        dest_path = Path(output_path)
        dest_path.parent.mkdir(parents=True, exist_ok=True)

        image_bytes: Optional[bytes] = None

        # Imagen models use generate_images
        if "imagen" in target_model.lower():
            response = client.models.generate_images(
                model=target_model,
                prompt=prompt,
            )
            if response and response.generated_images:
                img_obj = response.generated_images[0].image
                if img_obj and img_obj.image_bytes:
                    image_bytes = img_obj.image_bytes
        else:
            # For gemini / multimodal models, attempt generate_images first,
            # then fallback to generate_content if unsupported.
            try:
                response = client.models.generate_images(
                    model=target_model,
                    prompt=prompt,
                )
                if response and response.generated_images:
                    img_obj = response.generated_images[0].image
                    if img_obj and img_obj.image_bytes:
                        image_bytes = img_obj.image_bytes
            except Exception as gen_err:
                logger.debug(
                    "generate_images failed for model %s (%s), falling back to generate_content",
                    target_model,
                    gen_err,
                )
                content_resp = client.models.generate_content(
                    model=target_model,
                    contents=prompt,
                )
                if content_resp and content_resp.candidates:
                    for candidate in content_resp.candidates:
                        if candidate.content and candidate.content.parts:
                            for part in candidate.content.parts:
                                inline = getattr(part, "inline_data", None)
                                if inline and getattr(inline, "data", None):
                                    image_bytes = inline.data
                                    break
                        if image_bytes:
                            break

        if not image_bytes:
            logger.error(
                "No image data returned from model '%s' for prompt: %s",
                target_model,
                prompt,
            )
            return False

        dest_path.write_bytes(image_bytes)
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
