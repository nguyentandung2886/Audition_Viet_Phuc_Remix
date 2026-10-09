"""Unit tests for the AI image generation module."""

import os
import tempfile
from pathlib import Path
from unittest.mock import MagicMock
import pytest

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
