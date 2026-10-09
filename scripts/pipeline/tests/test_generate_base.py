"""Unit tests for the base character generation script."""

from unittest.mock import MagicMock, patch
import pytest

from pipeline.generate_base import (
    DEFAULT_OUTPUT_PATH,
    DEFAULT_PROMPT,
    generate_base_character,
    main,
)


def test_generate_base_character_defaults(monkeypatch):
    """Verify generate_base_character calls generate_image with default settings."""
    mock_gen = MagicMock(return_value=True)
    monkeypatch.setattr("pipeline.generate_base.generate_image", mock_gen)

    success = generate_base_character()

    assert success is True
    mock_gen.assert_called_once_with(
        prompt=DEFAULT_PROMPT,
        output_path=DEFAULT_OUTPUT_PATH,
        model=None,
        client=None,
        aspect_ratio="2:3",
    )


def test_generate_base_character_custom_args(monkeypatch):
    """Verify generate_base_character passes custom parameters correctly."""
    mock_gen = MagicMock(return_value=True)
    monkeypatch.setattr("pipeline.generate_base.generate_image", mock_gen)

    custom_path = "custom/base.png"
    custom_prompt = "custom prompt"
    custom_model = "imagen-3.0-custom"
    fake_client = MagicMock()

    success = generate_base_character(
        output_path=custom_path,
        prompt=custom_prompt,
        model=custom_model,
        client=fake_client,
    )

    assert success is True
    mock_gen.assert_called_once_with(
        prompt=custom_prompt,
        output_path=custom_path,
        model=custom_model,
        client=fake_client,
        aspect_ratio="2:3",
    )


def test_generate_base_character_failure(monkeypatch):
    """Verify generate_base_character returns False when generate_image fails."""
    mock_gen = MagicMock(return_value=False)
    monkeypatch.setattr("pipeline.generate_base.generate_image", mock_gen)

    success = generate_base_character()

    assert success is False


def test_main_cli_success(monkeypatch):
    """Verify main() returns 0 when generation succeeds."""
    mock_gen = MagicMock(return_value=True)
    monkeypatch.setattr("pipeline.generate_base.generate_base_character", mock_gen)

    with patch("sys.argv", ["generate_base.py", "--output", "test.png"]):
        exit_code = main()

    assert exit_code == 0
    mock_gen.assert_called_once()
    assert mock_gen.call_args.kwargs["output_path"] == "test.png"


def test_main_cli_failure(monkeypatch):
    """Verify main() returns 1 when generation fails."""
    mock_gen = MagicMock(return_value=False)
    monkeypatch.setattr("pipeline.generate_base.generate_base_character", mock_gen)

    with patch("sys.argv", ["generate_base.py"]):
        exit_code = main()

    assert exit_code == 1
