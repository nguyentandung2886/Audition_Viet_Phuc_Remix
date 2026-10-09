"""Unit and integration tests for Pipeline V2 test run script (test_v2.py)."""

from pathlib import Path
import tempfile
from unittest.mock import MagicMock, patch
import pytest
from PIL import Image
import numpy as np

from pipeline.test_v2 import (
    DEFAULT_PROMPT,
    DEFAULT_BASE_FILENAME,
    DEFAULT_DRESSED_FILENAME,
    DEFAULT_GARMENT_FILENAME,
    resolve_pipeline_path,
    run_pipeline_v2,
    main,
)


@pytest.fixture
def temp_output_dir(monkeypatch):
    """Fixture providing a temporary output directory configured via environment."""
    with tempfile.TemporaryDirectory() as td:
        out_dir = Path(td) / "assets"
        out_dir.mkdir(parents=True, exist_ok=True)
        monkeypatch.setenv("PIPELINE_OUTPUT_DIR", str(out_dir))
        yield out_dir


def test_resolve_pipeline_path_absolute(temp_output_dir):
    """Absolute paths should be resolved and returned as-is."""
    abs_path = (temp_output_dir / "custom.png").resolve()
    resolved = resolve_pipeline_path(abs_path, temp_output_dir)
    assert resolved == abs_path


def test_resolve_pipeline_path_relative_no_prefix(temp_output_dir):
    """Relative filename should resolve inside output_dir."""
    resolved = resolve_pipeline_path("test_asset.png", temp_output_dir)
    assert resolved == (temp_output_dir / "test_asset.png").resolve()


def test_resolve_pipeline_path_with_public_assets_prefix(temp_output_dir):
    """Paths starting with public/assets should have prefix stripped to avoid duplication."""
    resolved = resolve_pipeline_path("public/assets/garment.png", temp_output_dir)
    assert resolved == (temp_output_dir / "garment.png").resolve()

    resolved_win = resolve_pipeline_path("public\\assets\\garment.png", temp_output_dir)
    assert resolved_win == (temp_output_dir / "garment.png").resolve()


def test_run_pipeline_v2_success(temp_output_dir, monkeypatch):
    """Full successful execution when base character exists and steps succeed."""
    base_file = temp_output_dir / DEFAULT_BASE_FILENAME
    base_file.write_bytes(b"fake_base_png")

    mock_gen = MagicMock(side_effect=lambda **kwargs: kwargs["output_path"].write_bytes(b"dressed_png") or True)
    mock_extract = MagicMock(side_effect=lambda **kwargs: kwargs["output_path"].write_bytes(b"garment_png") or True)

    monkeypatch.setattr("pipeline.test_v2.generate_image", mock_gen)
    monkeypatch.setattr("pipeline.test_v2.extract_garment", mock_extract)

    success = run_pipeline_v2()

    assert success is True

    # Verify generate_image call
    mock_gen.assert_called_once_with(
        prompt=DEFAULT_PROMPT,
        output_path=(temp_output_dir / DEFAULT_DRESSED_FILENAME).resolve(),
        reference_image_path=base_file.resolve(),
        model=None,
        client=None,
        aspect_ratio="2:3",
    )

    # Verify extract_garment call
    mock_extract.assert_called_once_with(
        base_image_path=base_file.resolve(),
        dressed_image_path=(temp_output_dir / DEFAULT_DRESSED_FILENAME).resolve(),
        output_path=(temp_output_dir / DEFAULT_GARMENT_FILENAME).resolve(),
        tolerance=30.0,
        cleanup_noise=True,
        session=None,
    )


def test_run_pipeline_v2_base_missing_no_auto_gen(temp_output_dir, monkeypatch):
    """When base character is missing and auto_generate_base is False, should fail early."""
    mock_gen = MagicMock()
    mock_extract = MagicMock()
    monkeypatch.setattr("pipeline.test_v2.generate_image", mock_gen)
    monkeypatch.setattr("pipeline.test_v2.extract_garment", mock_extract)

    success = run_pipeline_v2(auto_generate_base=False)

    assert success is False
    mock_gen.assert_not_called()
    mock_extract.assert_not_called()


