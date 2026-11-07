"""Validate the installable artifact and Zotero update metadata together."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory
from zipfile import ZipFile

root = Path(__file__).resolve().parents[1]
with TemporaryDirectory() as temp:
    subprocess.run([sys.executable, str(root / 'scripts/build.py'), '--out-dir', temp], check=True, stdout=subprocess.DEVNULL)
    metadata = json.loads((Path(temp) / 'updates.json').read_text())
    entry = metadata['addons']['reading-shelf@4season.github.io']['updates'][0]
    package = Path(temp) / ('zotero-reading-shelf-' + entry['version'] + '.xpi')
    assert entry['update_hash'] == 'sha256:' + hashlib.sha256(package.read_bytes()).hexdigest()
    assert entry['update_link'] == 'https://github.com/4season/zotero-reading-shelf/releases/download/v' + entry['version'] + '/' + package.name
    with ZipFile(package) as archive:
        manifest = json.loads(archive.read('manifest.json'))
        assert manifest['version'] == entry['version']
        addon = manifest['applications']['zotero']
        assert addon['update_url'] == 'https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/updates.json'
        assert entry['applications']['zotero']['strict_min_version'] == addon['strict_min_version']
        assert entry['applications']['zotero']['strict_max_version'] == addon['strict_max_version']
        assert archive.testzip() is None
print('Zotero update URL, version, compatibility and exact XPI hash passed')
