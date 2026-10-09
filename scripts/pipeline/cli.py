import argparse
import json
import os
import shutil
import sys
from pathlib import Path

# Prevent UnicodeEncodeError on Windows terminals
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

from schema import BaseCharacter, CanvasSpec, GarmentComponent, ModularGarment, Point, ValidationReport
from processor import remove_background, crop_and_align_to_canvas
from validator import validate_asset
from composer import compose_outfit

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
CANONICAL_DIR = PROJECT_ROOT / "public" / "assets" / "canonical"

def load_canonical_data():
    CANONICAL_DIR.mkdir(parents=True, exist_ok=True)
    char_json = CANONICAL_DIR / "character.json"
    garment_json = CANONICAL_DIR / "garment_ao_dai.json"

    if not char_json.exists():
        print(f"Error: {char_json} not found.")
        return None, None

    if not garment_json.exists():
        print(f"Error: {garment_json} not found.")
        return None, None

    with open(char_json, "r", encoding="utf-8") as f:
        char_data = BaseCharacter.model_validate_json(f.read())

    with open(garment_json, "r", encoding="utf-8") as f:
        garment_data = ModularGarment.model_validate_json(f.read())

    return char_data, garment_data

def run_validation():
    """
    Validates all canonical base and modular Ao Dai assets,
    and writes validation_report.json.
    """
    char_data, garment_data = load_canonical_data()
    if not char_data or not garment_data:
        return 1

    print(f"Character: {char_data.name} ({char_data.characterId})")
    print(f"Garment: {garment_data.name} ({garment_data.garmentId})")
    print(f"Canvas: {char_data.canvas.width}x{char_data.canvas.height}")

    reports = []
    print("\n--- Validating Assets ---")

    # Validate Base Character
    base_img_path = char_data.assetPath or ""
    base_report = validate_asset(base_img_path, char_data.canvas.width, char_data.canvas.height, char_data.characterId)
    reports.append(base_report)
    print(f"  [{base_report.status.upper()}] {char_data.characterId}: valid={base_report.isValid}, bbox={base_report.boundingBox}")

    # Validate Components
    for comp in garment_data.components:
        report = validate_asset(comp.filePath or "", comp.canvasWidth, comp.canvasHeight, comp.assetId)
        comp.validationStatus = report.status
        reports.append(report)
        print(f"  [{report.status.upper()}] {comp.assetId}: valid={report.isValid}, bbox={report.boundingBox}")

    # Write Validation Report JSON
    report_path = CANONICAL_DIR / "validation_report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump([r.model_dump() for r in reports], f, indent=2)
    print(f"\n✓ Wrote validation report with {len(reports)} entries to {report_path}")

    all_approved = all(r.isValid and r.status == "approved" for r in reports)
    if not all_approved:
        print("✗ One or more assets failed validation.")
        return 1
    return 0

def run_composition():
    """
    Composites the modular Ao Dai preview.
    """
    char_data, garment_data = load_canonical_data()
    if not char_data or not garment_data:
        return 1

    print("\n--- Compositing Preview ---")
    base_img_path = char_data.assetPath or ""
    preview_output = CANONICAL_DIR / "preview_ao_dai.png"
    success = compose_outfit(base_img_path, garment_data.components, str(preview_output), base_render_order=30)

    if success:
        preview_report = validate_asset(str(preview_output), char_data.canvas.width, char_data.canvas.height, "preview_ao_dai")
        print(f"✓ Created composited preview at {preview_output}")
        print(f"  Preview validation: status={preview_report.status}, pixels={preview_report.nonEmptyPixelCount}")
        return 0
    else:
        print("✗ Failed to compose preview.")
        return 1

def run_process_asset(input_path: str, output_path: str) -> int:
    """
    Removes background and crops/aligns image to canonical 1024x1536 canvas.
    """
    if not input_path or not output_path:
        print("Error: --input and --output are required for action 'process'.")
        return 1
    success = remove_background(input_path, output_path)
    if not success:
        print(f"✗ Failed to remove background for {input_path}")
        return 1
    crop_and_align_to_canvas(output_path)
    print(f"✓ Processed asset saved to {output_path}")
    return 0

def run_validation_and_composition():
    """
    Validates assets and then composes preview if validation succeeds.
    """
    val_status = run_validation()
    if val_status != 0:
        return val_status
    return run_composition()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Viet Phuc Remix: Asset Validation & Composition CLI")
    parser.add_argument("--action", type=str, default="validate-and-compose", choices=["validate-and-compose", "validate", "compose", "process"])
    parser.add_argument("--input", type=str, default=None, help="Input file path for processing")
    parser.add_argument("--output", type=str, default=None, help="Output file path for processing")
    args = parser.parse_args()

    print("=== Viet Phuc Remix: Canonical Pipeline Runner ===")
    if args.action == "validate":
        sys.exit(run_validation())
    elif args.action == "compose":
        sys.exit(run_composition())
    elif args.action == "process":
        sys.exit(run_process_asset(args.input, args.output))
    else:
        sys.exit(run_validation_and_composition())
