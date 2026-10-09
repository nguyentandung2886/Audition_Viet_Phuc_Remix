import os
import sys
import tempfile
import unittest
from pathlib import Path
from PIL import Image

# Ensure pipeline scripts directory is on sys.path
PIPELINE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = PIPELINE_DIR.parent.parent
sys.path.insert(0, str(PIPELINE_DIR))

from schema import BaseCharacter, ModularGarment, GarmentComponent, CanvasSpec
from validator import validate_asset, resolve_asset_path
from composer import compose_outfit
import cli

class TestPipelineValidation(unittest.TestCase):
    def test_canonical_assets_all_approved(self):
        char_data, garment_data = cli.load_canonical_data()
        self.assertIsNotNone(char_data)
        self.assertIsNotNone(garment_data)

        # Base character
        base_report = validate_asset(char_data.assetPath, 1024, 1536, char_data.characterId)
        self.assertTrue(base_report.isValid)
        self.assertEqual(base_report.status, "approved")
        self.assertTrue(base_report.hasAlpha)
        self.assertTrue(base_report.dimensionsMatch)
        self.assertFalse(base_report.emptyImage)

        # Components
        for comp in garment_data.components:
            report = validate_asset(comp.filePath, comp.canvasWidth, comp.canvasHeight, comp.assetId)
            self.assertTrue(report.isValid, f"Component {comp.assetId} should be valid")
            self.assertEqual(report.status, "approved")
            self.assertTrue(report.hasAlpha)
            self.assertTrue(report.dimensionsMatch)
            self.assertFalse(report.emptyImage)
            self.assertIsNotNone(report.boundingBox)

    def test_resolve_asset_path(self):
        # Web-relative path
        resolved = resolve_asset_path("/assets/canonical/base_character.png")
        self.assertTrue(os.path.exists(resolved))

        # Absolute existing path
        self.assertEqual(resolve_asset_path(resolved), resolved)

        # Non-existent path returns as-is
        self.assertEqual(resolve_asset_path("/non/existent/path.png"), "/non/existent/path.png")

    def test_empty_image_flagged_retry(self):
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            img = Image.new("RGBA", (1024, 1536), (0, 0, 0, 0))
            img.save(tmp_path, "PNG")

            report = validate_asset(tmp_path, 1024, 1536, "empty_fixture")
            self.assertFalse(report.isValid)
            self.assertEqual(report.status, "retry")
            self.assertTrue(report.emptyImage)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    def test_dimension_mismatch_flagged_review_required(self):
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            img = Image.new("RGBA", (500, 500), (255, 0, 0, 255))
            img.save(tmp_path, "PNG")

            report = validate_asset(tmp_path, 1024, 1536, "small_fixture")
            self.assertFalse(report.isValid)
            self.assertFalse(report.dimensionsMatch)
            self.assertEqual(report.status, "review_required")
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    def test_missing_alpha_flagged_review_required(self):
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            img = Image.new("RGB", (1024, 1536), (255, 0, 0))
            img.save(tmp_path, "PNG")

            report = validate_asset(tmp_path, 1024, 1536, "no_alpha_fixture")
            self.assertFalse(report.isValid)
            self.assertFalse(report.hasAlpha)
            self.assertEqual(report.status, "review_required")
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    def test_non_rgba_mode_flagged_review_required(self):
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            # Grayscale with alpha (mode LA) is not RGBA
            img = Image.new("LA", (1024, 1536), (128, 255))
            img.save(tmp_path, "PNG")

            report = validate_asset(tmp_path, 1024, 1536, "la_mode_fixture")
            self.assertFalse(report.isValid)
            self.assertFalse(report.hasAlpha)
            self.assertEqual(report.status, "review_required")
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    def test_non_existent_file_flagged_retry(self):
        report = validate_asset("/non/existent/asset.png", 1024, 1536, "missing")
        self.assertFalse(report.isValid)
        self.assertEqual(report.status, "retry")
        self.assertIn("File not found", report.diagnostics[0])

    def test_empty_or_directory_path_flagged_retry(self):
        # Empty path
        rep_empty = validate_asset("", 1024, 1536, "empty_str")
        self.assertFalse(rep_empty.isValid)
        self.assertEqual(rep_empty.status, "retry")
        self.assertIn("File not found: ", rep_empty.diagnostics[0])

        # Directory path
        rep_dir = validate_asset("public", 1024, 1536, "dir_path")
        self.assertFalse(rep_dir.isValid)
        self.assertEqual(rep_dir.status, "retry")
        self.assertIn("File not found: public", rep_dir.diagnostics[0])

