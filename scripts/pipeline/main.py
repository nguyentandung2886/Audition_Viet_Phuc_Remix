"""Main integration script for the Viet Phuc Remix asset generation pipeline.

Executes the end-to-end pipeline:
1. Generates base character via Gemini/Imagen -> removes background with rembg ->
   exports to public/assets/characters/base_01/base.png and character.json.
2. Generates Ao Dai garment via Gemini/Imagen -> removes background with rembg ->
   exports to public/assets/garments/ao_dai/red/torso.png and garment.json.
"""

import argparse
import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict

from PIL import Image, ImageDraw

# Ensure pipeline modules can be imported
pipeline_dir = Path(__file__).resolve().parent
scripts_dir = pipeline_dir.parent
if str(scripts_dir) not in sys.path:
    sys.path.insert(0, str(scripts_dir))
if str(pipeline_dir) not in sys.path:
    sys.path.insert(0, str(pipeline_dir))

try:
    from pipeline.config import load_config
    from pipeline.generator import generate_image
    from pipeline.processor import (
        crop_and_align_to_canvas,
        export_metadata,
        remove_background,
    )
except ImportError:
    from config import load_config  # type: ignore
    from generator import generate_image  # type: ignore
    from processor import (  # type: ignore
        crop_and_align_to_canvas,
        export_metadata,
        remove_background,
    )

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("pipeline.main")

# Default generation prompts
BASE_CHARACTER_PROMPT = (
    "Full-body anime female mannequin character, standing straight, frontal view, "
    "arms slightly resting at sides, neutral standing pose, clean minimalist lines, "
    "solid white background, studio lighting, high resolution character design"
)

AO_DAI_PROMPT = (
    "Traditional Vietnamese Ao Dai red silk tunic, elegant silhouette with high collar, "
    "delicate gold floral embroidery, frontal view, straight standing pose, "
    "solid white background, clean garment cutout layer"
)

# Canonical metadata structures
BASE_CHARACTER_METADATA: Dict[str, Any] = {
    "characterId": "base_01",
    "name": "Base Female Anime Character",
    "canvas": {
        "width": 1024,
        "height": 1536,
    },
    "anchors": {
        "head": {"x": 0.5, "y": 0.12},
        "neck": {"x": 0.5, "y": 0.18},
        "left_shoulder": {"x": 0.38, "y": 0.22},
        "right_shoulder": {"x": 0.62, "y": 0.22},
        "waist": {"x": 0.5, "y": 0.45},
        "hips": {"x": 0.5, "y": 0.58},
    },
    "assetPath": "/assets/characters/base_01/base.png",
}

AO_DAI_METADATA: Dict[str, Any] = {
    "garmentId": "ao_dai/red",
    "name": "Áo Dài Đỏ Truyền Thống",
    "characterId": "base_01",
    "garmentType": "ao_dai",
    "dynasty": "Nguyen",
    "gender": "nu",
    "description": "Áo dài truyền thống màu đỏ thanh lịch thời Nguyễn",
    "historicalFact": "Trang phục truyền thống Việt Nam kế thừa tinh hoa từ áo ngũ thân thời Nguyễn.",
    "canvas": {
        "width": 1024,
        "height": 1536,
    },
    "renderOrder": 10,
    "layers": [
        {
            "layerId": "torso",
            "name": "Thân áo dài đỏ",
            "renderOrder": 10,
            "assetPath": "/assets/garments/ao_dai/red/torso.png",
            "visible": True,
        }
    ],
    "components": [
        {
            "assetId": "ao_dai_red_torso",
            "name": "Áo Dài Torso",
            "characterId": "base_01",
            "garmentType": "ao_dai",
            "componentType": "front_panel",
            "canvasWidth": 1024,
            "canvasHeight": 1536,
            "renderOrder": 10,
            "anchorReferences": ["neck", "waist"],
            "colorVariants": ["red"],
            "alphaAvailable": True,
            "filePath": "/assets/garments/ao_dai/red/torso.png",
        }
    ],
}


