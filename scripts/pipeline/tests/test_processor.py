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

from pipeline.processor import export_metadata, remove_background


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
