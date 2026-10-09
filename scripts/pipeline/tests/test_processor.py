"""Unit tests for the image processor and metadata exporter module."""

import io
import json
import logging
import os
from pathlib import Path
import tempfile
from unittest.mock import MagicMock
from PIL import Image
import pytest

from pipeline.processor import export_metadata, extract_garment, remove_background


def test_export_metadata():
    """Verify exporting metadata dictionary to JSON as specified in task brief."""
    test_file = "test_meta.json"
    try:
        export_metadata({"renderOrder": 1}, test_file)
        with open(test_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert data["renderOrder"] == 1
    finally:
        if os.path.exists(test_file):
            os.remove(test_file)


def test_export_metadata_nested_dir():
    """Verify export_metadata creates parent directories if they do not exist."""
    with tempfile.TemporaryDirectory() as temp_dir:
        nested_path = Path(temp_dir) / "nested" / "sub" / "meta.json"
        metadata = {
            "characterId": "base_01",
            "name": "Base Female Anime Character",
            "canvas": {"width": 1024, "height": 1536},
        }
        export_metadata(metadata, nested_path)
        assert nested_path.exists()

        with open(nested_path, "r", encoding="utf-8") as f:
            loaded = json.load(f)
        assert loaded == metadata


def test_export_metadata_invalid_input():
    """Verify export_metadata raises appropriate errors on invalid data or paths."""
    with tempfile.TemporaryDirectory() as temp_dir:
        with pytest.raises((TypeError, ValueError)):
            export_metadata(None, Path(temp_dir) / "out.json")  # type: ignore

        with pytest.raises(ValueError):
            export_metadata({"valid": True}, "")


def test_remove_background_missing_input():
    """Verify remove_background returns False when input file does not exist."""
    with tempfile.TemporaryDirectory() as temp_dir:
        non_existent = Path(temp_dir) / "non_existent.png"
        out_file = Path(temp_dir) / "output.png"
        result = remove_background(non_existent, out_file)
        assert result is False
        assert not out_file.exists()


def test_remove_background_empty_paths():
    """Verify remove_background returns False on empty input or output paths."""
    assert remove_background("", "output.png") is False
    assert remove_background("input.png", "") is False


def test_remove_background_success():
    """Verify remove_background processes image and outputs PNG with RGBA alpha channel."""
    with tempfile.TemporaryDirectory() as temp_dir:
        input_path = Path(temp_dir) / "sample_input.png"
        output_path = Path(temp_dir) / "sample_output.png"

        # Create a simple test image (red box on white background)
        img = Image.new("RGB", (64, 64), color="white")
        for x in range(20, 44):
            for y in range(20, 44):
                img.putpixel((x, y), (255, 0, 0))
        img.save(input_path, format="PNG")

        success = remove_background(input_path, output_path)
        assert success is True
        assert output_path.exists()

        with Image.open(output_path) as out_img:
            assert out_img.format == "PNG"
            assert out_img.mode == "RGBA"
            # Check that alpha channel exists and contains transparent pixels
            alpha = out_img.split()[-1]
            extrema = alpha.getextrema()
            assert extrema[0] < 255


def test_remove_background_creates_parent_directories():
    """Verify remove_background automatically creates nested output directories."""
    with tempfile.TemporaryDirectory() as temp_dir:
        input_path = Path(temp_dir) / "sample.png"
        output_path = Path(temp_dir) / "deeply" / "nested" / "dir" / "sample_rgba.png"

        img = Image.new("RGB", (32, 32), color="blue")
        img.save(input_path, format="PNG")

        success = remove_background(input_path, output_path)
        assert success is True
        assert output_path.exists()


def test_remove_background_fallback_on_rembg_failure(monkeypatch, caplog):
    """Verify fallback when rembg fails: logs warning and still exports an RGBA image."""
    with tempfile.TemporaryDirectory() as temp_dir:
        input_path = Path(temp_dir) / "input_fallback.png"
        output_path = Path(temp_dir) / "output_fallback.png"

        img = Image.new("RGB", (32, 32), color="green")
        img.save(input_path, format="PNG")

        def mock_rembg_remove(*args, **kwargs):
            raise RuntimeError("Simulated rembg inference failure")

        monkeypatch.setattr("rembg.remove", mock_rembg_remove)

        with caplog.at_level(logging.WARNING):
            success = remove_background(input_path, output_path)

        assert success is True
        assert output_path.exists()
        with Image.open(output_path) as out_img:
            assert out_img.mode == "RGBA"
            assert out_img.format == "PNG"

        assert any(
            "rembg" in record.message.lower() or "fallback" in record.message.lower()
            for record in caplog.records
        )


def test_remove_background_opaque_warning(monkeypatch, caplog):
    """Verify that if alpha channel has no transparent pixels, warning is logged but export succeeds."""
    with tempfile.TemporaryDirectory() as temp_dir:
        input_path = Path(temp_dir) / "input_opaque.png"
        output_path = Path(temp_dir) / "output_opaque.png"

        img = Image.new("RGBA", (32, 32), color=(100, 100, 100, 255))
        img.save(input_path, format="PNG")

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        opaque_bytes = buf.getvalue()

        monkeypatch.setattr("rembg.remove", lambda *args, **kwargs: opaque_bytes)

        with caplog.at_level(logging.WARNING):
            success = remove_background(input_path, output_path)

        assert success is True
        assert output_path.exists()
        assert any(
            "opaque" in record.message.lower() or "transparent" in record.message.lower()
            for record in caplog.records
        )


def test_extract_garment_missing_inputs():
    """Verify extract_garment returns False when inputs are missing or non-existent."""
    with tempfile.TemporaryDirectory() as temp_dir:
        non_existent = Path(temp_dir) / "missing.png"
        existing = Path(temp_dir) / "existing.png"
        out_file = Path(temp_dir) / "out.png"

        img = Image.new("RGBA", (32, 32), (255, 0, 0, 255))
        img.save(existing, format="PNG")

        assert extract_garment(non_existent, existing, out_file) is False
        assert extract_garment(existing, non_existent, out_file) is False
        assert extract_garment("", existing, out_file) is False
        assert extract_garment(existing, "", out_file) is False
        assert extract_garment(existing, existing, "") is False
        assert not out_file.exists()


def test_extract_garment_creates_parent_dirs():
    """Verify extract_garment automatically creates nested destination directories."""
    with tempfile.TemporaryDirectory() as temp_dir:
        base_path = Path(temp_dir) / "base.png"
        dressed_path = Path(temp_dir) / "dressed.png"
        out_path = Path(temp_dir) / "nested" / "dir" / "garment.png"

        # Create transparent base and dressed
        base_img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
        base_img.save(base_path, format="PNG")

        dressed_img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
        # Draw small clothing patch
        for x in range(10, 20):
            for y in range(10, 20):
                dressed_img.putpixel((x, y), (200, 30, 40, 255))
        dressed_img.save(dressed_path, format="PNG")

        success = extract_garment(base_path, dressed_path, out_path)
        assert success is True
        assert out_path.exists()


def test_extract_garment_subtracts_matching_body():
    """Verify extract_garment masks matching body pixels as transparent and keeps clothing."""
    with tempfile.TemporaryDirectory() as temp_dir:
        base_path = Path(temp_dir) / "base.png"
        dressed_path = Path(temp_dir) / "dressed.png"
        out_path = Path(temp_dir) / "garment.png"

        # Base character: skin color (240, 200, 180) across y: 10..50, x: 20..40, rest transparent
        base_img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        skin_color = (240, 200, 180, 255)
        for y in range(10, 50):
            for x in range(20, 40):
                base_img.putpixel((x, y), skin_color)
        base_img.save(base_path, format="PNG")

        # Dressed character:
        # - Head/face y: 10..24, x: 20..40 is unchanged skin
        # - Body garment y: 25..50, x: 20..40 is red ao dai (220, 20, 30)
        # - Rest transparent
        dressed_img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        garment_color = (220, 20, 30, 255)
        for y in range(10, 25):
            for x in range(20, 40):
                dressed_img.putpixel((x, y), skin_color)
        for y in range(25, 50):
            for x in range(20, 40):
                dressed_img.putpixel((x, y), garment_color)
        dressed_img.save(dressed_path, format="PNG")

        success = extract_garment(base_path, dressed_path, out_path, tolerance=30.0)
        assert success is True
        assert out_path.exists()

        with Image.open(out_path) as out_img:
            assert out_img.mode == "RGBA"
            # Head region must be transparent (Alpha = 0)
            for y in range(10, 25):
                for x in range(20, 40):
                    px = out_img.getpixel((x, y))
                    assert px[3] == 0, f"Head pixel at ({x}, {y}) should be transparent but got {px}"

            # Garment region must be opaque red (Alpha = 255)
            for y in range(25, 50):
                for x in range(20, 40):
                    px = out_img.getpixel((x, y))
                    assert px[3] == 255, f"Garment pixel at ({x}, {y}) should be opaque but got {px}"
                    assert px[0] == 220 and px[1] == 20 and px[2] == 30

            # Background must be transparent
            assert out_img.getpixel((0, 0))[3] == 0


def test_extract_garment_garment_outside_base_silhouette():
    """Verify extract_garment preserves clothing that extends beyond the base character silhouette."""
    with tempfile.TemporaryDirectory() as temp_dir:
        base_path = Path(temp_dir) / "base.png"
        dressed_path = Path(temp_dir) / "dressed.png"
        out_path = Path(temp_dir) / "garment.png"

        # Narrow base torso x: 28..36, y: 20..40
        base_img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        for y in range(20, 40):
            for x in range(28, 36):
                base_img.putpixel((x, y), (240, 200, 180, 255))
        base_img.save(base_path, format="PNG")

        # Dressed with wide sleeves x: 10..54, y: 20..40 in blue (30, 80, 220)
        dressed_img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        blue_sleeve = (30, 80, 220, 255)
        for y in range(20, 40):
            for x in range(10, 54):
                dressed_img.putpixel((x, y), blue_sleeve)
        dressed_img.save(dressed_path, format="PNG")

        success = extract_garment(base_path, dressed_path, out_path, tolerance=30.0)
        assert success is True

        with Image.open(out_path) as out_img:
            # Pixels outside base silhouette (x=15, y=30) must be preserved
            sleeve_px = out_img.getpixel((15, 30))
            assert sleeve_px[3] == 255
            assert sleeve_px[:3] == (30, 80, 220)


def test_extract_garment_dimension_mismatch_resizes():
    """Verify extract_garment resizes dressed image to match base dimensions when mismatched."""
    with tempfile.TemporaryDirectory() as temp_dir:
        base_path = Path(temp_dir) / "base.png"
        dressed_path = Path(temp_dir) / "dressed.png"
        out_path = Path(temp_dir) / "garment.png"

        base_img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        for y in range(10, 30):
            for x in range(10, 30):
                base_img.putpixel((x, y), (240, 200, 180, 255))
        base_img.save(base_path, format="PNG")

        # Dressed image is 128x128
        dressed_img = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
        for y in range(60, 100):
            for x in range(40, 80):
                dressed_img.putpixel((x, y), (220, 30, 30, 255))
        dressed_img.save(dressed_path, format="PNG")

        success = extract_garment(base_path, dressed_path, out_path)
        assert success is True

        with Image.open(out_path) as out_img:
            # Output dimensions must match base image size (64, 64)
            assert out_img.size == (64, 64)
            assert out_img.mode == "RGBA"


def test_extract_garment_with_opaque_background_and_fallback(monkeypatch):
    """Verify extract_garment handles opaque RGB images using background removal fallback."""
    with tempfile.TemporaryDirectory() as temp_dir:
        base_path = Path(temp_dir) / "base.jpg"
        dressed_path = Path(temp_dir) / "dressed.jpg"
        out_path = Path(temp_dir) / "garment.png"

        # Base: white background (255, 255, 255), skin circle in center
        base_img = Image.new("RGB", (64, 64), color="white")
        for y in range(20, 44):
            for x in range(20, 44):
                base_img.putpixel((x, y), (240, 200, 180))
        base_img.save(base_path, format="JPEG")

        # Dressed: white background, same skin face at 20..30, green dress at 31..44
        dressed_img = Image.new("RGB", (64, 64), color="white")
        for y in range(20, 31):
            for x in range(20, 44):
                dressed_img.putpixel((x, y), (240, 200, 180))
        for y in range(31, 44):
            for x in range(20, 44):
                dressed_img.putpixel((x, y), (20, 180, 40))
        dressed_img.save(dressed_path, format="JPEG")

        def mock_rembg_fail(*args, **kwargs):
            raise RuntimeError("rembg disabled in test")

        monkeypatch.setattr("rembg.remove", mock_rembg_fail)

        success = extract_garment(base_path, dressed_path, out_path, threshold=240)
        assert success is True

        with Image.open(out_path) as out_img:
            assert out_img.mode == "RGBA"
            # Background should be transparent
            assert out_img.getpixel((5, 5))[3] == 0
            # Face should be transparent
            assert out_img.getpixel((25, 25))[3] == 0
            # Green dress should be visible
            green_px = out_img.getpixel((25, 36))
            assert green_px[3] > 0
            assert green_px[1] > 100


def test_extract_garment_noise_cleanup():
    """Verify cleanup_noise removes tiny stray pixel specks."""
    with tempfile.TemporaryDirectory() as temp_dir:
        base_path = Path(temp_dir) / "base.png"
        dressed_path = Path(temp_dir) / "dressed.png"
        out_path = Path(temp_dir) / "garment.png"

        # Base: skin
        base_img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        for y in range(10, 50):
            for x in range(20, 40):
                base_img.putpixel((x, y), (240, 200, 180, 255))
        base_img.save(base_path, format="PNG")

        # Dressed: large garment (25..50, 20..40) + single stray noise pixel on face at (22, 12)
        dressed_img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        for y in range(10, 25):
            for x in range(20, 40):
                dressed_img.putpixel((x, y), (240, 200, 180, 255))
        dressed_img.putpixel((22, 12), (0, 0, 255, 255))  # single pixel noise

        for y in range(25, 50):
            for x in range(20, 40):
                dressed_img.putpixel((x, y), (220, 20, 30, 255))
        dressed_img.save(dressed_path, format="PNG")

        success = extract_garment(
            base_path, dressed_path, out_path, cleanup_noise=True, min_island_size=10
        )
        assert success is True

        with Image.open(out_path) as out_img:
            # The single noise speck should be cleaned up
            assert out_img.getpixel((22, 12))[3] == 0
            # The large garment should be preserved
            assert out_img.getpixel((30, 35))[3] == 255

