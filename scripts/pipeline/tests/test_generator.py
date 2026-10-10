"""Unit tests for the AI image generation module."""

import os
import tempfile
from pathlib import Path
from unittest.mock import MagicMock
import pytest
from google.genai import types

import pipeline.generator


def generate_image(*args, **kwargs):
    """Delegate to pipeline.generator.generate_image to support monkeypatching."""
    return pipeline.generator.generate_image(*args, **kwargs)


def test_generate_image_mock(monkeypatch):
    """Test monkeypatching generate_image as specified in task brief."""
    def mock_generate(*args, **kwargs):
        with open("test_out.png", "w") as f:
            f.write("mock")
        return True

    monkeypatch.setattr("pipeline.generator.generate_image", mock_generate)
    assert generate_image("test prompt", "test_out.png") is True
    assert os.path.exists("test_out.png")
    os.remove("test_out.png")


def test_generate_image_empty_prompt():
    """Verify that an empty prompt immediately returns False."""
    assert generate_image("", "out.png") is False
    assert generate_image("   ", "out.png") is False


def test_generate_image_empty_output_path():
    """Verify that an empty output path immediately returns False."""
    assert generate_image("test prompt", "") is False


def test_generate_image_outside_output_dir(monkeypatch):
    """Verify that paths outside OUTPUT_DIR are rejected for security and path containment."""
    with tempfile.TemporaryDirectory() as temp_dir:
        monkeypatch.setattr(
            "pipeline.generator.load_config",
            lambda: {"API_KEY": "fake_key", "OUTPUT_DIR": temp_dir},
        )

        # Attempt relative traversal out of OUTPUT_DIR
        assert generate_image("test prompt", "../outside.png") is False

        # Attempt absolute path outside OUTPUT_DIR
        outside_path = Path(temp_dir).parent / "outside_dir" / "character.png"
        assert generate_image("test prompt", str(outside_path)) is False
        assert not outside_path.exists()

        # Attempt to target OUTPUT_DIR root itself
        assert generate_image("test prompt", str(temp_dir)) is False


def test_generate_image_missing_api_key(monkeypatch):
    """Verify that generate_image returns False when GEMINI_API_KEY is not configured."""
    with tempfile.TemporaryDirectory() as temp_dir:
        monkeypatch.delenv("GEMINI_API_KEY", raising=False)
        monkeypatch.setattr(
            "pipeline.generator.load_config",
            lambda: {"API_KEY": None, "OUTPUT_DIR": temp_dir},
        )
        assert generate_image("a beautiful ao dai", "out.png") is False


def test_generate_image_success_imagen(monkeypatch):
    """Verify successful image generation using imagen model and mock client."""
    with tempfile.TemporaryDirectory() as temp_dir:
        out_file = Path(temp_dir) / "subdir" / "character.png"
        fake_bytes = b"\x89PNG\r\n\x1a\nfakeimagedata"

        mock_image = MagicMock()
        mock_image.image_bytes = fake_bytes

        mock_generated_image = MagicMock()
        mock_generated_image.image = mock_image

        mock_response = MagicMock()
        mock_response.generated_images = [mock_generated_image]

        mock_client = MagicMock()
        mock_client.models.generate_images.return_value = mock_response

        monkeypatch.setattr("pipeline.generator.load_config", lambda: {"API_KEY": "fake_key", "OUTPUT_DIR": temp_dir})
        monkeypatch.setattr("pipeline.generator.genai.Client", lambda api_key: mock_client)

        result = generate_image("ao dai prompt", str(out_file), model="imagen-3.0-generate-002")

        assert result is True
        assert out_file.exists()
        assert out_file.read_bytes() == fake_bytes
        mock_client.models.generate_images.assert_called_once_with(
            model="imagen-3.0-generate-002",
            prompt="ao dai prompt",
            config=types.GenerateImagesConfig(aspect_ratio="2:3"),
        )