def test_run_pipeline_v2_auto_generate_base_success(temp_output_dir, monkeypatch):
    """When base character is missing and auto_generate_base is True, generates base then proceeds."""
    base_file = temp_output_dir / DEFAULT_BASE_FILENAME

    def fake_base_gen(output_path, **kwargs):
        Path(output_path).write_bytes(b"base_png")
        return True

    mock_base_gen = MagicMock(side_effect=fake_base_gen)
    mock_gen = MagicMock(side_effect=lambda **kwargs: kwargs["output_path"].write_bytes(b"dressed_png") or True)
    mock_extract = MagicMock(side_effect=lambda **kwargs: kwargs["output_path"].write_bytes(b"garment_png") or True)

    monkeypatch.setattr("pipeline.test_v2.generate_base_character", mock_base_gen)
    monkeypatch.setattr("pipeline.test_v2.generate_image", mock_gen)
    monkeypatch.setattr("pipeline.test_v2.extract_garment", mock_extract)

    success = run_pipeline_v2(auto_generate_base=True)

    assert success is True
    mock_base_gen.assert_called_once()
    mock_gen.assert_called_once()
    mock_extract.assert_called_once()


def test_run_pipeline_v2_auto_generate_base_failure(temp_output_dir, monkeypatch):
    """When base character auto-generation fails, pipeline should abort immediately."""
    mock_base_gen = MagicMock(return_value=False)
    mock_gen = MagicMock()
    mock_extract = MagicMock()

    monkeypatch.setattr("pipeline.test_v2.generate_base_character", mock_base_gen)
    monkeypatch.setattr("pipeline.test_v2.generate_image", mock_gen)
    monkeypatch.setattr("pipeline.test_v2.extract_garment", mock_extract)

    success = run_pipeline_v2(auto_generate_base=True)

    assert success is False
    mock_base_gen.assert_called_once()
    mock_gen.assert_not_called()
    mock_extract.assert_not_called()


def test_run_pipeline_v2_generate_image_fails(temp_output_dir, monkeypatch):
    """When generate_image returns False, extraction should not be called."""
    base_file = temp_output_dir / DEFAULT_BASE_FILENAME
    base_file.write_bytes(b"fake_base")

    mock_gen = MagicMock(return_value=False)
    mock_extract = MagicMock()

    monkeypatch.setattr("pipeline.test_v2.generate_image", mock_gen)
    monkeypatch.setattr("pipeline.test_v2.extract_garment", mock_extract)

    success = run_pipeline_v2()

    assert success is False
    mock_gen.assert_called_once()
    mock_extract.assert_not_called()


def test_run_pipeline_v2_extract_garment_fails(temp_output_dir, monkeypatch):
    """When extract_garment fails, pipeline should return False."""
    base_file = temp_output_dir / DEFAULT_BASE_FILENAME
    base_file.write_bytes(b"fake_base")

    mock_gen = MagicMock(side_effect=lambda **kwargs: kwargs["output_path"].write_bytes(b"dressed_png") or True)
    mock_extract = MagicMock(return_value=False)

    monkeypatch.setattr("pipeline.test_v2.generate_image", mock_gen)
    monkeypatch.setattr("pipeline.test_v2.extract_garment", mock_extract)

    success = run_pipeline_v2()

    assert success is False
    mock_gen.assert_called_once()
    mock_extract.assert_called_once()


def test_run_pipeline_v2_custom_options(temp_output_dir, monkeypatch):
    """Custom prompts, tolerance, model, client, and file paths are honored."""
    custom_base = temp_output_dir / "custom_base.png"
    custom_base.write_bytes(b"custom_base")
    custom_dressed = temp_output_dir / "custom_dressed.png"
    custom_garment = temp_output_dir / "custom_garment.png"

    mock_gen = MagicMock(side_effect=lambda **kwargs: kwargs["output_path"].write_bytes(b"custom_d") or True)
    mock_extract = MagicMock(side_effect=lambda **kwargs: kwargs["output_path"].write_bytes(b"custom_g") or True)

    monkeypatch.setattr("pipeline.test_v2.generate_image", mock_gen)
    monkeypatch.setattr("pipeline.test_v2.extract_garment", mock_extract)

    fake_client = MagicMock()

    success = run_pipeline_v2(
        prompt="Custom Ao Dai Prompt",
        base_image_path=custom_base,
        dressed_output_path=custom_dressed,
        garment_output_path=custom_garment,
        model="imagen-custom-v2",
        client=fake_client,
        tolerance=45.0,
        cleanup_noise=False,
    )

    assert success is True
    assert mock_gen.call_args.kwargs["prompt"] == "Custom Ao Dai Prompt"
    assert mock_gen.call_args.kwargs["model"] == "imagen-custom-v2"
    assert mock_gen.call_args.kwargs["client"] is fake_client
    assert mock_gen.call_args.kwargs["output_path"] == custom_dressed.resolve()
    assert mock_gen.call_args.kwargs["reference_image_path"] == custom_base.resolve()

    assert mock_extract.call_args.kwargs["base_image_path"] == custom_base.resolve()
    assert mock_extract.call_args.kwargs["dressed_image_path"] == custom_dressed.resolve()
    assert mock_extract.call_args.kwargs["output_path"] == custom_garment.resolve()
    assert mock_extract.call_args.kwargs["tolerance"] == 45.0
    assert mock_extract.call_args.kwargs["cleanup_noise"] is False


