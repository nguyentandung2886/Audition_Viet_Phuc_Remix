import os
import tempfile
from pathlib import Path
import pytest
from pipeline.config import OUTPUT_DIR, load_config, validate_output_directory


def test_load_config_requires_api_key(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    config = load_config()
    assert config["API_KEY"] is None


def test_load_config_with_api_key(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test_gemini_key_123")
    config = load_config()
    assert config["API_KEY"] == "test_gemini_key_123"


def test_output_dir_constant():
    assert OUTPUT_DIR == "../../public/assets"


def test_load_config_resolves_and_validates_default_output_dir(monkeypatch):
    monkeypatch.delenv("PIPELINE_OUTPUT_DIR", raising=False)
    config = load_config()
    output_path = Path(config["OUTPUT_DIR"])
    assert output_path.is_absolute()
    assert output_path.exists()
    assert output_path.is_dir()
    assert output_path.name == "assets"


def test_load_config_custom_output_dir_creation(monkeypatch):
    with tempfile.TemporaryDirectory() as temp_dir:
        custom_dir = Path(temp_dir) / "custom_output" / "sub_assets"
        assert not custom_dir.exists()
        monkeypatch.setenv("PIPELINE_OUTPUT_DIR", str(custom_dir))

        config = load_config()
        assert config["OUTPUT_DIR"] == str(custom_dir.resolve())
        assert custom_dir.exists()
        assert custom_dir.is_dir()


def test_validate_output_directory_not_a_directory():
    with tempfile.TemporaryDirectory() as temp_dir:
        dummy_file = Path(temp_dir) / "not_a_dir.txt"
        dummy_file.write_text("dummy")

        with pytest.raises(NotADirectoryError):
            validate_output_directory(dummy_file)


def test_validate_output_directory_missing_without_creation():
    with tempfile.TemporaryDirectory() as temp_dir:
        missing_dir = Path(temp_dir) / "non_existent_dir"

        with pytest.raises(FileNotFoundError):
            validate_output_directory(missing_dir, create_if_missing=False)
