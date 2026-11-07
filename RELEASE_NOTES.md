# Reading Shelf 1.3.1 — Mode checkbox in sync, even priority buttons

**English** · [한국어](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.ko.md)

![Dragging papers between lanes and switching modes in Zotero](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-eisenhower.gif)

## What's changed

- **The Eisenhower mode checkbox in the settings and the mode button in the gallery now always agree.** Changing either one updates the other, including when the settings window is open while you use the button.
  - With per-collection memory off, both change the mode shared by all collections.
  - With per-collection memory on, both act on the collection selected in Zotero and leave other collections alone. (Before, the checkbox was disabled in this case and showed a value that did not match the collection you were looking at.)
- **★ and ◷ buttons look evenly spaced.** Buttons that are off now have a faint frame of the same size as the ones that are on, so the row no longer looks wider on cards where they are off. Their size and position did not change.

## Update

This version keeps the add-on ID introduced in 1.3.0, so Zotero can offer it as an automatic update when automatic plugin updates are on. Coming from 1.2.x? Remove the old Reading Shelf in **Tools → Plugins** first, then install **zotero-reading-shelf-1.3.1.xpi** via **⚙ → Install Plugin From File…**.

## Known limits

Checked on macOS with Zotero 10.0.8. Windows and Linux with the installed Zotero app have not been checked. The checkbox/button sync is covered by automated tests and a browser demo; the settings window itself has not been exercised with many real libraries.

## License

AGPL-3.0-only. Built on [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) and inspired by [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary), both AGPLv3. See [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md).
