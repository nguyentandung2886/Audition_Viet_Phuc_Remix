"""AI Image Generation Module using Google GenAI SDK.

Provides functions to generate base characters and clothing assets using
Imagen / Gemini models with robust validation, error handling, and logging.
"""

import logging
import os
from pathlib import Path
from typing import Any, Optional, Union

from google import genai
try:
    from google.genai import types
except ImportError:
    types = None  # type: ignore

try:
    from pipeline.config import load_config
except ImportError:
    from config import load_config  # type: ignore

logger = logging.getLogger(__name__)

# Default model for image generation
DEFAULT_MODEL: str = os.environ.get("GEMINI_IMAGE_MODEL", "imagen-3.0-generate-002")


def build_garment_isolation_prompt(
    component_type: str = "torso",
    garment_name: str = "Vietnamese Ao Dai",
    custom_details: Optional[str] = None,
) -> str:
    """Build a detailed prompt to instruct the AI to erase the character body and isolate the garment.

    Enforces:
    - 2D anime cel-shaded art style.
    - Complete erasure of character body (face, skin, limbs, hair) and background.
    - Geometric stability: strict 1:1 scale, position, and silhouette preservation.
    - Hollow interior openings (open collar, sleeve cuffs, waistband) without back lining
      drawing over where the character stands.
    """
    comp = component_type.lower().strip()
    details = f" Specific details: {custom_details.strip()}" if custom_details else ""

    if comp in ("torso", "dress", "robe", "ao_dai", "nhat_binh", "outerwear"):
        return (
            f"Professional 2D anime cel-shaded asset isolation.{details} "
            f"From the reference image, isolate ONLY the {garment_name} {comp} garment. "
            f"ERASE AND REMOVE EVERYTHING ELSE: completely erase the character's head, face, eyes, hair, ears, "
            f"neck, shoulder skin, arms, hands, legs, feet, shoes, undergarments, trousers, and the entire background. "
            f"Replace all erased regions with a pure, solid, flat white background (#FFFFFF). "
            f"GEOMETRIC AND STRUCTURAL CONSTRAINTS: "
            f"1. Preserve the exact 1:1 position, silhouette, angle, drapery, and dimensions on the canvas. "
            f"Do not zoom, rotate, shift, or resize. "
            f"2. HOLLOW INTERIOR OPENINGS: The neck collar opening, sleeve cuff openings, and bottom hem must be completely "
            f"hollow and empty (pure flat white background inside). "
            f"CRITICAL: Do NOT draw the inside back lining, inner back collar, or back fabric covering where the person's body was. "
            f"The interior must be empty so a character standing behind it can show through naturally. "
            f"3. Render only the front-facing outer silk fabric, authentic embroidery, trims, closures, and side flaps."
        )
    elif comp in ("pants", "trousers", "skirt", "bottom"):
        return (
            f"Professional 2D anime cel-shaded asset isolation.{details} "
            f"From the reference image, isolate ONLY the {garment_name} pants / lower garment. "
            f"ERASE AND REMOVE EVERYTHING ELSE: completely erase the character's upper body, torso, arms, hands, "
            f"head, face, neck, legs skin, feet, slippers, and background. "
            f"Replace all erased areas with a pure solid flat white background (#FFFFFF). "
            f"GEOMETRIC AND STRUCTURAL CONSTRAINTS: "
            f"1. Preserve the exact 1:1 scale, vertical alignment, and silhouette of the trousers. "
            f"2. HOLLOW OPENINGS: The waistband opening and bottom ankle cuff openings must be hollow (flat white background), "
            f"with no back lining or body skin visible. "
            f"3. Keep only the outer silk fabric, natural folds, and hem embroidery."
        )
    elif comp in ("headpiece", "man", "hat", "crown", "khan_van"):
        return (
            f"Professional 2D anime cel-shaded asset isolation.{details} "
            f"From the reference image, isolate ONLY the {garment_name} headpiece / mấn. "
            f"ERASE AND REMOVE EVERYTHING ELSE: completely remove all character hair, scalp, ears, forehead, "
            f"face, body, and background. "
            f"Replace all erased areas with a pure solid flat white background (#FFFFFF). "
            f"Preserve the exact circular/curved shape, position, gold embroidery, and scale. "
            f"The inner head opening where the head sits must be empty (pure flat white background), "
            f"not filled with hair, scalp, or skin."
        )
    elif comp in ("necklace", "accessory", "kieng", "jewelry", "pendant"):
        return (
            f"Professional 2D anime cel-shaded asset isolation.{details} "
            f"From the reference image, isolate ONLY the {garment_name} accessory ({comp}). "
            f"ERASE AND REMOVE EVERYTHING ELSE: remove the character's neck, chest, clothes, collar, and background. "
            f"Replace all removed areas with a solid flat white background (#FFFFFF). "
            f"Preserve the unbroken metallic/carved silhouette and exact coordinates."
        )
    else:
        return (
            f"Professional 2D anime cel-shaded asset isolation.{details} "
            f"From the reference image, isolate ONLY the {garment_name} {comp}. "
            f"ERASE AND REMOVE EVERYTHING ELSE: completely remove the character's body, skin, face, hair, limbs, "
            f"and background. Replace all erased areas with a pure solid flat white background (#FFFFFF). "
            f"Preserve the exact 1:1 scale, position, and silhouette. All openings must be hollowed out with no internal back lining."
        )