class TestPipelineComposition(unittest.TestCase):
    def test_compose_outfit(self):
        char_data, garment_data = cli.load_canonical_data()
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            success = compose_outfit(char_data.assetPath, garment_data.components, tmp_path, base_render_order=30)
            self.assertTrue(success)
            self.assertTrue(os.path.exists(tmp_path))

            report = validate_asset(tmp_path, 1024, 1536, "test_preview")
            self.assertTrue(report.isValid)
            self.assertEqual(report.status, "approved")
            self.assertGreater(report.nonEmptyPixelCount, 200000)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    def test_compose_outfit_plain_filename(self):
        char_data, garment_data = cli.load_canonical_data()
        plain_filename = "test_plain_output_temp.png"
        try:
            success = compose_outfit(char_data.assetPath, garment_data.components, plain_filename, base_render_order=30)
            self.assertTrue(success)
            self.assertTrue(os.path.exists(plain_filename))
        finally:
            if os.path.exists(plain_filename):
                os.remove(plain_filename)

    def test_compose_outfit_empty_layers_fails(self):
        # When neither base character nor any components exist, composition must fail
        success = compose_outfit("/non/existent/base.png", [], "out_non_existent.png")
        self.assertFalse(success)

class TestPipelineProcessor(unittest.TestCase):
    def test_crop_and_align_web_path(self):
        from processor import crop_and_align_to_canvas, remove_background
        # Verify non-existent file returns False or raises FileNotFoundError
        self.assertFalse(remove_background("/non/existent/file.png", "out.png"))
        with self.assertRaises(FileNotFoundError):
            crop_and_align_to_canvas("/non/existent/file.png")

    def test_crop_and_align_with_custom_output_path(self):
        from processor import crop_and_align_to_canvas
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as src_tmp:
            src_path = src_tmp.name
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as dst_tmp:
            dst_path = dst_tmp.name

        try:
            img = Image.new("RGBA", (500, 500), (200, 50, 50, 255))
            img.save(src_path, "PNG")

            result_path = crop_and_align_to_canvas(src_path, output_path=dst_path)
            self.assertEqual(result_path, dst_path)
            self.assertTrue(os.path.exists(dst_path))

            with Image.open(dst_path) as out_img:
                self.assertEqual(out_img.size, (1024, 1536))
                self.assertEqual(out_img.mode, "RGBA")
        finally:
            if os.path.exists(src_path):
                os.remove(src_path)
            if os.path.exists(dst_path):
                os.remove(dst_path)

class TestPipelineCLI(unittest.TestCase):
    def test_cli_actions(self):
        # Validate only
        val_code = cli.run_validation()
        self.assertEqual(val_code, 0)

        # Compose only
        comp_code = cli.run_composition()
        self.assertEqual(comp_code, 0)

        # Validate and compose
        val_comp_code = cli.run_validation_and_composition()
        self.assertEqual(val_comp_code, 0)

    def test_cli_process_action(self):
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as src_tmp:
            src_path = src_tmp.name
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as dst_tmp:
            dst_path = dst_tmp.name

        try:
            img = Image.new("RGBA", (300, 400), (255, 255, 255, 255))
            img.save(src_path, "PNG")

            code = cli.run_process_asset(src_path, dst_path)
            self.assertEqual(code, 0)
            self.assertTrue(os.path.exists(dst_path))
        finally:
            if os.path.exists(src_path):
                os.remove(src_path)
            if os.path.exists(dst_path):
                os.remove(dst_path)

if __name__ == "__main__":
    unittest.main()
