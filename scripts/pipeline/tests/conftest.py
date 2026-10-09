import sys
from pathlib import Path

# Ensure the 'scripts' directory is in sys.path so 'pipeline' can be imported
scripts_dir = Path(__file__).resolve().parents[2]
if str(scripts_dir) not in sys.path:
    sys.path.insert(0, str(scripts_dir))
