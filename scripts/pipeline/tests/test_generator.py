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


def test_generate_image_missing_api_key(monkeypatch):
    """Verify that generate_image returns False when GEMINI_API_KEY is not configured."""
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.setattr("pipeline.generator.load_config", lambda: {"API_KEY": None, "OUTPUT_DIR": "/tmp"})
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


def test_generate_image_multimodal_gemini_fallback(monkeypatch):
    """Verify successful generation when model is gemini and returns inline_data parts."""
    with tempfile.TemporaryDirectory() as temp_dir:
        out_file = Path(temp_dir) / "gemini_out.png"
        fake_bytes = b"gemini_image_bytes"

        mock_part = MagicMock()
        mock_part.inline_data.data = fake_bytes

        mock_candidate = MagicMock()
        mock_candidate.content.parts = [mock_part]

        mock_response = MagicMock()
        mock_response.candidates = [mock_candidate]

        mock_client = MagicMock()
        mock_client.models.generate_images.side_effect = Exception("Model not supported for generate_images")
        mock_client.models.generate_content.return_value = mock_response

        monkeypatch.setattr("pipeline.generator.load_config", lambda: {"API_KEY": "fake_key", "OUTPUT_DIR": temp_dir})
        monkeypatch.setattr("pipeline.generator.genai.Client", lambda api_key: mock_client)

        result = generate_image("test gemini prompt", str(out_file), model="gemini-3.1-pro")

        assert result is True
        assert out_file.exists()
        assert out_file.read_bytes() == fake_bytes