def test_generate_image_success_relative_path(monkeypatch):
    """Verify that a relative output path is correctly resolved inside OUTPUT_DIR."""
    with tempfile.TemporaryDirectory() as temp_dir:
        fake_bytes = b"sample_png_bytes"

        mock_image = MagicMock()
        mock_image.image_bytes = fake_bytes

        mock_generated_image = MagicMock()
        mock_generated_image.image = mock_image

        mock_response = MagicMock()
        mock_response.generated_images = [mock_generated_image]

        mock_client = MagicMock()
        mock_client.models.generate_images.return_value = mock_response

        monkeypatch.setattr("pipeline.generator.load_config", lambda: {"API_KEY": "fake_key", "OUTPUT_DIR": temp_dir})
        monkeypatch.setattr("pipeline.generator.genai.Client", lambda api_key: mock_client)

        result = generate_image("test prompt", "canonical/character.png")

        assert result is True
        expected_file = Path(temp_dir) / "canonical" / "character.png"
        assert expected_file.exists()
        assert expected_file.read_bytes() == fake_bytes


def test_generate_image_api_exception(monkeypatch):
    """Verify that any API exception or network error is handled gracefully, returning False."""
    with tempfile.TemporaryDirectory() as temp_dir:
        out_file = Path(temp_dir) / "character.png"

        mock_client = MagicMock()
        mock_client.models.generate_images.side_effect = RuntimeError("API quota exceeded")

        monkeypatch.setattr("pipeline.generator.load_config", lambda: {"API_KEY": "fake_key", "OUTPUT_DIR": temp_dir})
        monkeypatch.setattr("pipeline.generator.genai.Client", lambda api_key: mock_client)

        result = generate_image("ao dai prompt", str(out_file))

        assert result is False
        assert not out_file.exists()


def test_generate_image_empty_response(monkeypatch):
    """Verify that an empty response with no images logs and returns False."""
    with tempfile.TemporaryDirectory() as temp_dir:
        out_file = Path(temp_dir) / "character.png"

        mock_response = MagicMock()
        mock_response.generated_images = []

        mock_client = MagicMock()
        mock_client.models.generate_images.return_value = mock_response

        monkeypatch.setattr("pipeline.generator.load_config", lambda: {"API_KEY": "fake_key", "OUTPUT_DIR": temp_dir})
        monkeypatch.setattr("pipeline.generator.genai.Client", lambda api_key: mock_client)

        result = generate_image("ao dai prompt", str(out_file))

        assert result is False
        assert not out_file.exists()


def test_generate_image_missing_image_bytes(monkeypatch):
    """Verify that a response with an image object lacking image_bytes returns False."""
    with tempfile.TemporaryDirectory() as temp_dir:
        out_file = Path(temp_dir) / "character.png"

        mock_image = MagicMock()
        mock_image.image_bytes = None

        mock_generated_image = MagicMock()
        mock_generated_image.image = mock_image

        mock_response = MagicMock()
        mock_response.generated_images = [mock_generated_image]

        mock_client = MagicMock()
        mock_client.models.generate_images.return_value = mock_response

        monkeypatch.setattr("pipeline.generator.load_config", lambda: {"API_KEY": "fake_key", "OUTPUT_DIR": temp_dir})
        monkeypatch.setattr("pipeline.generator.genai.Client", lambda api_key: mock_client)

        result = generate_image("ao dai prompt", str(out_file))

        assert result is False
        assert not out_file.exists()


def test_generate_image_custom_aspect_ratio(monkeypatch):
    """Verify that custom aspect_ratio is correctly forwarded to the model call."""
    with tempfile.TemporaryDirectory() as temp_dir:
        out_file = Path(temp_dir) / "character.png"
        fake_bytes = b"sample_bytes"

        mock_image = MagicMock()
        mock_image.image_bytes = fake_bytes
        mock_generated_image = MagicMock()
        mock_generated_image.image = mock_image
        mock_response = MagicMock()
        mock_response.generated_images = [mock_generated_image]

        mock_client = MagicMock()
        mock_client.models.generate_images.return_value = mock_response

        monkeypatch.setattr("pipeline.generator.load_config", lambda: {"API_KEY": "fake_key", "OUTPUT_DIR": temp_dir})
        monkeypatch.setattr("pipeline.generator.genai.Client", lambda api_key: mock_client)

        result = generate_image("ao dai prompt", str(out_file), aspect_ratio="1:1")

        assert result is True
        mock_client.models.generate_images.assert_called_once_with(
            model="imagen-3.0-generate-002",
            prompt="ao dai prompt",
            config=types.GenerateImagesConfig(aspect_ratio="1:1"),
        )


