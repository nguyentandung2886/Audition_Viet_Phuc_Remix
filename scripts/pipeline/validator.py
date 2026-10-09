import os
from pathlib import Path
from PIL import Image
from schema import ValidationReport

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

def validate_asset(image_path: str, expected_width: int = 1024, expected_height: int = 1536, asset_id: str = "unknown") -> ValidationReport:
    diagnostics = []
    resolved = resolve_asset_path(image_path)
    
    if not os.path.isfile(resolved):
        return ValidationReport(
            assetId=asset_id,
            isValid=False,
            status="retry",
            dimensionsMatch=False,
            hasAlpha=False,
            emptyImage=True,
            diagnostics=[f"File not found: {image_path}"]
        )

    try:
        with Image.open(resolved) as img:
            width, height = img.size
            mode = img.mode

            dimensionsMatch = (width == expected_width and height == expected_height)
            if not dimensionsMatch:
                diagnostics.append(f"Dimensions mismatch: got {width}x{height}, expected {expected_width}x{expected_height}")

            hasAlpha = (mode == "RGBA")
            if not hasAlpha:
                diagnostics.append("Image does not have an alpha channel (must be RGBA transparent)")

            emptyImage = False
            boundingBox = None
            nonEmptyPixelCount = 0

            if hasAlpha:
                alpha = img.split()[-1]
                bbox = alpha.getbbox()
                if bbox is None:
                    emptyImage = True
                    diagnostics.append("Image is completely transparent (empty bounding box)")
                else:
                    boundingBox = [bbox[0], bbox[1], bbox[2], bbox[3]]
                    # Count non-empty pixels
                    extrema = alpha.getextrema()
                    if extrema == (0, 0):
                        emptyImage = True
                        diagnostics.append("Image is completely transparent (all alpha values are 0)")
                    else:
                        # Quick estimate or accurate count of alpha > 5
                        hist = alpha.histogram()
                        nonEmptyPixelCount = sum(hist[6:])
                        if nonEmptyPixelCount == 0:
                            emptyImage = True
                            diagnostics.append("Image has zero visible pixels above threshold")
            else:
                emptyImage = False
                boundingBox = [0, 0, width, height]
                nonEmptyPixelCount = width * height

            isValid = dimensionsMatch and hasAlpha and not emptyImage
            if emptyImage:
                status = "retry"
            elif not isValid:
                status = "review_required"
            else:
                status = "approved"

            return ValidationReport(
                assetId=asset_id,
                isValid=isValid,
                status=status,
                dimensionsMatch=dimensionsMatch,
                hasAlpha=hasAlpha,
                emptyImage=emptyImage,
                diagnostics=diagnostics,
                boundingBox=boundingBox,
                nonEmptyPixelCount=nonEmptyPixelCount
            )
    except Exception as e:
        return ValidationReport(
            assetId=asset_id,
            isValid=False,
            status="retry",
            dimensionsMatch=False,
            hasAlpha=False,
            emptyImage=True,
            diagnostics=[f"Failed to open or process image: {str(e)}"]
        )