def test_main_cli_success(monkeypatch):
    """main() returns 0 when pipeline succeeds."""
    mock_run = MagicMock(return_value=True)
    monkeypatch.setattr("pipeline.test_v2.run_pipeline_v2", mock_run)

    with patch("sys.argv", ["test_v2.py", "--prompt", "test prompt", "--auto-generate-base"]):
        code = main()

    assert code == 0
    mock_run.assert_called_once()
    assert mock_run.call_args.kwargs["prompt"] == "test prompt"
    assert mock_run.call_args.kwargs["auto_generate_base"] is True


def test_main_cli_failure(monkeypatch):
    """main() returns 1 when pipeline fails."""
    mock_run = MagicMock(return_value=False)
    monkeypatch.setattr("pipeline.test_v2.run_pipeline_v2", mock_run)

    with patch("sys.argv", ["test_v2.py"]):
        code = main()

    assert code == 1


def test_end_to_end_integration_with_real_extractor(temp_output_dir, monkeypatch):
    """End-to-end integration test chaining generate_image mock with REAL extract_garment."""
    # 1. Create a real base character RGBA image (white background with a neutral gray torso)
    base_path = temp_output_dir / DEFAULT_BASE_FILENAME
    base_img = Image.new("RGBA", (100, 150), (255, 255, 255, 255))
    base_arr = np.array(base_img)
    # Neutral skin/torso in center (x: 30..70, y: 30..120) with color (200, 180, 160)
    base_arr[30:120, 30:70, :3] = [200, 180, 160]
    Image.fromarray(base_arr, "RGBA").save(base_path, "PNG")

    # 2. Mock generate_image: simulates AI dressed image wearing a red ao dai (220, 20, 30) over torso
    def fake_generate_image(prompt, output_path, reference_image_path, **kwargs):
        with Image.open(reference_image_path) as ref:
            dressed_arr = np.array(ref.convert("RGBA"))
        # Add red dress on torso (x: 25..75, y: 40..130)
        dressed_arr[40:130, 25:75, :3] = [220, 20, 30]
        # Head area unchanged skin (y: 30..40, x: 30..70)
        Image.fromarray(dressed_arr, "RGBA").save(output_path, "PNG")
        return True

    monkeypatch.setattr("pipeline.test_v2.generate_image", fake_generate_image)

    # 3. Run pipeline V2 - extract_garment is NOT mocked!
    garment_path = temp_output_dir / DEFAULT_GARMENT_FILENAME
    dressed_path = temp_output_dir / DEFAULT_DRESSED_FILENAME

    success = run_pipeline_v2(tolerance=25.0, cleanup_noise=False)

    assert success is True
    assert dressed_path.is_file()
    assert garment_path.is_file()

    # 4. Verify output garment PNG
    with Image.open(garment_path) as g_img:
        assert g_img.mode == "RGBA"
        g_arr = np.array(g_img)
        # Red dress pixels should have positive alpha
        dress_pixels = g_arr[60:100, 35:65]
        assert np.all(dress_pixels[:, :, 3] > 0)
        # Head/skin area should be transparent (alpha == 0)
        skin_head_pixels = g_arr[32:38, 35:65]
        assert np.all(skin_head_pixels[:, :, 3] == 0)
