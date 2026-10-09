import os
from pipeline.config import OUTPUT_DIR, load_config


def test_load_config_requires_api_key():
    if "GEMINI_API_KEY" in os.environ:
        del os.environ["GEMINI_API_KEY"]
    config = load_config()
    assert config["API_KEY"] is None


def test_load_config_with_api_key(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test_gemini_key_123")
    config = load_config()
    assert config["API_KEY"] == "test_gemini_key_123"


def test_output_dir_constant():
    assert OUTPUT_DIR == "../../public/assets"


def test_load_config_output_dir_default(monkeypatch):
    monkeypatch.delenv("PIPELINE_OUTPUT_DIR", raising=False)
    config = load_config()
    assert config["OUTPUT_DIR"] == "../../public/assets"


def test_load_config_output_dir_custom(monkeypatch):
    monkeypatch.setenv("PIPELINE_OUTPUT_DIR", "custom/path/assets")
    config = load_config()
    assert config["OUTPUT_DIR"] == "custom/path/assets"
