"""Automated processing and alignment of generated anime assets.

Processes raw generated images through rembg background removal,
conforms each layer to the canonical 1024x1536 canvas, aligns them to
anatomical anchors, and writes out the production assets and JSON schemas.
"""

import json
import os
import sys
from pathlib import Path
from PIL import Image

# Ensure pipeline root is in path
current_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(current_dir))

from processor import remove_background, crop_and_align_to_canvas

BRAIN_DIR = Path(r"C:\Users\MSI\.gemini\antigravity\brain\12d9a574-778c-4176-9fc1-82c4df77024c")
PROJECT_ROOT = current_dir.parent.parent
OUTPUT_DIR = PROJECT_ROOT / "public" / "assets"

# Canonical Dimensions
CANVAS_WIDTH = 1024
CANVAS_HEIGHT = 1536

RAW_FILES = {
    "base": BRAIN_DIR / "anime_female_base_1791554299356.jpg",
    "torso": BRAIN_DIR / "ao_dai_red_torso_1791554329701.jpg",
    "pants": BRAIN_DIR / "ao_dai_pants_1791554349582.jpg",
    "headpiece": BRAIN_DIR / "ao_dai_headpiece_1791554370619.jpg",
    "necklace": BRAIN_DIR / "ao_dai_necklace_1791554410902.jpg",
}


