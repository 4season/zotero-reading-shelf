# Building, testing and releasing

## Build and test

Python 3 and Node.js are required. Runtime libraries are vendored; the plugin has no npm runtime dependency and no background service.

```sh
python scripts/test.py
python scripts/build.py
```

Build output goes to `dist/`. On macOS, to also test against the PDF.js bundled with an installed Zotero:

```sh
python scripts/test.py --zotero-omni /Applications/Zotero.app/Contents/Resources/app/omni.ja
```

For the browser layout fixture, run `python -m http.server 8767` and open `http://127.0.0.1:8767/tests/layout.html`. Feature demos: `docs/demo.html?lang=ko&mode=matrix` or `docs/demo.html?lang=en&mode=shelf` on the same server.

Continuous integration builds and tests on Windows, macOS and Linux. These checks do not launch the installed Zotero UI.

## Source layout

Zotero loads one `bootstrap.js`, so it is generated from the modules in `src/` (constants, i18n, status/workflow, lifecycle, data, gallery, gallery previews, covers). Edit `src/`, then run `python scripts/bundle.py`; `scripts/test.py` fails if `bootstrap.js` is stale.

## Releasing

`scripts/build.py` writes the XPI, its SHA-256 checksum and `updates.json`. Publish the XPI as a GitHub Release asset first, then commit the generated `updates.json` to the repository root. `tests/updates.py` validates the versioned download URL, compatibility range and exact XPI hash. Only stable releases go in the feed.

## Licenses

Reading Shelf is AGPL-3.0-only. `vendor/upstream/` holds the source archives of bundled dependencies. See [NOTICE.md](NOTICE.md) for provenance and license blob identifiers.