def test_generate_image_aspect_ratio_none(monkeypatch):
    """Verify that aspect_ratio=None does not include config in the model call."""
    with tempfile.TemporaryDirectory() as temp_dir:
        out_file = Path(temp_dir) / "character.png"
        fake_bytes = b"sample_bytes"

        mock_image = MagicMock()
        mock_image.image_bytes = fake_bytes
        mock_generated_image = MagicMock()
        mock_generated_image.image = mock_image
        mock_response = MagicMock()
        mock_response.generated_images = [mock_generated_image]

        mock_client = MagicMock()
        mock_client.models.generate_images.return_value = mock_response

        monkeypatch.setattr("pipeline.generator.load_config", lambda: {"API_KEY": "fake_key", "OUTPUT_DIR": temp_dir})
        monkeypatch.setattr("pipeline.generator.genai.Client", lambda api_key: mock_client)

        result = generate_image("ao dai prompt", str(out_file), aspect_ratio=None)

        assert result is True
        mock_client.models.generate_images.assert_called_once_with(
            model="imagen-3.0-generate-002",
            prompt="ao dai prompt",
        )


def test_generate_image_with_reference_image(monkeypatch):
    """Verify that providing reference_image_path calls client.models.edit_image."""
    with tempfile.TemporaryDirectory() as temp_dir:
        out_file = Path(temp_dir) / "dressed.png"
        ref_file = Path(temp_dir) / "base_ref.png"
        ref_file.write_bytes(b"\x89PNG\r\n\x1a\nbasechar")

        fake_bytes = b"\x89PNG\r\n\x1a\nnewimage"
        mock_image = MagicMock()
        mock_image.image_bytes = fake_bytes
        mock_generated_image = MagicMock()
        mock_generated_image.image = mock_image
        mock_response = MagicMock()
        mock_response.generated_images = [mock_generated_image]

        mock_client = MagicMock()
        mock_client.models.edit_image.return_value = mock_response

        monkeypatch.setattr("pipeline.generator.load_config", lambda: {"API_KEY": "fake_key", "OUTPUT_DIR": temp_dir})
        monkeypatch.setattr("pipeline.generator.genai.Client", lambda api_key: mock_client)

        result = generate_image(
            prompt="add red ao dai",
            output_path=str(out_file),
            reference_image_path=str(ref_file),
        )

        assert result is True
        assert out_file.exists()
        assert out_file.read_bytes() == fake_bytes

        # Verify edit_image was called, NOT generate_images
        mock_client.models.edit_image.assert_called_once()
        mock_client.models.generate_images.assert_not_called()

        call_kwargs = mock_client.models.edit_image.call_args.kwargs
        assert call_kwargs["model"] == "imagen-3.0-generate-002"
        assert call_kwargs["prompt"] == "add red ao dai"
        assert len(call_kwargs["reference_images"]) == 1
        ref_img_arg = call_kwargs["reference_images"][0]
        assert isinstance(ref_img_arg, types.RawReferenceImage)
        assert ref_img_arg.reference_id == 1
        assert ref_img_arg.reference_image.image_bytes == b"\x89PNG\r\n\x1a\nbasechar"
        assert call_kwargs["config"].edit_mode == "EDIT_MODE_DEFAULT"
        assert call_kwargs["config"].aspect_ratio == "2:3"


def test_generate_image_with_missing_reference_image(monkeypatch):
    """Verify that a non-existent reference_image_path returns False immediately."""
    with tempfile.TemporaryDirectory() as temp_dir:
        out_file = Path(temp_dir) / "dressed.png"
        non_existent_ref = Path(temp_dir) / "does_not_exist.png"

        mock_client = MagicMock()

        monkeypatch.setattr("pipeline.generator.load_config", lambda: {"API_KEY": "fake_key", "OUTPUT_DIR": temp_dir})
        monkeypatch.setattr("pipeline.generator.genai.Client", lambda api_key: mock_client)

        result = generate_image(
            prompt="add red ao dai",
            output_path=str(out_file),
            reference_image_path=str(non_existent_ref),
        )

        assert result is False
        assert not out_file.exists()
        mock_client.models.edit_image.assert_not_called()
        mock_client.models.generate_images.assert_not_called()


