"""Build the Reading Shelf XPI and its SHA-256 checksum."""

import argparse
import hashlib
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
PACKAGE_FILES = (
    "manifest.json", "bootstrap.js", "description.js", "gallery.css", "prefs.js",
    "settings.xhtml", "settings.js", "settings.css", "icons/reading-shelf.svg", "LICENSE", "NOTICE.md", "vendor/markdown-it.min.js",
    "vendor/markdown-it-LICENSE.txt", "vendor/markdown-it-dependency-notices.txt",
    "vendor/katex.min.js", "vendor/katex-LICENSE.txt",
)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out-dir", type=Path, default=ROOT / "dist")
    args = parser.parse_args()

    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    addon = manifest["applications"]["zotero"]
    if addon["id"] != "syllabus-lite@local.zotero" or not addon["update_url"].startswith("https://"):
        raise SystemExit("Expected the original add-on ID and an HTTPS update URL.")

    args.out_dir.mkdir(parents=True, exist_ok=True)
    xpi = args.out_dir / f"zotero-reading-shelf-{manifest['version']}.xpi"
    with ZipFile(xpi, "w") as archive:
        for filename in PACKAGE_FILES:
            info = ZipInfo(filename, date_time=(1980, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            archive.writestr(info, (ROOT / filename).read_bytes(), ZIP_DEFLATED, compresslevel=9)
    with ZipFile(xpi) as archive:
        bad_file = archive.testzip()
        if bad_file:
            raise SystemExit(f"Archive check failed for {bad_file}")
    digest = hashlib.sha256(xpi.read_bytes()).hexdigest()
    checksum = xpi.with_suffix(".xpi.sha256")
    checksum.write_text(f"{digest}  {xpi.name}\n", encoding="utf-8")
    updates = {"addons": {addon["id"]: {"updates": [{
        "version": manifest["version"],
        "update_link": f"https://github.com/4season/zotero-reading-shelf/releases/download/v{manifest['version']}/{xpi.name}",
        "update_hash": "sha256:" + digest,
        "applications": {"zotero": {"strict_min_version": addon["strict_min_version"], "strict_max_version": addon["strict_max_version"]}},
    }]}}}
    update_file = args.out_dir / "updates.json"
    update_file.write_text(json.dumps(updates, indent=2) + "\n", encoding="utf-8")
    print(update_file)
    print(xpi)
    print(checksum)


if __name__ == "__main__":
    main()
