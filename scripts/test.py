"""Run portable tests and optionally exercise the installed Zotero PDF engine."""

import argparse
from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
PDF_RESOURCE = "resource/reader/pdf/build/"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--zotero-omni", type=Path, help="Path to Zotero's app/omni.ja archive")
    args = parser.parse_args()

    subprocess.run([sys.executable, str(ROOT / "scripts/bundle.py"), "--check"], check=True)
    subprocess.run(["node", str(ROOT / "tests/gallery.cjs")], check=True)
    subprocess.run(["node", str(ROOT / "tests/status.cjs")], check=True)
    subprocess.run(["node", str(ROOT / "tests/settings.cjs")], check=True)
    subprocess.run([sys.executable, str(ROOT / "tests/updates.py")], check=True)
    if args.zotero_omni:
        with TemporaryDirectory() as temp, ZipFile(args.zotero_omni) as zotero:
            folder = Path(temp)
            for name in ("pdf.mjs", "pdf.worker.mjs"):
                (folder / name).write_bytes(zotero.read(PDF_RESOURCE + name))
            subprocess.run(["node", str(ROOT / "tests/pdf.cjs"), str(folder / "pdf.mjs")], check=True)


if __name__ == "__main__":
    main()
