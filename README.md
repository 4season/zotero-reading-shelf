# Reading Shelf

Reading Shelf is an independent third-party plugin compatible with Zotero. It adds a gallery for Zotero collections. Browse covers, put papers and books in reading order, and open their notes and attachments from the gallery.

## Install

1. Download `zotero-reading-shelf-1.1.0.xpi` from the GitHub release.
2. In Zotero, open **Tools → Plugins → ⚙ → Install Plugin From File…** and select the XPI.
3. Select one collection and click **Gallery**. Click **Table** to return to the Zotero table.

The manifest targets Zotero 10.x. Development and interactive feedback used Zotero 10.0.7 on macOS. Other operating systems have yet to be tested. Quick Look and the optional Poppler fallback are macOS-specific. Updates are installed manually.

If you already use the earlier Syllabus Lite build, install over it. Reading Shelf keeps the same plugin ID and preferences. If you use the original Zotero Syllabus, switch off its gallery before opening Reading Shelf to avoid overlapping gallery controls.

## Use the gallery

- Drag cards into **Reading order**, or use the card's **+** button. Drag between cards to reorder them.
- Click a card to select it and show any additional child notes or attachments. Double-click to open a file or note. Right-click an item for Zotero's item menu.
- Resize cards with **Card size**. Use **Sort** to sort unordered items without changing the custom reading order.
- Double-click the collection description to edit Markdown or add LaTeX. Use `$…$` within a sentence and put `$$…$$` on a separate line for an equation.
- On macOS, choose **Zotero → Settings → Reading Shelf** to hide card buttons, the size slider, or the sort menu.

## Storage and previews

Reading order and collection descriptions are stored in local Zotero preferences. For a collection without local Reading Shelf data, the plugin can read the original Syllabus personal reading order note as a starting point. Subsequent edits are stored in Reading Shelf's preferences and are local to the profile.

The gallery generates thumbnails for local attachments near the viewport and stores them in the `syllabus-lite-thumbnails` subfolder of the Zotero data directory. The preview pipeline uses Zotero's bundled PDF.js, embedded EPUB covers, local images, and optional local preview tools on macOS. Missing, encrypted, and unsupported attachments may show placeholders. The plugin uses local files for preview generation.

## Build and test

Python 3 and Node.js are required for these commands. The build uses vendored browser libraries and Python's standard library.

```sh
python3 scripts/build.py
python3 scripts/test.py
```

The build writes the XPI and its SHA-256 checksum to `dist/`. To test bounded PDF reads and cancellation with Zotero's own PDF.js and a synthetic PDF fixture on macOS, run the optional integration test.

```sh
python3 scripts/test.py --zotero-omni /Applications/Zotero.app/Contents/Resources/app/omni.ja
```

The automated tests exercise gallery logic and PDF handling. They do not launch the Zotero interface or measure its total memory use.

## License and credits

This project is distributed under [AGPL-3.0](LICENSE). See [NOTICE.md](NOTICE.md) for Zotero Syllabus attribution and bundled library notices.
