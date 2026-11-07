# Reading Shelf 1.3.8 — Table to Gallery sync fixes

**English** · [한국어](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.ko.md)

![Opening a paper's notes and attachments right under it, then right-clicking one in Zotero](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-attachments.gif)

## What's fixed

1.3.7 made the opened paper follow you between Gallery and Table, but the Table → Gallery direction had two gaps:

- **A row opened in the table is now carried over even if it is not selected.** Opening a row with its arrow in the table does not select it, so the gallery used to ignore it. Now the selected paper is used if its row is open, and otherwise the first open row.
- **Closing a row in the table now closes it in the gallery.** Before, the gallery remembered what it had open earlier and unfolded it again when you came back. The table is now the source of truth when you switch to the gallery.

The gallery still opens one paper at a time, so if several rows are open in the table, the one chosen by the rule above is shown.

## Update

Same add-on ID as 1.3.0, so Zotero updates it automatically when automatic plugin updates are on. Coming from 1.2.x? Remove the old Reading Shelf in **Tools → Plugins** first, then install **zotero-reading-shelf-1.3.8.xpi** via **⚙ → Install Plugin From File…**.

## Known limits

Checked on macOS with Zotero 10.0.8. Windows and Linux with the installed Zotero app have not been checked. The Gallery/Table sync is covered by automated tests with a stand-in for Zotero's item tree and has not been tried across many real libraries.

## License

AGPL-3.0-only. Built on [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) and inspired by [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary), both AGPLv3. See [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md).
