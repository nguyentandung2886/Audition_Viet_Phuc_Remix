"""Image processing and metadata export module for the Viet Phuc Remix pipeline.

Provides functions to remove backgrounds using rembg, export JSON metadata,
and ensure assets conform to transparent RGBA format.
"""

import io
import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, Optional, Union

from PIL import Image

try:
    from pipeline.validator import resolve_asset_path
except ImportError:
    try:
        from validator import resolve_asset_path  # type: ignore
    except ImportError:
        def resolve_asset_path(image_path: Union[str, Path]) -> str:
            return str(image_path)

logger = logging.getLogger(__name__)

_cached_session = None


def get_rembg_session(model_name: str = "u2netp"):
    """Get or lazily initialize a rembg session with the specified model."""
    global _cached_session
    if _cached_session is None:
        try:
            import rembg
            _cached_session = rembg.new_session(model_name)
        except Exception as exc:
            logger.warning("Failed to initialize rembg session for '%s': %s", model_name, exc)
            return None
    return _cached_session


def export_metadata(data: Dict[str, Any], output_path: Union[str, Path]) -> None:
    """Export metadata dictionary to a JSON file, creating parent directories if needed.

    Args:
        data: Dictionary of metadata to serialize.
        output_path: File path where JSON should be written.

    Raises:
        TypeError: If data is not a dictionary.
        ValueError: If output_path is empty.
    """
    if not isinstance(data, dict):
        raise TypeError(f"Metadata must be a dictionary, got {type(data).__name__}")

    if not output_path or not str(output_path).strip():
        raise ValueError("output_path cannot be empty")

    dest_path = Path(output_path)
    dest_path.parent.mkdir(parents=True, exist_ok=True)

    with open(dest_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    logger.info("Successfully exported metadata to %s", dest_path)


def remove_background(
    input_path: Union[str, Path],
    output_path: Union[str, Path],
    threshold: int = 240,
    session: Optional[Any] = None,
    model_name: str = "u2netp",
) -> bool:
    """Remove background from an image using rembg and save as transparent RGBA PNG.

    If rembg fails or background separation is imperfect, falls back gracefully
    to basic RGBA conversion and logs a warning while still exporting.

    Args:
        input_path: Path to the input image file.
        output_path: Destination path for the transparent PNG output.
        threshold: Pixel intensity threshold for color-key fallback.
        session: Optional pre-initialized rembg session.
        model_name: rembg model identifier (defaults to lightweight 'u2netp').

    Returns:
        bool: True if image was successfully processed and saved, False otherwise.
    """
    if not input_path or not str(input_path).strip():
        logger.error("remove_background failed: input_path cannot be empty.")
        return False

    if not output_path or not str(output_path).strip():
        logger.error("remove_background failed: output_path cannot be empty.")
        return False

    resolved_in = resolve_asset_path(str(input_path))
    if not os.path.isfile(resolved_in):
        logger.error("Input image does not exist: %s", resolved_in)
        return False

    dest_path = Path(output_path)
    dest_path.parent.mkdir(parents=True, exist_ok=True)

    # Attempt rembg processing
    try:
        import rembg

        with open(resolved_in, "rb") as i:
            input_bytes = i.read()

        active_session = session if session is not None else get_rembg_session(model_name)
        if active_session is not None:
            output_bytes = rembg.remove(input_bytes, session=active_session)
        else:
            output_bytes = rembg.remove(input_bytes)

        with Image.open(io.BytesIO(output_bytes)) as out_img:
            rgba = out_img.convert("RGBA")
            alpha = rgba.split()[-1]
            extrema = alpha.getextrema()
            if extrema == (255, 255):
                logger.warning(
                    "rembg did not separate background for %s; output image has fully opaque alpha channel.",
                    resolved_in,
                )
            rgba.save(dest_path, format="PNG")
            logger.info("Successfully removed background and saved RGBA image to %s", dest_path)
            return True

    except Exception as exc:
        logger.warning(
            "rembg background removal failed for %s (%s). Falling back to basic RGBA export.",
            resolved_in,
            exc,
        )

        # Fallback PIL-based alpha conversion / white background removal
        try:
            with Image.open(resolved_in) as img:
                rgba = img.convert("RGBA")
                data = rgba.getdata()

                new_data = []
                for item in data:
                    # If near white, make transparent
                    if item[0] >= threshold and item[1] >= threshold and item[2] >= threshold:
                        new_data.append((item[0], item[1], item[2], 0))
                    else:
                        new_data.append(item)

                rgba.putdata(new_data)
                rgba.save(dest_path, format="PNG")
                logger.info("Saved fallback RGBA image to %s", dest_path)
                return True
        except Exception as fallback_exc:
            logger.error("Failed to process image fallback for %s: %s", resolved_in, fallback_exc, exc_info=True)
            return False


def crop_and_align_to_canvas(
    img_path: Union[str, Path],
    output_path: Optional[Union[str, Path]] = None,
    target_width: int = 1024,
    target_height: int = 1536,
) -> str:
    """Ensure the image matches the target canvas size (1024x1536 RGBA).

    If dimensions do not match, centers and fits it into the canvas without distortion.
    """
    resolved = resolve_asset_path(str(img_path))
    if not os.path.isfile(resolved):
        raise FileNotFoundError(f"Image not found at {img_path}")

    save_path = Path(output_path) if output_path else Path(resolved)
    save_path.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(resolved) as img:
        if img.size == (target_width, target_height) and img.mode == "RGBA":
            if save_path != Path(resolved):
                img.save(save_path, "PNG")
            return str(save_path)

        rgba = img.convert("RGBA")
        new_img = Image.new("RGBA", (target_width, target_height), (0, 0, 0, 0))

        # Calculate aspect-ratio preserving fit or centering
        offset_x = max(0, (target_width - rgba.width) // 2)
        offset_y = max(0, (target_height - rgba.height) // 2)

        if rgba.width > target_width or rgba.height > target_height:
            rgba.thumbnail((target_width, target_height), Image.Resampling.LANCZOS)
            offset_x = (target_width - rgba.width) // 2
            offset_y = (target_height - rgba.height) // 2

        new_img.paste(rgba, (offset_x, offset_y), rgba)
        new_img.save(save_path, "PNG")
        return str(save_path)
