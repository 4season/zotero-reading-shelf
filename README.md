# Reading Shelf

Reading Shelf is an independent third-party plugin compatible with Zotero. It adds a gallery for Zotero collections. Browse covers, put papers and books in reading order, and open their notes and attachments from the gallery.

## Install

1. Download `zotero-reading-shelf-1.2.0-beta.1.xpi` from the GitHub release.
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

## Reading status and illustrated guide

![Gallery and related note guide](docs/images/gallery-guide.svg)

The **Gallery / Table** toggle sits to the left of quick search. Notes show a text excerpt in a readable note card. Dragging the first item into an empty **Reading order** reserves a card-sized space before you drop it.

Set **읽을 예정** (to read), **읽는 중** (reading), or **중요** (important) using the status selector beneath a regular item, or right-click one or more items and choose **Reading Shelf · 상태**. Choose **상태 없음** to explicitly clear the status. In Table view, enable the **Reading Shelf** column through the table header's column picker if necessary. Status badges are sortable using the native column header.

![Table status guide](docs/images/status-guide.svg)

Status is shared across collections for the same item and stored locally in this Zotero profile. It does not modify tags, Extra, or synced item metadata. An existing local reading-order entry defaults to **읽을 예정** until you explicitly set or clear its status. Reading order remains collection-specific. These are manual workflow labels, not an automatic measurement of reading completion.

In **Settings → Reading Shelf**, hide the reading-order **+ / −** buttons and the child note/attachment indicator independently. Clicking a card can still reveal child items when the indicator is hidden. Size and sort controls have their own switches.

The illustrations use synthetic examples and are diagrams, not captured Zotero screenshots. `docs/demo.html` is an additional browser preview fixture, not the installed Zotero interface.

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