def test_generate_image_fallback_without_reference_image(monkeypatch):
    """Verify that omitting reference_image_path uses generate_images, not edit_image."""
    with tempfile.TemporaryDirectory() as temp_dir:
        out_file = Path(temp_dir) / "base.png"
        fake_bytes = b"\x89PNG\r\n\x1a\nbaseresult"

        mock_image = MagicMock()
        mock_image.image_bytes = fake_bytes
        mock_generated_image = MagicMock()
        mock_generated_image.image = mock_image
        mock_response = MagicMock()
        mock_response.generated_images = [mock_generated_image]

        mock_client = MagicMock()
        mock_client.models.generate_images.return_value = mock_response

        monkeypatch.setattr("pipeline.generator.load_config", lambda: {"API_KEY": "fake_key", "OUTPUT_DIR": temp_dir})
        monkeypatch.setattr("pipeline.generator.genai.Client", lambda api_key: mock_client)

        result = generate_image(
            prompt="base anime character",
            output_path=str(out_file),
            reference_image_path=None,
        )

        assert result is True
        mock_client.models.generate_images.assert_called_once()
        mock_client.models.edit_image.assert_not_called()


def test_generate_image_edit_api_exception(monkeypatch):
    """Verify that an exception in edit_image is gracefully caught and returns False."""
    with tempfile.TemporaryDirectory() as temp_dir:
        out_file = Path(temp_dir) / "dressed.png"
        ref_file = Path(temp_dir) / "base.png"
        ref_file.write_bytes(b"\x89PNG\r\n\x1a\nbasechar")

        mock_client = MagicMock()
        mock_client.models.edit_image.side_effect = RuntimeError("Edit quota exceeded")

        monkeypatch.setattr("pipeline.generator.load_config", lambda: {"API_KEY": "fake_key", "OUTPUT_DIR": temp_dir})
        monkeypatch.setattr("pipeline.generator.genai.Client", lambda api_key: mock_client)

        result = generate_image(
            prompt="add red ao dai",
            output_path=str(out_file),
            reference_image_path=str(ref_file),
        )

        assert result is False
        assert not out_file.exists()


def test_build_garment_isolation_prompt():
    """Verify isolation prompts enforce anime style, hollow openings, and body removal."""
    from pipeline.generator import build_garment_isolation_prompt

    # Test torso
    torso_prompt = build_garment_isolation_prompt("torso", "Áo Nhật Bình")
    assert "isolate ONLY the Áo Nhật Bình torso" in torso_prompt
    assert "HOLLOW INTERIOR OPENINGS" in torso_prompt
    assert "Do NOT draw the inside back lining" in torso_prompt
    assert "ERASE AND REMOVE EVERYTHING ELSE" in torso_prompt

    # Test pants
    pants_prompt = build_garment_isolation_prompt("pants", "Áo Nhật Bình", custom_details="White silk")
    assert "pants / lower garment" in pants_prompt
    assert "White silk" in pants_prompt
    assert "waistband opening" in pants_prompt

    # Test headpiece
    head_prompt = build_garment_isolation_prompt("headpiece", "Khăn Vành")
    assert "headpiece / mấn" in head_prompt
    assert "inner head opening where the head sits must be empty" in head_prompt

    # Test necklace
    neck_prompt = build_garment_isolation_prompt("necklace", "Ngọc Bội")
    assert "accessory" in neck_prompt


def test_isolate_garment_ai_calls_generate_image(monkeypatch):
    """Verify isolate_garment_ai delegates to generate_image with isolation prompt."""
    from pipeline.generator import isolate_garment_ai

    mock_generate = MagicMock(return_value=True)
    monkeypatch.setattr("pipeline.generator.generate_image", mock_generate)

    result = isolate_garment_ai(
        dressed_image_path="ref_dressed.png",
        output_path="out_isolated.png",
        component_type="torso",
        garment_name="Áo Nhật Bình",
    )

    assert result is True
    mock_generate.assert_called_once()
    kwargs = mock_generate.call_args.kwargs
    assert "Áo Nhật Bình" in kwargs["prompt"]
    assert kwargs["output_path"] == "out_isolated.png"
    assert kwargs["reference_image_path"] == "ref_dressed.png"