def fit_layer_to_canvas(
    rgba_img: Image.Image,
    target_width: int = CANVAS_WIDTH,
    target_height: int = CANVAS_HEIGHT,
    scale_factor: float = 1.0,
    offset_x_ratio: float = 0.5,
    offset_y_ratio: float = 0.5,
) -> Image.Image:
    """Creates a transparent 1024x1536 canvas and pastes the asset based on scale and center ratios."""
    canvas = Image.new("RGBA", (target_width, target_height), (0, 0, 0, 0))

    # Crop out pure transparent borders to get bounding box of visible content
    alpha = rgba_img.split()[-1]
    bbox = alpha.getbbox()
    if bbox:
        cropped = rgba_img.crop(bbox)
    else:
        cropped = rgba_img

    orig_w, orig_h = cropped.size
    new_w = int(orig_w * scale_factor)
    new_h = int(orig_h * scale_factor)

    if new_w > 0 and new_h > 0:
        resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
    else:
        resized = cropped

    # Target center coordinates
    center_x = int(target_width * offset_x_ratio)
    center_y = int(target_height * offset_y_ratio)

    paste_x = center_x - (resized.width // 2)
    paste_y = center_y - (resized.height // 2)

    canvas.paste(resized, (paste_x, paste_y), resized)
    return canvas


def main():
    print("=== Processing Generated Anime Assets for Viet Phuc Remix ===")
    os.makedirs(OUTPUT_DIR / "characters" / "base_01", exist_ok=True)
    os.makedirs(OUTPUT_DIR / "garments" / "ao_dai" / "red", exist_ok=True)

    temp_dir = current_dir / "temp_processing"
    temp_dir.mkdir(exist_ok=True)

    # 1. Process Base Character
    print("\n1. Processing Base Character...")
    base_raw = RAW_FILES["base"]
    base_rembg = temp_dir / "base_rembg.png"
    final_base = OUTPUT_DIR / "characters" / "base_01" / "base.png"

    if remove_background(base_raw, base_rembg):
        with Image.open(base_rembg) as img:
            fitted = fit_layer_to_canvas(
                img,
                scale_factor=1.18,
                offset_x_ratio=0.50,
                offset_y_ratio=0.52,
            )
            fitted.save(final_base, "PNG")
        print(f"-> Saved canonical Base Character to {final_base}")
    else:
        print("Failed to remove background for base character!")

    # 2. Process Pants
    print("\n2. Processing Pants...")
    pants_raw = RAW_FILES["pants"]
    pants_rembg = temp_dir / "pants_rembg.png"
    final_pants = OUTPUT_DIR / "garments" / "ao_dai" / "red" / "pants.png"

    if remove_background(pants_raw, pants_rembg):
        with Image.open(pants_rembg) as img:
            fitted = fit_layer_to_canvas(
                img,
                scale_factor=0.92,
                offset_x_ratio=0.50,
                offset_y_ratio=0.72,
            )
            fitted.save(final_pants, "PNG")
        print(f"-> Saved Pants layer to {final_pants}")

    # 3. Process Ao Dai Torso (Thân áo trước & tà)
    print("\n3. Processing Ao Dai Torso...")
    torso_raw = RAW_FILES["torso"]
    torso_rembg = temp_dir / "torso_rembg.png"
    final_torso = OUTPUT_DIR / "garments" / "ao_dai" / "red" / "torso.png"

    if remove_background(torso_raw, torso_rembg):
        with Image.open(torso_rembg) as img:
            fitted = fit_layer_to_canvas(
                img,
                scale_factor=1.12,
                offset_x_ratio=0.50,
                offset_y_ratio=0.56,
            )
            fitted.save(final_torso, "PNG")
        print(f"-> Saved Torso layer to {final_torso}")

    # 4. Process Headpiece
    print("\n4. Processing Headpiece (Man)...")
    head_raw = RAW_FILES["headpiece"]
    head_rembg = temp_dir / "head_rembg.png"
    final_head = OUTPUT_DIR / "garments" / "ao_dai" / "red" / "headpiece.png"

    if remove_background(head_raw, head_rembg):
        with Image.open(head_rembg) as img:
            fitted = fit_layer_to_canvas(
                img,
                scale_factor=0.48,
                offset_x_ratio=0.50,
                offset_y_ratio=0.10,
            )
            fitted.save(final_head, "PNG")
        print(f"-> Saved Headpiece layer to {final_head}")

    # 5. Process Necklace
    print("\n5. Processing Necklace (Kieng bac)...")
    neck_raw = RAW_FILES["necklace"]
    neck_rembg = temp_dir / "neck_rembg.png"
    final_neck = OUTPUT_DIR / "garments" / "ao_dai" / "red" / "necklace.png"

    if remove_background(neck_raw, neck_rembg):
        with Image.open(neck_rembg) as img:
            fitted = fit_layer_to_canvas(
                img,
                scale_factor=0.32,
                offset_x_ratio=0.50,
                offset_y_ratio=0.29,
            )
            fitted.save(final_neck, "PNG")
        print(f"-> Saved Necklace layer to {final_neck}")

    # 6. Update Metadata JSONs
    print("\n6. Exporting Updated Metadata...")
    char_json_path = OUTPUT_DIR / "characters" / "base_01" / "character.json"
    char_metadata = {
        "characterId": "base_01",
        "name": "Nữ Sinh Anime Việt Nam (Base Character)",
        "artStyle": "Anime 2D Cel-Shaded",
        "canvas": {"width": CANVAS_WIDTH, "height": CANVAS_HEIGHT},
        "anchors": {
            "head": {"x": 0.50, "y": 0.12},
            "neck": {"x": 0.50, "y": 0.28},
            "left_shoulder": {"x": 0.40, "y": 0.31},
            "right_shoulder": {"x": 0.60, "y": 0.31},
            "waist": {"x": 0.50, "y": 0.49},
            "hips": {"x": 0.50, "y": 0.60},
        },
        "assetPath": "/assets/characters/base_01/base.png",
    }
    with open(char_json_path, "w", encoding="utf-8") as f:
        json.dump(char_metadata, f, indent=2, ensure_ascii=False)
    print(f"-> Wrote character metadata to {char_json_path}")

    garment_json_path = OUTPUT_DIR / "garments" / "ao_dai" / "red" / "garment.json"
    garment_metadata = {
        "garmentId": "ao_dai/red",
        "name": "Áo Dài Đỏ Hoa Sen Hoàng Triều",
        "characterId": "base_01",
        "garmentType": "ao_dai",
        "dynasty": "Nguyễn (1802 - 1945)",
        "gender": "nu",
        "description": "Áo dài truyền thống lụa đỏ thắm thêu hoa sen hoàng kim tinh xảo thời Nguyễn, kết hợp cùng mấn đội đầu gấm phụng và kiềng bạc cổ truyền.",
        "historicalFact": "Trang phục áo dài Việt Nam thời Nguyễn kế thừa và cách tân từ áo ngũ thân lập lĩnh, thể hiện sự kín đáo, đoan trang và khí chất thanh nhã của người phụ nữ Việt.",
        "canvas": {"width": CANVAS_WIDTH, "height": CANVAS_HEIGHT},
        "renderOrder": 10,
        "layers": [
            {
                "layerId": "pants",
                "name": "Quần Lụa Trắng",
                "componentType": "pants",
                "renderOrder": 25,
                "assetPath": "/assets/garments/ao_dai/red/pants.png",
                "visible": True,
                "isOptional": False,
            },
            {
                "layerId": "torso",
                "name": "Thân Áo Dài Hoa Sen",
                "componentType": "front_panel",
                "renderOrder": 40,
                "assetPath": "/assets/garments/ao_dai/red/torso.png",
                "visible": True,
                "isOptional": False,
            },
            {
                "layerId": "necklace",
                "name": "Kiềng Bạc Chạm Hoa Sen",
                "componentType": "accessory",
                "renderOrder": 50,
                "assetPath": "/assets/garments/ao_dai/red/necklace.png",
                "visible": True,
                "isOptional": True,
            },
            {
                "layerId": "headpiece",
                "name": "Mấn Đội Đầu Hoàng Kim",
                "componentType": "headpiece",
                "renderOrder": 60,
                "assetPath": "/assets/garments/ao_dai/red/headpiece.png",
                "visible": True,
                "isOptional": True,
            },
        ],
        "components": [
            {
                "assetId": "ao_dai_red_pants",
                "name": "Quần Lụa Trắng",
                "componentType": "pants",
                "renderOrder": 25,
                "filePath": "/assets/garments/ao_dai/red/pants.png",
            },
            {
                "assetId": "ao_dai_red_torso",
                "name": "Thân Áo Dài Hoa Sen",
                "componentType": "front_panel",
                "renderOrder": 40,
                "filePath": "/assets/garments/ao_dai/red/torso.png",
            },
            {
                "assetId": "ao_dai_red_necklace",
                "name": "Kiềng Bạc Cổ Truyền",
                "componentType": "necklace",
                "renderOrder": 50,
                "filePath": "/assets/garments/ao_dai/red/necklace.png",
            },
            {
                "assetId": "ao_dai_red_headpiece",
                "name": "Mấn Đội Đầu Hoàng Gia",
                "componentType": "headpiece",
                "renderOrder": 60,
                "filePath": "/assets/garments/ao_dai/red/headpiece.png",
            },
        ],
    }
    with open(garment_json_path, "w", encoding="utf-8") as f:
        json.dump(garment_metadata, f, indent=2, ensure_ascii=False)
    print(f"-> Wrote garment metadata to {garment_json_path}")

    print("\n=== All anime assets processed and configured successfully! ===")


if __name__ == "__main__":
    main()
