# Reading Shelf 1.3.7 — Opened paper follows you between Gallery and Table

**English** · [한국어](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.ko.md)

![Opening a paper's notes and attachments right under it, then right-clicking one in Zotero](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-attachments.gif)

## What's new

- **The paper you opened stays open when you switch between Gallery and Table.** Open a paper's notes and attachments in the gallery, click **Table**, and its row is open there too. Open a row in the table, click **Gallery**, and the card unfolds to show its notes and attachments.
  - The gallery opens one paper at a time, while the table can have many rows open. Switching to the gallery picks the selected paper (or the paper that a selected note or attachment belongs to) when its row is open.
  - Closing a card in the gallery closes the row the plugin opened; rows you opened yourself in the table are left alone.
  - Only papers that have notes or more than one attachment unfold in the gallery.

## What's improved

- **Closing a paper's notes and attachments feels less abrupt.** The cards now fade out in 0.24 s, matching how they fade in, so they no longer disappear before the others have finished moving back.

## Update

Same add-on ID as 1.3.0, so Zotero updates it automatically when automatic plugin updates are on. Coming from 1.2.x? Remove the old Reading Shelf in **Tools → Plugins** first, then install **zotero-reading-shelf-1.3.7.xpi** via **⚙ → Install Plugin From File…**.

## Known limits

Checked on macOS with Zotero 10.0.8. Windows and Linux with the installed Zotero app have not been checked. The Gallery/Table sync uses Zotero's own item-tree functions and is covered by automated tests with a stand-in for the tree; it has not yet been tried across many real libraries.

## License

AGPL-3.0-only. Built on [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) and inspired by [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary), both AGPLv3. See [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md).
