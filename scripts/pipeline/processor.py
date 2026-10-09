import os
from pathlib import Path
from PIL import Image
from validator import resolve_asset_path

def remove_background(input_path: str, output_path: str, threshold: int = 240) -> bool:
    """
    Ensures background is transparent RGBA.
    Attempts rembg if available; otherwise uses color-keying for white/near-white backgrounds.
    """
    resolved_in = resolve_asset_path(input_path)
    if not os.path.isfile(resolved_in):
        print(f"Error: {input_path} does not exist.")
        return False

    out_dir = os.path.dirname(output_path)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
        
    try:
        # Try rembg if installed
        try:
            import rembg
            with open(resolved_in, 'rb') as i:
                input_bytes = i.read()
            output_bytes = rembg.remove(input_bytes)
            with open(output_path, 'wb') as o:
                o.write(output_bytes)
            return True
        except (ImportError, Exception):
            pass

        # Fallback PIL-based alpha conversion / white background removal
        with Image.open(resolved_in) as img:
            rgba = img.convert("RGBA")
            data = rgba.get_flattened_data() if hasattr(rgba, 'get_flattened_data') else rgba.getdata()
            
            new_data = []
            for item in data:
                # If near white, make transparent
                if item[0] >= threshold and item[1] >= threshold and item[2] >= threshold:
                    new_data.append((item[0], item[1], item[2], 0))
                else:
                    new_data.append(item)
                    
            rgba.putdata(new_data)
            rgba.save(output_path, "PNG")
            return True
    except Exception as e:
        print(f"Failed to process background: {e}")
        return False

def crop_and_align_to_canvas(img_path: str, output_path: str = None, target_width: int = 1024, target_height: int = 1536) -> str:
    """
    Ensures the image matches the target canvas size (1024x1536 RGBA).
    If it doesn't match, it centers and fits it into the canvas without distortion.
    """
    resolved = resolve_asset_path(img_path)
    if not os.path.isfile(resolved):
        raise FileNotFoundError(f"Image not found at {img_path}")

    save_path = output_path if output_path else resolved
    out_dir = os.path.dirname(save_path)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    with Image.open(resolved) as img:
        if img.size == (target_width, target_height) and img.mode == "RGBA":
            if save_path != resolved:
                img.save(save_path, "PNG")
            return save_path
            
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
        return save_path
