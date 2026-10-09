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
import numpy as np

try:
    import cv2
except ImportError:
    cv2 = None  # type: ignore

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


def _apply_color_key_fallback(img: Image.Image, threshold: int = 240) -> Image.Image:
    """Fallback method to convert near-white background pixels to transparent."""
    rgba = img.convert("RGBA")
    arr = np.array(rgba, dtype=np.uint8)
    is_near_white = (arr[:, :, 0] >= threshold) & (arr[:, :, 1] >= threshold) & (arr[:, :, 2] >= threshold)
    arr[is_near_white, 3] = 0
    return Image.fromarray(arr, mode="RGBA")


def isolate_foreground(
    img: Image.Image,
    threshold: int = 240,
    session: Optional[Any] = None,
    model_name: str = "u2netp",
) -> Image.Image:
    """Isolate the foreground object by removing solid or uniform background.

    If the image already has transparency (min alpha < 128), returns it as-is.
    Otherwise attempts rembg background removal with fallback to color keying.
    """
    if img.mode == "RGBA":
        alpha = img.split()[-1]
        extrema = alpha.getextrema()
        if extrema[0] < 128:
            return img

    try:
        import rembg

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        input_bytes = buf.getvalue()

        active_session = session if session is not None else get_rembg_session(model_name)
        if active_session is not None:
            output_bytes = rembg.remove(input_bytes, session=active_session)
        else:
            output_bytes = rembg.remove(input_bytes)

        with Image.open(io.BytesIO(output_bytes)) as out_img:
            rgba = out_img.convert("RGBA")
            alpha = rgba.split()[-1]
            if alpha.getextrema() == (255, 255):
                logger.warning("rembg did not separate background; falling back to color-keying.")
                return _apply_color_key_fallback(rgba, threshold)
            return rgba

    except Exception as exc:
        logger.warning("rembg processing failed (%s). Falling back to color-keying.", exc)
        return _apply_color_key_fallback(img.convert("RGBA"), threshold)