def create_placeholder_image(output_path: Path, color: str, label: str) -> None:
    """Create a placeholder image for testing or offline dry-runs."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (1024, 1536), color="white")
    draw = ImageDraw.Draw(img)

    # Draw simple stylized mannequin or garment shape
    if "base" in label.lower():
        # Body shape
        draw.ellipse([462, 150, 562, 280], fill=color)  # Head
        draw.polygon([(412, 290), (612, 290), (562, 700), (462, 700)], fill=color)  # Torso
        draw.rectangle([462, 700, 562, 1400], fill=color)  # Legs
    else:
        # Tunic shape
        draw.polygon([(400, 270), (624, 270), (680, 1300), (344, 1300)], fill=color)

    img.save(output_path, "PNG")


def run_pipeline(mock: bool = False) -> int:
    """Execute the end-to-end asset generation and processing pipeline."""
    logger.info("Initializing Viet Phuc Remix asset generation pipeline...")
    cfg = load_config()
    output_root = Path(cfg["OUTPUT_DIR"]).resolve()

    logger.info("Target asset directory: %s", output_root)

    # Define paths
    char_dir = output_root / "characters" / "base_01"
    raw_char_path = char_dir / "raw_base.png"
    final_char_png = char_dir / "base.png"
    final_char_json = char_dir / "character.json"

    garment_dir = output_root / "garments" / "ao_dai" / "red"
    raw_garment_path = garment_dir / "raw_torso.png"
    final_garment_png = garment_dir / "torso.png"
    final_garment_json = garment_dir / "garment.json"

    # =========================================================================
    # Step 1: Base Character
    # =========================================================================
    logger.info("--- Step 1: Generating Base Character ---")
    if mock:
        logger.info("Running in mock mode: generating placeholder base character image...")
        create_placeholder_image(raw_char_path, color="#E8D5C4", label="base")
        gen_char_success = True
    else:
        logger.info("Calling Gemini API for base character generation...")
        gen_char_success = generate_image(
            prompt=BASE_CHARACTER_PROMPT,
            output_path=raw_char_path,
            aspect_ratio="2:3",
        )

    if not gen_char_success:
        logger.error(
            "Halting pipeline: Failed to generate base character image. "
            "Please check GEMINI_API_KEY and API quota."
        )
        return 1

    logger.info("Removing background for base character...")
    rmbg_char_success = remove_background(
        input_path=raw_char_path,
        output_path=final_char_png,
    )
    if not rmbg_char_success:
        logger.error("Failed to process background removal for base character.")
        return 1

    logger.info("Aligning base character to canonical canvas dimensions (1024x1536)...")
    crop_and_align_to_canvas(final_char_png, target_width=1024, target_height=1536)

    logger.info("Exporting character metadata to %s...", final_char_json)
    export_metadata(BASE_CHARACTER_METADATA, final_char_json)

    # Clean up temporary raw image
    if raw_char_path.exists():
        try:
            raw_char_path.unlink()
        except OSError:
            pass

    # =========================================================================
    # Step 2: Ao Dai Garment
    # =========================================================================
    logger.info("--- Step 2: Generating Ao Dai Garment ---")
    if mock:
        logger.info("Running in mock mode: generating placeholder Ao Dai garment image...")
        create_placeholder_image(raw_garment_path, color="#C82828", label="garment")
        gen_garment_success = True
    else:
        logger.info("Calling Gemini API for Ao Dai garment generation...")
        gen_garment_success = generate_image(
            prompt=AO_DAI_PROMPT,
            output_path=raw_garment_path,
            aspect_ratio="2:3",
        )

    if not gen_garment_success:
        logger.error(
            "Halting pipeline: Failed to generate Ao Dai garment image. "
            "Please check GEMINI_API_KEY and API quota."
        )
        return 1

    logger.info("Removing background for Ao Dai garment...")
    rmbg_garment_success = remove_background(
        input_path=raw_garment_path,
        output_path=final_garment_png,
    )
    if not rmbg_garment_success:
        logger.error("Failed to process background removal for Ao Dai garment.")
        return 1

    logger.info("Aligning Ao Dai garment to canonical canvas dimensions (1024x1536)...")
    crop_and_align_to_canvas(final_garment_png, target_width=1024, target_height=1536)

    logger.info("Exporting garment metadata to %s...", final_garment_json)
    export_metadata(AO_DAI_METADATA, final_garment_json)

    # Clean up temporary raw image
    if raw_garment_path.exists():
        try:
            raw_garment_path.unlink()
        except OSError:
            pass

    logger.info("=====================================================")
    logger.info("Pipeline completed successfully!")
    logger.info("Generated assets:")
    logger.info("  Character Image:    %s", final_char_png)
    logger.info("  Character Metadata: %s", final_char_json)
    logger.info("  Garment Image:      %s", final_garment_png)
    logger.info("  Garment Metadata:   %s", final_garment_json)
    logger.info("=====================================================")
    return 0


def main() -> None:
    """Parse CLI arguments and run the pipeline."""
    parser = argparse.ArgumentParser(description="Viet Phuc Remix Asset Generation Pipeline")
    parser.add_argument(
        "--mock",
        action="store_true",
        help="Use mock placeholder generator instead of live Gemini API calls",
    )
    args = parser.parse_args()

    exit_code = run_pipeline(mock=args.mock)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
