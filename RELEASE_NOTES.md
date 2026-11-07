# Reading Shelf 1.3.3 — Layout fixes for ★/◷

**English** · [한국어](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.ko.md)

![Dragging papers between lanes and switching modes in Zotero](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-eisenhower.gif)

## Fixes

- **Cards no longer shift when you hover over them.** The row with the reading status and ★/◷ now always reserves the height of the buttons, so showing them on hover does not push the content below.
- **Note cards have room under the title.** Notes have no author line, so the ★/◷ buttons used to sit right against the title; they now have the same breathing room as on other cards.
- **Notes line up in the table.** In the Reading Shelf column, a note's ★ and ◷ now sit in the same columns as on other rows instead of one column to the left.

## Update

Same add-on ID as 1.3.0, so Zotero updates it automatically when automatic plugin updates are on. Coming from 1.2.x? Remove the old Reading Shelf in **Tools → Plugins** first, then install **zotero-reading-shelf-1.3.3.xpi** via **⚙ → Install Plugin From File…**.

## Known limits

Checked on macOS with Zotero 10.0.8. Windows and Linux with the installed Zotero app have not been checked. The spacing was measured in a browser demo and covered by automated tests; fonts and display scaling in Zotero may look slightly different.

## License

AGPL-3.0-only. Built on [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) and inspired by [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary), both AGPLv3. See [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md).
