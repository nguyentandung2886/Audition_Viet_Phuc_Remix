import os
from pathlib import Path
from PIL import Image
from typing import List, Union, Dict, Any
from schema import GarmentComponent

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

def resolve_asset_path(image_path: str) -> str:
    if not image_path or not str(image_path).strip():
        return image_path
    image_str = str(image_path).strip()
    if os.path.isfile(image_str):
        return image_str
    clean = image_str.lstrip("/\\")
    if not clean:
        return image_path
    public_candidate = PROJECT_ROOT / "public" / clean
    if public_candidate.is_file():
        return str(public_candidate)
    return image_path

def compose_outfit(base_character_path: str, components: List[GarmentComponent], output_path: str, base_render_order: int = 30) -> bool:
    """
    Composes a complete outfit preview by layering components based on explicit renderOrder.
    Uses canonical 1024x1536 canvas coordinate system.
    """
    try:
        # Canonical canvas size
        canvas_width, canvas_height = 1024, 1536

        # Assemble all layers including base character
        layers: List[Dict[str, Any]] = []

        resolved_base = resolve_asset_path(base_character_path)
        if os.path.isfile(resolved_base):
            layers.append({
                "path": resolved_base,
                "renderOrder": base_render_order,
                "assetId": "canonical_base"
            })
        else:
            print(f"Warning: Base character not found: {base_character_path}")

        for comp in components:
            if comp.filePath:
                resolved_comp = resolve_asset_path(comp.filePath)
                if os.path.isfile(resolved_comp):
                    layers.append({
                        "path": resolved_comp,
                        "renderOrder": comp.renderOrder,
                        "assetId": comp.assetId
                    })
                else:
                    print(f"Warning: Component {comp.assetId} file not found: {comp.filePath}")
            else:
                print(f"Warning: Component {comp.assetId} has no filePath defined")

        # Sort layers strictly by renderOrder ascending
        sorted_layers = sorted(layers, key=lambda l: l["renderOrder"])

        if not sorted_layers:
            print("[Composer] Error: No valid layers found to composite.")
            return False

        # Start with a transparent 1024x1536 RGBA canvas
        canvas = Image.new("RGBA", (canvas_width, canvas_height), (0, 0, 0, 0))

        for layer in sorted_layers:
            with Image.open(layer["path"]) as img:
                layer_img = img.convert("RGBA")
                if layer_img.size != (canvas_width, canvas_height):
                    # Resize or pad if size doesn't match
                    layer_img = layer_img.resize((canvas_width, canvas_height), Image.Resampling.LANCZOS)
                canvas = Image.alpha_composite(canvas, layer_img)

        out_dir = os.path.dirname(output_path)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)
        canvas.save(output_path, "PNG")
        print(f"[Composer] Successfully composited {len(sorted_layers)} layers to {output_path}")
        return True
    except Exception as e:
        print(f"[Composer] Failed to compose outfit: {e}")
        return False