def isolate_garment_ai(
    dressed_image_path: Union[str, Path],
    output_path: Union[str, Path],
    component_type: str = "torso",
    garment_name: str = "traditional Vietnamese garment",
    custom_details: Optional[str] = None,
    client: Optional[Any] = None,
    model: Optional[str] = None,
    aspect_ratio: Optional[str] = "2:3",
) -> bool:
    """Isolate a specific garment component from a dressed character image using AI editing.

    Uses Gemini image-to-image editing with an explicit prompt that removes character body
    parts and background, leaving only the hollowed, geometrically-aligned garment component
    on a solid flat white background.

    Args:
        dressed_image_path: Path to the input dressed character image.
        output_path: Destination path for the isolated garment image.
        component_type: Type of component ('torso', 'pants', 'headpiece', 'necklace').
        garment_name: Cultural name of the garment (e.g. 'Áo Nhật Bình', 'Áo Dài').
        custom_details: Optional specific descriptive details for prompt.
        client: Optional pre-configured genai.Client instance.
        model: Optional model override.
        aspect_ratio: Canvas aspect ratio (default '2:3').

    Returns:
        bool: True if generation succeeded and image was saved, False otherwise.
    """
    prompt = build_garment_isolation_prompt(
        component_type=component_type,
        garment_name=garment_name,
        custom_details=custom_details,
    )
    logger.info("Isolating %s (%s) via AI image editing...", component_type, garment_name)
    return generate_image(
        prompt=prompt,
        output_path=output_path,
        model=model,
        client=client,
        aspect_ratio=aspect_ratio,
        reference_image_path=dressed_image_path,
    )



def generate_image(
    prompt: str,
    output_path: Union[str, Path],
    model: Optional[str] = None,
    client: Optional[genai.Client] = None,
    aspect_ratio: Optional[str] = "2:3",
    reference_image_path: Optional[Union[str, Path]] = None,
) -> bool:
    """Generate an image from a text prompt and save to the specified output path.

    If reference_image_path is provided, uses client.models.edit_image to edit the reference.
    Otherwise, generates a new image using client.models.generate_images.

    Args:
        prompt: Text description of the image to generate.
        output_path: Destination file path for saving the image (must be within OUTPUT_DIR).
        model: Model name/identifier (defaults to GEMINI_IMAGE_MODEL or 'imagen-3.0-generate-002').
        client: Optional pre-configured genai.Client instance.
        aspect_ratio: Optional aspect ratio for image generation (defaults to "2:3").
        reference_image_path: Optional path to reference image for image-to-image editing.

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
            cwd_dest = dest_path.resolve()
            try:
                if cwd_dest.is_relative_to(base_dir) and cwd_dest != base_dir:
                    dest_path = cwd_dest
                else:
                    dest_path = (base_dir / dest_path).resolve()
            except (ValueError, AttributeError):
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

        ref_image_obj = None
        if reference_image_path is not None:
            ref_path = Path(reference_image_path)
            if not ref_path.is_absolute() and not ref_path.exists():
                candidate = (base_dir / ref_path).resolve()
                if candidate.exists():
                    ref_path = candidate
                else:
                    ref_path = ref_path.resolve()
            else:
                ref_path = ref_path.resolve()

            if not ref_path.is_file():
                logger.error(
                    "Failed to generate image: reference image '%s' does not exist.",
                    ref_path,
                )
                return False

            if types is not None and hasattr(types, "Image") and hasattr(types, "RawReferenceImage"):
                image_ref = types.Image.from_file(location=str(ref_path))
                ref_image_obj = types.RawReferenceImage(
                    reference_id=1,
                    reference_image=image_ref,
                )
            else:
                ref_image_obj = {
                    "reference_id": 1,
                    "reference_image": {"image_bytes": ref_path.read_bytes()},
                }

        if client is None:
            api_key = cfg.get("API_KEY")
            if not api_key:
                logger.error("Failed to generate image: GEMINI_API_KEY is not configured.")
                return False
            client = genai.Client(api_key=api_key)

        dest_path.parent.mkdir(parents=True, exist_ok=True)

        if ref_image_obj is not None:
            config_kwargs: dict[str, Any] = {"edit_mode": "EDIT_MODE_DEFAULT"}
            if aspect_ratio:
                config_kwargs["aspect_ratio"] = aspect_ratio

            if types is not None and hasattr(types, "EditImageConfig"):
                edit_config = types.EditImageConfig(**config_kwargs)
            else:
                edit_config = config_kwargs

            response = client.models.edit_image(
                model=target_model,
                prompt=prompt,
                reference_images=[ref_image_obj],
                config=edit_config,
            )
        else:
            call_kwargs: dict[str, Any] = {
                "model": target_model,
                "prompt": prompt,
            }
            if aspect_ratio:
                if types is not None and hasattr(types, "GenerateImagesConfig"):
                    call_kwargs["config"] = types.GenerateImagesConfig(aspect_ratio=aspect_ratio)
                else:
                    call_kwargs["config"] = {"aspect_ratio": aspect_ratio}

            response = client.models.generate_images(**call_kwargs)

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