def extract_garment(
    base_image_path: Union[str, Path],
    dressed_image_path: Union[str, Path],
    output_path: Union[str, Path],
    tolerance: float = 30.0,
    threshold: int = 240,
    session: Optional[Any] = None,
    model_name: str = "u2netp",
    cleanup_noise: bool = True,
    min_island_size: int = 32,
    target_width: Optional[int] = None,
    target_height: Optional[int] = None,
) -> bool:
    """Extract only new clothing/garments by subtracting base character features.

    Compares base_image and dressed_image, masks out unchanged body parts (skin,
    face, limbs) by setting their alpha channel to 0, isolates new garments, cleans up
    backgrounds and noise specks, and saves the result as a transparent PNG.

    Args:
        base_image_path: Path to the reference base character image.
        dressed_image_path: Path to the dressed character image.
        output_path: Destination path for the extracted transparent garment PNG.
        tolerance: Color Euclidean distance threshold (default 30.0) below which pixels
                   matching base character are masked out as unchanged body parts.
        threshold: Pixel intensity threshold for color-key background fallback.
        session: Optional pre-initialized rembg session.
        model_name: rembg model identifier (defaults to 'u2netp').
        cleanup_noise: Whether to remove small isolated noise islands.
        min_island_size: Minimum pixel area for connected garment components.
        target_width: Optional target canvas width for alignment.
        target_height: Optional target canvas height for alignment.

    Returns:
        bool: True if garment was extracted and saved successfully, False otherwise.
    """
    if not base_image_path or not str(base_image_path).strip():
        logger.error("extract_garment failed: base_image_path cannot be empty.")
        return False

    if not dressed_image_path or not str(dressed_image_path).strip():
        logger.error("extract_garment failed: dressed_image_path cannot be empty.")
        return False

    if not output_path or not str(output_path).strip():
        logger.error("extract_garment failed: output_path cannot be empty.")
        return False

    resolved_base = resolve_asset_path(str(base_image_path))
    if not os.path.isfile(resolved_base):
        logger.error("Base image does not exist: %s", resolved_base)
        return False

    resolved_dressed = resolve_asset_path(str(dressed_image_path))
    if not os.path.isfile(resolved_dressed):
        logger.error("Dressed image does not exist: %s", resolved_dressed)
        return False

    dest_path = Path(output_path)
    dest_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        with Image.open(resolved_base) as b_img, Image.open(resolved_dressed) as d_img:
            base_img = b_img.copy()
            dressed_img = d_img.copy()

        # 1. Isolate foregrounds (remove background) if not already transparent
        base_isolated = isolate_foreground(
            base_img, threshold=threshold, session=session, model_name=model_name
        )
        dressed_isolated = isolate_foreground(
            dressed_img, threshold=threshold, session=session, model_name=model_name
        )

        # 2. Align dimensions if they differ
        if dressed_isolated.size != base_isolated.size:
            logger.info(
                "Resizing dressed image %s to match base image %s",
                dressed_isolated.size,
                base_isolated.size,
            )
            dressed_isolated = dressed_isolated.resize(
                base_isolated.size, Image.Resampling.LANCZOS
            )

        # 3. Convert to numpy arrays for pixel comparison
        base_arr = np.array(base_isolated.convert("RGBA"), dtype=np.uint8)
        dressed_arr = np.array(dressed_isolated.convert("RGBA"), dtype=np.uint8)

        base_rgb = base_arr[:, :, :3].astype(np.float32)
        base_a = base_arr[:, :, 3]
        dressed_rgb = dressed_arr[:, :, :3].astype(np.float32)
        dressed_a = dressed_arr[:, :, 3]

        # Compute color difference between base and dressed
        color_diff = np.sqrt(np.sum((dressed_rgb - base_rgb) ** 2, axis=-1))

        # A pixel is considered unchanged base character body if:
        # - Base character has non-transparent body here (base_a > 10)
        # - Color difference is within tolerance
        is_base_body = (base_a > 10) & (color_diff <= tolerance)

        # Garment pixels: dressed foreground exists AND not matching base body
        is_garment = (dressed_a > 10) & (~is_base_body)

        # Build output array
        out_arr = np.zeros_like(dressed_arr)
        out_arr[is_garment, :3] = dressed_arr[is_garment, :3]
        out_arr[is_garment, 3] = dressed_a[is_garment]

        # 4. Optional noise cleanup using connected components
        if cleanup_noise and min_island_size > 0 and cv2 is not None:
            garment_mask = (out_arr[:, :, 3] > 0).astype(np.uint8)
            total_garment_pixels = int(np.count_nonzero(garment_mask))
            if total_garment_pixels > 0:
                effective_min = min(min_island_size, max(1, total_garment_pixels // 4))
                num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(
                    garment_mask, connectivity=8
                )
                for i in range(1, num_labels):
                    area = stats[i, cv2.CC_STAT_AREA]
                    if area < effective_min:
                        out_arr[labels == i] = 0

        garment_pixels = int(np.count_nonzero(out_arr[:, :, 3] > 0))
        if garment_pixels == 0:
            logger.warning(
                "No garment pixels detected after subtracting base character from %s",
                resolved_dressed,
            )
        else:
            logger.info(
                "Successfully extracted garment (%d pixels) from %s",
                garment_pixels,
                resolved_dressed,
            )

        out_img = Image.fromarray(out_arr, mode="RGBA")

        if target_width is not None and target_height is not None:
            if out_img.size != (target_width, target_height):
                out_img.save(dest_path, format="PNG")
                crop_and_align_to_canvas(
                    dest_path,
                    output_path=dest_path,
                    target_width=target_width,
                    target_height=target_height,
                )
                return True

        out_img.save(dest_path, format="PNG")
        return True

    except Exception as exc:
        logger.error(
            "Failed to extract garment from %s and %s: %s",
            resolved_base,
            resolved_dressed,
            exc,
            exc_info=True,
        )
        return False
